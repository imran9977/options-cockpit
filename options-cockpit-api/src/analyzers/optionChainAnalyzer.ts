import type { OptionChain, OptionStrike } from "../models/OptionChain.js";

import { generateMarketEvidence } from "../services/marketEvidenceGenerator.js";
import { confirmMarketDirection } from "../services/confirmationEngine.js";
import { qualifyObservation } from "../services/qualificationEngine.js";
import { generateObservation } from "../services/observationGenerator.js";


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

export function extractATMRange(
    optionChain: OptionChain,
    atmStrike: number
) {
    const strikes = Object.keys(optionChain)
        .map(Number)
        .sort((a, b) => a - b);

    const atmIndex = strikes.indexOf(atmStrike);

    if (atmIndex === -1) {
        throw new Error("ATM strike not found in option chain");
    }

    const startIndex = Math.max(0, atmIndex - 10);
    const endIndex = Math.min(strikes.length, atmIndex + 11);

    const atmRangeStrikes = strikes.slice(startIndex, endIndex);

    return atmRangeStrikes;
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
    };
}

export function calculateSupports(
    atmRangeData: Array<{
        strike: number;
        data: OptionStrike;
    }>
) {
    const supports = atmRangeData
        .map((item) => ({
            strike: item.strike,
            oi: item.data?.pe?.oi ?? 0,
        }))
        .sort((a, b) => b.oi - a.oi);

    return {
        primarySupport: supports[0]?.strike ?? null,
        secondarySupport: supports[1]?.strike ?? null,
    };
}

export function calculateResistances(
    atmRangeData: Array<{
        strike: number;
        data: OptionStrike;
    }>
) {
    const resistances = atmRangeData
        .map((item) => ({
            strike: item.strike,
            oi: item.data?.ce?.oi ?? 0,
        }))
        .sort((a, b) => b.oi - a.oi);

    return {
        primaryResistance: resistances[0]?.strike ?? null,
        secondaryResistance: resistances[1]?.strike ?? null,
    };
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

export function calculatePositionBuildUp(
    atmRangeData: Array<{
        strike: number;
        data: OptionStrike;
    }>
) {
    let longBuildUp = 0;
    let shortBuildUp = 0;
    let shortCovering = 0;
    let longUnwinding = 0;

    let totalObservations = 0;

    const classify = (
        priceChange: number,
        oiChange: number
    ) => {

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

    };

    for (const item of atmRangeData) {

        // CALL SIDE
        const cePriceChange =
            (item.data?.ce?.last_price ?? 0) -
            (item.data?.ce?.previous_close_price ?? 0);

        const ceOIChange =
            (item.data?.ce?.oi ?? 0) -
            (item.data?.ce?.previous_oi ?? 0);

        classify(cePriceChange, ceOIChange);

        // PUT SIDE
        const pePriceChange =
            (item.data?.pe?.last_price ?? 0) -
            (item.data?.pe?.previous_close_price ?? 0);

        const peOIChange =
            (item.data?.pe?.oi ?? 0) -
            (item.data?.pe?.previous_oi ?? 0);

        classify(pePriceChange, peOIChange);
    }


    const getStrength = (count: number) => {
        const percentage =
            (count / totalObservations) * 100;

        if (percentage >= 60) return "Strong";
        if (percentage >= 30) return "Moderate";
        return "Low";
    };

    return {

        longBuildUp: getStrength(longBuildUp),
        longBuildUpCount: longBuildUp,
        longBuildUpPercentage: Number(
            ((longBuildUp / totalObservations) * 100).toFixed(1)
        ),

        shortBuildUp: getStrength(shortBuildUp),
        shortBuildUpCount: shortBuildUp,
        shortBuildUpPercentage: Number(
            ((shortBuildUp / totalObservations) * 100).toFixed(1)
        ),

        shortCovering: getStrength(shortCovering),
        shortCoveringCount: shortCovering,
        shortCoveringPercentage: Number(
            ((shortCovering / totalObservations) * 100).toFixed(1)
        ),

        longUnwinding: getStrength(longUnwinding),
        longUnwindingCount: longUnwinding,
        longUnwindingPercentage: Number(
            ((longUnwinding / totalObservations) * 100).toFixed(1)
        ),

    };
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

export function calculateATMGreeks(
    optionChain: OptionChain,
    atmStrike: number
) {
    const atmData: OptionStrike | undefined =
        optionChain[atmStrike.toFixed(6)];

    return {
        atmIV: Number(
            (atmData?.ce?.implied_volatility ?? 0)
                .toFixed(2)
        ),

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
    };
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
    spotPrice: number,
    optionChain: OptionChain
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

    const { pcr } = calculatePCR(
        atmRangeData
    );

    const {
        primarySupport,
        secondarySupport,
    } = calculateSupports(atmRangeData);

    const {
        primaryResistance,
        secondaryResistance,
    } = calculateResistances(atmRangeData);

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
    } = calculateATMGreeks(
        optionChain,
        atmStrike
    );

    const {
        marketBias,
        confidence,
    } = calculateMarketBias(
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

    // console.log("\n==================== EVIDENCE ====================");
    // console.table(evidence);

    const confirmation =
        confirmMarketDirection(evidence);

    // console.log("\n================= CONFIRMATION =================");
    // console.log(confirmation);

    const qualified =
        qualifyObservation(confirmation);


    // console.log("\n================ QUALIFICATION =================");
    // console.log(qualified);

    const observations = qualified
        ? [generateObservation(qualified)]
        : [];

    // console.log("\n================ OBSERVATIONS ==================");
    // console.table(observations);



    return {
        spotPrice,
        atmStrike,
        pcr,

        primarySupport,
        secondarySupport,

        primaryResistance,
        secondaryResistance,

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

        atmIV,
        atmDelta,
        atmGamma,
        atmTheta,

        marketBias,
        confidence,

        observations,
    };
}
