import type { MarketObservation } from "./MarketObservation";

export interface OptionAnalysis {
    spotPrice: number;
    atmStrike: number;
    pcr: number;

    primarySupport: number | null;
    secondarySupport: number | null;

    primaryResistance: number | null;
    secondaryResistance: number | null;

    maxCallOI: number;
    maxCallOIStrike: number | null;

    maxPutOI: number;
    maxPutOIStrike: number | null;

    maxPain: number | null;

    totalCallOIChange: number;
    totalPutOIChange: number;

    longBuildUp: string;
    shortBuildUp: string;
    shortCovering: string;
    longUnwinding: string;

    atmIV: number;
    atmDelta: number;
    atmGamma: number;
    atmTheta: number;

    marketBias: "Bullish" | "Bearish" | "Neutral";
    confidence: "Strong" | "Moderate" | "Low";

    observations: MarketObservation[];
}