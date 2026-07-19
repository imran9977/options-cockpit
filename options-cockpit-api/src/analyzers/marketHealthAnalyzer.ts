type MarketHealth = {
    trend: string;
    opening: string;
    structure: string;
    rangeState: string;
    momentum: string;
};

function determineTrend(
    spot: number,
    previousClose: number
): string {
    if (spot > previousClose) return "Bullish";
    if (spot < previousClose) return "Bearish";
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
    if (spot > open) return "Above VWAP";
    if (spot < open) return "Below VWAP";

    return "At VWAP";
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