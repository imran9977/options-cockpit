import { getIntradayCandles } from "./intradayCandleService.js";
import { getClassicalLevels } from "./classicalLevelsService.js";
import { getSMCAnalysis } from "./smcService.js";
import { getOpeningRange } from "./openingRangeService.js";
import { getLatestSnapshot } from "./marketPoller.js";
import { detectLevelBreaks, type LevelDefinition } from "../analyzers/levelBreakDetector.js";
import { checkRetest, type PendingRetest } from "../analyzers/retestDetector.js";
import { detectZoneReactions } from "../analyzers/zoneReactionDetector.js";
import { detectNewSweeps } from "../analyzers/smcZoneDetector.js";
import { scoreConfluence } from "../analyzers/confluenceScorer.js";
import { scoreOptionChainAgreement, detectIVCrashSignals } from "../analyzers/optionChainAgreement.js";
import { logPriceStructureSignal } from "./priceStructureSignalLogger.js";
import type { OptionAnalysis } from "../models/OptionAnalysis.js";
import type { IntradayCandle } from "../models/SMCAnalysis.js";
import type { PriceStructureSignal, SignalCandidate } from "../models/PriceStructureSignal.js";
import type { Underlying } from "../config/instruments.js";

function dateStr(date: Date): string {
    return date.toISOString().split("T")[0];
}

// intradayCandleService/smcService cache up to 7 days for other
// purposes (the Price Structure table's own multi-day zone history),
// but every detector in THIS file must only ever see today - applying
// today's just-computed levels against a candle (or zone) from a
// prior day can produce a false match that permanently marks a level
// "already broken" before today's real break ever happens. Filtered
// once, here, rather than patching each detector separately.
function onlyToday<T>(
    items: readonly T[],
    today: string,
    getTimestamp: (item: T) => number
): T[] {
    return items.filter(item => dateStr(new Date(getTimestamp(item))) === today);
}

interface DayLevelSet {
    date: string;
    levels: LevelDefinition[];
}

const levelSetByUnderlying: Record<Underlying, DayLevelSet | null> = {
    NIFTY: null,
    SENSEX: null,
};

// Built once per day, anchored on the opening candle - daily
// R1/R2/S1/S2/pivot are already fixed-for-the-day values from
// classicalLevelsService, and passing the (also fixed-for-the-day)
// opening price as the "spot" for round-number calculation keeps
// those fixed for the day too, instead of drifting with live spot.
async function getTodaysLevels(
    underlying: Underlying,
    candles: readonly IntradayCandle[]
): Promise<LevelDefinition[] | null> {

    const today = dateStr(new Date());
    const cache = levelSetByUnderlying[underlying];

    if (cache && cache.date === today) {
        return cache.levels;
    }

    const openingRange = getOpeningRange(underlying, candles);

    if (!openingRange) {
        return null;
    }

    const classicalLevels = await getClassicalLevels(underlying, openingRange.high);

    const levels: LevelDefinition[] = [
        { id: "OPEN_RANGE_HIGH", label: "Opening range high", price: openingRange.high },
        { id: "OPEN_RANGE_LOW", label: "Opening range low", price: openingRange.low },
        { id: "PIVOT", label: "Pivot", price: classicalLevels.daily.pivot },
        { id: "R1", label: "R1", price: classicalLevels.daily.r1 },
        { id: "R2", label: "R2", price: classicalLevels.daily.r2 },
        { id: "S1", label: "S1", price: classicalLevels.daily.s1 },
        { id: "S2", label: "S2", price: classicalLevels.daily.s2 },
        { id: "ROUND_ABOVE", label: `Round ${classicalLevels.roundNumbers.nearestAbove50}`, price: classicalLevels.roundNumbers.nearestAbove50 },
        { id: "ROUND_BELOW", label: `Round ${classicalLevels.roundNumbers.nearestBelow50}`, price: classicalLevels.roundNumbers.nearestBelow50 },
    ];

    levelSetByUnderlying[underlying] = { date: today, levels };

    return levels;
}

