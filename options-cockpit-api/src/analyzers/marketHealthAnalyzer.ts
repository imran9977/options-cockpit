type MarketHealth = {
    trend: string;
    opening: string;
    structure: string;
    rangeState: string;
    momentum: string;
};

// Percentage, not a fixed point count - so this stays meaningful as
// Nifty's price level drifts over months/years, unlike the ±10 point
// gap threshold or the fixed-point range bands elsewhere in this file.
const TREND_DEAD_ZONE_PERCENT = 0.05;

function determineTrend(
    spot: number,
    previousClose: number
): string {

    if (previousClose === 0) {
        return "Neutral";
    }

    const changePercent =
        ((spot - previousClose) / previousClose) * 100;

    if (changePercent > TREND_DEAD_ZONE_PERCENT) return "Bullish";
    if (changePercent < -TREND_DEAD_ZONE_PERCENT) return "Bearish";

    return "Neutral";
}

function determineOpening(
    open: number,
    previousClose: number
): string {
    const gap = open - previousClose;

    if (gap > 10) return "Gap Up";
    if (gap < -10) return "Gap Down";

    return "Flat";
}

function determineStructure(
    spot: number,
    open: number
): string {
    // This compares spot to today's open, not to a true
    // volume-weighted average price - kept as "Above/Below Open"
    // rather than mislabeling it VWAP.
    if (spot > open) return "Above Open";
    if (spot < open) return "Below Open";

    return "At Open";
}

function determineRangeState(
    dayRange: number
): string {
    if (dayRange >= 250) return "Expanding";
    if (dayRange >= 120) return "Normal";

    return "Narrow";
}

function determineMomentum(
    spot: number,
    open: number
): string {

    const move = spot - open;

    if (move >= 150) return "Strong Buying";
    if (move >= 40) return "Moderate Buying";
    if (move <= -150) return "Strong Selling";
    if (move <= -40) return "Moderate Selling";

    return "Neutral";
}

// Real momentum: rate of change over the last ~60s of live polling
// (see historyEngine.ts), not a static spot-vs-open snapshot.
// Thresholds are a starting estimate, not empirically calibrated -
// worth checking against the signal-logger's evidence once there's
// enough live data to see if they hold up.
export function determineVelocityMomentum(
    velocity: number
): string {

    if (velocity >= 15) return "Strong Buying";
    if (velocity >= 5) return "Moderate Buying";
    if (velocity <= -15) return "Strong Selling";
    if (velocity <= -5) return "Moderate Selling";

    return "Neutral";
}

export function analyzeMarketHealth(
    spot: number,
    open: number,
    previousClose: number,
    dayRange: number
): MarketHealth {

    return {
        trend: determineTrend(
            spot,
            previousClose
        ),
        opening: determineOpening(
            open,
            previousClose
        ),
        structure: determineStructure(
            spot,
            open
        ),
        rangeState: determineRangeState(
            dayRange
        ),
        momentum: determineMomentum(
            spot,
            open
        )
    };

}