import type { StrikeWindowSnapshot } from "../models/StrikeWindowSnapshot.js";
import type { StrikeWindowAnalysis } from "../models/StrikeWindowAnalysis.js";
import type { StrikeAnalysis } from "../models/StrikeAnalysis.js";
import type { StrikeDelta } from "../models/StrikeDelta.js";
import { analyzePremium } from "./premiumAnalyzer.js";
import { analyzeVolume } from "./volumeAnalyzer.js";
import { analyzeOI } from "../analyzers/oiAnalyzer.js";
import { analyzeGamma } from "../analyzers/gammaAnalyzer.js";
import { analyzeIV } from "../analyzers/ivAnalyzer.js";

// Below this, premiums are near-worthless (deep OTM) and a tiny
// absolute move produces a huge, meaningless percentage - fall back
// to absolute comparison rather than let noise decide dominantSide.
const MIN_PREMIUM_FOR_RELATIVE_COMPARISON = 0.5;

function relativeChange(
    change: number,
    previousValue: number
): number | null {

    if (previousValue < MIN_PREMIUM_FOR_RELATIVE_COMPARISON) {
        return null;
    }

    return Math.abs(change) / previousValue;
}

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

        // Relative (%) change, not absolute rupees - an absolute
        // comparison structurally favors whichever leg has the
        // higher premium (usually deeper ITM or higher IV) rather
        // than whichever leg is genuinely moving harder.
        const ceRelativeChange = relativeChange(
            delta.cePremiumChange,
            previousStrike.ceLastPrice
        );

        const peRelativeChange = relativeChange(
            delta.pePremiumChange,
            previousStrike.peLastPrice
        );

        let dominantSide: "CE" | "PE" | "NEUTRAL";

        if (ceRelativeChange !== null && peRelativeChange !== null) {

            dominantSide =
                ceRelativeChange > peRelativeChange
                    ? "CE"
                    : peRelativeChange > ceRelativeChange
                        ? "PE"
                        : "NEUTRAL";

        } else {

            dominantSide =
                Math.abs(delta.cePremiumChange) > Math.abs(delta.pePremiumChange)
                    ? "CE"
                    : Math.abs(delta.pePremiumChange) > Math.abs(delta.cePremiumChange)
                        ? "PE"
                        : "NEUTRAL";
        }

        analyses.push({

            strike: currentStrike.strike,

            delta,

            premiumStrength,
            oiStrength,
            volumeStrength,
            ivStrength,
            gammaStrength,

            dominantSide,

            evidence
        });
    }

    return {

    timestamp: current.timestamp,

    spotPrice: current.spotPrice,

    atmStrike: current.atmStrike,

    strikes: current.strikes,

    analyses

};
}