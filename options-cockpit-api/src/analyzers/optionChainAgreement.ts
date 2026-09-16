import { EGBDStage } from "../models/EGBD.js";
import type { OptionAnalysis } from "../models/OptionAnalysis.js";
import type { SignalCandidate } from "../models/PriceStructureSignal.js";

export type OptionChainAgreement = "confirms" | "mixed" | "contradicts" | "no-data";

type Direction = "bullish" | "bearish";

interface SourceScore {
    score: -1 | 0 | 1;
    reason: string | null;
}

// Put writing is a bullish-leaning positioning bet (writers expect
// price to stay above the strike), call writing the bearish mirror -
// Low Writer Activity / Balanced Positioning mean no real read either
// way. Exactly the 4 strings determineOIFlowVerdict can return.
function scoreOIFlow(direction: Direction, oiFlowVerdict: string): SourceScore {

    if (oiFlowVerdict === "Put Writers Active") {
        return direction === "bullish"
            ? { score: 1, reason: "Put writers active - bullish OI positioning" }
            : { score: -1, reason: "Put writers active - bullish OI positioning against this bearish signal" };
    }

    if (oiFlowVerdict === "Call Writers Active") {
        return direction === "bearish"
            ? { score: 1, reason: "Call writers active - bearish OI positioning" }
            : { score: -1, reason: "Call writers active - bearish OI positioning against this bullish signal" };
    }

    return { score: 0, reason: null };
}

function scoreMarketBias(
    direction: Direction,
    marketBias: OptionAnalysis["marketBias"],
    confidence: OptionAnalysis["confidence"]
): SourceScore {

    if (marketBias === "Neutral") {
        return { score: 0, reason: null };
    }

    const biasDirection: Direction = marketBias === "Bullish" ? "bullish" : "bearish";

    if (biasDirection === direction) {
        return { score: 1, reason: `Market bias: ${marketBias} (${confidence} confidence)` };
    }

    return { score: -1, reason: `Market bias: ${marketBias} (${confidence} confidence) - against this signal` };
}

// WATCHING/RESET mean "nothing confirmed yet," not disagreement - only
// a strike that's actually armed or further counts as a real read.
const CONFIRMED_STAGES = new Set<EGBDStage>([
    EGBDStage.TRIGGER_ARMED,
    EGBDStage.ENTRY_WINDOW,
    EGBDStage.MOMENTUM_BUILDING,
    EGBDStage.MOMENTUM_STRONG,
    EGBDStage.MOMENTUM_WEAKENING,
    EGBDStage.EXIT_WINDOW,
]);

function scoreEGBD(direction: Direction, optionAnalysis: OptionAnalysis): SourceScore {

    const active = optionAnalysis.egbd?.activeSignal;

    if (!active || !CONFIRMED_STAGES.has(active.stage)) {
        return { score: 0, reason: null };
    }

    const sideDirection: Direction = active.side === "CE" ? "bullish" : "bearish";

    if (sideDirection === direction) {
        return { score: 1, reason: `EGBD showing ${active.side} momentum building (${active.stage})` };
    }

    return { score: -1, reason: `EGBD showing ${active.side} momentum building (${active.stage}) - opposite side` };
}

export interface OptionChainAgreementResult {
    agreement: OptionChainAgreement;
    reasons: string[];
}

// No hard veto, deliberately - each source contributes independently
// and the net score decides the label. A signal whose option-chain
// context disagrees is still returned as "contradicts," never
// suppressed - the same AND-gate-across-noisy-signals mistake that
// broke EGBD's own calibration earlier today must not repeat here.
export function scoreOptionChainAgreement(
    direction: Direction,
    optionAnalysis: OptionAnalysis
): OptionChainAgreementResult {

    const sources = [
        scoreOIFlow(direction, optionAnalysis.oiFlowVerdict),
        scoreMarketBias(direction, optionAnalysis.marketBias, optionAnalysis.confidence),
        scoreEGBD(direction, optionAnalysis),
    ];

    const net = sources.reduce((sum, source) => sum + source.score, 0);
    const reasons = sources.map(source => source.reason).filter((reason): reason is string => reason !== null);

    let agreement: OptionChainAgreement;

    if (net >= 2) {
        agreement = "confirms";
    } else if (net <= -2) {
        agreement = "contradicts";
    } else if (reasons.length === 0) {
        agreement = "no-data";
    } else {
        agreement = "mixed";
    }

    return { agreement, reasons };
}

export interface IVCrashResult {
    candidate: SignalCandidate;
    crashKey: string;
}

// One source of truth: EGBD's own engine already tracks each strike's
// peak IV since it armed and flags ivCrashed with the same
// persistence gating used for its exit condition - this just reads
// that existing flag off every tracked signal (not only activeSignal,
// since a crash can matter on a strike that isn't currently the
// single best-ranked candidate) rather than re-detecting it here.
//
// alreadyCrashed mirrors detectLevelBreaks' alreadyBroken set - EGBD's
// ivCrashed flag stays true for several polls while the stage cascades
// EXIT_WINDOW -> RESET -> WATCHING, and without this, every ~20s poll
// in that window would emit a fresh near-duplicate signal instead of
// one.
export function detectIVCrashSignals(
    optionAnalysis: OptionAnalysis,
    alreadyCrashed: ReadonlySet<string>
): IVCrashResult[] {

    const signals = optionAnalysis.egbd?.signals ?? [];

    const results: IVCrashResult[] = [];

    for (const signal of signals) {

        const crashKey = `${signal.strike}_${signal.side}`;

        if (!signal.ivCrashed || alreadyCrashed.has(crashKey)) {
            continue;
        }

        const direction: Direction = signal.side === "CE" ? "bullish" : "bearish";
        const label = `${signal.strike}${signal.side}`;

        results.push({
            crashKey,
            candidate: {
                kind: "IV_CRASH",
                direction,
                confidence: "high",
                headline: `IV crash on ${label} - premium may lag even if price moves your way`,
                reasoning: [
                    "IV has dropped sharply from its peak since this strike armed, sustained over multiple polls - not a single noisy tick",
                ],
                levelLabel: label,
                price: signal.strike,
                triggeredAt: Date.now(),
            },
        });
    }

    return results;
}
