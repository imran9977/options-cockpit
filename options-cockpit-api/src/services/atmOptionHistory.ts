import type { ATMOptionSnapshot } from "../models/ATMOptionSnapshot.js";
import type { Underlying } from "../config/instruments.js";

const historyByUnderlying: Record<Underlying, ATMOptionSnapshot[]> = {
    NIFTY: [],
    SENSEX: [],
};

const MAX_HISTORY = 60;

export function addATMOptionSnapshot(
    underlying: Underlying,
    snapshot: ATMOptionSnapshot
): void {
    const history = historyByUnderlying[underlying];

    history.push(snapshot);

    if (history.length > MAX_HISTORY) {
        history.shift();
    }
}

export function getATMOptionHistory(
    underlying: Underlying
): readonly ATMOptionSnapshot[] {
    return historyByUnderlying[underlying];
}

export function getATMHistorySize(underlying: Underlying): number {
    return historyByUnderlying[underlying].length;
}

export function clearATMOptionHistory(underlying: Underlying): void {
    historyByUnderlying[underlying].length = 0;
}
