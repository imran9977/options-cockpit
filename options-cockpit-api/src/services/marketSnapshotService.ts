import { getMarketQuote, getHistoricalVix } from "./dhanApi.js";
import { getOptionChain } from "./optionChainService.js";

import { toMarketSnapshot } from "../mappers/marketSnapshotMapper.js";
import { toMarketMetrics } from "../mappers/marketMetricsMapper.js";

import { analyzeOptionChain } from "../analyzers/optionChainAnalyzer.js";
import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";
import type { OptionAnalysis } from "../models/OptionAnalysis.js";
import { analyzeMarketHealth } from "../analyzers/marketHealthAnalyzer.js";
import { analyzeVixHealth } from "../analyzers/vixHealthAnalyzer.js";
import { getLatestSnapshot } from "./marketPoller.js";
import { getClassicalLevels } from "./classicalLevelsService.js";
import type { Underlying } from "../config/instruments.js";
import { isExpiryDay } from "./expiryService.js";

async function buildOptionAnalysisFor(
    underlying: Underlying
): Promise<OptionAnalysis> {

    const optionChainResponse = await getOptionChain(underlying);

    // EGBD is specifically about expiry-day gamma-squeeze dynamics -
    // running it every day would waste cycles and risk noisy,
    // off-context signals on days the phenomenon it looks for isn't
    // even the relevant one. getCurrentExpiry() is already cached
    // daily, so this costs nothing extra beyond the first call.
    const [classicalLevels, isExpiryDayToday] = await Promise.all([
        getClassicalLevels(underlying, optionChainResponse.data.last_price),
        isExpiryDay(underlying),
    ]);

    return analyzeOptionChain(
        underlying,
        optionChainResponse.data.last_price,
        optionChainResponse.data.oc,
        classicalLevels,
        isExpiryDayToday
    );
}

export async function buildMarketSnapshot(): Promise<MarketSnapshotResponse> {

    const [marketQuote, historicalVix, niftyAnalysis, sensexAnalysis] =
        await Promise.all([
            getMarketQuote(),
            getHistoricalVix(),
            buildOptionAnalysisFor("NIFTY"),
            buildOptionAnalysisFor("SENSEX"),
        ]);

    const snapshot = toMarketSnapshot(
        marketQuote,
        niftyAnalysis.previousClose,
        sensexAnalysis.previousClose
    );
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

    return {
        marketSnapshot: snapshot,
        marketMetrics: metrics,
        marketHealth,
        vixHealth,
        optionAnalysis: {
            nifty: niftyAnalysis,
            sensex: sensexAnalysis,
        },
    };
}
export async function getMarketSnapshot(): Promise<MarketSnapshotResponse> {
    const snapshot = getLatestSnapshot();

    if (!snapshot) {
        throw new Error("Market snapshot is initializing. Please retry shortly.");
    }

    return snapshot;
}