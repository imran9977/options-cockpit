import type { StrikeWindowAnalysis } from "../models/StrikeWindowAnalysis.js";
import type { StrikeAnalysis } from "../models/StrikeAnalysis.js";
import type { StrikeLegMomentum } from "../models/StrikeLegMomentum.js";
import {
    EGBDStage,
    type EGBDResult,
    type EGBDSignal,
    type EGBDState,
} from "../models/EGBD.js";

const stateStore = new Map<string, EGBDState>();
const STAGE_PERSISTENCE = 2;
const STRONG_MOMENTUM_PERSISTENCE = 3;
const WEAKENING_PERSISTENCE = 2;

function getStateKey(
    strike: number,
    side: "CE" | "PE"
): string {
    return `${strike}_${side}`;
}

function getOrCreateState(
    strike: number,
    side: "CE" | "PE",
    timestamp: number
): EGBDState {

    const key = getStateKey(strike, side);

    const existing = stateStore.get(key);

    if (existing) {
        return existing;
    }

    const state: EGBDState = {
        strike,
        side,
        stage: EGBDStage.WATCHING,
        lastUpdated: timestamp,
        stageAge: 0,
    };

    stateStore.set(key, state);

    return state;
}

function isTriggerArmed(
    analysis: StrikeAnalysis
): boolean {

    return (
        analysis.premiumStrength > 0 &&
        analysis.volumeStrength > 0 &&
        analysis.oiStrength > 0 &&
        analysis.gammaStrength > 0
    );
}

function updateStageAge(
    state: EGBDState,
    nextStage: EGBDStage,
    timestamp: number
): void {

    if (state.stage === nextStage) {
        state.stageAge += 1;
    } else {
        state.stage = nextStage;
        state.stageAge = 1;
    }

    state.lastUpdated = timestamp;
}

function findMomentum(
    momentum: readonly StrikeLegMomentum[],
    strike: number,
    side: "CE" | "PE"
): StrikeLegMomentum | undefined {

    return momentum.find(
        entry =>
            entry.strike === strike &&
            entry.side === side
    );
}

type TransitionScore = {
    score: number;
    premium: boolean;
    oi: boolean;
    volume: boolean;
    gamma: boolean;
};

function calculateTransitionScore(
    momentum: StrikeLegMomentum
): TransitionScore {

    const premiumVelocity = momentum.premium.velocity > 0;
    const premiumAcceleration = momentum.premium.acceleration >= 0;

    const oiVelocity = momentum.oi.velocity > 0;
    const oiAcceleration = momentum.oi.acceleration >= 0;

    const volumeVelocity = momentum.volume.velocity > 0;
    const volumeAcceleration = momentum.volume.acceleration >= 0;

    const gammaVelocity = momentum.gamma.velocity > 0;
    const gammaAcceleration = momentum.gamma.acceleration >= 0;

    const premium = premiumVelocity;
    const oi = oiVelocity;
    const volume = volumeVelocity;
    const gamma = gammaVelocity;

    let score = 0;

    // Primary drivers (movement)
    if (premiumVelocity) score += 3;
    if (volumeVelocity) score += 3;
    if (oiVelocity) score += 2;
    if (gammaVelocity) score += 2;

    // Reinforcement (quality of movement)
    if (premiumAcceleration) score += 1;
    if (volumeAcceleration) score += 1;
    if (oiAcceleration) score += 1;
    if (gammaAcceleration) score += 1;

    return {
        score,
        premium,
        oi,
        volume,
        gamma,
    };
}

function buildSignal(
    analysis: StrikeAnalysis,
    state: EGBDState,
    legMomentum: StrikeLegMomentum
): EGBDSignal {

    return {
        strike: state.strike,
        side: state.side,
        stage: state.stage,
        stageAge: state.stageAge,
        premiumStrength: analysis.premiumStrength,
        volumeStrength: analysis.volumeStrength,
        oiStrength: analysis.oiStrength,
        gammaStrength: analysis.gammaStrength,
        ivStrength: analysis.ivStrength,

        momentumScore:
            legMomentum.premium.momentumScore +
            legMomentum.oi.momentumScore +
            legMomentum.volume.momentumScore +
            legMomentum.gamma.momentumScore +
            legMomentum.iv.momentumScore,

        evidence: [...analysis.evidence],
    };
}

