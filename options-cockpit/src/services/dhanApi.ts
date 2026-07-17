import type { MarketSnapshot } from "../models/MarketSnapshot";
import { MarketMetrics } from "../models/MarketMetrics";

export interface MarketQuoteResponse {
    marketSnapshot: MarketSnapshot;
    marketMetrics: MarketMetrics;
}

export async function getMarketSnapshot(): Promise<MarketQuoteResponse> {
    const response = await fetch("http://localhost:3000/market-quote");

    if (!response.ok) {
        throw new Error("Failed to fetch market snapshot");
    }

    const data = await response.json();

    return data;
}