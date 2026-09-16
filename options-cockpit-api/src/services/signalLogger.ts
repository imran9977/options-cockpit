import fs from "fs";
import path from "path";
import type {
    HorizonStats,
    SignalCheckpoint,
    SignalCheckpoints,
    SignalDirection,
    SignalLogEntry,
} from "../models/SignalLogEntry.js";
import type { Underlying } from "../config/instruments.js";

const DATA_DIR = path.resolve(process.cwd(), "data");

function logFileFor(underlying: Underlying): string {
    return path.join(DATA_DIR, `signal-log-${underlying.toLowerCase()}.json`);
}

const HORIZON_MS: Record<keyof SignalCheckpoints, number> = {
    min5: 5 * 60 * 1000,
    min15: 15 * 60 * 1000,
    min30: 30 * 60 * 1000,
    min60: 60 * 60 * 1000,
};

interface LogState {
    entries: SignalLogEntry[];
    // Tracks the last direction a signal actually fired for, so we
    // log only on a transition (new setup) instead of once per 5s
    // poll. Kept per underlying - shared, one instrument's signal
    // could silently swallow the other's as a "duplicate."
    lastDirection: SignalDirection | null;
}

const stateByUnderlying: Record<Underlying, LogState> = {
    NIFTY: { entries: [], lastDirection: null },
    SENSEX: { entries: [], lastDirection: null },
};

function emptyCheckpoint(): SignalCheckpoint {
    return {
        price: null,
        deltaPoints: null,
        deltaPercent: null,
        filledAt: null,
    };
}

function loadFromDisk(underlying: Underlying): void {
    const state = stateByUnderlying[underlying];
    const file = logFileFor(underlying);

    try {
        if (fs.existsSync(file)) {
            state.entries = JSON.parse(fs.readFileSync(file, "utf-8"));
        }
    } catch (error) {
        state.entries = [];
    }
}

function saveToDisk(underlying: Underlying): void {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        fs.writeFileSync(
            logFileFor(underlying),
            JSON.stringify(stateByUnderlying[underlying].entries, null, 2)
        );
    } catch (error) {
    }
}

loadFromDisk("NIFTY");
loadFromDisk("SENSEX");

export function logSignalIfNew(
    underlying: Underlying,
    direction: SignalDirection | null,
    confidence: number,
    spotPrice: number,
    atmStrike: number
): void {

    const state = stateByUnderlying[underlying];

    if (direction === null) {
        // Signal dropped out (neutral/mixed) - the next qualified
        // signal, even same direction, counts as a fresh occurrence.
        state.lastDirection = null;
        return;
    }

    if (direction === state.lastDirection) {
        return;
    }

    state.lastDirection = direction;

    const now = Date.now();

    const entry: SignalLogEntry = {
        id: `SIGNAL_${now}`,
        firedAt: now,
        firedAtLabel: new Date(now).toLocaleString("en-IN"),
        direction,
        confidence,
        entrySpotPrice: spotPrice,
        entryAtmStrike: atmStrike,
        checkpoints: {
            min5: emptyCheckpoint(),
            min15: emptyCheckpoint(),
            min30: emptyCheckpoint(),
            min60: emptyCheckpoint(),
        },
    };

    state.entries.push(entry);

    saveToDisk(underlying);
}

export function updatePendingSignals(
    underlying: Underlying,
    currentSpotPrice: number
): void {

    const state = stateByUnderlying[underlying];
    const now = Date.now();
    let changed = false;

    for (const entry of state.entries) {

        for (const horizon of Object.keys(HORIZON_MS) as Array<keyof SignalCheckpoints>) {

            const checkpoint = entry.checkpoints[horizon];

            if (checkpoint.filledAt !== null) {
                continue;
            }

            const elapsed = now - entry.firedAt;

            if (elapsed < HORIZON_MS[horizon]) {
                continue;
            }

            const deltaPoints = currentSpotPrice - entry.entrySpotPrice;

            checkpoint.price = currentSpotPrice;
            checkpoint.deltaPoints = Number(deltaPoints.toFixed(2));
            checkpoint.deltaPercent = Number(
                ((deltaPoints / entry.entrySpotPrice) * 100).toFixed(3)
            );
            checkpoint.filledAt = now;

            changed = true;
        }
    }

    if (changed) {
        saveToDisk(underlying);
    }
}

export function getAllSignals(underlying: Underlying): readonly SignalLogEntry[] {
    return stateByUnderlying[underlying].entries;
}

export function getSignalStats(underlying: Underlying): HorizonStats[] {

    const horizons: Array<keyof SignalCheckpoints> = [
        "min5",
        "min15",
        "min30",
        "min60",
    ];

    const { entries } = stateByUnderlying[underlying];

    return horizons.map(horizon => {

        let correctCount = 0;
        let incorrectCount = 0;

        for (const entry of entries) {

            const checkpoint = entry.checkpoints[horizon];

            if (checkpoint.filledAt === null || checkpoint.deltaPoints === null) {
                continue;
            }

            if (checkpoint.deltaPoints === 0) {
                continue;
            }

            const movedUp = checkpoint.deltaPoints > 0;

            const wasCorrect =
                (entry.direction === "bullish" && movedUp) ||
                (entry.direction === "bearish" && !movedUp);

            if (wasCorrect) {
                correctCount++;
            } else {
                incorrectCount++;
            }
        }

        const sampleSize = correctCount + incorrectCount;

        return {
            horizon,
            sampleSize,
            correctCount,
            incorrectCount,
            winRate:
                sampleSize > 0
                    ? Number(((correctCount / sampleSize) * 100).toFixed(1))
                    : null,
        };
    });
}
