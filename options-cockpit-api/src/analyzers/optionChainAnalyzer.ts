import type { OptionChain, OptionStrike } from "../models/OptionChain.js";

import { generateMarketEvidence } from "../services/marketEvidenceGenerator.js";
import { confirmMarketDirection } from "../services/confirmationEngine.js";
import { qualifyObservation } from "../services/qualificationEngine.js";
import { generateObservation } from "../services/observationGenerator.js";
import type { ATMOptionSnapshot } from "../models/ATMOptionSnapshot.js";
import { addATMOptionSnapshot } from "../services/atmOptionHistory.js";
import { analyzeOptionMomentum } from "../services/optionMomentumEngine.js";
import { getATMOptionHistory } from "../services/atmOptionHistory.js";
import type { StrikeSnapshot } from "../models/StrikeSnapshot.js";
import type { StrikeWindowSnapshot } from "../models/StrikeWindowSnapshot.js";
import { addStrikeWindowSnapshot } from "../services/strikeWindowHistory.js";
import { analyzeStrikeWindow } from "../analyzers/strikeIntelligenceEngine.js";
import { getStrikeWindowHistory } from "../services/strikeWindowHistory.js";
import { stabilizeMarketBias, stabilizePositionBuildUpHint } from "../services/marketReadStabilizer.js";
import { buildStrikeObservations } from "../services/strikeObservationEngine.js";
import { analyzeStrikeMomentum, MOMENTUM_MIN_HISTORY } from "../services/strikeMomentumEngine.js";
import { analyzeEGBD } from "../services/egbdEngine.js";
import { buildEGBDObservations } from "../services/egbdObservationEngine.js";
import { logSignalIfNew, updatePendingSignals } from "../services/signalLogger.js";
import type { ClassicalLevels } from "../models/ClassicalLevels.js";
import type { Underlying } from "../config/instruments.js";

export function findATMStrike(
    spotPrice: number,
    optionChain: OptionChain
) {
    const strikes = Object.keys(optionChain).map(Number);

    if (strikes.length === 0) {
        throw new Error("Option chain is empty");
    }

    const atmStrike = strikes.reduce((closest, current) => {
        const currentDistance = Math.abs(current - spotPrice);
        const closestDistance = Math.abs(closest - spotPrice);

        return currentDistance < closestDistance
            ? current
            : closest;
    });

    return {
        atmStrike,
    };
}
// ATM ± 10 strikes (10 below + ATM + 10 above = 21), matching what
// the UI has always claimed. Previously 6 (~ATM ± 2-3), which made
// PCR/OI-flow/EGBD noisy and narrower than displayed.
const ACTIVE_WINDOW_SIZE = 21;
function extractATMRange(
    optionChain: OptionChain,
    atmStrike: number
): number[] {

    const strikes = Object.keys(optionChain)
        .map(Number)
        .sort((a, b) => a - b);

    const atmIndex = strikes.indexOf(atmStrike);

    if (atmIndex === -1) {
        throw new Error("ATM strike not found in option chain");
    }

    const leftCount = Math.floor(ACTIVE_WINDOW_SIZE / 2);
    const rightCount = ACTIVE_WINDOW_SIZE - leftCount - 1;

    let startIndex = atmIndex - leftCount;
    let endIndex = atmIndex + rightCount;

    if (startIndex < 0) {
        endIndex += -startIndex;
        startIndex = 0;
    }

    if (endIndex >= strikes.length) {
        startIndex -= endIndex - strikes.length + 1;
        endIndex = strikes.length - 1;
    }

    startIndex = Math.max(0, startIndex);

    return strikes.slice(startIndex, endIndex + 1);
}

export function getATMRangeData(
    optionChain: OptionChain,
    atmRangeStrikes: number[]
): Array<{
    strike: number;
    data: OptionStrike;
}> {
    return atmRangeStrikes.map((strike) => ({
        strike,
        data: optionChain[strike.toFixed(6)],
    }));
}

