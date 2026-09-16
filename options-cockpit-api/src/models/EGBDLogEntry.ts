export interface EGBDLogEntry {
    timestamp: number;
    timeLabel: string;

    strike: number;
    side: "CE" | "PE";

    fromStage: string;
    toStage: string;

    currentPremium: number;
    referenceEntryPrice: number | null;
    peakPremiumSinceEntry: number | null;
    multipleFromEntry: number | null;
    pullbackFromPeakPercent: number | null;

    oiConcentration: number;
    momentumScore: number;

    premiumStrength: number;
    volumeStrength: number;
    oiStrength: number;
    gammaStrength: number;
    ivStrength: number;

    evidence: string[];
}
