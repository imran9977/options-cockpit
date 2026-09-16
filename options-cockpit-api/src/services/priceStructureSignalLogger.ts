import fs from "fs";
import path from "path";
import type { PriceStructureSignal } from "../models/PriceStructureSignal.js";
import type { Underlying } from "../config/instruments.js";

const DATA_DIR = path.resolve(process.cwd(), "data");

// One file per calendar day per underlying, same reasoning as
// egbdLogger.ts - "analyse this evening" is naturally scoped to today
// and to one index.
function todayLogFile(underlying: Underlying): string {
    const today = new Date().toISOString().split("T")[0];
    return path.join(
        DATA_DIR,
        `price-structure-signal-log-${today}-${underlying.toLowerCase()}.json`
    );
}

interface LogState {
    cachedFile: string | null;
    entries: PriceStructureSignal[];
}

const stateByUnderlying: Record<Underlying, LogState> = {
    NIFTY: { cachedFile: null, entries: [] },
    SENSEX: { cachedFile: null, entries: [] },
};

function ensureLoadedForToday(underlying: Underlying): LogState {

    const state = stateByUnderlying[underlying];
    const file = todayLogFile(underlying);

    if (state.cachedFile === file) {
        return state;
    }

    state.cachedFile = file;

    try {
        state.entries = fs.existsSync(file)
            ? JSON.parse(fs.readFileSync(file, "utf-8"))
            : [];
    } catch (error) {
        state.entries = [];
    }

    return state;
}

function saveToDisk(state: LogState): void {

    if (!state.cachedFile) {
        return;
    }

    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        fs.writeFileSync(state.cachedFile, JSON.stringify(state.entries, null, 2));
    } catch (error) {
        // Silent, same as egbdLogger.ts - a failed write here
        // shouldn't interrupt live analysis.
    }
}

// Logs every signal generated, surfaced or not - the exact discipline
// egbdLogger.ts already provides for EGBD, so a future option-chain
// fusion pass has real evidence to design against instead of the
// blind spot EGBD had until today's forced RCA.
export function logPriceStructureSignal(
    underlying: Underlying,
    signal: PriceStructureSignal
): void {

    const state = ensureLoadedForToday(underlying);

    state.entries.push(signal);

    saveToDisk(state);
}

export function getTodayPriceStructureSignalLog(
    underlying: Underlying
): readonly PriceStructureSignal[] {
    return ensureLoadedForToday(underlying).entries;
}
