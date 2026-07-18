import type {
    EvidenceCategory,
    EvidenceDirection,
    MarketEvidence,
} from "../models/MarketEvidence.js";

export interface GenerateMarketEvidenceInput {

    spotPrice: number;
    atmStrike: number;

    pcr: number;

    primarySupport: number | null;
    primaryResistance: number | null;

    longBuildUp: string;
    shortBuildUp: string;
    shortCovering: string;
    longUnwinding: string;

    atmDelta: number;

    maxPain: number | null;

}

export function generateMarketEvidence(
    input: GenerateMarketEvidenceInput
): MarketEvidence[] {

    const evidence: MarketEvidence[] = [];

    const now = Date.now();

    const addEvidence = (
        id: string,
        category: EvidenceCategory,
        direction: EvidenceDirection,
        strength: number,
        reason: string,
        source: string
    ) => {

        evidence.push({

            id,

            category,

            direction,

            strength,

            reason,

            source,

            timestamp: now,

        });

    };

    // --------------------------------------------------
    // PCR
    // --------------------------------------------------

    if (input.pcr >= 1.10) {

        addEvidence(
            "PCR_BULLISH",
            "PCR",
            "bullish",
            25,
            `PCR is bullish (${input.pcr.toFixed(2)})`,
            "PCRAnalyzer"
        );

    } else if (input.pcr <= 0.90) {

        addEvidence(
            "PCR_BEARISH",
            "PCR",
            "bearish",
            25,
            `PCR is bearish (${input.pcr.toFixed(2)})`,
            "PCRAnalyzer"
        );

    }

    // --------------------------------------------------
    // Spot vs ATM
    // --------------------------------------------------

    if (input.spotPrice > input.atmStrike) {

        addEvidence(
            "SPOT_ABOVE_ATM",
            "ATM",
            "bullish",
            12,
            "Spot trading above ATM strike.",
            "ATMAnalyzer"
        );

    } else {

        addEvidence(
            "SPOT_BELOW_ATM",
            "ATM",
            "bearish",
            12,
            "Spot trading below ATM strike.",
            "ATMAnalyzer"
        );

    }

    // --------------------------------------------------
    // Support
    // --------------------------------------------------

    if (
        input.primarySupport !== null &&
        input.spotPrice > input.primarySupport
    ) {

        addEvidence(
            "SUPPORT_HOLDING",
            "SUPPORT",
            "bullish",
            18,
            "Spot holding above primary support.",
            "SupportAnalyzer"
        );

    }

    // --------------------------------------------------
    // Resistance
    // --------------------------------------------------

    if (
        input.primaryResistance !== null &&
        input.spotPrice < input.primaryResistance
    ) {

        addEvidence(
            "RESISTANCE_HOLDING",
            "RESISTANCE",
            "bearish",
            18,
            "Spot trading below primary resistance.",
            "ResistanceAnalyzer"
        );

    }

    // --------------------------------------------------
    // Long Build-up
    // --------------------------------------------------

    if (input.longBuildUp === "Strong") {

        addEvidence(
            "LONG_BUILDUP",
            "POSITION_BUILDUP",
            "bullish",
            20,
            "Strong long build-up detected.",
            "PositionBuildUpAnalyzer"
        );

    }

    // --------------------------------------------------
    // Short Build-up
    // --------------------------------------------------

    if (input.shortBuildUp === "Strong") {

        addEvidence(
            "SHORT_BUILDUP",
            "POSITION_BUILDUP",
            "bearish",
            20,
            "Strong short build-up detected.",
            "PositionBuildUpAnalyzer"
        );

    }

    // --------------------------------------------------
    // Delta
    // --------------------------------------------------

    if (input.atmDelta >= 0.55) {

        addEvidence(
            "DELTA_BULLISH",
            "DELTA",
            "bullish",
            15,
            "ATM Delta supports bullish momentum.",
            "DeltaAnalyzer"
        );

    } else if (input.atmDelta <= 0.45) {

        addEvidence(
            "DELTA_BEARISH",
            "DELTA",
            "bearish",
            15,
            "ATM Delta supports bearish momentum.",
            "DeltaAnalyzer"
        );

    }

    // --------------------------------------------------
    // Max Pain
    // --------------------------------------------------

    if (input.maxPain !== null) {

        if (input.spotPrice > input.maxPain) {

            addEvidence(
                "ABOVE_MAXPAIN",
                "MAX_PAIN",
                "bullish",
                10,
                "Spot trading above Max Pain.",
                "MaxPainAnalyzer"
            );

        } else if (input.spotPrice < input.maxPain) {

            addEvidence(
                "BELOW_MAXPAIN",
                "MAX_PAIN",
                "bearish",
                10,
                "Spot trading below Max Pain.",
                "MaxPainAnalyzer"
            );

        }

    }

    return evidence;

}