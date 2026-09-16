export type SignalKind =
    | "LEVEL_BREAK"
    | "RETEST_HOLD"
    | "RETEST_FAIL"
    | "ZONE_REACTION"
    | "SWEEP_REVERSAL"
    | "CONFLUENCE"
    | "IV_CRASH";

export type OptionChainAgreement = "confirms" | "mixed" | "contradicts" | "no-data";

export interface PriceStructureSignal {
    id: string;
    kind: SignalKind;
    direction: "bullish" | "bearish";
    confidence: "high" | "medium" | "low";
    headline: string;
    reasoning: string[];
    levelLabel: string;
    price: number;
    triggeredAt: number;
    trendContext: string;
    optionChainAgreement: OptionChainAgreement;
    status: "active" | "expired";
}

export interface PriceStructureSignalsByIndex {
    nifty: PriceStructureSignal[];
    sensex: PriceStructureSignal[];
}