export function calculatePCR(
    atmRangeData: Array<{
        strike: number;
        data: OptionStrike;
    }>
) {
    let totalPEOI = 0;
    let totalCEOI = 0;

    for (const item of atmRangeData) {
        totalPEOI += item.data?.pe?.oi ?? 0;
        totalCEOI += item.data?.ce?.oi ?? 0;
    }

    return {
        pcr: totalCEOI === 0
            ? 0
            : Number((totalPEOI / totalCEOI).toFixed(2)),

        totalCallOI: totalCEOI,
        totalPutOI: totalPEOI,
    };
}

// "Significant" = a change worth calling out, sized against how much
// OI actually sits in this window - not a fixed lot count, so this
// stays meaningful regardless of window size or lot-size changes.
// previous_oi is Dhan's prior-day-close OI, so this change is
// cumulative since yesterday's close (matches NSE's own "Chng in OI"),
// not a single poll's noise. Not empirically tuned yet - a reasoned
// starting point, same caveat as other thresholds in this codebase.
const OI_FLOW_SIGNIFICANCE_PERCENT = 3;

export function determineOIFlowVerdict(
    totalCallOIChange: number,
    totalPutOIChange: number,
    totalWindowOI: number
): string {

    if (totalWindowOI <= 0) {
        return "Balanced Positioning";
    }

    const callChangePercent =
        (Math.abs(totalCallOIChange) / totalWindowOI) * 100;

    const putChangePercent =
        (Math.abs(totalPutOIChange) / totalWindowOI) * 100;

    const callBuilding = totalCallOIChange > 0;
    const putBuilding = totalPutOIChange > 0;

    if (
        putBuilding &&
        putChangePercent >= OI_FLOW_SIGNIFICANCE_PERCENT &&
        putChangePercent > callChangePercent
    ) {
        return "Put Writers Active";
    }

    if (
        callBuilding &&
        callChangePercent >= OI_FLOW_SIGNIFICANCE_PERCENT &&
        callChangePercent > putChangePercent
    ) {
        return "Call Writers Active";
    }

    if (
        callChangePercent < OI_FLOW_SIGNIFICANCE_PERCENT &&
        putChangePercent < OI_FLOW_SIGNIFICANCE_PERCENT
    ) {
        return "Low Writer Activity";
    }

    return "Balanced Positioning";
}

export function calculateMaxOI(
    atmRangeData: Array<{
        strike: number;
        data: OptionStrike;
    }>
) {
    const maxCall = atmRangeData
        .map((item) => ({
            strike: item.strike,
            oi: item.data?.ce?.oi ?? 0,
        }))
        .sort((a, b) => b.oi - a.oi)[0];

    const maxPut = atmRangeData
        .map((item) => ({
            strike: item.strike,
            oi: item.data?.pe?.oi ?? 0,
        }))
        .sort((a, b) => b.oi - a.oi)[0];

    return {
        maxCallOI: maxCall?.oi ?? 0,
        maxCallOIStrike: maxCall?.strike ?? null,

        maxPutOI: maxPut?.oi ?? 0,
        maxPutOIStrike: maxPut?.strike ?? null,
    };
}


