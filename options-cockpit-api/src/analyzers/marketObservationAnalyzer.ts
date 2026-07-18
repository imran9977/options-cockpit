import type {
    MarketObservation,
    ObservationDriver,
    ObservationPriority,
    ObservationType,
} from "../models/MarketObservation.js";

interface GenerateMarketObservationsInput {
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

    marketBias: "Bullish" | "Bearish" | "Neutral";
    confidence: "Strong" | "Moderate" | "Low";
}

interface ObservationEvidence {
    id: string;
    type: ObservationType;
    priority: ObservationPriority;
    driver: ObservationDriver;
    statement: string;
}

interface ObservationContext {
    timestamp: string;
    expiresAt: string;
}

function createObservationContext(): ObservationContext {
    const now = new Date();

    return {
        timestamp: now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }),
        expiresAt: new Date(
            now.getTime() + 90 * 60 * 1000
        ).toISOString(),
    };
}

function buildObservations(
    evidence: ObservationEvidence[],
    context: ObservationContext
): MarketObservation[] {

    const observations: MarketObservation[] = [];

    const participationEvidence = evidence.filter(
        (item) =>
            item.driver === "PCR" ||
            item.driver === "BUILD_UP" ||
            item.driver === "DELTA"
    );

    const structureEvidence = evidence.filter(
        (item) =>
            item.driver === "SUPPORT" ||
            item.driver === "RESISTANCE" ||
            item.driver === "ATM" ||
            item.driver === "MAX_PAIN"
    );

    const biasEvidence = evidence.filter(
        (item) =>
            item.driver === "MARKET_BIAS"
    );

    if (participationEvidence.length > 0) {

        const bullishCount = participationEvidence.filter(
            (item) => item.type === "bullish"
        ).length;

        const bearishCount = participationEvidence.filter(
            (item) => item.type === "bearish"
        ).length;

        let headline = "Market Participation Mixed";
        let summary =
            "Participation indicators are providing mixed signals.";
        let watchFor =
            "Wait for participation signals to align before increasing conviction.";
        let type: ObservationType = "neutral";

        if (bullishCount > bearishCount) {

            headline = "Bullish Participation Strengthening";

            summary =
                "Buying participation is strengthening across multiple market indicators.";

            watchFor =
                "Look for follow-through buying to confirm bullish continuation.";

            type = "bullish";

        } else if (bearishCount > bullishCount) {

            headline = "Bearish Participation Strengthening";

            summary =
                "Selling participation is strengthening across multiple market indicators.";

            watchFor =
                "Watch for fresh selling pressure on intraday pullbacks.";

            type = "bearish";

        }

        observations.push({

            id: "PARTICIPATION",

            type,

            priority: "high",

            driver: "BUILD_UP",

            headline,

            summary,

            evidence: participationEvidence.map(
                (item) => item.statement
            ),

            watchFor,

            timestamp: context.timestamp,

            expiresAt: context.expiresAt,

        });

    }

    if (structureEvidence.length > 0) {

        const bullishCount = structureEvidence.filter(
            (item) => item.type === "bullish"
        ).length;

        const bearishCount = structureEvidence.filter(
            (item) => item.type === "bearish"
        ).length;

        let headline = "Market Structure Balanced";
        let summary =
            "Price structure is currently offering mixed technical signals.";
        let watchFor =
            "Watch key support and resistance levels for the next directional move.";
        let type: ObservationType = "neutral";

        if (bullishCount > bearishCount) {

            headline = "Price Structure Favors Bulls";

            summary =
                "Current price structure continues to support bullish market conditions.";

            watchFor =
                "Monitor resistance for a potential breakout confirmation.";

            type = "bullish";

        } else if (bearishCount > bullishCount) {

            headline = "Price Structure Favors Bears";

            summary =
                "Current price structure continues to support bearish market conditions.";

            watchFor =
                "Watch whether support begins to weaken under selling pressure.";

            type = "bearish";

        }

        observations.push({

            id: "PRICE_STRUCTURE",

            type,

            priority: "high",

            driver: "SUPPORT",

            headline,

            summary,

            evidence: structureEvidence.map(
                (item) => item.statement
            ),

            watchFor,

            timestamp: context.timestamp,

            expiresAt: context.expiresAt,

        });

    }

    if (biasEvidence.length > 0) {

        const bias = biasEvidence[0];

        observations.push({

            id: "MARKET_BIAS",

            type: bias.type,

            priority: bias.priority,

            driver: "MARKET_BIAS",

            headline: "Overall Market Bias",

            summary: bias.statement,

            evidence: [bias.statement],

            watchFor:
                "Monitor whether incoming market data continues to support the current bias.",

            timestamp: context.timestamp,

            expiresAt: context.expiresAt,

        });

    }

    return observations;

}


