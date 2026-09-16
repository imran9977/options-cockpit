import type { MarketSnapshot } from "../models/MarketSnapshot.js";
import { INSTRUMENTS } from "../config/instruments.js";

export function toMarketSnapshot(
    dhanResponse: any,
    niftyPreviousClose: number,
    sensexPreviousClose: number
): MarketSnapshot {
    return {
        niftySpot:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.NIFTY
            ].last_price,

        niftyDayHigh:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.NIFTY
            ].ohlc.high,

        niftyDayLow:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.NIFTY
            ].ohlc.low,

        sensexSpot:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.SENSEX
            ].last_price,

        sensexDayHigh:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.SENSEX
            ].ohlc.high,

        sensexDayLow:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.SENSEX
            ].ohlc.low,

        indiaVix:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.INDIA_VIX
            ].last_price,

        niftyOpen:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.NIFTY
            ].ohlc.open,

        // Dhan's live ohlc.close for an index quote tracks the
        // still-forming current price during market hours (it was
        // observed identical to last_price intraday), not yesterday's
        // settled close - the real previous close instead comes from
        // classicalLevelsService's actual daily-candle history, which
        // buildOptionAnalysisFor already computes per underlying.
        niftyPreviousClose,

        sensexOpen:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.SENSEX
            ].ohlc.open,

        sensexPreviousClose,
    };
}