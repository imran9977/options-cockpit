import { getMarketQuote } from "./dhanApi.js";
import { getOptionChain } from "./optionChainService.js";

import { toMarketSnapshot } from "../mappers/marketSnapshotMapper.js";
import { toMarketMetrics } from "../mappers/marketMetricsMapper.js";

import { analyzeOptionChain } from "../analyzers/optionChainAnalyzer.js";
import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";

export async function getMarketSnapshot(): Promise<MarketSnapshotResponse>{
    
const marketQuote = await getMarketQuote();
    const optionChainResponse = await getOptionChain();

    const snapshot = toMarketSnapshot(marketQuote);
    const metrics = toMarketMetrics(snapshot);

    const optionAnalysis = analyzeOptionChain(
        optionChainResponse.data.last_price,
        optionChainResponse.data.oc
    );

    return {
        marketSnapshot: snapshot,
        marketMetrics: metrics,
        optionAnalysis,
    };
}