import type { MarketSnapshot } from "../models/MarketSnapshot";
import { MarketMetrics } from "../models/MarketMetrics";
import type { OptionAnalysisByIndex } from "../models/OptionAnalysis";
import type { MarketHealth } from "../models/MarketHealth";
import type { VixHealth } from "../models/VixHealth";
import type { CommodityRibbon } from "../models/CommodityRibbon";
import type { SMCAnalysisByIndex } from "../models/SMCAnalysis";
import type { PriceStructureSignalsByIndex } from "../models/PriceStructureSignal";

export interface MarketQuoteResponse {
    marketSnapshot: MarketSnapshot;
    marketMetrics: MarketMetrics;
    marketHealth: MarketHealth;
    vixHealth: VixHealth;
    optionAnalysis: OptionAnalysisByIndex;
}

export interface CommodityRibbonResponse {
    commodities: CommodityRibbon[];
}

export async function getMarketSnapshot(): Promise<MarketQuoteResponse> {
    const response = await fetch("http://localhost:3000/market-quote");
// const response = await fetch(
//   "https://indexed-nicole-gateway-philosophy.trycloudflare.com/market-quote" 
// );

    if (!response.ok) {
        throw new Error("Failed to fetch market snapshot");
    }

    const data = await response.json();

    return data;
}

export async function getCommodityRibbon(): Promise<CommodityRibbonResponse> {

    const response = await fetch("http://localhost:3000/commodities");
// const response = await fetch(
//   "https://worker-suits-bee-preferences.trycloudflare.com/commodities"
// );
    if (!response.ok) {
        throw new Error(
            "Failed to fetch commodity ribbon"
        );
    }

    return response.json();
}

export async function getSMCAnalysis(): Promise<SMCAnalysisByIndex> {

    const response = await fetch("http://localhost:3000/smc-analysis");

    if (!response.ok) {
        throw new Error("Failed to fetch price structure analysis");
    }

    return response.json();
}

export async function getPriceStructureSignals(): Promise<PriceStructureSignalsByIndex> {

    const response = await fetch("http://localhost:3000/price-structure-signals");

    if (!response.ok) {
        throw new Error("Failed to fetch price structure signals");
    }

    return response.json();
}