import type { MarketSnapshot } from "../models/MarketSnapshot";
import { MarketMetrics } from "../models/MarketMetrics";
import type { OptionAnalysis } from "../models/OptionAnalysis";
import type { MarketHealth } from "../models/MarketHealth";
import type { VixHealth } from "../models/VixHealth";

export interface MarketQuoteResponse {
    marketSnapshot: MarketSnapshot;
    marketMetrics: MarketMetrics;
    marketHealth: MarketHealth;
    vixHealth: VixHealth;
    optionAnalysis: OptionAnalysis;
}

export async function getMarketSnapshot(): Promise<MarketQuoteResponse> {
    const response = await fetch("http://localhost:3000/market-quote");

    if (!response.ok) {
        throw new Error("Failed to fetch market snapshot");
    }

    const data = await response.json();

    return data;
}