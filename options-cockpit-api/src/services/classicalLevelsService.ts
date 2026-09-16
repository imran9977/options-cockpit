import { config } from "../config/config.js";
import { UNDERLYING_CONFIG, type Underlying } from "../config/instruments.js";
import type {
    ClassicalLevels,
    PivotLevels,
} from "../models/ClassicalLevels.js";

interface DailyCandle {
    date: string; // YYYY-MM-DD (UTC)
    high: number;
    low: number;
    close: number;
}

interface HistoricalCandlesResponse {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
    timestamp: number[];
}

function toDateOnlyString(date: Date): string {
    return date.toISOString().split("T")[0];
}

function formatRequestDate(date: Date): string {
    return toDateOnlyString(date);
}

// Dhan's historical timestamps have been observed in epoch seconds.
// Guard against a future switch to milliseconds either way.
function normalizeEpoch(timestamp: number): Date {
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    return new Date(ms);
}

async function fetchDailyCandles(
    securityId: number,
    lookbackDays: number
): Promise<DailyCandle[]> {

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - lookbackDays);

    const response = await fetch(
        `${config.dhan.baseUrl}/v2/charts/historical`,
        {
            method: "POST",
            headers: {
                "access-token": config.dhan.accessToken,
                "client-id": config.dhan.clientId,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                securityId: String(securityId),
                exchangeSegment: "IDX_I",
                instrument: "INDEX",
                fromDate: formatRequestDate(fromDate),
                toDate: formatRequestDate(toDate),
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            `Dhan Historical Candles API Error: ${response.status}`
        );
    }

    const data: HistoricalCandlesResponse = await response.json();

    const candles: DailyCandle[] = data.timestamp.map((ts, i) => ({
        date: toDateOnlyString(normalizeEpoch(ts)),
        high: data.high[i],
        low: data.low[i],
        close: data.close[i],
    }));

    candles.sort((a, b) => a.date.localeCompare(b.date));

    return candles;
}

function calculatePivot(
    high: number,
    low: number,
    close: number
): PivotLevels {

    const pivot = (high + low + close) / 3;
    const range = high - low;

    return {
        pivot: Number(pivot.toFixed(2)),
        r1: Number((2 * pivot - low).toFixed(2)),
        s1: Number((2 * pivot - high).toFixed(2)),
        r2: Number((pivot + range).toFixed(2)),
        s2: Number((pivot - range).toFixed(2)),
        r3: Number((high + 2 * (pivot - low)).toFixed(2)),
        s3: Number((low - 2 * (high - pivot)).toFixed(2)),
        previousHigh: high,
        previousLow: low,
        previousClose: close,
    };
}

function getPreviousCompletedDay(
    candles: DailyCandle[],
    today: string
): DailyCandle | null {

    const completed = candles.filter(candle => candle.date !== today);

    return completed.length > 0
        ? completed[completed.length - 1]
        : null;
}

// Monday (UTC midnight) of the week containing the given date.
function getMondayOf(date: Date): Date {

    const monday = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );

    const dayOfWeek = monday.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    monday.setUTCDate(monday.getUTCDate() - diffToMonday);

    return monday;
}

function getPreviousCompletedWeek(
    candles: DailyCandle[],
    today: Date
): DailyCandle[] {

    const currentWeekMonday = getMondayOf(today);

    const previousWeekMonday = new Date(currentWeekMonday);
    previousWeekMonday.setUTCDate(previousWeekMonday.getUTCDate() - 7);

    const previousWeekSunday = new Date(currentWeekMonday);
    previousWeekSunday.setUTCDate(previousWeekSunday.getUTCDate() - 1);

    const startStr = toDateOnlyString(previousWeekMonday);
    const endStr = toDateOnlyString(previousWeekSunday);

    return candles.filter(
        candle => candle.date >= startStr && candle.date <= endStr
    );
}

function calculateRoundNumbers(spotPrice: number) {

    const floor50 = Math.floor(spotPrice / 50) * 50;
    const floor100 = Math.floor(spotPrice / 100) * 100;

    return {
        nearestBelow50: floor50,
        nearestAbove50: floor50 + 50,
        nearestBelow100: floor100,
        nearestAbove100: floor100 + 100,
    };
}

interface PivotCache {
    date: string;
    daily: PivotLevels;
    weekly: PivotLevels | null;
}

// Previous day/week high-low-close is fixed for the whole trading
// day - refetching it every 5s poll would be pure waste and risks
// the same rate-limit problem as before. Cache by calendar date, one
// slot per underlying - previously a single shared slot, which meant
// a same-day call for a second instrument would silently return the
// first instrument's cached pivots.
const cacheByUnderlying: Record<Underlying, PivotCache | null> = {
    NIFTY: null,
    SENSEX: null,
};

async function loadPivotsForToday(
    underlying: Underlying
): Promise<PivotCache> {

    const now = new Date();
    const today = toDateOnlyString(now);

    const cache = cacheByUnderlying[underlying];

    if (cache && cache.date === today) {
        return cache;
    }

    // 20 calendar days comfortably covers the previous trading day and
    // the previous full trading week, even across weekends/holidays.
    const candles = await fetchDailyCandles(
        UNDERLYING_CONFIG[underlying].scrip,
        20
    );

    const previousDay = getPreviousCompletedDay(candles, today);

    if (!previousDay) {
        throw new Error(
            "Not enough historical data to compute classical levels"
        );
    }

    const daily = calculatePivot(
        previousDay.high,
        previousDay.low,
        previousDay.close
    );

    const previousWeekCandles = getPreviousCompletedWeek(candles, now);

    const weekly = previousWeekCandles.length > 0
        ? calculatePivot(
            Math.max(...previousWeekCandles.map(c => c.high)),
            Math.min(...previousWeekCandles.map(c => c.low)),
            previousWeekCandles[previousWeekCandles.length - 1].close
        )
        : null;

    const freshCache: PivotCache = { date: today, daily, weekly };
    cacheByUnderlying[underlying] = freshCache;

    return freshCache;
}

export async function getClassicalLevels(
    underlying: Underlying,
    spotPrice: number
): Promise<ClassicalLevels> {

    const { daily, weekly } = await loadPivotsForToday(underlying);

    return {
        daily,
        weekly,
        roundNumbers: calculateRoundNumbers(spotPrice),
    };
}