export function calculateOIFlow(
    atmRangeData: Array<{
        strike: number;
        data: OptionStrike;
    }>
) {
    let maxCallOIAddition = 0;
    let maxCallOIAdditionStrike: number | null = null;

    let maxCallOIExit = 0;
    let maxCallOIExitStrike: number | null = null;

    let maxPutOIAddition = 0;
    let maxPutOIAdditionStrike: number | null = null;

    let maxPutOIExit = 0;
    let maxPutOIExitStrike: number | null = null;

    let totalCallOIChange = 0;
    let totalPutOIChange = 0;

    for (const item of atmRangeData) {

        const callOIChange =
            (item.data?.ce?.oi ?? 0) -
            (item.data?.ce?.previous_oi ?? 0);
        totalCallOIChange += callOIChange;

        if (callOIChange > 0 && callOIChange > maxCallOIAddition) {
            maxCallOIAddition = callOIChange;
            maxCallOIAdditionStrike = item.strike;
        }

        if (callOIChange < 0 && callOIChange < maxCallOIExit) {
            maxCallOIExit = callOIChange;
            maxCallOIExitStrike = item.strike;
        }

        const putOIChange =
            (item.data?.pe?.oi ?? 0) -
            (item.data?.pe?.previous_oi ?? 0);
        totalPutOIChange += putOIChange;

        if (putOIChange > 0 && putOIChange > maxPutOIAddition) {
            maxPutOIAddition = putOIChange;
            maxPutOIAdditionStrike = item.strike;
        }

        if (putOIChange < 0 && putOIChange < maxPutOIExit) {
            maxPutOIExit = putOIChange;
            maxPutOIExitStrike = item.strike;
        }
    }

    return {
        totalCallOIChange,
        totalPutOIChange,

        maxCallOIAddition,
        maxCallOIAdditionStrike,

        maxCallOIExit,
        maxCallOIExitStrike,

        maxPutOIAddition,
        maxPutOIAdditionStrike,

        maxPutOIExit,
        maxPutOIExitStrike,

        callNetFlow:
            totalCallOIChange > 0
                ? "Building"
                : totalCallOIChange < 0
                    ? "Unwinding"
                    : "Balanced",

        putNetFlow:
            totalPutOIChange > 0
                ? "Building"
                : totalPutOIChange < 0
                    ? "Unwinding"
                    : "Balanced",

        callContribution:
            totalCallOIChange !== 0
                ? Number(
                    (
                        Math.abs(maxCallOIAddition) /
                        Math.abs(totalCallOIChange) *
                        100
                    ).toFixed(1)
                )
                : 0,

        putContribution:
            totalPutOIChange !== 0
                ? Number(
                    (
                        Math.abs(maxPutOIAddition) /
                        Math.abs(totalPutOIChange) *
                        100
                    ).toFixed(1)
                )
                : 0,
    };
}

interface LegChange {
    priceChange: number;
    oiChange: number;
}

