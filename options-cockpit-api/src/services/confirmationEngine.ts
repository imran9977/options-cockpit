import type {
    ConfirmationDirection,
    ConfirmationResult,
} from "../models/ConfirmationResult.js";

import type { MarketEvidence } from "../models/MarketEvidence.js";

export function confirmMarketDirection(
    evidence: MarketEvidence[]
): ConfirmationResult {

    let bullishScore = 0;
    let bearishScore = 0;

    const supportingEvidence: MarketEvidence[] = [];
    const contradictingEvidence: MarketEvidence[] = [];

    for (const item of evidence) {

        if (item.direction === "bullish") {

            bullishScore += item.strength;
            supportingEvidence.push(item);

        } else if (item.direction === "bearish") {

            bearishScore += item.strength;
            contradictingEvidence.push(item);

        }

    }

    let direction: ConfirmationDirection = "neutral";

    if (bullishScore > bearishScore) {

        direction = "bullish";

    } else if (bearishScore > bullishScore) {

        direction = "bearish";

    } else if (bullishScore > 0 && bearishScore > 0) {

        direction = "mixed";

    }

    const total = bullishScore + bearishScore;

    let confidence = 0;

    if (total > 0) {

        // How dominant is the winning side?
        const dominance =
            Math.max(bullishScore, bearishScore) / total;

        // How much evidence exists overall?
        // Saturates at 100 total strength.
        const participation =
            Math.min(total, 100) / 100;

        confidence = Math.round(
            dominance * participation * 100
        );

    }

    return {

        direction,

        confidence,

        supportingEvidence,

        contradictingEvidence,

    };

}