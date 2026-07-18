export type EvidenceDirection =
    | "bullish"
    | "bearish"
    | "neutral";

export type EvidenceCategory =
    | "PCR"
    | "POSITION_BUILDUP"
    | "PRICE_STRUCTURE"
    | "SUPPORT"
    | "RESISTANCE"
    | "ATM"
    | "DELTA"
    | "MAX_PAIN"
    | "MARKET_BIAS"
    | "VOLUME"
    | "VOLATILITY"
    | "OTHER";

export interface MarketEvidence {

    /**
     * Unique identifier.
     */
    id: string;

    /**
     * Category that produced this evidence.
     */
    category: EvidenceCategory;

    /**
     * Bullish / Bearish / Neutral.
     */
    direction: EvidenceDirection;

    /**
     * Relative importance.
     * Range: 0 - 100
     */
    strength: number;

    /**
     * Human readable explanation.
     *
     * Example:
     * "PCR increased from 0.92 to 1.08"
     */
    reason: string;

    /**
     * Analyzer which generated this evidence.
     *
     * Example:
     * "PCRAnalyzer"
     */
    source: string;

    /**
     * Epoch timestamp.
     */
    timestamp: number;
}