export function generateMarketObservations(
    input: GenerateMarketObservationsInput
): MarketObservation[] {

    const evidence: ObservationEvidence[] = [];

    const context = createObservationContext();

    const addEvidence = (
        id: string,
        type: ObservationType,
        priority: ObservationPriority,
        driver: ObservationDriver,
        statement: string
    ) => {

        evidence.push({
            id,
            type,
            priority,
            driver,
            statement,
        });

    };

    // PCR
    if (input.pcr >= 1.10) {
        addEvidence(
            "PCR_BULLISH",
            "bullish",
            "high",
            "PCR",
            "Put writers are gaining control."
        );
    } else if (input.pcr <= 0.90) {
        addEvidence(
            "PCR_BEARISH",
            "bearish",
            "high",
            "PCR",
            "Call writers are gaining control."
        );
    }

    // Spot vs ATM
    if (input.spotPrice > input.atmStrike) {
        addEvidence(
            "SPOT_ABOVE_ATM",
            "bullish",
            "medium",
            "ATM",
            "Spot is trading above ATM strike."
        );
    } else {
        addEvidence(
            "SPOT_BELOW_ATM",
            "bearish",
            "medium",
            "ATM",
            "Spot is trading below ATM strike."
        );
    }

    // Support
    if (
        input.primarySupport !== null &&
        input.spotPrice > input.primarySupport
    ) {
        addEvidence(
            "ABOVE_SUPPORT",
            "bullish",
            "high",
            "SUPPORT",
            "Price is holding above support."
        );
    }

    // Resistance
    if (
        input.primaryResistance !== null &&
        input.spotPrice < input.primaryResistance
    ) {
        addEvidence(
            "BELOW_RESISTANCE",
            "bearish",
            "high",
            "RESISTANCE",
            "Price remains below resistance."
        );
    }

    // Long Build-up
    if (input.longBuildUp === "Strong") {
        addEvidence(
            "LONG_BUILDUP",
            "bullish",
            "high",
            "BUILD_UP",
            "Strong long build-up near ATM."
        );
    }

    // Short Build-up
    if (input.shortBuildUp === "Strong") {
        addEvidence(
            "SHORT_BUILDUP",
            "bearish",
            "high",
            "BUILD_UP",
            "Strong short build-up near ATM."
        );
    }

    // Delta
    if (input.atmDelta >= 0.55) {
        addEvidence(
            "DELTA_BULLISH",
            "bullish",
            "medium",
            "DELTA",
            "Delta supports bullish momentum."
        );
    } else if (input.atmDelta <= 0.45) {
        addEvidence(
            "DELTA_BEARISH",
            "bearish",
            "medium",
            "DELTA",
            "Delta supports bearish momentum."
        );
    }

    // Max Pain
    if (input.maxPain !== null) {
        if (input.spotPrice > input.maxPain) {
            addEvidence(
                "ABOVE_MAXPAIN",
                "bullish",
                "medium",
                "MAX_PAIN",
                "Spot is trading above Max Pain."
            );
        } else if (input.spotPrice < input.maxPain) {
            addEvidence(
                "BELOW_MAXPAIN",
                "bearish",
                "medium",
                "MAX_PAIN",
                "Spot is trading below Max Pain."
            );
        }
    }

    return buildObservations(
        evidence,
        context
    );
}