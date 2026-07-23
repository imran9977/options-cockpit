import type { ATMOptionSnapshot } from "../models/ATMOptionSnapshot.js";

const history: ATMOptionSnapshot[] = [];

const MAX_HISTORY = 60;

export function addATMOptionSnapshot(
    snapshot: ATMOptionSnapshot
): void {
    history.push(snapshot);

    if (history.length > MAX_HISTORY) {
        history.shift();
    }
}

export function getATMOptionHistory(): readonly ATMOptionSnapshot[] {
    return history;
}

export function getATMHistorySize(): number {
    return history.length;
}

export function clearATMOptionHistory(): void {
    history.length = 0;
}