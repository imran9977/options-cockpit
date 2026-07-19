interface VixHistory { close: number[]; }
import type { VixHealth } from "../models/VixHealth.js";

function average(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function determineRegime(
    current: number,
    averageVix: number
): string {

    if (current >= averageVix + 2) {
        return "High Volatility";
    }

    if (current <= averageVix - 2) {
        return "Low Volatility";
    }

    return "Normal Volatility";
}

function determineMomentum(
    current: number,
    previous: number
): string {

    const change = current - previous;

    if (change >= 0.75) {
        return "Rising";
    }

    if (change <= -0.75) {
        return "Falling";
    }

    return "Stable";
}

function determinePremiumOutlook(
    current: number,
    averageVix: number
): string {

    if (current >= averageVix + 1) {
        return "Expensive";
    }

    if (current <= averageVix - 1) {
        return "Cheap";
    }

    return "Fair";
}

function determineTradingEnvironment(
    current: number,
    averageVix: number
): string {

    if (current >= averageVix + 2) {
        return "High Risk";
    }

    if (current <= averageVix - 2) {
        return "Favorable";
    }

    return "Balanced";
}

export function analyzeVixHealth(
    history: VixHistory
): VixHealth {

    const closes = history.close;

    if (closes.length < 2) {
        return {
            current: 0,
            previous: 0,
            average20Day: 0,
            high20Day: 0,
            low20Day: 0,

            regime: "Unknown",
            momentum: "Unknown",
            premiumOutlook: "Unknown",
            tradingEnvironment: "Unknown"
        };
    }

    const current = closes[closes.length - 1];
    const previous = closes[closes.length - 2];

    const averageVix = average(closes);
    const high20Day = Math.max(...closes);
    const low20Day = Math.min(...closes);

    return {
        current,
        previous,
        average20Day: averageVix,
        high20Day,
        low20Day,

        regime: determineRegime(current, averageVix),
        momentum: determineMomentum(current, previous),
        premiumOutlook: determinePremiumOutlook(current, averageVix),
        tradingEnvironment: determineTradingEnvironment(current, averageVix)
    };
}