import { writeFileSync, readFileSync, existsSync } from "fs";

const CAPITAL = 100000;
const ALLOCATION_FRACTION = 0.40;
const LOT_SIZE = 65;
const MAX_LOTS = 15;
const POLL_MS = 15000;
const MARKET_CLOSE_IST_HOUR = 15;
const MARKET_CLOSE_IST_MIN = 30;

const LOG_FILE = "./paper-trade-log-2026-09-15.json";

let state = {
  trades: [],
  nearMisses: [],
  serialCounter: 0,
  position: null,
  startedAt: new Date().toISOString(),
  lastPollAt: null,
  lastError: null,
};

if (existsSync(LOG_FILE)) {
  try {
    state = { ...state, ...JSON.parse(readFileSync(LOG_FILE, "utf-8")) };
  } catch (e) {}
}

function save() {
  try {
    writeFileSync(LOG_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error("save() failed:", e);
  }
}

function nowIso() {
  return new Date().toISOString();
}

function isPastMarketClose() {
  const now = new Date();
  const istMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 330) % (24 * 60);
  const closeMinutes = MARKET_CLOSE_IST_HOUR * 60 + MARKET_CLOSE_IST_MIN;
  return istMinutes >= closeMinutes;
}

async function safeFetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function getMarketQuote() {
  return safeFetchJson("http://localhost:3000/market-quote");
}

async function getSMCAnalysis() {
  return safeFetchJson("http://localhost:3000/smc-analysis");
}

async function getLivePremiumFallback(strike, side) {
  const json = await safeFetchJson("http://localhost:3000/option-chain?underlying=nifty");
  const leg = json?.data?.oc?.[strike.toFixed(6)];
  if (!leg) return null;
  return side === "CE" ? leg.ce?.last_price : leg.pe?.last_price;
}

