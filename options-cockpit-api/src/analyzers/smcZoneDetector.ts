import type { IntradayCandle, SMCZone, SMCZoneType } from "../models/SMCAnalysis.js";

// Starting values, explicitly unvalidated against real outcomes yet -
// same caveat as every other threshold in this codebase (EGBD's
// TYPICAL_MOVE, the position build-up hint threshold, etc).
const ATR_LOOKBACK = 14;
// Raised from 0.05 to 0.15 (and displacement from 1.5x to 2x below) -
// checked live, the looser values produced dozens of zones a day when
// the actual goal is a short, curated watchlist for 2-3 trades a day,
// not a log of every technically-qualifying pattern.
const FVG_MIN_GAP_RATIO = 0.15;
const OB_STRUCTURE_LOOKBACK = 15;
const OB_DISPLACEMENT_MULTIPLIER = 2;
// A 3-candle window (checked live against 375 real 5-min Nifty
// candles) fired 93 times - almost any minor wiggle is technically
// the single extreme among its nearest 7 neighbors. 8 is still below
// TradingView's own Pivot High/Low default of 10 (tuned for daily
// charts, too much lag here), but selective enough to mean something
// on a 5-minute chart.
const SWEEP_FRACTAL_WINDOW = 8;
const SWEEP_SEARCH_BACK = 40;

function sameCalendarDate(a: number, b: number): boolean {
    return new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);
}

function averageRange(
    candles: IntradayCandle[],
    endIndexExclusive: number,
    lookback: number
): number {

    const start = Math.max(0, endIndexExclusive - lookback);
    const slice = candles.slice(start, endIndexExclusive);

    if (slice.length === 0) {
        return 0;
    }

    const total = slice.reduce((sum, candle) => sum + (candle.high - candle.low), 0);

    return total / slice.length;
}

let zoneCounter = 0;

function makeZone(
    type: SMCZoneType,
    direction: "bullish" | "bearish",
    priceA: number,
    priceB: number,
    startTime: number,
    strength: number
): SMCZone {

    zoneCounter += 1;

    return {
        id: `${type}_${startTime}_${zoneCounter}`,
        type,
        direction,
        top: Math.max(priceA, priceB),
        bottom: Math.min(priceA, priceB),
        startTime,
        endTime: null,
        status: "active",
        strength,
    };
}

// Standard 3-candle ICT/SMC definition: candle[i-2] and candle[i]
// leave a range that candle[i-1] never traded into.
function detectFVG(candles: IntradayCandle[], i: number): SMCZone | null {

    const left = candles[i - 2];
    const middle = candles[i - 1];
    const right = candles[i];

    // Dhan's intraday feed has no gap between one day's 15:30 close
    // and the next day's 09:15 open - an unguarded scan would flag a
    // fake multi-hundred-point FVG every single morning.
    if (!sameCalendarDate(left.timestamp, right.timestamp)) {
        return null;
    }

    const avgRange = averageRange(candles, i - 2, ATR_LOOKBACK);
    const minGap = avgRange * FVG_MIN_GAP_RATIO;

    if (left.high < right.low && right.low - left.high >= minGap) {
        const gapSize = right.low - left.high;
        return makeZone("FVG", "bullish", left.high, right.low, middle.timestamp, avgRange > 0 ? gapSize / avgRange : 0);
    }

    if (left.low > right.high && left.low - right.high >= minGap) {
        const gapSize = left.low - right.high;
        return makeZone("FVG", "bearish", right.high, left.low, middle.timestamp, avgRange > 0 ? gapSize / avgRange : 0);
    }

    return null;
}

// The last opposite-colored candle before a "displacement" candle
// that breaks the recent structural high/low with above-average range.
function detectOrderBlock(candles: IntradayCandle[], i: number): SMCZone | null {

    const lookbackStart = i - OB_STRUCTURE_LOOKBACK;

    if (lookbackStart < 0) {
        return null;
    }

    const priorSlice = candles.slice(lookbackStart, i);
    const priorHigh = Math.max(...priorSlice.map(candle => candle.high));
    const priorLow = Math.min(...priorSlice.map(candle => candle.low));

    const breakout = candles[i];
    const breakoutRange = breakout.high - breakout.low;
    const avgRange = averageRange(candles, i, OB_STRUCTURE_LOOKBACK);

    if (breakoutRange < avgRange * OB_DISPLACEMENT_MULTIPLIER) {
        return null;
    }

    const isBullishBreak = breakout.close > priorHigh;
    const isBearishBreak = breakout.close < priorLow;

    if (!isBullishBreak && !isBearishBreak) {
        return null;
    }

    const direction: "bullish" | "bearish" = isBullishBreak ? "bullish" : "bearish";
    const wantDownCandle = isBullishBreak;

    for (let j = i - 1; j >= lookbackStart; j--) {

        const candle = candles[j];
        const isDown = candle.close < candle.open;
        const isUp = candle.close > candle.open;

        if ((wantDownCandle && isDown) || (!wantDownCandle && isUp)) {
            const strength = avgRange > 0 ? breakoutRange / avgRange : 0;
            return makeZone("OB", direction, candle.low, candle.high, candle.timestamp, strength);
        }
    }

    return null;
}

