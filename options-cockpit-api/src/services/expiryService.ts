import { config } from "../config/config.js";
import { UNDERLYING_CONFIG, type Underlying } from "../config/instruments.js";

interface ExpiryState {
    cachedExpiry: string | null;
    cachedDate: string | null;
    expiryJustChanged: boolean;
}

function createExpiryState(): ExpiryState {
    return {
        cachedExpiry: null,
        cachedDate: null,
        expiryJustChanged: false,
    };
}

const stateByUnderlying: Record<Underlying, ExpiryState> = {
    NIFTY: createExpiryState(),
    SENSEX: createExpiryState(),
};

function todayDateString(): string {
    return new Date().toISOString().split("T")[0];
}

export async function refreshExpiry(underlying: Underlying): Promise<string> {
    const state = stateByUnderlying[underlying];
    const { scrip, seg } = UNDERLYING_CONFIG[underlying];

    const url = `${config.dhan.baseUrl}/v2/optionchain/expirylist`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "access-token": config.dhan.accessToken,
            "client-id": config.dhan.clientId,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            UnderlyingScrip: scrip,
            UnderlyingSeg: seg,
        }),
    });

    if (!response.ok) {
        throw new Error(`Dhan Expiry API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data?.data) || data.data.length === 0) {
        throw new Error("No expiries returned from Dhan");
    }

    const nearestExpiry = data.data[0] as string;

    if (state.cachedExpiry !== null && state.cachedExpiry !== nearestExpiry) {
        state.expiryJustChanged = true;
    }

    state.cachedExpiry = nearestExpiry;
    state.cachedDate = todayDateString();

    return nearestExpiry;
}

// Previously cached forever after the first call - once the nearest
// expiry actually rolled over, this kept requesting an expired
// contract for the rest of the process's life. Now re-checks once
// per calendar day, same caching cadence as classicalLevelsService.
export async function getCurrentExpiry(underlying: Underlying): Promise<string> {
    const state = stateByUnderlying[underlying];
    const today = todayDateString();

    if (state.cachedExpiry !== null && state.cachedDate === today) {
        return state.cachedExpiry;
    }

    return refreshExpiry(underlying);
}

// Callers should check this immediately after getCurrentExpiry() and
// clear any per-expiry state if it reads true. Resets on read, so it
// only fires once per actual rollover. Kept per-underlying so Nifty's
// Tuesday rollover can't spuriously fire against Sensex's Thursday
// state, or vice versa.
export function didExpiryJustChange(underlying: Underlying): boolean {
    const state = stateByUnderlying[underlying];
    const changed = state.expiryJustChanged;
    state.expiryJustChanged = false;
    return changed;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}

// Deliberately checks the real expiry date from Dhan rather than
// hardcoding a weekday - Nifty's weekly expiry is Tuesday and
// Sensex's is Thursday, but either can shift for a holiday week, and
// this stays correct either way without needing a maintained holiday
// calendar.
export async function isExpiryDay(underlying: Underlying): Promise<boolean> {

    const expiry = await getCurrentExpiry(underlying);
    const expiryDate = new Date(expiry);

    if (Number.isNaN(expiryDate.getTime())) {
        // Can't parse whatever Dhan returned - fail safe rather than
        // silently run gamma-blast detection on the wrong assumption.
        return false;
    }

    return isSameCalendarDay(expiryDate, new Date());
}
