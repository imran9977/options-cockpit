import { getMarketQuote } from "./dhanApi.js";
import { getOptionChain } from "./optionChainService.js";

import { toMarketSnapshot } from "../mappers/marketSnapshotMapper.js";
import { toMarketMetrics } from "../mappers/marketMetricsMapper.js";

import { analyzeOptionChain } from "../analyzers/optionChainAnalyzer.js";
import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";

let cachedSnapshot: MarketSnapshotResponse | null = null;

let cacheTimestamp = 0;

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export async function getMarketSnapshot(): Promise<MarketSnapshotResponse> {

    const now = Date.now();

    if (
        cachedSnapshot &&
        now - cacheTimestamp < CACHE_DURATION
    ) {
        console.log("Serving market snapshot from cache");
        return cachedSnapshot;
    }

    console.log("Refreshing market snapshot from Dhan");

    const marketQuote = await getMarketQuote();
    const optionChainResponse = await getOptionChain();

    const snapshot = toMarketSnapshot(marketQuote);
    const metrics = toMarketMetrics(snapshot);
    const optionAnalysis = analyzeOptionChain(
        optionChainResponse.data.last_price,
        optionChainResponse.data.oc
    );

    cachedSnapshot = {
        marketSnapshot: snapshot,
        marketMetrics: metrics,
        optionAnalysis,
    };

    cacheTimestamp = now;

    return cachedSnapshot;
}