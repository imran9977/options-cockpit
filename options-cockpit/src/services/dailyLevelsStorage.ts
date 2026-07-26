import type { DailyLevels } from "../models/DailyLevel";

const STORAGE_KEY = "options-cockpit-daily-levels";

function getTodayDate(): string {

    return new Date().toISOString().split("T")[0];

}

export function saveDailyLevels(
    levels: DailyLevels
): void {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(levels)
    );

}

export function getDailyLevels(): DailyLevels | null {

    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {

        return null;

    }

    const levels: DailyLevels = JSON.parse(stored);

    if (levels.date !== getTodayDate()) {

        localStorage.removeItem(STORAGE_KEY);

        return null;

    }

    return levels;

}

export function hasTodayLevels(): boolean {

    return getDailyLevels() !== null;

}

export function clearDailyLevels(): void {

    localStorage.removeItem(STORAGE_KEY);

}