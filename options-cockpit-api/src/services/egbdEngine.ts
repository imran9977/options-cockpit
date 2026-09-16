import type { StrikeWindowAnalysis } from "../models/StrikeWindowAnalysis.js";
import type { StrikeAnalysis } from "../models/StrikeAnalysis.js";
import type { StrikeLegMomentum } from "../models/StrikeLegMomentum.js";
import type { StrikeSnapshot } from "../models/StrikeSnapshot.js";
import {
    EGBDStage,
    type EGBDResult,
    type EGBDSignal,
    type EGBDState,
} from "../models/EGBD.js";
import { logEGBDTransition } from "./egbdLogger.js";
import type { Underlying } from "../config/instruments.js";

// Two independent maps (not one map with a compound key) so
// clearEGBDState/pruneStaleStates for one instrument stay a plain
// operation on that instrument's own map, and never have to scan or
// filter the other's entries.
const stateStoreByUnderlying: Record<Underlying, Map<string, EGBDState>> = {
    NIFTY: new Map(),
    SENSEX: new Map(),
};

const STAGE_PERSISTENCE = 2;
const STRONG_MOMENTUM_PERSISTENCE = 3;
const WEAKENING_PERSISTENCE = 2;

// A drop of this fraction from the strike's own peak IV since it
// armed counts as a crash - relative to its own peak, not an absolute
// IV level, since "high" and "low" IV mean different things per
// strike/expiry. Starting value, unvalidated against real outcomes
// yet - same caveat as every other threshold in this file.
const IV_CRASH_DROP_RATIO = 0.15;

// Stages worth force-exiting out of on a confirmed crash - WATCHING
// has no peak to have crashed from (nothing armed yet), and
// EXIT_WINDOW/RESET are already on their way out on their own.
const CRASH_EXIT_STAGES = new Set<EGBDStage>([
    EGBDStage.TRIGGER_ARMED,
    EGBDStage.ENTRY_WINDOW,
    EGBDStage.MOMENTUM_BUILDING,
    EGBDStage.MOMENTUM_STRONG,
    EGBDStage.MOMENTUM_WEAKENING,
]);

// Relative to the strike's OWN peak-since-armed, not an absolute IV
// level - a strike that's always had low IV crashing 15% means
// something different in absolute points than one that's always had
// high IV, but both represent the same real loss of premium support.
function hasIVCrashed(
    currentIV: number,
    peakIV: number | null
): boolean {

    if (peakIV === null || peakIV <= 0) {
        return false;
    }

    return (peakIV - currentIV) / peakIV >= IV_CRASH_DROP_RATIO;
}

// A strike that drifts out of the ATM window as spot moves just
// stops getting touched - it isn't removed. Pruning by staleness
// (not "is it in today's window") avoids punishing a strike that
// briefly leaves and comes right back as spot wobbles at the edge.
const STALE_STATE_MAX_AGE_MS = 60 * 60 * 1000;

// Call once per rollover (see didExpiryJustChange in
// expiryService.ts) - a strike number from the expired contract has
// nothing to do with the same-numbered strike on the new one.
export function clearEGBDState(underlying: Underlying): void {
    stateStoreByUnderlying[underlying].clear();
}

function pruneStaleStates(stateStore: Map<string, EGBDState>, now: number): void {

    for (const [key, state] of stateStore) {
        if (now - state.lastUpdated > STALE_STATE_MAX_AGE_MS) {
            stateStore.delete(key);
        }
    }
}

function getStateKey(
    strike: number,
    side: "CE" | "PE"
): string {
    return `${strike}_${side}`;
}

function getOrCreateState(
    stateStore: Map<string, EGBDState>,
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
        unarmedStreak: 0,
        referenceEntryPrice: null,
        peakPremiumSinceEntry: null,
        peakIVSinceEntry: null,
        ivCrashStreak: 0,
    };

    stateStore.set(key, state);

    return state;
}

