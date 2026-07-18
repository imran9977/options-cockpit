import type { QualifiedObservation } from "../models/QualifiedObservation.js";
import type {
    MarketObservation,
    ObservationDriver,
    ObservationPriority,
    ObservationType,
} from "../models/MarketObservation.js";

export function generateObservation(
    qualified: QualifiedObservation
): MarketObservation {

    const now = new Date();

    const timestamp = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    const expiresAt = new Date(
        now.getTime() + 90 * 60 * 1000
    ).toISOString();

    let type: ObservationType;
    let priority: ObservationPriority;
    let driver: ObservationDriver;
    let message: string;

    if (qualified.direction === "bullish") {

        type = "bullish";
        if (qualified.confidence >= 80) {

            priority = "critical";

        } else if (qualified.confidence >= 65) {

            priority = "high";

        } else {

            priority = "medium";

        }
        driver = "MARKET_BIAS";

        message =
            qualified.confidence >= 80
                ? "Strong bullish confirmation across multiple market signals."
                : "Bullish market bias confirmed.";

    } else {

        type = "bearish";
        if (qualified.confidence >= 80) {

            priority = "critical";

        } else if (qualified.confidence >= 65) {

            priority = "high";

        } else {

            priority = "medium";

        }
        driver = "MARKET_BIAS";

        message =
            qualified.confidence >= 80
                ? "Strong bearish confirmation across multiple market signals."
                : "Bearish market bias confirmed.";

    }

    return {

        id: `MARKET_BIAS_${Date.now()}`,

        type,

        priority,

        driver,

        message,

        timestamp,

        expiresAt,

    };

}