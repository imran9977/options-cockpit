export type SignalKind =
    | "LEVEL_BREAK"
    | "RETEST_HOLD"
    | "RETEST_FAIL"
    | "ZONE_REACTION"
    | "SWEEP_REVERSAL"
    | "CONFLUENCE"
    | "IV_CRASH";

// What a detector produces - a plain candidate with no identity or
// lifecycle yet. The service assigns those once, so every detector
// stays a pure function of (candles, context) -> candidates.
export interface SignalCandidate {
    kind: SignalKind;
    direction: "bullish" | "bearish";
    confidence: "high" | "medium" | "low";
    headline: string;
    reasoning: string[];
    levelLabel: string;

    // The candidate's real-world price anchor (the level's price, the
    // zone's midpoint, the swing price) - lets confluence scoring
    // compare candidates numerically instead of parsing display text.
    price: number;

    triggeredAt: number;
}

export type OptionChainAgreement = "confirms" | "mixed" | "contradicts" | "no-data";

export interface PriceStructureSignal extends SignalCandidate {
    id: string;

    // The current marketHealth.trend for this underlying at the
    // moment this signal fired - shown plainly so a counter-trend
    // signal is visibly flagged, not hidden or given false parity
    // with a with-trend one.
    trendContext: string;

    // Whether EGBD/marketBias/oiFlowVerdict corroborate this signal's
    // direction - Phase 2 fusion. No hard veto: "contradicts" is
    // still shown, just honestly labeled, never suppressed.
    optionChainAgreement: OptionChainAgreement;

    status: "active" | "expired";
}
