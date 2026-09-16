import type { StrikeWindowSnapshot } from "../models/StrikeWindowSnapshot.js";
import type { Underlying } from "../config/instruments.js";

const historyByUnderlying: Record<Underlying, StrikeWindowSnapshot[]> = {
    NIFTY: [],
    SENSEX: [],
};

const MAX_HISTORY = 60;

export function addStrikeWindowSnapshot(
    underlying: Underlying,
    snapshot: StrikeWindowSnapshot
): void {

    const history = historyByUnderlying[underlying];

    history.push(snapshot);

    if (history.length > MAX_HISTORY) {
        history.shift();
    }
}

export function getStrikeWindowHistory(
    underlying: Underlying
): readonly StrikeWindowSnapshot[] {
    return historyByUnderlying[underlying];
}

export function getStrikeWindowHistorySize(underlying: Underlying): number {
    return historyByUnderlying[underlying].length;
}

export function clearStrikeWindowHistory(underlying: Underlying): void {
    historyByUnderlying[underlying].length = 0;
}
