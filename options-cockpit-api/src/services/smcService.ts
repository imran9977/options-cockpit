import { getIntradayCandles, getCandleIntervalMinutes } from "./intradayCandleService.js";
import { detectNewZones, updateZoneStatuses } from "../analyzers/smcZoneDetector.js";
import type { IntradayCandle, SMCAnalysis, SMCZone } from "../models/SMCAnalysis.js";
import type { Underlying } from "../config/instruments.js";

function dateStr(date: Date): string {
    return date.toISOString().split("T")[0];
}

// intradayCandleService retains 7 days for other reasons (avoiding
// refetch, letting a cold-started process recover today without
// waiting), but Price Structure itself should only ever reflect
// today's own OBs/FVGs/IFVGs - a zone detected against a prior day's
// candles has no bearing on today's setups. Filtered once here,
// before any detector runs, rather than teaching each detector its
// own date guard (detectFVG already had one for its own reasons;
// detectOrderBlock did not, and could otherwise use yesterday's
// closing candles as "prior structure" for today's first bars).
function onlyToday(candles: readonly IntradayCandle[], today: string): IntradayCandle[] {
    return candles.filter(candle => dateStr(new Date(candle.timestamp)) === today);
}

interface UnderlyingState {
    date: string;
    zones: SMCZone[];
    lastScannedIndex: number;
    // Detection keys seen so far, tracked independently of the zones
    // array's own mutable `type` field - a zone that inverts (FVG ->
    // IFVG) changes its stored type in place, but a rescan
    // re-evaluating the same raw candle pair still produces a fresh
    // object with the ORIGINAL type, and must be recognized as the
    // same zone rather than pushed as a duplicate.
    seenZoneKeys: Set<string>;
}

function freshState(date: string): UnderlyingState {
    return {
        date,
        zones: [],
        lastScannedIndex: 0,
        seenZoneKeys: new Set(),
    };
}

const stateByUnderlying: Record<Underlying, UnderlyingState> = {
    NIFTY: freshState(""),
    SENSEX: freshState(""),
};

function zoneKey(zone: SMCZone): string {
    return `${zone.type}_${zone.direction}_${zone.startTime}`;
}

// The most recently scanned candle(s) may have still been the
// currently-forming bar when first scanned, with values that keep
// revising until its 5-minute window closes. Re-examining a couple
// of previously-scanned indices catches a pattern that only becomes
// real once those values settle.
const RESCAN_TAIL = 2;

export async function getSMCAnalysis(underlying: Underlying): Promise<SMCAnalysis> {

    const today = dateStr(new Date());
    let state = stateByUnderlying[underlying];

    // New trading day - yesterday's zones have nothing to do with
    // today's setups.
    if (state.date !== today) {
        state = freshState(today);
        stateByUnderlying[underlying] = state;
    }

    const allCandles = await getIntradayCandles(underlying);
    const candles = onlyToday(allCandles, today);

    const rescanFrom = Math.max(0, state.lastScannedIndex - RESCAN_TAIL);

    const newZones = detectNewZones(candles, rescanFrom);

    for (const zone of newZones) {
        const key = zoneKey(zone);
        if (!state.seenZoneKeys.has(key)) {
            state.zones.push(zone);
            state.seenZoneKeys.add(key);
        }
    }

    updateZoneStatuses(state.zones, candles, rescanFrom);

    state.lastScannedIndex = candles.length;

    return {
        underlying,
        intervalMinutes: getCandleIntervalMinutes(),
        candles: candles as IntradayCandle[],
        zones: state.zones,
        lastUpdated: Date.now(),
    };
}

export async function getSMCAnalysisByIndex(): Promise<{
    nifty: SMCAnalysis;
    sensex: SMCAnalysis;
}> {

    const [nifty, sensex] = await Promise.all([
        getSMCAnalysis("NIFTY"),
        getSMCAnalysis("SENSEX"),
    ]);

    return { nifty, sensex };
}
