import type { StrikeWindowSnapshot } from "../models/StrikeWindowSnapshot.js";

const history: StrikeWindowSnapshot[] = [];

const MAX_HISTORY = 60;

export function addStrikeWindowSnapshot(
    snapshot: StrikeWindowSnapshot
): void {

    history.push(snapshot);

    if (history.length > MAX_HISTORY) {
        history.shift();
    }
}

export function getStrikeWindowHistory(): readonly StrikeWindowSnapshot[] {
    return history;
}

export function getStrikeWindowHistorySize(): number {
    return history.length;
}

export function clearStrikeWindowHistory(): void {
    history.length = 0;
}