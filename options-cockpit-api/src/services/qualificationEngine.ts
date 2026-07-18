import type { ConfirmationResult } from "../models/ConfirmationResult.js";
import type { QualifiedObservation } from "../models/QualifiedObservation.js";

export function qualifyObservation(
    confirmation: ConfirmationResult
): QualifiedObservation | null {

    if (confirmation.direction === "neutral") {

        return null;

    }

    if (confirmation.direction === "mixed") {

        return null;

    }

    if (confirmation.confidence < 50) {

        return null;

    }

    return {

        direction: confirmation.direction,

        confidence: confirmation.confidence,

        evidenceCount: confirmation.supportingEvidence.length,

        supportingReasons: confirmation.supportingEvidence.map(
            evidence => evidence.reason
        ),

    };

}