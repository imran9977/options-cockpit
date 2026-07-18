export type ObservationType =
    | "bullish"
    | "bearish"
    | "neutral";

export type ObservationPriority =
    | "critical"
    | "high"
    | "medium"
    | "low";

export type ObservationDriver =
    | "PCR"
    | "BUILD_UP"
    | "SUPPORT"
    | "RESISTANCE"
    | "ATM"
    | "DELTA"
    | "MAX_PAIN"
    | "MARKET_BIAS";

export interface MarketObservation {
    id: string;

    type: ObservationType;

    priority: ObservationPriority;

    driver: ObservationDriver;

    message: string;

    timestamp: string;

    expiresAt: string;
}