// Premium and Volume are the reliable, low-noise signals - live data
// (2026-09-15 expiry day log) showed they were positive on every
// strike that ever armed, all day. OI and Gamma are each individually
// lumpy/discontinuous poll-to-poll (OI in particular: 0 on 99.6% of
// that day's TRIGGER_ARMED->WATCHING fallbacks), and requiring BOTH
// of them to also be positive on the exact same ~3s tick as Premium
// and Volume vetoed 79% of arm events that day despite Premium and
// Volume staying strong - i.e. it was killing real, sustained moves
// on momentary OI/Gamma noise, not on the move actually fading.
// OI/Gamma still matter: they're not dropped, just moved out of the
// hard gate and into calculateTransitionScore, where real backing is
// still required to climb past ENTRY_WINDOW (Premium+Volume alone cap
// at score 8, short of the 10 needed for MOMENTUM_STRONG).
function isTriggerArmed(
    analysis: StrikeAnalysis
): boolean {

    return (
        analysis.premiumStrength > 0 &&
        analysis.volumeStrength > 0
    );
}

// The biggest CE/PE OI in the current window - the "walls" a real
// squeeze needs a critical mass of writers at, to have genuine fuel
// behind it (not just a thin, noisy premium pop). Used to weight
// candidate selection, not to gate arming - a fast-developing setup
// shouldn't be blocked just because OI hasn't built up yet, but when
// choosing between equally-staged candidates, real backing should win.
function calculateMaxOIInWindow(
    strikes: readonly StrikeSnapshot[]
): { maxCallOI: number; maxPutOI: number } {

    let maxCallOI = 0;
    let maxPutOI = 0;

    for (const strike of strikes) {
        maxCallOI = Math.max(maxCallOI, strike.ceOI);
        maxPutOI = Math.max(maxPutOI, strike.peOI);
    }

    return {
        maxCallOI: Math.max(maxCallOI, 1),
        maxPutOI: Math.max(maxPutOI, 1),
    };
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

// Each metric's momentumScore (|velocity| + |acceleration|) comes in
// a different unit - rupees, contracts, gamma-decimals, IV points.
// Adding them directly is dimensionless nonsense and lets whichever
// metric has the biggest raw numbers (usually OI/Volume in contracts)
// drown out the others. Dividing each by a reasoned "typical move"
// scale first converts all five into the same dimensionless
// "how many typical moves was this" unit before combining - not
// empirically tuned, same caveat as every other threshold here.
const TYPICAL_MOVE = {
    premium: 1,      // ₹1 over the momentum window
    oi: 50,          // 50 contracts
    volume: 100,     // 100 contracts
    gamma: 0.001,    // matches GAMMA_GUIDE's own step size
    iv: 0.5,         // 0.5 IV points
} as const;

function normalizedMomentum(
    rawMomentumScore: number,
    typicalMove: number
): number {
    return rawMomentumScore / typicalMove;
}

function buildSignal(
    analysis: StrikeAnalysis,
    state: EGBDState,
    legMomentum: StrikeLegMomentum,
    currentPremium: number,
    oiConcentration: number,
    ivCrashed: boolean
): EGBDSignal {

    const multipleFromEntry =
        state.referenceEntryPrice !== null && state.referenceEntryPrice > 0
            ? Number((currentPremium / state.referenceEntryPrice).toFixed(2))
            : null;

    const pullbackFromPeakPercent =
        state.peakPremiumSinceEntry !== null && state.peakPremiumSinceEntry > 0
            ? Number((
                ((state.peakPremiumSinceEntry - currentPremium) / state.peakPremiumSinceEntry) * 100
            ).toFixed(1))
            : null;

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

        momentumScore: Number((
            normalizedMomentum(legMomentum.premium.momentumScore, TYPICAL_MOVE.premium) +
            normalizedMomentum(legMomentum.oi.momentumScore, TYPICAL_MOVE.oi) +
            normalizedMomentum(legMomentum.volume.momentumScore, TYPICAL_MOVE.volume) +
            normalizedMomentum(legMomentum.gamma.momentumScore, TYPICAL_MOVE.gamma) +
            normalizedMomentum(legMomentum.iv.momentumScore, TYPICAL_MOVE.iv)
        ).toFixed(2)),

        currentPremium,
        referenceEntryPrice: state.referenceEntryPrice,
        peakPremiumSinceEntry: state.peakPremiumSinceEntry,
        multipleFromEntry,
        pullbackFromPeakPercent,

        oiConcentration,

        ivCrashed,

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

    return strikeAnalysis.strikes.map(strike => {

        // Live, poll-to-poll OI change - the same figure EGBD's own
        // trigger reacts to (analyzeOI/oiStrength), not the
        // cumulative-since-yesterday figure shown in Option Chain
        // Intelligence. Different question, deliberately different
        // number, so this stays "what the algorithm is seeing."
        const analysis = strikeAnalysis.analyses.find(
            candidate => candidate.strike === strike.strike
        );

        return {

            strike: strike.strike,

            callPremium: strike.ceLastPrice,

            putPremium: strike.peLastPrice,

            callOIChange: analysis?.delta.ceOIChange ?? 0,

            putOIChange: analysis?.delta.peOIChange ?? 0,

            // Same live poll-to-poll delta as ΔOI above - and the
            // same weight (3) as Premium in EGBD's transition score,
            // tied for the single biggest driver of a stage advancing.
            callVolumeChange: analysis?.delta.ceVolumeChange ?? 0,

            putVolumeChange: analysis?.delta.peVolumeChange ?? 0,

            callGamma: strike.ceGamma,

            putGamma: strike.peGamma,

            isATM:
                strike.strike === strikeAnalysis.atmStrike,

        };
    });

}

export function analyzeEGBD(
    underlying: Underlying,
    strikeAnalysis: StrikeWindowAnalysis,
    momentum: readonly StrikeLegMomentum[]
): EGBDResult {

    const stateStore = stateStoreByUnderlying[underlying];

    pruneStaleStates(stateStore, strikeAnalysis.timestamp);

    const signals: EGBDSignal[] = [];

    const { maxCallOI, maxPutOI } = calculateMaxOIInWindow(
        strikeAnalysis.strikes
    );

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
            stateStore,
            analysis.strike,
            side,
            strikeAnalysis.timestamp
        );

        const stageBefore = state.stage;

        const armed = isTriggerArmed(analysis);

        const transition = calculateTransitionScore(
            legMomentum
        );

        if (!armed) {

            state.unarmedStreak += 1;

            // Same caution applied to falling back as advancing a
            // stage requires - one noisy tick is a blip, not proof
            // the setup is gone. Stage/stageAge are left untouched
            // until the streak actually confirms it.
            if (state.unarmedStreak >= STAGE_PERSISTENCE) {

                updateStageAge(
                    state,
                    EGBDStage.WATCHING,
                    strikeAnalysis.timestamp
                );
            }

        } else {

            state.unarmedStreak = 0;

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

        const strikeSnapshot = strikeAnalysis.strikes.find(
            snapshot => snapshot.strike === analysis.strike
        );

        const currentPremium = Number((
            side === "CE"
                ? strikeSnapshot?.ceLastPrice ?? 0
                : strikeSnapshot?.peLastPrice ?? 0
        ).toFixed(2));

        const currentIV = side === "CE"
            ? strikeSnapshot?.ceIV ?? 0
            : strikeSnapshot?.peIV ?? 0;

        // How this strike's OI on its dominant side compares to the
        // biggest wall in the window - 1.0 means it IS the wall, 0
        // means it has none of the window's OI. Used to prefer a
        // well-backed candidate over a thinly-backed one when
        // selecting activeSignal, not to gate whether this strike
        // can arm at all.
        const strikeOI = side === "CE"
            ? strikeSnapshot?.ceOI ?? 0
            : strikeSnapshot?.peOI ?? 0;

        const oiConcentration = Number((
            strikeOI / (side === "CE" ? maxCallOI : maxPutOI)
        ).toFixed(2));

        // Anchor a reference price the moment this strike is first
        // confirmed armed - not on every WATCHING cycle, only the
        // actual WATCHING -> TRIGGER_ARMED transition.
        if (
            stageBefore === EGBDStage.WATCHING &&
            state.stage === EGBDStage.TRIGGER_ARMED
        ) {
            state.referenceEntryPrice = currentPremium;
            state.peakPremiumSinceEntry = currentPremium;
            state.peakIVSinceEntry = currentIV;
        }

        // Track the running high while a reference is active.
        if (state.referenceEntryPrice !== null) {
            state.peakPremiumSinceEntry = Math.max(
                state.peakPremiumSinceEntry ?? currentPremium,
                currentPremium
            );
            state.peakIVSinceEntry = Math.max(
                state.peakIVSinceEntry ?? currentIV,
                currentIV
            );
        }

        // Persistence-gated, same shape as unarmedStreak - one noisy
        // IV tick can't force an exit on its own, only a sustained
        // drop from this strike's own peak can.
        if (hasIVCrashed(currentIV, state.peakIVSinceEntry)) {
            state.ivCrashStreak += 1;
        } else {
            state.ivCrashStreak = 0;
        }

        const ivCrashConfirmed = state.ivCrashStreak >= STAGE_PERSISTENCE;

        // Independent of the score-based switch above - a confirmed
        // crash forces the exit regardless of what momentum/OI/volume
        // are doing, the same way unarmedStreak can force WATCHING
        // regardless of the switch's outcome. EXIT_WINDOW already
        // flows to RESET on its own next cycle either way.
        if (ivCrashConfirmed && CRASH_EXIT_STAGES.has(state.stage)) {
            updateStageAge(
                state,
                EGBDStage.EXIT_WINDOW,
                strikeAnalysis.timestamp
            );
        }

        // Captured before any clear-on-reset below, so a transition
        // INTO a reset still logs what the reference/peak were
        // during the cycle that just ended, not the freshly-cleared
        // nulls.
        const referenceEntryPriceForLog = state.referenceEntryPrice;
        const peakPremiumSinceEntryForLog = state.peakPremiumSinceEntry;

        const multipleFromEntryForLog =
            referenceEntryPriceForLog !== null && referenceEntryPriceForLog > 0
                ? Number((currentPremium / referenceEntryPriceForLog).toFixed(2))
                : null;

        const pullbackFromPeakPercentForLog =
            peakPremiumSinceEntryForLog !== null && peakPremiumSinceEntryForLog > 0
                ? Number((
                    ((peakPremiumSinceEntryForLog - currentPremium) / peakPremiumSinceEntryForLog) * 100
                ).toFixed(1))
                : null;

        // Clear only on a genuine reset back to WATCHING (guarded by
        // unarmedStreak above already), not a transient blip.
        if (
            state.stage === EGBDStage.WATCHING &&
            stageBefore !== EGBDStage.WATCHING
        ) {
            state.referenceEntryPrice = null;
            state.peakPremiumSinceEntry = null;
            state.peakIVSinceEntry = null;
            state.ivCrashStreak = 0;
        }

        const signal = buildSignal(
            analysis,
            state,
            legMomentum,
            currentPremium,
            oiConcentration,
            ivCrashConfirmed
        );

        // Log once per actual stage change, not once per 5s poll -
        // gives a clean, reviewable story per strike/side instead of
        // a flood of unchanged-stage entries.
        if (stageBefore !== state.stage) {
            logEGBDTransition(underlying, {
                strike: signal.strike,
                side: signal.side,
                fromStage: stageBefore,
                toStage: signal.stage,
                currentPremium: signal.currentPremium,
                referenceEntryPrice: referenceEntryPriceForLog,
                peakPremiumSinceEntry: peakPremiumSinceEntryForLog,
                multipleFromEntry: multipleFromEntryForLog,
                pullbackFromPeakPercent: pullbackFromPeakPercentForLog,
                oiConcentration: signal.oiConcentration,
                momentumScore: signal.momentumScore,
                premiumStrength: signal.premiumStrength,
                volumeStrength: signal.volumeStrength,
                oiStrength: signal.oiStrength,
                gammaStrength: signal.gammaStrength,
                ivStrength: signal.ivStrength,
                evidence: signal.evidence,
            });
        }

        signals.push(signal);
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

                // Same stage - prefer real OI backing over a thinly-
                // backed strike before comparing raw momentum, so a
                // noisy move with little fuel behind it doesn't
                // outrank a genuinely well-backed setup.
                if (
                    currentOpportunity === bestOpportunity &&
                    current.oiConcentration > best.oiConcentration
                ) {
                    return current;
                }

                if (
                    currentOpportunity === bestOpportunity &&
                    current.oiConcentration === best.oiConcentration &&
                    current.momentumScore > best.momentumScore
                ) {
                    return current;
                }

                if (
                    currentOpportunity === bestOpportunity &&
                    current.oiConcentration === best.oiConcentration &&
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

    observation: activeSignal
        ? buildObservation(activeSignal)
        : "",

    gammaExposureTable:
        buildGammaExposureTable(strikeAnalysis),
};
}