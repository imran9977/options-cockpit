import type { MarketEvidence } from "./MarketEvidence.js";

export type ConfirmationDirection =
    | "bullish"
    | "bearish"
    | "neutral"
    | "mixed";

export interface ConfirmationResult {

    /**
     * Final confirmed market direction.
     */
    direction: ConfirmationDirection;

    /**
     * Confidence score.
     * Range: 0 - 100
     */
    confidence: number;

    /**
     * Evidence supporting this conclusion.
     */
    supportingEvidence: MarketEvidence[];

    /**
     * Evidence contradicting this conclusion.
     */
    contradictingEvidence: MarketEvidence[];

}