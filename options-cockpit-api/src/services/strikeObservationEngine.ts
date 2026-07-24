import type { StrikeWindowAnalysis } from "../models/StrikeWindowAnalysis.js";
import type { Observation } from "../models/Observation.js";
import { buildObservations } from "./observationEngine.js";

export function buildStrikeObservations(
    analysis: StrikeWindowAnalysis
): Observation[] {

    const observations: Observation[] = [];

    for (const strikeAnalysis of analysis.analyses) {

        observations.push(
            ...buildObservations(strikeAnalysis)
        );

    }

    return observations;
}