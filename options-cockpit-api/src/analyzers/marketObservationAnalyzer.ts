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

export function generateMarketObservations(
    input: GenerateMarketObservationsInput
): MarketObservation[] {

    const observations: MarketObservation[] = [];

    const now = new Date();

    const timestamp = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    const expiresAt = new Date(
        now.getTime() + 90 * 60 * 1000
    ).toISOString();

    const addObservation = (
        id: string,
        type: ObservationType,
        priority: ObservationPriority,
        driver: ObservationDriver,
        message: string
    ) => {

        observations.push({
            id,
            type,
            priority,
            driver,
            message,
            timestamp,
            expiresAt,
        });

    };

    // PCR
    if (input.pcr >= 1.10) {
        addObservation(
            "PCR_BULLISH",
            "bullish",
            "high",
            "PCR",
            "Put writers are gaining control."
        );
    } else if (input.pcr <= 0.90) {
        addObservation(
            "PCR_BEARISH",
            "bearish",
            "high",
            "PCR",
            "Call writers are gaining control."
        );
    }

    // Spot vs ATM
    if (input.spotPrice > input.atmStrike) {
        addObservation(
            "SPOT_ABOVE_ATM",
            "bullish",
            "medium",
            "ATM",
            "Spot is trading above ATM strike."
        );
    } else {
        addObservation(
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
        addObservation(
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
        addObservation(
            "BELOW_RESISTANCE",
            "bearish",
            "high",
            "RESISTANCE",
            "Price remains below resistance."
        );
    }

    // Long Build-up
    if (input.longBuildUp === "Strong") {
        addObservation(
            "LONG_BUILDUP",
            "bullish",
            "high",
            "BUILD_UP",
            "Strong long build-up near ATM."
        );
    }

    // Short Build-up
    if (input.shortBuildUp === "Strong") {
        addObservation(
            "SHORT_BUILDUP",
            "bearish",
            "high",
            "BUILD_UP",
            "Strong short build-up near ATM."
        );
    }

    // Delta
    if (input.atmDelta >= 0.55) {
        addObservation(
            "DELTA_BULLISH",
            "bullish",
            "medium",
            "DELTA",
            "Delta supports bullish momentum."
        );
    } else if (input.atmDelta <= 0.45) {
        addObservation(
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
            addObservation(
                "ABOVE_MAXPAIN",
                "bullish",
                "medium",
                "MAX_PAIN",
                "Spot is trading above Max Pain."
            );
        } else if (input.spotPrice < input.maxPain) {
            addObservation(
                "BELOW_MAXPAIN",
                "bearish",
                "medium",
                "MAX_PAIN",
                "Spot is trading below Max Pain."
            );
        }
    }

    return observations;
}