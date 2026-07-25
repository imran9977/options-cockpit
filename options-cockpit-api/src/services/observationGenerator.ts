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

    if (qualified.direction === "bullish") {

        type = "bullish";

        if (qualified.confidence >= 80) {

            priority = "critical";

        } else if (qualified.confidence >= 65) {

            priority = "high";

        } else {

            priority = "medium";

        }

    } else {

        type = "bearish";

        if (qualified.confidence >= 80) {

            priority = "critical";

        } else if (qualified.confidence >= 65) {

            priority = "high";

        } else {

            priority = "medium";

        }

    }

    driver = "MARKET_BIAS";

    const headline =
        qualified.direction === "bullish"
            ? "Bullish Market Bias"
            : "Bearish Market Bias";

    const summary =
        `${qualified.direction === "bullish" ? "Bullish" : "Bearish"} bias confirmed with ${qualified.confidence}% confidence based on ${qualified.evidenceCount} supporting signal${qualified.evidenceCount === 1 ? "" : "s"}.`;

    return {

        id: `MARKET_BIAS_${Date.now()}`,

        type,

        priority,

        driver,

        headline,

        summary,

        evidence: qualified.supportingReasons,

        watchFor: null,

        timestamp,

        expiresAt,

    };

}