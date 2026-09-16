import { config } from "../config/config.js";
import { UNDERLYING_CONFIG, type Underlying } from "../config/instruments.js";
import type { IntradayCandle } from "../models/SMCAnalysis.js";

// 5-minute, not 1-minute: the failure mode this feature exists to fix
// is overreacting to short-term noise, and 1-minute candles are
// strictly noisier - more fake FVGs, more OBs invalidated within
// minutes, more meaningless sweep flags.
const CANDLE_INTERVAL_MINUTES = 5;

const RETENTION_DAYS = 7;

// Re-fetch at most once a minute - candles only close every 5
// minutes, so this is already generous, not a bottleneck.
const FETCH_THROTTLE_MS = 60 * 1000;

interface CandleCache {
    candles: IntradayCandle[];
    lastFetchedAt: number;
}

function createCache(): CandleCache {
    return { candles: [], lastFetchedAt: 0 };
}

const cacheByUnderlying: Record<Underlying, CandleCache> = {
    NIFTY: createCache(),
    SENSEX: createCache(),
};

function dateStr(date: Date): string {
    return date.toISOString().split("T")[0];
}

interface IntradayResponse {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
    timestamp: number[];
}

function toCandles(data: IntradayResponse): IntradayCandle[] {
    return data.timestamp.map((ts, i) => ({
        // Dhan's intraday timestamps are epoch seconds.
        timestamp: ts * 1000,
        open: data.open[i],
        high: data.high[i],
        low: data.low[i],
        close: data.close[i],
        volume: data.volume[i],
    }));
}

async function fetchIntraday(
    underlying: Underlying,
    fromDate: string,
    toDate: string
): Promise<IntradayCandle[]> {

    const { scrip, seg } = UNDERLYING_CONFIG[underlying];

    const response = await fetch(`${config.dhan.baseUrl}/v2/charts/intraday`, {
        method: "POST",
        headers: {
            "access-token": config.dhan.accessToken,
            "client-id": config.dhan.clientId,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            securityId: String(scrip),
            exchangeSegment: seg,
            instrument: "INDEX",
            interval: String(CANDLE_INTERVAL_MINUTES),
            fromDate,
            toDate,
        }),
    });

    if (!response.ok) {
        throw new Error(`Dhan Intraday API Error: ${response.status}`);
    }

    const data: IntradayResponse = await response.json();

    return toCandles(data);
}

// Merges a freshly-fetched tail over the cached array. Overwrites,
// not just appends - the still-forming latest candle's OHLC keeps
// revising on every fetch until its 5-minute window actually closes,
// so treating previously-seen candles as immutable would freeze that
// candle at its first-seen values forever.
function mergeCandles(
    existing: IntradayCandle[],
    fresh: IntradayCandle[]
): IntradayCandle[] {

    const byTimestamp = new Map<number, IntradayCandle>();

    for (const candle of existing) {
        byTimestamp.set(candle.timestamp, candle);
    }

    for (const candle of fresh) {
        byTimestamp.set(candle.timestamp, candle);
    }

    return Array.from(byTimestamp.values()).sort(
        (a, b) => a.timestamp - b.timestamp
    );
}

function pruneOldCandles(candles: IntradayCandle[]): IntradayCandle[] {

    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

    return candles.filter(candle => candle.timestamp >= cutoff);
}

export async function getIntradayCandles(
    underlying: Underlying
): Promise<readonly IntradayCandle[]> {

    const cache = cacheByUnderlying[underlying];
    const now = Date.now();

    if (cache.candles.length > 0 && now - cache.lastFetchedAt < FETCH_THROTTLE_MS) {
        return cache.candles;
    }

    const today = new Date();

    // Tail-fetch only: bound fromDate to today whenever we already
    // have history, so the response comes back small. Only pull the
    // full retention window on a cold cache (process just started).
    const fromDate = cache.candles.length > 0
        ? dateStr(today)
        : dateStr(new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000));

    const fresh = await fetchIntraday(underlying, fromDate, dateStr(today));

    cache.candles = pruneOldCandles(mergeCandles(cache.candles, fresh));
    cache.lastFetchedAt = now;

    return cache.candles;
}

export function getCandleIntervalMinutes(): number {
    return CANDLE_INTERVAL_MINUTES;
}
