import { MarketObservation } from "./MarketObservation.js";
import type { EGBDResult } from "./EGBD.js";

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
    previousClose: number;
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

    // ATM last-traded premiums - already fetched by the poller for
    // this same cycle, so exposing them costs no extra Dhan call.
    // Reading a live premium any other way means hitting /option-chain
    // directly, which collides with the poller's own regular 3s-spaced
    // call and risks the "one request per 3s" floor rejecting it.
    atmCallPremium: number;
    atmPutPremium: number;

    // Same reasoning, widened to the whole ATM+/-N window already
    // fetched for OI/build-up analysis - a strike held from an
    // earlier poll (e.g. a paper-trade entry) can drift away from ATM
    // as spot moves, and this is the only safe way to keep reading
    // its live premium without hitting /option-chain directly.
    nearbyStrikePremiums: { strike: number; callPremium: number; putPremium: number }[];
    expectedMove: number;

    greeksPremiumLabel: string;
    greeksMovementLabel: string;
    greeksEnvironment: string;

    marketBias: "Bullish" | "Bearish" | "Neutral";
    confidence: "Strong" | "Moderate" | "Low";

    observations: MarketObservation[];
    strikeObservations: MarketObservation[];

    egbd?: EGBDResult;

    // EGBD only runs on the actual expiry day (checked against the
    // real Dhan expiry date, not a hardcoded day-of-week) - this
    // tells the frontend whether "no signal" means "quiet" or
    // "deliberately not running today."
    isExpiryDay: boolean;
}

// Nifty and Sensex each get their own full OptionAnalysis - same
// shape MarketHealth already uses for its nifty/sensex split.
export interface OptionAnalysisByIndex {
    nifty: OptionAnalysis;
    sensex: OptionAnalysis;
}