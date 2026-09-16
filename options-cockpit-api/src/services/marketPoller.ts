import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";
import { buildMarketSnapshot } from "./marketSnapshotService.js";
import { calculateSpotVelocity } from "./historyEngine.js";
import { determineVelocityMomentum } from "../analyzers/marketHealthAnalyzer.js";

let latestSnapshot: MarketSnapshotResponse | null = null;
const snapshotHistory: MarketSnapshotResponse[] = [];
const MAX_HISTORY = 60;
let isRefreshing = false;
let pollingStarted = false;

// Dhan's option-chain endpoint is rate-limited to one request every
// 3 seconds per underlying (documented on their Option Chain API
// page). This loop only schedules the next tick AFTER the current
// one fully resolves (see pollingLoop below), so the real gap
// between consecutive option-chain calls is always >= this value,
// never less - 3000 sits exactly at Dhan's floor, not under it.
const POLLING_INTERVAL = 3000;

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

        // Nifty's momentum is overwritten here with real rate-of-change,
        // since it needs the polling history that only this module keeps.
        // Sensex still uses the static spot-vs-open method for now -
        // out of scope for this change.
        const velocity = calculateSpotVelocity(snapshotHistory);
        latestSnapshot.marketHealth.nifty.momentum =
            determineVelocityMomentum(velocity);

    } catch (error) {
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