function nearbyZonesSummary(smc, spot) {
  if (!smc?.nifty) return [];
  const candles = smc.nifty.candles ?? [];
  const cutoff = candles[Math.max(0, candles.length - 100)]?.timestamp ?? 0;
  return smc.nifty.zones
    .filter(z => z.status !== "invalidated" && z.startTime >= cutoff)
    .map(z => ({
      ...z,
      dist: Math.min(Math.abs(spot - z.top), Math.abs(spot - z.bottom)),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map(z => `${z.type} ${z.direction} [${z.bottom}-${z.top}] ${z.status} (${Math.round(z.dist)}pts away)`);
}

function buildSnapshot(oa, mh, smc) {
  return {
    spot: oa.spotPrice,
    atmStrike: oa.atmStrike,
    marketBias: oa.marketBias,
    confidence: oa.confidence,
    oiFlowVerdict: oa.oiFlowVerdict,
    positionBuildUpHint: oa.positionBuildUpHint,
    greeksEnvironment: oa.greeksEnvironment,
    pivotPoint: oa.pivotPoint,
    primarySupport: oa.primarySupport,
    primaryResistance: oa.primaryResistance,
    niftyTrend: mh?.nifty?.trend,
    niftyMomentum: mh?.nifty?.momentum,
    niftyStructure: mh?.nifty?.structure,
    nearbyPriceStructureZones: nearbyZonesSummary(smc, oa.spotPrice),
  };
}

async function main() {
  console.log(`Paper trade monitor started/resumed at ${nowIso()}`);

  while (true) {
    try {

    if (isPastMarketClose()) {

      if (state.position) {
        console.log("Market close reached with an open position - forcing exit.");
        const quote = await getMarketQuote();
        const oa = quote?.optionAnalysis?.nifty;
        const signal = oa?.egbd?.signals?.find(
          s => s.strike === state.position.strike && s.side === state.position.side
        );
        let exitPremium = signal?.currentPremium;
        if (exitPremium == null) {
          exitPremium = await getLivePremiumFallback(state.position.strike, state.position.side);
        }
        if (exitPremium != null) {
          closePosition(exitPremium, "Market close (3:30 PM) - forced exit, position still open", oa, null, null);
        }
      }

      console.log("Past market close. Monitor stopping.");
      break;
    }

    state.lastPollAt = nowIso();

    const quote = await getMarketQuote();

    if (!quote || !quote.optionAnalysis?.nifty) {
      console.log(`${nowIso()} poll failed (no market-quote data) - skipping`);
      await sleep(POLL_MS);
      continue;
    }

    const oa = quote.optionAnalysis.nifty;
    const mh = quote.marketHealth;
    const egbd = oa.egbd;

    if (!egbd) {
      console.log(`${nowIso()} EGBD not present (not expiry day?) - skipping`);
      await sleep(POLL_MS);
      continue;
    }

    if (!state.position) {

      // Track near-misses: anything that armed but never reached
      // ENTRY_WINDOW, so nothing that could have been a trade is lost
      // from the record even if we never entered it. A signal that
      // fades back to WATCHING closes its near-miss record; one that
      // goes on to become a real trade gets removed below instead
      // (it's not a "miss" once it's actually traded).
      for (const signal of egbd.signals ?? []) {

        const key = `${signal.strike}_${signal.side}`;

        if (signal.stage === "WATCHING") {
          const existing = state.nearMisses.find(m => m.key === key && m.open);
          if (existing) {
            existing.open = false;
            existing.lastSeen = nowIso();
          }
          continue;
        }

        let miss = state.nearMisses.find(m => m.key === key && m.open);
        if (!miss) {
          miss = { key, strike: signal.strike, side: signal.side, open: true, maxStage: signal.stage, firstSeen: nowIso(), lastSeen: nowIso() };
          state.nearMisses.push(miss);
        }
        miss.lastSeen = nowIso();
        miss.maxStage = signal.stage;
      }

      const active = egbd.activeSignal;

      if (active && active.stage === "ENTRY_WINDOW" && active.currentPremium > 0) {

        const smc = await getSMCAnalysis();
        const entryPremium = active.currentPremium;
        const lots = Math.min(
          MAX_LOTS,
          Math.max(1, Math.floor((CAPITAL * ALLOCATION_FRACTION) / (entryPremium * LOT_SIZE)))
        );

        // This candidate just became a real trade, not a near-miss -
        // drop its near-miss record so it doesn't show up as both.
        const missIndex = state.nearMisses.findIndex(
          m => m.key === `${active.strike}_${active.side}` && m.open
        );
        if (missIndex !== -1) {
          state.nearMisses.splice(missIndex, 1);
        }

        state.serialCounter += 1;

        state.position = {
          serialNo: state.serialCounter,
          strike: active.strike,
          side: active.side,
          lots,
          entryPremium,
          entryTime: nowIso(),
          reason:
            `EGBD reached ENTRY_WINDOW on ${active.strike}${active.side} - ` +
            `momentum score ${active.momentumScore}, OI wall backing ${(active.oiConcentration * 100).toFixed(0)}%, ` +
            `evidence: ${active.evidence.join("; ")}`,
          entrySnapshot: buildSnapshot(oa, mh, smc),
          stageHistory: [{ time: nowIso(), stage: active.stage, premium: entryPremium, momentumScore: active.momentumScore }],
        };

        console.log(`${nowIso()} ENTERED ${active.strike}${active.side} @ ${entryPremium}, ${lots} lots`);
        save();
      }

    } else {

      const signal = egbd.signals?.find(
        s => s.strike === state.position.strike && s.side === state.position.side
      );

      if (signal) {

        const lastStage = state.position.stageHistory[state.position.stageHistory.length - 1]?.stage;
        if (signal.stage !== lastStage) {
          state.position.stageHistory.push({
            time: nowIso(), stage: signal.stage, premium: signal.currentPremium, momentumScore: signal.momentumScore,
          });
          save();
        }

        if (signal.stage === "EXIT_WINDOW") {
          const smc = await getSMCAnalysis();
          closePosition(signal.currentPremium, "EGBD reached EXIT_WINDOW - momentum exhausted", oa, mh, smc);
        } else if (signal.stage === "WATCHING") {
          const smc = await getSMCAnalysis();
          closePosition(signal.currentPremium, "EGBD signal reset back to WATCHING before reaching EXIT_WINDOW - treated as invalidated", oa, mh, smc);
        } else {
          console.log(`${nowIso()} holding ${state.position.strike}${state.position.side}, stage=${signal.stage}, premium=${signal.currentPremium}`);
        }

      } else {

        console.log(`${nowIso()} held signal no longer tracked by EGBD (pruned/stale) - closing at fallback live premium`);
        const fallbackPremium = await getLivePremiumFallback(state.position.strike, state.position.side);
        if (fallbackPremium != null) {
          const smc = await getSMCAnalysis();
          closePosition(fallbackPremium, "Signal dropped from EGBD tracking (pruned as stale) - closed at last live premium", oa, mh, smc);
        }
      }
    }

    } catch (err) {
      // One bad cycle must never kill a monitor meant to run
      // unattended for a full trading day - log it and keep going.
      state.lastError = `${nowIso()}: ${err}`;
      console.error("Loop iteration error (continuing):", err);
      save();
    }

    await sleep(POLL_MS);
  }
}

function closePosition(exitPremium, exitReason, oa, mh, smc) {

  const pos = state.position;
  const totalInvestment = pos.lots * LOT_SIZE * pos.entryPremium;
  const totalPnl = pos.lots * LOT_SIZE * (exitPremium - pos.entryPremium);

  state.trades.push({
    serialNo: pos.serialNo,
    trade: `${pos.strike} ${pos.side}`,
    lots: pos.lots,
    units: pos.lots * LOT_SIZE,
    entryPrice: pos.entryPremium,
    exitPrice: exitPremium,
    totalInvestment: Math.round(totalInvestment),
    totalPnl: Math.round(totalPnl),
    entryTime: pos.entryTime,
    exitTime: nowIso(),
    reason: pos.reason,
    exitReason,
    entrySnapshot: pos.entrySnapshot,
    exitSnapshot: oa ? buildSnapshot(oa, mh, smc) : null,
    stageHistory: pos.stageHistory,
  });

  console.log(`${nowIso()} EXITED ${pos.strike}${pos.side} @ ${exitPremium}, P&L ${Math.round(totalPnl)}`);

  state.position = null;
  save();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

main().catch(err => {
  state.lastError = String(err);
  save();
  console.error("FATAL:", err);
});
