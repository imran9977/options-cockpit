import type { MarketSnapshot } from "./MarketSnapshot.js";
import type { MarketMetrics } from "./MarketMetrics.js";
import type { OptionAnalysis } from "./OptionAnalysis.js";
import type { MarketHealth } from "./MarketHealth.js";
import type { VixHealth } from "./VixHealth.js";

export interface MarketSnapshotResponse {
    marketSnapshot: MarketSnapshot;
    marketMetrics: MarketMetrics;
    marketHealth: MarketHealth;
    vixHealth: VixHealth;
    optionAnalysis: OptionAnalysis;
}