function buildObservation(
    signal: EGBDSignal
): string {

    switch (signal.stage) {

        case EGBDStage.WATCHING:
            return `Watching ${signal.strike} ${signal.side}. Early participation is emerging, but confirmation is still incomplete.`;

        case EGBDStage.TRIGGER_ARMED:
            return `Trigger Armed. Premium, Volume, Open Interest and Gamma are aligning. Prepare for a potential momentum expansion.`;

        case EGBDStage.ENTRY_WINDOW:
            return `Entry Window Open. Market participation has become dependable. Monitor premium expansion for a quality entry.`;

        case EGBDStage.MOMENTUM_BUILDING:
            return `Momentum Building. Premium expansion is strengthening with broad market participation. This is the preferred participation zone.`;

        case EGBDStage.MOMENTUM_STRONG:
            return `Momentum Strong. Gamma expansion is active. Manage the trade and avoid chasing fresh entries.`;

        case EGBDStage.MOMENTUM_WEAKENING:
            return `Momentum Weakening. Participation is reducing and momentum is cooling. Consider protecting profits.`;

        case EGBDStage.EXIT_WINDOW:
            return `Exit Window Active. Momentum has largely exhausted. Wait patiently for the next setup.`;

        case EGBDStage.RESET:
            return `Cycle Complete. Monitoring for the next Gamma Blast setup.`;

        default:
            return "";
    }
}

function buildGammaExposureTable(
    strikeAnalysis: StrikeWindowAnalysis
) {

    return strikeAnalysis.strikes.map(strike => ({

        strike: strike.strike,

        callGamma: strike.ceGamma,

        putGamma: strike.peGamma,

        isATM:
            strike.strike === strikeAnalysis.atmStrike,

    }));

}

