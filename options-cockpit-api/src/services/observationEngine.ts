import type { StrikeAnalysis } from "../models/StrikeAnalysis.js";
import type { Observation } from "../models/Observation.js";

export function buildObservations(
    analysis: StrikeAnalysis
): Observation[] {

    const observations: Observation[] = [];

    if (analysis.premiumStrength > 0) {

        observations.push({
            title: "Premium movement detected",
            strength: analysis.premiumStrength,
            evidence: analysis.evidence
        });

    }

    if (analysis.volumeStrength > 0) {

        observations.push({
            title: "Volume participation detected",
            strength: analysis.volumeStrength,
            evidence: analysis.evidence
        });

    }

    if (analysis.oiStrength > 0) {

        observations.push({
            title: "Open Interest activity detected",
            strength: analysis.oiStrength,
            evidence: analysis.evidence
        });

    }

    if (analysis.gammaStrength > 0) {

        observations.push({
            title: "Gamma activity detected",
            strength: analysis.gammaStrength,
            evidence: analysis.evidence
        });

    }

    if (analysis.ivStrength > 0) {

        observations.push({
            title: "Implied Volatility activity detected",
            strength: analysis.ivStrength,
            evidence: analysis.evidence
        });

    }

    return observations;
}