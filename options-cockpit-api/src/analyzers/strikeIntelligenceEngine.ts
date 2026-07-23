import type { StrikeWindowSnapshot } from "../models/StrikeWindowSnapshot.js";
import type { StrikeWindowAnalysis } from "../models/StrikeWindowAnalysis.js";
import type { StrikeAnalysis } from "../models/StrikeAnalysis.js";
import type { StrikeDelta } from "../models/StrikeDelta.js";
import { analyzePremium } from "./premiumAnalyzer.js";
import { analyzeVolume } from "./volumeAnalyzer.js";
import { analyzeOI } from "../analyzers/oiAnalyzer.js";
import { analyzeGamma } from "../analyzers/gammaAnalyzer.js";
import { analyzeIV } from "../analyzers/ivAnalyzer.js";

export function analyzeStrikeWindow(
    previous: StrikeWindowSnapshot,
    current: StrikeWindowSnapshot
): StrikeWindowAnalysis {

    const analyses: StrikeAnalysis[] = [];

    for (const currentStrike of current.strikes) {

        const previousStrike = previous.strikes.find(
            strike => strike.strike === currentStrike.strike
        );

        if (!previousStrike) {
            continue;
        }

        const delta: StrikeDelta = {

            strike: currentStrike.strike,

            cePremiumChange: currentStrike.ceLastPrice - previousStrike.ceLastPrice,
            pePremiumChange: currentStrike.peLastPrice - previousStrike.peLastPrice,

            ceOIChange: currentStrike.ceOI - previousStrike.ceOI,
            peOIChange: currentStrike.peOI - previousStrike.peOI,

            ceVolumeChange: currentStrike.ceVolume - previousStrike.ceVolume,
            peVolumeChange: currentStrike.peVolume - previousStrike.peVolume,

            ceIVChange: currentStrike.ceIV - previousStrike.ceIV,
            peIVChange: currentStrike.peIV - previousStrike.peIV,

            ceGammaChange: currentStrike.ceGamma - previousStrike.ceGamma,
            peGammaChange: currentStrike.peGamma - previousStrike.peGamma
        };

        const evidence: string[] = [];

        const premiumStrength = analyzePremium(
            delta,
            evidence
        );

        const volumeStrength = analyzeVolume(
            delta,
            evidence
        );

        const oiStrength = analyzeOI(
            delta,
            evidence
        );

        const gammaStrength = analyzeGamma(
            delta,
            evidence
        );

        const ivStrength = analyzeIV(
            delta,
            evidence
        );

        const dominantSide =
            Math.abs(delta.cePremiumChange) > Math.abs(delta.pePremiumChange)
                ? "CE"
                : Math.abs(delta.pePremiumChange) > Math.abs(delta.cePremiumChange)
                    ? "PE"
                    : "NEUTRAL";

        analyses.push({

            strike: currentStrike.strike,

            delta,

            // Premium Intelligence
            premiumStrength,
            premiumVelocity: 0,
            premiumAcceleration: 0,

            // Open Interest Intelligence
            oiStrength,
            oiVelocity: 0,

            // Volume Intelligence
            volumeStrength,
            volumeVelocity: 0,

            // Volatility Intelligence
            ivStrength,

            // Gamma Intelligence
            gammaStrength,

            // Trend Intelligence
            trendAge: 0,

            // Overall Assessment
            totalStrength: premiumStrength,

            dominantSide,

            evidence
        });
    }

    return {
        timestamp: current.timestamp,
        spotPrice: current.spotPrice,
        atmStrike: current.atmStrike,
        analyses
    };
}