interface UnderlyingState {
    date: string;
    lastScannedIndex: number;
    alreadyBrokenLevelIds: Set<string>;
    pendingRetests: PendingRetest[];
    alreadyCrashedKeys: Set<string>;
    signals: PriceStructureSignal[];
}

function freshState(date: string): UnderlyingState {
    return {
        date,
        lastScannedIndex: 0,
        alreadyBrokenLevelIds: new Set(),
        pendingRetests: [],
        alreadyCrashedKeys: new Set(),
        signals: [],
    };
}

const stateByUnderlying: Record<Underlying, UnderlyingState> = {
    NIFTY: freshState(""),
    SENSEX: freshState(""),
};

let signalCounter = 0;

function finalize(
    candidate: SignalCandidate,
    trendContext: string,
    optionAnalysis: OptionAnalysis | null
): PriceStructureSignal {

    signalCounter += 1;

    // IV_CRASH already comes straight from the option chain (EGBD's
    // own state) - scoring "does the option chain agree with itself"
    // is circular and would just add confusing noise to a signal
    // that's already option-chain-native.
    const agreementResult = optionAnalysis && candidate.kind !== "IV_CRASH"
        ? scoreOptionChainAgreement(candidate.direction, optionAnalysis)
        : { agreement: "no-data" as const, reasons: [] as string[] };

    return {
        ...candidate,
        id: `${candidate.kind}_${candidate.triggeredAt}_${signalCounter}`,
        trendContext,
        optionChainAgreement: agreementResult.agreement,
        reasoning: [...candidate.reasoning, ...agreementResult.reasons],
        status: "active",
    };
}

// 90 minutes - matches marketObservationAnalyzer.ts's own expiresAt
// convention for "how long is a market read still worth showing."
const SIGNAL_EXPIRY_MS = 90 * 60 * 1000;
const MAX_SIGNALS_KEPT = 30;

function pruneExpired(signals: PriceStructureSignal[]): PriceStructureSignal[] {
    const cutoff = Date.now() - SIGNAL_EXPIRY_MS;
    return signals.map(signal =>
        signal.triggeredAt < cutoff ? { ...signal, status: "expired" as const } : signal
    );
}

function trendContextFor(underlying: Underlying): string {

    const snapshot = getLatestSnapshot();

    if (!snapshot) {
        return "";
    }

    return underlying === "NIFTY"
        ? snapshot.marketHealth.nifty.trend
        : snapshot.marketHealth.sensex.trend;
}

function optionAnalysisFor(underlying: Underlying): OptionAnalysis | null {

    const snapshot = getLatestSnapshot();

    if (!snapshot) {
        return null;
    }

    return underlying === "NIFTY"
        ? snapshot.optionAnalysis.nifty
        : snapshot.optionAnalysis.sensex;
}

