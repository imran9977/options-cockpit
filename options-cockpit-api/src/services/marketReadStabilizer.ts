import type { Underlying } from "../config/instruments.js";

// A raw reading must hold for this many consecutive polls before it
// replaces what's actually shown - the exact same "don't act on one
// noisy tick" persistence idiom already proven for EGBD's stage
// (unarmedStreak/STAGE_PERSISTENCE) and its IV-crash exit condition
// (ivCrashStreak). calculateMarketBias/determinePositionBuildUpHint
// are raw, single-poll, unsmoothed calculations with no persistence
// of their own - a live 3-minute Nifty move (23214 -> 23156) flipped
// marketBias and positionBuildUpHint mid-observation, which is exactly
// this same class of bug surfacing on a different calculation. Fixed
// once, here, for every consumer (Confirmation Card, option-chain
// agreement scoring) instead of patching each display separately.
const CONFIRMATION_PERSISTENCE = 2;

interface StabilityState<T> {
    confirmed: T | null;
    candidate: T | null;
    candidateStreak: number;
}

function freshStability<T>(): StabilityState<T> {
    return { confirmed: null, candidate: null, candidateStreak: 0 };
}

function stabilize<T>(
    state: StabilityState<T>,
    raw: T,
    isEqual: (a: T, b: T) => boolean
): T {

    if (state.confirmed === null) {
        state.confirmed = raw;
        return state.confirmed;
    }

    if (isEqual(state.confirmed, raw)) {
        // Matches what's already shown - any in-progress candidate
        // was just a blip that didn't hold, drop it.
        state.candidate = null;
        state.candidateStreak = 0;
        return state.confirmed;
    }

    if (state.candidate !== null && isEqual(state.candidate, raw)) {
        state.candidateStreak += 1;
    } else {
        state.candidate = raw;
        state.candidateStreak = 1;
    }

    if (state.candidateStreak >= CONFIRMATION_PERSISTENCE) {
        state.confirmed = raw;
        state.candidate = null;
        state.candidateStreak = 0;
    }

    return state.confirmed;
}

export interface BiasReading {
    bias: "Bullish" | "Bearish" | "Neutral";
    confidence: "Strong" | "Moderate" | "Low";
}

const biasStateByUnderlying: Record<Underlying, StabilityState<BiasReading>> = {
    NIFTY: freshStability(),
    SENSEX: freshStability(),
};

// Tracked as one combined reading, not bias/confidence independently -
// they're two outputs of the same underlying score, and stabilizing
// them separately could show a bias/confidence pairing that no single
// raw poll ever actually produced.
export function stabilizeMarketBias(
    underlying: Underlying,
    rawBias: BiasReading["bias"],
    rawConfidence: BiasReading["confidence"]
): BiasReading {

    return stabilize(
        biasStateByUnderlying[underlying],
        { bias: rawBias, confidence: rawConfidence },
        (a, b) => a.bias === b.bias && a.confidence === b.confidence
    );
}

const hintStateByUnderlying: Record<Underlying, StabilityState<string>> = {
    NIFTY: freshStability(),
    SENSEX: freshStability(),
};

export function stabilizePositionBuildUpHint(
    underlying: Underlying,
    rawHint: string
): string {

    return stabilize(
        hintStateByUnderlying[underlying],
        rawHint,
        (a, b) => a === b
    );
}
