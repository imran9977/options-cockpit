import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";
import { buildMarketSnapshot } from "./marketSnapshotService.js";
import { analyzeSpotMotion } from "./historyEngine.js";

let latestSnapshot: MarketSnapshotResponse | null = null;
const snapshotHistory: MarketSnapshotResponse[] = [];
const MAX_HISTORY = 60;
let isRefreshing = false;
let pollingStarted = false;

const POLLING_INTERVAL = 5000;

async function refreshSnapshot(): Promise<void> {
    if (isRefreshing) {
        return;
    }

    isRefreshing = true;

    try {
        latestSnapshot = await buildMarketSnapshot();

        snapshotHistory.push(latestSnapshot);

        if (snapshotHistory.length > MAX_HISTORY) {
            snapshotHistory.shift();
        }

        const spotMotion = analyzeSpotMotion(snapshotHistory);

        console.log(
            `[Motion] Velocity: ${spotMotion.velocity.toFixed(2)}, Acceleration: ${spotMotion.acceleration.toFixed(2)}`
        );

    } catch (error) {
        console.error("[MarketPoller] Refresh failed:", error);
    } finally {
        isRefreshing = false;
    }
}

async function pollingLoop(): Promise<void> {
    await refreshSnapshot();

    setTimeout(() => {
        void pollingLoop();
    }, POLLING_INTERVAL);
}

export function startMarketPolling(): void {
    if (pollingStarted) {
        return;
    }

    pollingStarted = true;

    void pollingLoop();
}

export function getLatestSnapshot(): MarketSnapshotResponse | null {
    return latestSnapshot;
}

export function getSnapshotHistory(): readonly MarketSnapshotResponse[] {
    return snapshotHistory;
}

export function getHistorySize(): number {
    return snapshotHistory.length;
}