interface BuildUpBreakdown {
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

function classifyBuildUp(
    changes: LegChange[]
): BuildUpBreakdown {

    let longBuildUp = 0;
    let shortBuildUp = 0;
    let shortCovering = 0;
    let longUnwinding = 0;

    let totalObservations = 0;

    for (const { priceChange, oiChange } of changes) {

        totalObservations++;

        if (priceChange > 0 && oiChange > 0) {
            longBuildUp++;
        }
        else if (priceChange < 0 && oiChange > 0) {
            shortBuildUp++;
        }
        else if (priceChange > 0 && oiChange < 0) {
            shortCovering++;
        }
        else if (priceChange < 0 && oiChange < 0) {
            longUnwinding++;
        }
    }

    const getStrength = (count: number) => {

        if (totalObservations === 0) {
            return "Low";
        }

        const percentage = (count / totalObservations) * 100;

        if (percentage >= 60) return "Strong";
        if (percentage >= 30) return "Moderate";
        return "Low";
    };

    const getPercentage = (count: number) =>
        totalObservations === 0
            ? 0
            : Number(((count / totalObservations) * 100).toFixed(1));

    return {

        longBuildUp: getStrength(longBuildUp),
        longBuildUpCount: longBuildUp,
        longBuildUpPercentage: getPercentage(longBuildUp),

        shortBuildUp: getStrength(shortBuildUp),
        shortBuildUpCount: shortBuildUp,
        shortBuildUpPercentage: getPercentage(shortBuildUp),

        shortCovering: getStrength(shortCovering),
        shortCoveringCount: shortCovering,
        shortCoveringPercentage: getPercentage(shortCovering),

        longUnwinding: getStrength(longUnwinding),
        longUnwindingCount: longUnwinding,
        longUnwindingPercentage: getPercentage(longUnwinding),
    };
}

function toCallChanges(
    atmRangeData: Array<{ strike: number; data: OptionStrike }>
): LegChange[] {
    return atmRangeData.map(item => ({
        priceChange:
            (item.data?.ce?.last_price ?? 0) -
            (item.data?.ce?.previous_close_price ?? 0),
        oiChange:
            (item.data?.ce?.oi ?? 0) -
            (item.data?.ce?.previous_oi ?? 0),
    }));
}

function toPutChanges(
    atmRangeData: Array<{ strike: number; data: OptionStrike }>
): LegChange[] {
    return atmRangeData.map(item => ({
        priceChange:
            (item.data?.pe?.last_price ?? 0) -
            (item.data?.pe?.previous_close_price ?? 0),
        oiChange:
            (item.data?.pe?.oi ?? 0) -
            (item.data?.pe?.previous_oi ?? 0),
    }));
}

// Unchanged behavior - pools Call and Put legs together. Kept as-is
// because calculateMarketBias/generateMarketEvidence still consume
// this pooled version; splitting those is a separate, not-yet-audited
// piece of work. New call/put-specific breakdowns are below.
export function calculatePositionBuildUp(
    atmRangeData: Array<{
        strike: number;
        data: OptionStrike;
    }>
): BuildUpBreakdown {
    return classifyBuildUp([
        ...toCallChanges(atmRangeData),
        ...toPutChanges(atmRangeData),
    ]);
}

export function calculateCallPositionBuildUp(
    atmRangeData: Array<{ strike: number; data: OptionStrike }>
): BuildUpBreakdown {
    return classifyBuildUp(toCallChanges(atmRangeData));
}

export function calculatePutPositionBuildUp(
    atmRangeData: Array<{ strike: number; data: OptionStrike }>
): BuildUpBreakdown {
    return classifyBuildUp(toPutChanges(atmRangeData));
}

// Same weighting as the pooled score below, applied per leg so a
// squeeze/build-up on one side can be told apart from the other -
// the whole reason the pooled version couldn't answer "which side."
const POSITION_BUILDUP_HINT_THRESHOLD = 40;

function positionBuildUpScore(breakdown: BuildUpBreakdown): number {
    return (
        breakdown.longBuildUpPercentage * 4 +
        breakdown.shortCoveringPercentage * 2 -
        breakdown.shortBuildUpPercentage * 4 -
        breakdown.longUnwindingPercentage * 2
    );
}

// A hint, not a recommendation: which side (if either) shows enough
// fresh buying/squeeze activity to be worth a closer look. Thresholds
// are a starting estimate, same caveat as every other threshold in
// this codebase - not yet validated against real outcomes.
export function determinePositionBuildUpHint(
    callBreakdown: BuildUpBreakdown,
    putBreakdown: BuildUpBreakdown
): string {

    const callScore = positionBuildUpScore(callBreakdown);
    const putScore = positionBuildUpScore(putBreakdown);

    if (
        callScore >= POSITION_BUILDUP_HINT_THRESHOLD &&
        callScore > putScore
    ) {
        return "BUY CE";
    }

    if (
        putScore >= POSITION_BUILDUP_HINT_THRESHOLD &&
        putScore > callScore
    ) {
        return "BUY PE";
    }

    return "NO CLEAR SETUP";
}
export function calculateMaxPain(
    optionChain: OptionChain
) {
    const strikes = Object.keys(optionChain)
        .map(Number)
        .sort((a, b) => a - b);

    let maxPainStrike: number | null = null;
    let minimumPain = Number.MAX_SAFE_INTEGER;

    for (const settlementStrike of strikes) {
        let totalPain = 0;

        for (const strike of strikes) {
            const strikeData: OptionStrike =
                optionChain[strike.toFixed(6)];

            const callOI =
                strikeData?.ce?.oi ?? 0;

            const putOI =
                strikeData?.pe?.oi ?? 0;

            const callPain =
                strike < settlementStrike
                    ? (settlementStrike - strike) * callOI
                    : 0;

            const putPain =
                strike > settlementStrike
                    ? (strike - settlementStrike) * putOI
                    : 0;

            totalPain += callPain + putPain;
        }

        if (totalPain < minimumPain) {
            minimumPain = totalPain;
            maxPainStrike = settlementStrike;
        }
    }

    return {
        maxPain: maxPainStrike,
    };
}

// atmIV/atmDelta/atmGamma/atmTheta stay Call-only and unchanged in
// meaning - calculateMarketBias and generateMarketEvidence still
// consume them as-is. Put-side greeks and skew are new, additive.
export function calculateATMGreeks(
    optionChain: OptionChain,
    atmStrike: number
) {
    const atmData: OptionStrike | undefined =
        optionChain[atmStrike.toFixed(6)];

    const atmCallIV = Number(
        (atmData?.ce?.implied_volatility ?? 0).toFixed(2)
    );

    const atmPutIV = Number(
        (atmData?.pe?.implied_volatility ?? 0).toFixed(2)
    );

    // ATM straddle price (Call premium + Put premium) - the market's
    // own implied "expected move" by expiry. Uses data already on
    // hand, no extra API calls.
    const expectedMove = Number(
        (
            (atmData?.ce?.last_price ?? 0) +
            (atmData?.pe?.last_price ?? 0)
        ).toFixed(2)
    );

    return {
        expectedMove,

        atmIV: atmCallIV,

        atmDelta: Number(
            (atmData?.ce?.greeks?.delta ?? 0)
                .toFixed(2)
        ),

        atmGamma: Number(
            (atmData?.ce?.greeks?.gamma ?? 0)
                .toFixed(4)
        ),

        atmTheta: Number(
            (atmData?.ce?.greeks?.theta ?? 0)
                .toFixed(2)
        ),

        atmPutIV,

        atmPutDelta: Number(
            (atmData?.pe?.greeks?.delta ?? 0)
                .toFixed(2)
        ),

        atmPutGamma: Number(
            (atmData?.pe?.greeks?.gamma ?? 0)
                .toFixed(4)
        ),

        atmPutTheta: Number(
            (atmData?.pe?.greeks?.theta ?? 0)
                .toFixed(2)
        ),

        // Put IV minus Call IV. Positive = puts pricier than calls,
        // relative to each other = more fear/downside hedging demand
        // priced in. Near zero = calm. This is a real, standard
        // metric (volatility skew) that wasn't shown anywhere before.
        ivSkew: Number((atmPutIV - atmCallIV).toFixed(2)),
    };
}

// Answers "is this a good time to buy options", not "which
// direction" - Greeks are direction-agnostic, so this deliberately
// does not use bullish/bearish framing. Thresholds mirror the
// existing IV/Gamma/Theta guides already shown in the UI popovers.
export function determineGreeksEnvironment(
    atmIV: number,
    atmGamma: number,
    atmTheta: number
): { premiumLabel: string; movementLabel: string; environment: string } {

    const premiumLabel =
        atmIV <= 12
            ? "Cheap Premium"
            : atmIV > 25
                ? "Expensive Premium"
                : "Fair Premium";

    const movementLabel =
        atmGamma >= 0.006
            ? "Fast-Moving Setup"
            : Math.abs(atmTheta) >= 40
                ? "Heavy Time Decay"
                : "Steady Conditions";

    return {
        premiumLabel,
        movementLabel,
        environment: `${premiumLabel} · ${movementLabel}`,
    };
}

export function extractATMOptionSnapshot(
    optionChain: OptionChain,
    spotPrice: number,
    atmStrike: number
): ATMOptionSnapshot {

    const atmData =
        optionChain[atmStrike.toFixed(6)];

    return {
        timestamp: Date.now(),

        spotPrice,
        atmStrike,

        ceLastPrice: atmData?.ce?.last_price ?? 0,
        peLastPrice: atmData?.pe?.last_price ?? 0,

        ceOI: atmData?.ce?.oi ?? 0,
        peOI: atmData?.pe?.oi ?? 0,

        ceOIChange:
            (atmData?.ce?.oi ?? 0) -
            (atmData?.ce?.previous_oi ?? 0),

        peOIChange:
            (atmData?.pe?.oi ?? 0) -
            (atmData?.pe?.previous_oi ?? 0),

        ceIV: Number(
            (atmData?.ce?.implied_volatility ?? 0).toFixed(2)
        ),

        peIV: Number(
            (atmData?.pe?.implied_volatility ?? 0).toFixed(2)
        ),

        ceGamma: Number(
            (atmData?.ce?.greeks?.gamma ?? 0).toFixed(4)
        ),

        peGamma: Number(
            (atmData?.pe?.greeks?.gamma ?? 0).toFixed(4)
        ),
    };
}

export function extractStrikeWindowSnapshot(
    atmRangeData: {
        strike: number;
        data: OptionStrike | undefined;
    }[],
    spotPrice: number,
    atmStrike: number
): StrikeWindowSnapshot {

    const strikes: StrikeSnapshot[] = atmRangeData.map(item => ({

        strike: item.strike,

        ceLastPrice: item.data?.ce?.last_price ?? 0,
        peLastPrice: item.data?.pe?.last_price ?? 0,

        ceOI: item.data?.ce?.oi ?? 0,
        peOI: item.data?.pe?.oi ?? 0,

        ceOIChange:
            (item.data?.ce?.oi ?? 0) -
            (item.data?.ce?.previous_oi ?? 0),

        peOIChange:
            (item.data?.pe?.oi ?? 0) -
            (item.data?.pe?.previous_oi ?? 0),

        ceIV: Number(
            (item.data?.ce?.implied_volatility ?? 0).toFixed(2)
        ),

        peIV: Number(
            (item.data?.pe?.implied_volatility ?? 0).toFixed(2)
        ),

        ceGamma: Number(
            (item.data?.ce?.greeks?.gamma ?? 0).toFixed(4)
        ),

        peGamma: Number(
            (item.data?.pe?.greeks?.gamma ?? 0).toFixed(4)
        ),

        ceVolume: item.data?.ce?.volume ?? 0,
        peVolume: item.data?.pe?.volume ?? 0

    }));

    return {

        timestamp: Date.now(),

        spotPrice,

        atmStrike,

        strikes

    };
}

function buildGammaExposureTable(
    atmRangeData: {
        strike: number;
        data: OptionStrike | undefined;
    }[],
    atmStrike: number
) {

    return atmRangeData.map(item => ({

        strike: item.strike,

        callGamma: Number(
            (item.data?.ce?.greeks?.gamma ?? 0).toFixed(4)
        ),

        putGamma: Number(
            (item.data?.pe?.greeks?.gamma ?? 0).toFixed(4)
        ),

        isATM: item.strike === atmStrike,

    }));

}

export function calculateMarketBias(
    spotPrice: number,
    atmStrike: number,
    pcr: number,
    longBuildUp: string,
    shortBuildUp: string,
    atmDelta: number,
    primarySupport: number | null,
    primaryResistance: number | null,
    maxPain: number | null
) {
    let bullishScore = 0;
    let bearishScore = 0;

    // PCR (Weight 2)
    if (pcr >= 1.1) {
        bullishScore += 2;
    } else if (pcr <= 0.9) {
        bearishScore += 2;
    }

    // Spot vs ATM (Weight 1)
    if (spotPrice > atmStrike) {
        bullishScore += 1;
    } else if (spotPrice < atmStrike) {
        bearishScore += 1;
    }

    // Position Build-up (Weight 2)
    if (longBuildUp === "Strong") {
        bullishScore += 2;
    } else if (longBuildUp === "Moderate") {
        bullishScore += 1;
    }

    if (shortBuildUp === "Strong") {
        bearishScore += 2;
    } else if (shortBuildUp === "Moderate") {
        bearishScore += 1;
    }

    // ATM Delta (Weight 1)
    if (atmDelta >= 0.55) {
        bullishScore += 1;
    } else if (atmDelta <= 0.45) {
        bearishScore += 1;
    }

    // Spot vs Support / Resistance (Weight 2)
    if (
        primarySupport !== null &&
        spotPrice > primarySupport
    ) {
        bullishScore += 2;
    }

    if (
        primaryResistance !== null &&
        spotPrice < primaryResistance
    ) {
        bearishScore += 2;
    }

    // Max Pain (Weight 1)
    if (maxPain !== null) {
        if (spotPrice > maxPain) {
            bullishScore += 1;
        } else if (spotPrice < maxPain) {
            bearishScore += 1;
        }
    }

    const difference = Math.abs(
        bullishScore - bearishScore
    );

    let confidence: "Strong" | "Moderate" | "Low";

    if (difference >= 5) {
        confidence = "Strong";
    } else if (difference >= 2) {
        confidence = "Moderate";
    } else {
        confidence = "Low";
    }

    let marketBias:
        | "Bullish"
        | "Bearish"
        | "Neutral";

    if (bullishScore > bearishScore) {
        marketBias = "Bullish";
    } else if (bearishScore > bullishScore) {
        marketBias = "Bearish";
    } else {
        marketBias = "Neutral";
    }

    return {
        marketBias,
        confidence,
    };
}

export function analyzeOptionChain(
    underlying: Underlying,
    spotPrice: number,
    optionChain: OptionChain,
    classicalLevels: ClassicalLevels,
    isExpiryDayToday: boolean
) {
    const { atmStrike } = findATMStrike(
        spotPrice,
        optionChain
    );

    const atmRangeStrikes = extractATMRange(
        optionChain,
        atmStrike
    );

    const atmRangeData = getATMRangeData(
        optionChain,
        atmRangeStrikes
    );

    const strikeWindowSnapshot =
        extractStrikeWindowSnapshot(
            atmRangeData,
            spotPrice,
            atmStrike
        );

    addStrikeWindowSnapshot(
        underlying,
        strikeWindowSnapshot
    );

    const strikeHistory = getStrikeWindowHistory(underlying);

    let strikeObservations: ReturnType<typeof buildStrikeObservations> = [];

    let egbd;

    let egbdObservations: ReturnType<
        typeof buildEGBDObservations
    > = [];

    if (strikeHistory.length >= 2) {

        const previous =
            strikeHistory[strikeHistory.length - 2];

        const current =
            strikeHistory[strikeHistory.length - 1];

        const strikeAnalysis =
            analyzeStrikeWindow(
                previous,
                current
            );

        strikeObservations =
            buildStrikeObservations(
                strikeAnalysis
            );

        if (isExpiryDayToday && strikeHistory.length >= MOMENTUM_MIN_HISTORY) {

            const strikeMomentum =
                analyzeStrikeMomentum(
                    strikeHistory
                );

            egbd =
                analyzeEGBD(
                    underlying,
                    strikeAnalysis,
                    strikeMomentum
                );


            egbdObservations =
                buildEGBDObservations(
                    egbd
                );

        }
    }

    const { pcr, totalCallOI, totalPutOI } = calculatePCR(
        atmRangeData
    );

    // Support/resistance come from classical daily pivot points
    // (previous session's high/low/close), not from options OI.
    // Max-OI-as-S/R is a lagging, easily-overwhelmed heuristic - see
    // discussion history. Pivots are deterministic and verifiable
    // against any charting platform, which OI-based levels weren't.
    const primarySupport = Math.round(classicalLevels.daily.s1);
    const secondarySupport = Math.round(classicalLevels.daily.s2);
    const primaryResistance = Math.round(classicalLevels.daily.r1);
    const secondaryResistance = Math.round(classicalLevels.daily.r2);
    const pivotPoint = Math.round(classicalLevels.daily.pivot);
    const previousClose = classicalLevels.daily.previousClose;

    const weeklyPrimarySupport = classicalLevels.weekly
        ? Math.round(classicalLevels.weekly.s1)
        : null;

    const weeklyPrimaryResistance = classicalLevels.weekly
        ? Math.round(classicalLevels.weekly.r1)
        : null;

    const {
        maxCallOI,
        maxCallOIStrike,
        maxPutOI,
        maxPutOIStrike,
    } = calculateMaxOI(atmRangeData);

    const { maxPain } =
        calculateMaxPain(optionChain);

    const {
        totalCallOIChange,
        totalPutOIChange,

        maxCallOIAddition,
        maxCallOIAdditionStrike,

        maxCallOIExit,
        maxCallOIExitStrike,

        maxPutOIAddition,
        maxPutOIAdditionStrike,

        maxPutOIExit,
        maxPutOIExitStrike,

        callNetFlow,
        putNetFlow,

        callContribution,
        putContribution,
    } = calculateOIFlow(atmRangeData);

    const oiFlowVerdict = determineOIFlowVerdict(
        totalCallOIChange,
        totalPutOIChange,
        totalCallOI + totalPutOI
    );

    const {

        longBuildUp,
        longBuildUpCount,
        longBuildUpPercentage,

        shortBuildUp,
        shortBuildUpCount,
        shortBuildUpPercentage,

        shortCovering,
        shortCoveringCount,
        shortCoveringPercentage,

        longUnwinding,
        longUnwindingCount,
        longUnwindingPercentage,

    } = calculatePositionBuildUp(atmRangeData);

    const {
        atmIV,
        atmDelta,
        atmGamma,
        atmTheta,
        atmPutIV,
        atmPutDelta,
        atmPutGamma,
        atmPutTheta,
        ivSkew,
        expectedMove,
    } = calculateATMGreeks(
        optionChain,
        atmStrike
    );

    const {
        premiumLabel: greeksPremiumLabel,
        movementLabel: greeksMovementLabel,
        environment: greeksEnvironment,
    } = determineGreeksEnvironment(
        atmIV,
        atmGamma,
        atmTheta
    );

    const atmOptionSnapshot = extractATMOptionSnapshot(
        optionChain,
        spotPrice,
        atmStrike
    );

    addATMOptionSnapshot(underlying, atmOptionSnapshot);

    const optionMomentum = analyzeOptionMomentum(
        getATMOptionHistory(underlying)
    );

    const callPositionBuildUp = calculateCallPositionBuildUp(
        atmRangeData
    );

    const putPositionBuildUp = calculatePutPositionBuildUp(
        atmRangeData
    );

    const positionBuildUpHint = stabilizePositionBuildUpHint(
        underlying,
        determinePositionBuildUpHint(
            callPositionBuildUp,
            putPositionBuildUp
        )
    );

    const rawBias = calculateMarketBias(
        spotPrice,
        atmStrike,
        pcr,
        longBuildUp,
        shortBuildUp,
        atmDelta,
        primarySupport,
        primaryResistance,
        maxPain
    );

    const { bias: marketBias, confidence } = stabilizeMarketBias(
        underlying,
        rawBias.marketBias,
        rawBias.confidence
    );

    const evidence = generateMarketEvidence({
        spotPrice,
        atmStrike,

        pcr,

        primarySupport,
        primaryResistance,

        longBuildUp,
        shortBuildUp,
        shortCovering,
        longUnwinding,

        atmDelta,

        maxPain,
    });

    const confirmation =
        confirmMarketDirection(evidence);


    const qualified =
        qualifyObservation(confirmation);

    const observations = qualified
        ? [generateObservation(qualified)]
        : [];

    // Evidence logging: records every new Bullish/Bearish signal the
    // observation panel would show, then fills in what price actually
    // did 5/15/30/60 minutes later on every subsequent poll.
    logSignalIfNew(
        underlying,
        qualified?.direction ?? null,
        qualified?.confidence ?? 0,
        spotPrice,
        atmStrike
    );

    updatePendingSignals(underlying, spotPrice);

    return {
        spotPrice,
        atmStrike,
        pcr,

        primarySupport,
        secondarySupport,

        primaryResistance,
        secondaryResistance,

        pivotPoint,
        previousClose,
        weeklyPrimarySupport,
        weeklyPrimaryResistance,

        maxCallOI,
        maxCallOIStrike,

        maxPutOI,
        maxPutOIStrike,

        maxPain,

        totalCallOIChange,
        totalPutOIChange,

        maxCallOIAddition,
        maxCallOIAdditionStrike,

        maxCallOIExit,
        maxCallOIExitStrike,

        maxPutOIAddition,
        maxPutOIAdditionStrike,

        maxPutOIExit,
        maxPutOIExitStrike,

        callNetFlow,
        putNetFlow,

        callContribution,
        putContribution,

        oiFlowVerdict,

        longBuildUp,
        longBuildUpCount,
        longBuildUpPercentage,

        shortBuildUp,
        shortBuildUpCount,
        shortBuildUpPercentage,

        shortCovering,
        shortCoveringCount,
        shortCoveringPercentage,

        longUnwinding,
        longUnwindingCount,
        longUnwindingPercentage,

        callPositionBuildUp,
        putPositionBuildUp,
        positionBuildUpHint,

        atmIV,
        atmDelta,
        atmGamma,
        atmTheta,

        atmPutIV,
        atmPutDelta,
        atmPutGamma,
        atmPutTheta,
        ivSkew,
        expectedMove,

        atmCallPremium: atmOptionSnapshot.ceLastPrice,
        atmPutPremium: atmOptionSnapshot.peLastPrice,

        nearbyStrikePremiums: atmRangeData.map(item => ({
            strike: item.strike,
            callPremium: item.data?.ce?.last_price ?? 0,
            putPremium: item.data?.pe?.last_price ?? 0,
        })),

        greeksPremiumLabel,
        greeksMovementLabel,
        greeksEnvironment,

        marketBias,
        confidence,

        observations: [
            ...observations,
            ...egbdObservations,
        ],
        strikeObservations,
        egbd,
        isExpiryDay: isExpiryDayToday,
    };
}
