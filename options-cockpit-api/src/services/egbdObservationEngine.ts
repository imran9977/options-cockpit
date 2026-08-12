import {
    EGBDStage,
    type EGBDResult,
    type EGBDSignal,
} from "../models/EGBD.js";

import type {
    MarketObservation,
    ObservationPriority,
} from "../models/MarketObservation.js";

const STAGE_CONFIG: Record<
    EGBDStage,
    {
        headline: string;
        priority: ObservationPriority;
    }
> = {

    [EGBDStage.WATCHING]: {
        headline: "Watching Gamma Build-up",
        priority: "low",
    },

    [EGBDStage.TRIGGER_ARMED]: {
        headline: "Gamma Trigger Armed",
        priority: "medium",
    },

    [EGBDStage.ENTRY_WINDOW]: {
        headline: "Gamma Blast Entry Window",
        priority: "high",
    },

    [EGBDStage.MOMENTUM_BUILDING]: {
        headline: "Gamma Momentum Building",
        priority: "high",
    },

    [EGBDStage.MOMENTUM_STRONG]: {
        headline: "Gamma Momentum Strong",
        priority: "critical",
    },

    [EGBDStage.MOMENTUM_WEAKENING]: {
        headline: "Gamma Momentum Weakening",
        priority: "medium",
    },

    [EGBDStage.EXIT_WINDOW]: {
        headline: "Gamma Blast Exit Window",
        priority: "medium",
    },

    [EGBDStage.RESET]: {
        headline: "Gamma Lifecycle Reset",
        priority: "low",
    },

};

function buildSummary(
    signal: EGBDSignal
): string {

    const label = `${signal.strike} ${signal.side}`;

    switch (signal.stage) {

        case EGBDStage.WATCHING:
            return `${label} is being monitored for early gamma expansion.`;

        case EGBDStage.TRIGGER_ARMED:
            return `${label} has aligned Premium, OI, Volume and Gamma conditions. Awaiting confirmation.`;

        case EGBDStage.ENTRY_WINDOW:
            return `${label} has entered the Gamma Blast entry window.`;

        case EGBDStage.MOMENTUM_BUILDING:
            return `${label} has been building momentum for ${signal.stageAge} cycle(s).`;

        case EGBDStage.MOMENTUM_STRONG:
            return `${label} has maintained strong momentum for ${signal.stageAge} consecutive cycle(s).`;

        case EGBDStage.MOMENTUM_WEAKENING:
            return `${label} is weakening after ${signal.stageAge} cycle(s).`;

        case EGBDStage.EXIT_WINDOW:
            return `${label} has entered the exit window. Watch for momentum exhaustion.`;

        case EGBDStage.RESET:
            return `${label} completed its gamma lifecycle and returned to monitoring.`;

    }

}

export function buildEGBDObservations(
    result: EGBDResult | undefined
): MarketObservation[] {

    if (!result) {
        return [];
    }

    const timestamp = new Date().toISOString();

    return result.signals.map(signal => {

        const config = STAGE_CONFIG[signal.stage];

        return {

            id:
                `EGBD_${signal.strike}_${signal.side}_${signal.stage}`,

            type:
                signal.side === "CE"
                    ? "bullish"
                    : "bearish",

            priority:
                config.priority,

            driver:
                "EGBD",

            headline:
                config.headline,

            summary:
                buildSummary(signal),

            evidence:
                signal.evidence,

            watchFor:
                null,

            timestamp,

            expiresAt:
                timestamp,

        };

    });

}