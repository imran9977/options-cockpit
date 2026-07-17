import { getMarketQuote } from "./dhanApi.js";
import { toMarketSnapshot } from "../mappers/marketSnapshotMapper.js";
import type { MarketSnapshot } from "../models/MarketSnapshot.js";
import { toMarketMetrics } from "../mappers/marketMetricsMapper.js";

export async function getMarketSnapshot() {
    const data = await getMarketQuote();

    const snapshot = toMarketSnapshot(data);
    const metrics = toMarketMetrics(snapshot);

    return {
        marketSnapshot: snapshot,
        marketMetrics: metrics,
    };
}