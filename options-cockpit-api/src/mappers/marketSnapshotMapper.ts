import type { MarketSnapshot } from "../models/MarketSnapshot.js";
import { INSTRUMENTS } from "../config/instruments.js";

export function toMarketSnapshot(dhanResponse: any): MarketSnapshot {
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

        niftyPreviousClose:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.NIFTY
            ].ohlc.close,

        sensexOpen:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.SENSEX
            ].ohlc.open,

        sensexPreviousClose:
            dhanResponse.data.IDX_I[
                INSTRUMENTS.SENSEX
            ].ohlc.close,
    };
}