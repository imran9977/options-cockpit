import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";
import { buildMarketSnapshot } from "./marketSnapshotService.js";

let latestSnapshot: MarketSnapshotResponse | null = null;
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