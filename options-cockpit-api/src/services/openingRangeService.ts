import type { IntradayCandle } from "../models/SMCAnalysis.js";
import type { Underlying } from "../config/instruments.js";

export interface OpeningRange {
    high: number;
    low: number;
    candleTimestamp: number;
}

interface OpeningRangeCache {
    date: string;
    range: OpeningRange;
}

const cacheByUnderlying: Record<Underlying, OpeningRangeCache | null> = {
    NIFTY: null,
    SENSEX: null,
};

function dateStr(date: Date): string {
    return date.toISOString().split("T")[0];
}

// Today's first 5-min candle's high/low, fixed for the rest of the
// session once captured - same per-day cache idiom as
// classicalLevelsService's pivot cache. Waits for a SECOND candle to
// exist before trusting the first one's values, since the still-
// forming latest candle keeps revising until its window closes
// (same caveat intradayCandleService's own merge logic documents).
export function getOpeningRange(
    underlying: Underlying,
    candles: readonly IntradayCandle[]
): OpeningRange | null {

    const today = dateStr(new Date());
    const cache = cacheByUnderlying[underlying];

    if (cache && cache.date === today) {
        return cache.range;
    }

    const todaysCandles = candles.filter(
        candle => dateStr(new Date(candle.timestamp)) === today
    );

    if (todaysCandles.length < 2) {
        return null;
    }

    const first = todaysCandles[0];

    const range: OpeningRange = {
        high: first.high,
        low: first.low,
        candleTimestamp: first.timestamp,
    };

    cacheByUnderlying[underlying] = { date: today, range };

    return range;
}
