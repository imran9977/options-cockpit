import type { MarketObservation } from "./MarketObservation";
import type { EGBDResult } from "./EGBD";

export interface BuildUpBreakdown {
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
}

export interface OptionAnalysis {
    spotPrice: number;
    atmStrike: number;
    pcr: number;

    primarySupport: number;
    secondarySupport: number;

    primaryResistance: number;
    secondaryResistance: number;

    pivotPoint: number;
    weeklyPrimarySupport: number | null;
    weeklyPrimaryResistance: number | null;

    maxCallOI: number;
    maxCallOIStrike: number | null;

    maxPutOI: number;
    maxPutOIStrike: number | null;

    maxPain: number | null;

    totalCallOIChange: number;
    totalPutOIChange: number;

    maxCallOIAddition: number;
    maxCallOIAdditionStrike: number | null;

    maxCallOIExit: number;
    maxCallOIExitStrike: number | null;

    maxPutOIAddition: number;
    maxPutOIAdditionStrike: number | null;

    maxPutOIExit: number;
    maxPutOIExitStrike: number | null;

    oiFlowVerdict: string;

    callNetFlow: "Building" | "Unwinding" | "Balanced";
    putNetFlow: "Building" | "Unwinding" | "Balanced";

    callContribution: number;
    putContribution: number;

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

    callPositionBuildUp: BuildUpBreakdown;
    putPositionBuildUp: BuildUpBreakdown;
    positionBuildUpHint: string;

    atmIV: number;
    atmDelta: number;
    atmGamma: number;
    atmTheta: number;

    atmPutIV: number;
    atmPutDelta: number;
    atmPutGamma: number;
    atmPutTheta: number;
    ivSkew: number;
    expectedMove: number;

    greeksPremiumLabel: string;
    greeksMovementLabel: string;
    greeksEnvironment: string;

    marketBias: "Bullish" | "Bearish" | "Neutral";
    confidence: "Strong" | "Moderate" | "Low";

    observations: MarketObservation[];
    strikeObservations: MarketObservation[];
    egbd?: EGBDResult;
    isExpiryDay: boolean;
}

// Nifty and Sensex each get their own full OptionAnalysis - same
// shape MarketHealth already uses for its nifty/sensex split.
export interface OptionAnalysisByIndex {
    nifty: OptionAnalysis;
    sensex: OptionAnalysis;
}