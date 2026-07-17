export function findATMStrike(
    spotPrice: number,
    optionChain: Record<string, unknown>
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
    optionChain: Record<string, unknown>,
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
    optionChain: Record<string, unknown>,
    atmRangeStrikes: number[]
) {
    return atmRangeStrikes.map((strike) => ({
        strike,
        data: optionChain[strike.toFixed(6)],
    }));
}

export function calculatePCR(
    atmRangeData: Array<{
        strike: number;
        data: any;
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
        data: any;
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
        data: any;
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
        data: any;
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

export function calculateOIChange(
    atmRangeData: Array<{
        strike: number;
        data: any;
    }>
) {
    let totalCallOIChange = 0;
    let totalPutOIChange = 0;

    for (const item of atmRangeData) {
        totalCallOIChange +=
            (item.data?.ce?.oi ?? 0) -
            (item.data?.ce?.previous_oi ?? 0);

        totalPutOIChange +=
            (item.data?.pe?.oi ?? 0) -
            (item.data?.pe?.previous_oi ?? 0);
    }

    return {
        totalCallOIChange,
        totalPutOIChange,
    };
}

export function calculatePositionBuildUp(
    atmRangeData: Array<{
        strike: number;
        data: any;
    }>
) {
    let longBuildUp = 0;
    let shortBuildUp = 0;
    let shortCovering = 0;
    let longUnwinding = 0;

    for (const item of atmRangeData) {
        const cePriceChange =
            (item.data?.ce?.last_price ?? 0) -
            (item.data?.ce?.previous_close_price ?? 0);

        const ceOIChange =
            (item.data?.ce?.oi ?? 0) -
            (item.data?.ce?.previous_oi ?? 0);

        if (cePriceChange > 0 && ceOIChange > 0) {
            longBuildUp++;
        } else if (cePriceChange < 0 && ceOIChange > 0) {
            shortBuildUp++;
        } else if (cePriceChange > 0 && ceOIChange < 0) {
            shortCovering++;
        } else if (cePriceChange < 0 && ceOIChange < 0) {
            longUnwinding++;
        }
    }

    const getStrength = (count: number) => {
        if (count >= 6) return "Strong";
        if (count >= 3) return "Moderate";
        return "Low";
    };

    return {
        longBuildUp: getStrength(longBuildUp),
        shortBuildUp: getStrength(shortBuildUp),
        shortCovering: getStrength(shortCovering),
        longUnwinding: getStrength(longUnwinding),
    };
}

export function calculateMaxPain(
    optionChain: Record<string, unknown>
) {
    const strikes = Object.keys(optionChain)
        .map(Number)
        .sort((a, b) => a - b);

    let maxPainStrike: number | null = null;
    let minimumPain = Number.MAX_SAFE_INTEGER;

    for (const settlementStrike of strikes) {
        let totalPain = 0;

        for (const strike of strikes) {
            const strikeData: any =
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
    optionChain: Record<string, unknown>,
    atmStrike: number
) {
    const atmData: any =
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
    atmDelta: number
) {
    let bullishScore = 0;
    let bearishScore = 0;

    if (pcr > 1) {
        bullishScore++;
    } else if (pcr < 1) {
        bearishScore++;
    }

    if (spotPrice > atmStrike) {
        bullishScore++;
    } else if (spotPrice < atmStrike) {
        bearishScore++;
    }

    if (longBuildUp === "Strong") {
        bullishScore++;
    }

    if (shortBuildUp === "Strong") {
        bearishScore++;
    }

    if (atmDelta > 0.5) {
        bullishScore++;
    } else if (atmDelta < 0.45) {
        bearishScore++;
    }

    const difference = Math.abs(
        bullishScore - bearishScore
    );

    let confidence: "Strong" | "Moderate" | "Low";

    if (difference >= 3) {
        confidence = "Strong";
    } else if (difference === 2) {
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
    optionChain: Record<string, unknown>
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
    } = calculateOIChange(atmRangeData);

    const {
        longBuildUp,
        shortBuildUp,
        shortCovering,
        longUnwinding,
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
        atmDelta
    );

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

        longBuildUp,
        shortBuildUp,
        shortCovering,
        longUnwinding,

        atmIV,
        atmDelta,
        atmGamma,
        atmTheta,

        marketBias,
        confidence,
    };
}