export function analyzeEGBD(
    strikeAnalysis: StrikeWindowAnalysis,
    momentum: readonly StrikeLegMomentum[]
): EGBDResult {

    const signals: EGBDSignal[] = [];

    for (const analysis of strikeAnalysis.analyses) {

        if (analysis.dominantSide === "NEUTRAL") {
            continue;
        }

        const side = analysis.dominantSide;

        const legMomentum = findMomentum(
            momentum,
            analysis.strike,
            side
        );

        if (!legMomentum) {
            continue;
        }

        const state = getOrCreateState(
            analysis.strike,
            side,
            strikeAnalysis.timestamp
        );

        const armed = isTriggerArmed(analysis);

        const transition = calculateTransitionScore(
            legMomentum
        );
        // Stage transition logic continues in Part 2...
        if (!armed) {

            updateStageAge(
                state,
                EGBDStage.WATCHING,
                strikeAnalysis.timestamp
            );

        } else {

            switch (state.stage) {

                case EGBDStage.WATCHING:

                    updateStageAge(
                        state,
                        transition.score >= 3 &&
                            state.stageAge >= STAGE_PERSISTENCE
                            ? EGBDStage.TRIGGER_ARMED
                            : EGBDStage.WATCHING,
                        strikeAnalysis.timestamp
                    );

                    break;

                case EGBDStage.TRIGGER_ARMED:

                    updateStageAge(
                        state,
                        transition.score >= 6 &&
                            state.stageAge >= STAGE_PERSISTENCE
                            ? EGBDStage.ENTRY_WINDOW
                            : EGBDStage.TRIGGER_ARMED,
                        strikeAnalysis.timestamp
                    );

                    break;

                case EGBDStage.ENTRY_WINDOW:

                    updateStageAge(
                        state,
                        transition.score >= 8 &&
                            state.stageAge >= STAGE_PERSISTENCE
                            ? EGBDStage.MOMENTUM_BUILDING
                            : EGBDStage.ENTRY_WINDOW,
                        strikeAnalysis.timestamp
                    );

                    break;

                case EGBDStage.MOMENTUM_BUILDING:

                    updateStageAge(
                        state,
                        transition.score >= 10 &&
                            state.stageAge >= STRONG_MOMENTUM_PERSISTENCE
                            ? EGBDStage.MOMENTUM_STRONG
                            : EGBDStage.MOMENTUM_BUILDING,
                        strikeAnalysis.timestamp
                    );

                    break;

                case EGBDStage.MOMENTUM_STRONG:

                    updateStageAge(
                        state,
                        transition.score < 8 &&
                            state.stageAge >= WEAKENING_PERSISTENCE
                            ? EGBDStage.MOMENTUM_WEAKENING
                            : EGBDStage.MOMENTUM_STRONG,
                        strikeAnalysis.timestamp
                    );

                    break;

                case EGBDStage.MOMENTUM_WEAKENING:

                    updateStageAge(
                        state,
                        transition.score < 3 &&
                            state.stageAge >= WEAKENING_PERSISTENCE
                            ? EGBDStage.EXIT_WINDOW
                            : EGBDStage.MOMENTUM_WEAKENING,
                        strikeAnalysis.timestamp
                    );

                    break;

                case EGBDStage.EXIT_WINDOW:

                    updateStageAge(
                        state,
                        EGBDStage.RESET,
                        strikeAnalysis.timestamp
                    );

                    break;

                case EGBDStage.RESET:

                    updateStageAge(
                        state,
                        EGBDStage.WATCHING,
                        strikeAnalysis.timestamp
                    );

                    break;

                default:

                    updateStageAge(
                        state,
                        EGBDStage.WATCHING,
                        strikeAnalysis.timestamp
                    );

                    break;
            }
        }


        signals.push(
            buildSignal(
                analysis,
                state,
                legMomentum
            )
        );
    }

    const activeSignal =
        signals.length > 0
            ? signals.reduce((best, current) => {

                const opportunityRank: Record<EGBDStage, number> = {
                    [EGBDStage.WATCHING]: 0,
                    [EGBDStage.TRIGGER_ARMED]: 3,
                    [EGBDStage.ENTRY_WINDOW]: 6,
                    [EGBDStage.MOMENTUM_BUILDING]: 5,
                    [EGBDStage.MOMENTUM_STRONG]: 2,
                    [EGBDStage.MOMENTUM_WEAKENING]: 1,
                    [EGBDStage.EXIT_WINDOW]: 0,
                    [EGBDStage.RESET]: 0,
                };

                const bestOpportunity = opportunityRank[best.stage];
                const currentOpportunity = opportunityRank[current.stage];

                if (currentOpportunity > bestOpportunity) {
                    return current;
                }

                if (
                    currentOpportunity === bestOpportunity &&
                    current.momentumScore > best.momentumScore
                ) {
                    return current;
                }

                if (
                    currentOpportunity === bestOpportunity &&
                    current.momentumScore === best.momentumScore &&
                    current.premiumStrength > best.premiumStrength
                ) {
                    return current;
                }

                return best;

            })
            : undefined;

    return {

    signals,

    activeSignal,

    primaryTrigger: activeSignal?.strike ?? 0,

    secondaryTrigger: activeSignal
        ? activeSignal.side === "CE"
            ? activeSignal.strike + 50
            : activeSignal.strike - 50
        : 0,

    invalidation: activeSignal
        ? activeSignal.side === "CE"
            ? activeSignal.strike - 25
            : activeSignal.strike + 25
        : 0,

    observation: activeSignal
        ? buildObservation(activeSignal)
        : "",

    gammaExposureTable:
        buildGammaExposureTable(strikeAnalysis),
};
}