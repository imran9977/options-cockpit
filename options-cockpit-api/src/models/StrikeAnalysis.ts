import type { StrikeDelta } from "./StrikeDelta.js";
import type { StrikeDirection } from "./StrikeDirection.js";

export interface StrikeAnalysis {

    strike: number;

    delta: StrikeDelta;

    // Premium Intelligence
    premiumStrength: number;

    // Open Interest Intelligence
    oiStrength: number;

    // Volume Intelligence
    volumeStrength: number;

    // Volatility Intelligence
    ivStrength: number;

    // Gamma Intelligence
    gammaStrength: number;

    dominantSide: StrikeDirection;

    evidence: string[];
}