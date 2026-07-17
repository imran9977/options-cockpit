import { MarketSnapshot } from "../models/MarketSnapshot.js";
import { MarketMetrics } from "../models/MarketMetrics.js";

export function toMarketMetrics(
    snapshot: MarketSnapshot
): MarketMetrics {

    return {
        niftyDistanceFromHigh:
            snapshot.niftyDayHigh - snapshot.niftySpot,

        niftyDistanceFromLow:
            snapshot.niftySpot - snapshot.niftyDayLow,

        niftyDayRange:
            snapshot.niftyDayHigh - snapshot.niftyDayLow,

        sensexDistanceFromHigh:
            snapshot.sensexDayHigh - snapshot.sensexSpot,

        sensexDistanceFromLow:
            snapshot.sensexSpot - snapshot.sensexDayLow,

        sensexDayRange:
            snapshot.sensexDayHigh - snapshot.sensexDayLow,

        niftyGap:
            snapshot.niftyOpen - snapshot.niftyPreviousClose,

        sensexGap:
            snapshot.sensexOpen - snapshot.sensexPreviousClose,
    };
}