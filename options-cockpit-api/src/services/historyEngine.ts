import type { MarketSnapshotResponse } from "../models/MarketSnapshotResponse.js";

export interface SpotMotion {
    velocity: number;
    acceleration: number;
}

function getLatestSnapshots(
    history: readonly MarketSnapshotResponse[],
    count: number
): readonly MarketSnapshotResponse[] {
    if (history.length === 0) {
        return [];
    }

    return history.slice(-count);
}

export function getSpotHistory(
    history: readonly MarketSnapshotResponse[],
    count = 60
): number[] {
    return getLatestSnapshots(history, count).map(
        snapshot => snapshot.marketSnapshot.niftySpot
    );
}

// ~60s at the poller's 5s interval. A raw tick-to-tick (2-sample)
// diff is dominated by quote jitter, not real short-term momentum -
// this window smooths that out while still being short enough to
// mean something for a same-day option buyer.
const MOMENTUM_LOOKBACK = 12;

export function calculateSpotVelocity(
    history: readonly MarketSnapshotResponse[],
    lookback: number = MOMENTUM_LOOKBACK
): number {
    const spots = getSpotHistory(history, lookback);

    if (spots.length < 2) {
        return 0;
    }

    return spots[spots.length - 1] - spots[0];
}

export function calculateSpotAcceleration(
    history: readonly MarketSnapshotResponse[]
): number {
    const spots = getSpotHistory(history, 3);

    if (spots.length < 3) {
        return 0;
    }

    const previousVelocity = spots[1] - spots[0];
    const currentVelocity = spots[2] - spots[1];

    return currentVelocity - previousVelocity;
}

export function analyzeSpotMotion(
    history: readonly MarketSnapshotResponse[]
): SpotMotion {
    return {
        velocity: calculateSpotVelocity(history),
        acceleration: calculateSpotAcceleration(history)
    };
}