import type { StrikeDelta } from "./StrikeDelta.js";
import type { StrikeDirection } from "./StrikeDirection.js";

export interface StrikeAnalysis {

    strike: number;

    delta: StrikeDelta;

    // Premium Intelligence
    premiumStrength: number;
    premiumVelocity: number;
    premiumAcceleration: number;

    // Open Interest Intelligence
    oiStrength: number;
    oiVelocity: number;

    // Volume Intelligence
    volumeStrength: number;
    volumeVelocity: number;

    // Volatility Intelligence
    ivStrength: number;

    // Gamma Intelligence
    gammaStrength: number;

    // Trend Intelligence
    trendAge: number;

    // Overall Assessment
    totalStrength: number;

    dominantSide: StrikeDirection;

    evidence: string[];
}