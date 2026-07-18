import { MarketObservation } from "./MarketObservation.js";

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
    longBuildUpCount: number;
    longBuildUpPercentage: number;

    shortBuildUp: string;
    shortBuildUpCount: number;
    shortBuildUpPercentage: number;

    shortCovering: string;
    shortCoveringCount: number;
    shortCoveringPercentage: number;

    longUnwinding: string;
    longUnwindingCount: number;
    longUnwindingPercentage: number;

    atmIV: number;
    atmDelta: number;
    atmGamma: number;
    atmTheta: number;

    marketBias: "Bullish" | "Bearish" | "Neutral";
    confidence: "Strong" | "Moderate" | "Low";

    observations: MarketObservation[];
}