export enum EGBDStage {

    WATCHING = "WATCHING",

    TRIGGER_ARMED = "TRIGGER_ARMED",

    ENTRY_WINDOW = "ENTRY_WINDOW",

    MOMENTUM_BUILDING = "MOMENTUM_BUILDING",

    MOMENTUM_STRONG = "MOMENTUM_STRONG",

    MOMENTUM_WEAKENING = "MOMENTUM_WEAKENING",

    EXIT_WINDOW = "EXIT_WINDOW",

    RESET = "RESET",
}

export interface EGBDState {

    strike: number;

    side: "CE" | "PE";

    stage: EGBDStage;

    lastUpdated: number;

    stageAge: number;

    // Consecutive cycles the trigger has failed to stay armed.
    // Only resets the stage to WATCHING once this holds for as long
    // as advancing a stage would require - a single noisy tick no
    // longer wipes out an otherwise-real gamma blast in progress.
    unarmedStreak: number;

    // Premium at the moment this strike was first confirmed armed
    // (WATCHING -> TRIGGER_ARMED), and the running high since then.
    // Both null while WATCHING with nothing active. Cleared only when
    // the stage genuinely resets back to WATCHING, not on a blip.
    referenceEntryPrice: number | null;

    peakPremiumSinceEntry: number | null;

    // Same lifecycle as peakPremiumSinceEntry, tracked in parallel -
    // the running high of this strike's own IV since it armed, used
    // to detect an IV crash (a large drop from ITS OWN peak, not an
    // absolute level).
    peakIVSinceEntry: number | null;

    // Consecutive cycles a confirmed IV crash has been detected -
    // same persistence-before-acting shape as unarmedStreak, so one
    // noisy IV tick can't force an exit on its own.
    ivCrashStreak: number;
}

export interface EGBDSignal {

    strike: number;

    side: "CE" | "PE";

    stage: EGBDStage;

    stageAge: number;

    premiumStrength: number;

    volumeStrength: number;

    oiStrength: number;

    gammaStrength: number;

    ivStrength: number;

    momentumScore: number;

    currentPremium: number;

    referenceEntryPrice: number | null;

    peakPremiumSinceEntry: number | null;

    // current / referenceEntryPrice - null until a reference exists.
    multipleFromEntry: number | null;

    // % down from the running peak since entry - null until a
    // reference exists.
    pullbackFromPeakPercent: number | null;

    // This strike's OI (dominant side) relative to the biggest OI
    // wall in the current window. 1.0 = it IS the wall, 0 = no real
    // OI backing at all.
    oiConcentration: number;

    // True once this strike's IV has dropped far enough from its own
    // peak-since-armed, sustained for long enough, to count as a real
    // crash - not a single noisy tick. Forces EGBD's own stage to
    // EXIT_WINDOW when set, and separately feeds the Suggestions
    // Panel's IV_CRASH signal.
    ivCrashed: boolean;

    evidence: string[];
}

export interface GammaExposureRow {

    strike: number;

    callPremium: number;

    putPremium: number;

    callOIChange: number;

    putOIChange: number;

    callVolumeChange: number;

    putVolumeChange: number;

    callGamma: number;

    putGamma: number;

    isATM: boolean;
}

export interface EGBDResult {

    signals: EGBDSignal[];

    observation: string;

    activeSignal?: EGBDSignal;

    gammaExposureTable: GammaExposureRow[];
}