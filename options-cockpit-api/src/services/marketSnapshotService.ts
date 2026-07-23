import { getMarketQuote, getHistoricalVix } from "./dhanApi.js";
import { getOptionChain } from "./optionChainService.js";

import { toMarketSnapshot } from "../mappers/marketSnapshotMapper.js";
import { toMarketMetrics } from "../mappers/marketMetricsMapper.js";

import { analyzeOptionChain } from "../analyzers/optionChainAnalyzer.js";
import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";
import { analyzeMarketHealth } from "../analyzers/marketHealthAnalyzer.js";
import { analyzeVixHealth } from "../analyzers/vixHealthAnalyzer.js";
import { getLatestSnapshot } from "./marketPoller.js";

export async function buildMarketSnapshot(): Promise<MarketSnapshotResponse> {

    const marketQuote = await getMarketQuote();
    const optionChainResponse = await getOptionChain();
    const historicalVix = await getHistoricalVix();

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

    return {
        marketSnapshot: snapshot,
        marketMetrics: metrics,
        marketHealth,
        vixHealth,
        optionAnalysis,
    };
}
export async function getMarketSnapshot(): Promise<MarketSnapshotResponse> {
    const snapshot = getLatestSnapshot();

    if (!snapshot) {
        throw new Error("Market snapshot is initializing. Please retry shortly.");
    }

    return snapshot;
}