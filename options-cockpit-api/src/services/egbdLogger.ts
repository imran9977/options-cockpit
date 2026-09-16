import fs from "fs";
import path from "path";
import type { EGBDLogEntry } from "../models/EGBDLogEntry.js";
import type { Underlying } from "../config/instruments.js";

const DATA_DIR = path.resolve(process.cwd(), "data");

// One file per calendar day per underlying - "analyse this evening"
// is naturally scoped to today and to one index, so there's no need
// to filter a giant combined file to find either.
function todayLogFile(underlying: Underlying): string {
    const today = new Date().toISOString().split("T")[0];
    return path.join(
        DATA_DIR,
        `egbd-log-${today}-${underlying.toLowerCase()}.json`
    );
}

interface LogState {
    cachedFile: string | null;
    entries: EGBDLogEntry[];
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
        // Silent per the earlier console-removal request - a failed
        // write here shouldn't interrupt live analysis.
    }
}

// Called once per actual stage transition (not once per 5s poll) -
// egbdEngine.ts already knows exactly when that happens, so this
// stays a plain append with no filtering logic of its own.
export function logEGBDTransition(
    underlying: Underlying,
    entry: Omit<EGBDLogEntry, "timestamp" | "timeLabel">
): void {

    const state = ensureLoadedForToday(underlying);

    const now = Date.now();

    state.entries.push({
        ...entry,
        timestamp: now,
        timeLabel: new Date(now).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }),
    });

    saveToDisk(state);
}

export function getTodayEGBDLog(underlying: Underlying): readonly EGBDLogEntry[] {
    return ensureLoadedForToday(underlying).entries;
}