export async function getPriceStructureSignals(
    underlying: Underlying
): Promise<PriceStructureSignal[]> {

    const today = dateStr(new Date());
    let state = stateByUnderlying[underlying];

    // New trading day - yesterday's broken levels and pending retests
    // have nothing to do with today's.
    if (state.date !== today) {
        state = freshState(today);
        stateByUnderlying[underlying] = state;
    }

    const allCandles = await getIntradayCandles(underlying);
    const candles = onlyToday(allCandles, today, c => c.timestamp);

    if (candles.length === 0) {
        return state.signals;
    }

    const levels = await getTodaysLevels(underlying, candles);

    if (!levels) {
        return state.signals;
    }

    const fromIndex = state.lastScannedIndex;
    const toIndexExclusive = candles.length;

    if (toIndexExclusive <= fromIndex) {
        return pruneExpired(state.signals);
    }

    const freshCandidates: SignalCandidate[] = [];

    const breakResults = detectLevelBreaks(
        candles, levels, fromIndex, state.alreadyBrokenLevelIds
    );

    for (const result of breakResults) {

        state.alreadyBrokenLevelIds.add(result.levelId);
        freshCandidates.push(result.candidate);

        state.pendingRetests.push({
            levelId: result.levelId,
            levelLabel: result.candidate.levelLabel,
            levelPrice: result.candidate.price,
            breakDirection: result.candidate.direction,
            brokeAtIndex: result.candleIndex,
        });
    }

    const stillPending: PendingRetest[] = [];

    for (const pending of state.pendingRetests) {

        const outcome = checkRetest(candles, pending, fromIndex, toIndexExclusive);

        if (outcome.candidate) {
            freshCandidates.push(outcome.candidate);
        }

        if (!outcome.resolved) {
            stillPending.push(pending);
        }
    }

    state.pendingRetests = stillPending;

    // Reuses smcService's already-computed zones - no extra Dhan call.
    // smcService itself retains zones across multiple days (the Price
    // Structure table's own concern) - filtered to today's here too,
    // for the same reason candles are: a zone from a prior day has no
    // business informing today's reactions or confluence.
    const smc = await getSMCAnalysis(underlying);
    const todaysZones = onlyToday(smc.zones, today, zone => zone.startTime);

    freshCandidates.push(...detectZoneReactions(candles, todaysZones, fromIndex));

    const sweepZones = detectNewSweeps(candles, fromIndex);

    for (const sweep of sweepZones) {
        freshCandidates.push({
            kind: "SWEEP_REVERSAL",
            direction: sweep.direction,
            confidence: "medium",
            headline: `Liquidity sweep near ${Math.round(sweep.bottom)}-${Math.round(sweep.top)}`,
            reasoning: [
                "Price wicked through a recent swing point and closed back on the original side",
            ],
            levelLabel: `Sweep ${Math.round(sweep.bottom)}-${Math.round(sweep.top)}`,
            price: sweep.direction === "bullish" ? sweep.bottom : sweep.top,
            triggeredAt: sweep.startTime,
        });
    }

    const activeZones = todaysZones.filter(zone => zone.status === "active");

    // classicalLevels here is a cache hit (already loaded today via
    // getTodaysLevels above) - the spotPrice argument only affects
    // roundNumbers, which this call's result doesn't use.
    const classicalLevels = await getClassicalLevels(underlying, candles[candles.length - 1].close);

    const optionAnalysis = optionAnalysisFor(underlying);

    if (optionAnalysis) {

        // Un-mark any key no longer flagged - EGBD clears a strike's
        // crash state once it cycles back to WATCHING, so a genuinely
        // new crash on the same strike later in the day can fire again.
        const stillCrashed = new Set(
            optionAnalysis.egbd?.signals
                .filter(signal => signal.ivCrashed)
                .map(signal => `${signal.strike}_${signal.side}`)
        );

        for (const key of state.alreadyCrashedKeys) {
            if (!stillCrashed.has(key)) {
                state.alreadyCrashedKeys.delete(key);
            }
        }

        const crashResults = detectIVCrashSignals(optionAnalysis, state.alreadyCrashedKeys);

        for (const result of crashResults) {
            state.alreadyCrashedKeys.add(result.crashKey);
            freshCandidates.push(result.candidate);
        }
    }

    const scored = scoreConfluence(
        freshCandidates, activeZones, classicalLevels.daily, classicalLevels.weekly
    );

    const trendContext = trendContextFor(underlying);
    const finalized = scored.map(candidate => finalize(candidate, trendContext, optionAnalysis));

    for (const signal of finalized) {
        logPriceStructureSignal(underlying, signal);
    }

    state.signals = pruneExpired([...finalized, ...state.signals]).slice(0, MAX_SIGNALS_KEPT);
    state.lastScannedIndex = toIndexExclusive;

    return state.signals;
}

export async function getPriceStructureSignalsByIndex(): Promise<{
    nifty: PriceStructureSignal[];
    sensex: PriceStructureSignal[];
}> {

    const [nifty, sensex] = await Promise.all([
        getPriceStructureSignals("NIFTY"),
        getPriceStructureSignals("SENSEX"),
    ]);

    return { nifty, sensex };
}
