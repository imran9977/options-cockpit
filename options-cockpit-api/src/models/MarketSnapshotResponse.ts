import type { MarketSnapshot } from "./MarketSnapshot.js";
import type { MarketMetrics } from "./MarketMetrics.js";
import type { OptionAnalysis } from "./OptionAnalysis.js";

export interface MarketSnapshotResponse {
    marketSnapshot: MarketSnapshot;
    marketMetrics: MarketMetrics;
    optionAnalysis: OptionAnalysis;
}