function isFractalLow(candles: IntradayCandle[], i: number, window: number): boolean {

    if (i - window < 0 || i + window >= candles.length) {
        return false;
    }

    const center = candles[i].low;

    for (let k = i - window; k <= i + window; k++) {
        if (k !== i && candles[k].low <= center) {
            return false;
        }
    }

    return true;
}

function isFractalHigh(candles: IntradayCandle[], i: number, window: number): boolean {

    if (i - window < 0 || i + window >= candles.length) {
        return false;
    }

    const center = candles[i].high;

    for (let k = i - window; k <= i + window; k++) {
        if (k !== i && candles[k].high >= center) {
            return false;
        }
    }

    return true;
}

// A confirmed swing point (fractal high/low) whose wick gets breached
// by a later candle that closes back on the original side - the
// classic stop-hunt-then-reject pattern. No volume/follow-through
// filter - pure geometry, since entry confirmation is out of scope.
//
// Kept defined but not called from detectNewZones below - a sweep is
// a point-in-time event that already happened, not a forward-looking
// range to watch, so it doesn't belong in a curated watchlist table
// the way OB/FVG/IFVG do. Left in place rather than deleted since
// sweeps were one of the four things explicitly asked for, and this
// may still feed future confirmation logic.
function detectSweep(candles: IntradayCandle[], i: number): SMCZone | null {

    const window = SWEEP_FRACTAL_WINDOW;
    const current = candles[i];
    const searchStart = Math.max(window, i - SWEEP_SEARCH_BACK);

    for (let p = i - window - 1; p >= searchStart; p--) {

        if (isFractalLow(candles, p, window)) {
            const swingLow = candles[p].low;
            if (current.low < swingLow && current.close > swingLow) {
                return makeZone("SWEEP", "bullish", current.low, swingLow, current.timestamp, 0);
            }
        }

        if (isFractalHigh(candles, p, window)) {
            const swingHigh = candles[p].high;
            if (current.high > swingHigh && current.close < swingHigh) {
                return makeZone("SWEEP", "bearish", swingHigh, current.high, current.timestamp, 0);
            }
        }
    }

    return null;
}

// Mirrors detectNewZones' loop shape, feeding the suggestion engine's
// candidate list rather than the zones-table array - a sweep is a
// point-in-time event, not a zone to track ongoing status for.
export function detectNewSweeps(
    candles: readonly IntradayCandle[],
    fromIndex: number
): SMCZone[] {

    const list = candles as IntradayCandle[];
    const sweeps: SMCZone[] = [];
    const start = Math.max(SWEEP_FRACTAL_WINDOW + 1, fromIndex);

    for (let i = start; i < list.length; i++) {
        const sweep = detectSweep(list, i);
        if (sweep) {
            sweeps.push(sweep);
        }
    }

    return sweeps;
}

// Scoped to only the newly-closed tail (fromIndex onward) - never a
// full rescan of the cached array. Backward-looking comparisons still
// see the full history, only the right-edge candle being evaluated
// is bounded.
export function detectNewZones(
    candles: readonly IntradayCandle[],
    fromIndex: number
): SMCZone[] {

    const list = candles as IntradayCandle[];
    const zones: SMCZone[] = [];
    const start = Math.max(2, fromIndex);

    for (let i = start; i < list.length; i++) {

        const fvg = detectFVG(list, i);
        if (fvg) {
            zones.push(fvg);
        }

        const ob = detectOrderBlock(list, i);
        if (ob) {
            zones.push(ob);
        }
    }

    return zones;
}

// Mutates existing zones in place - an FVG that inverts becomes an
// IFVG on the SAME record (matches egbdEngine.ts mutating state.stage
// through an enum rather than creating new records per stage), not a
// freshly spawned zone.
export function updateZoneStatuses(
    zones: SMCZone[],
    candles: readonly IntradayCandle[],
    fromIndex: number
): void {

    const list = candles as IntradayCandle[];
    const start = Math.max(0, fromIndex);

    for (let i = start; i < list.length; i++) {

        const candle = list[i];

        for (const zone of zones) {

            if (zone.status === "invalidated" || candle.timestamp <= zone.startTime) {
                continue;
            }

            if (zone.type === "FVG") {

                const closedThroughAgainstBias =
                    zone.direction === "bullish"
                        ? candle.close < zone.bottom
                        : candle.close > zone.top;

                if (closedThroughAgainstBias) {
                    zone.type = "IFVG";
                    zone.role = zone.direction === "bullish" ? "resistance" : "support";
                    zone.status = "active";
                    zone.endTime = candle.timestamp;
                    continue;
                }

                const touchedInside = candle.low <= zone.top && candle.high >= zone.bottom;

                if (touchedInside && zone.status === "active") {
                    zone.status = "filled";
                }

            } else if (zone.type === "IFVG") {

                const invalidatedAgain =
                    zone.role === "resistance"
                        ? candle.close > zone.top
                        : candle.close < zone.bottom;

                if (invalidatedAgain) {
                    zone.status = "invalidated";
                    zone.endTime = candle.timestamp;
                }

            } else if (zone.type === "OB") {

                const invalidated =
                    zone.direction === "bullish"
                        ? candle.close < zone.bottom
                        : candle.close > zone.top;

                if (invalidated) {
                    zone.status = "invalidated";
                    zone.endTime = candle.timestamp;
                }

            } else if (zone.type === "SWEEP") {

                // Point-in-time event, not a persistent zone to test
                // against future candles.
                zone.status = "filled";
            }
        }
    }
}
