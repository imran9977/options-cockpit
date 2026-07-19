import { getMarketQuote, getHistoricalVix } from "./dhanApi.js";
import { getOptionChain } from "./optionChainService.js";

import { toMarketSnapshot } from "../mappers/marketSnapshotMapper.js";
import { toMarketMetrics } from "../mappers/marketMetricsMapper.js";

import { analyzeOptionChain } from "../analyzers/optionChainAnalyzer.js";
import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";
import { analyzeMarketHealth } from "../analyzers/marketHealthAnalyzer.js";
import { analyzeVixHealth } from "../analyzers/vixHealthAnalyzer.js";

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

    const [
        marketQuote,
        optionChainResponse,
        historicalVix
    ] = await Promise.all([
        getMarketQuote(),
        getOptionChain(),
        getHistoricalVix()
    ]);

    const snapshot = toMarketSnapshot(marketQuote);
    const metrics = toMarketMetrics(snapshot);

    const marketHealth = {
        nifty: analyzeMarketHealth(
            snapshot.niftySpot,
            snapshot.niftyOpen,
            snapshot.niftyPreviousClose,
            metrics.niftyDayRange
        ),

        sensex: analyzeMarketHealth(
            snapshot.sensexSpot,
            snapshot.sensexOpen,
            snapshot.sensexPreviousClose,
            metrics.sensexDayRange
        )
    };

    const vixHealth = analyzeVixHealth({
    close: historicalVix.close
});

    const optionAnalysis = analyzeOptionChain(
        optionChainResponse.data.last_price,
        optionChainResponse.data.oc
    );

    cachedSnapshot = {
    marketSnapshot: snapshot,
    marketMetrics: metrics,
    marketHealth,
    vixHealth,
    optionAnalysis,
};

    cacheTimestamp = now;

    return cachedSnapshot;
}