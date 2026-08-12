import type { StrikeWindowSnapshot } from "../models/StrikeWindowSnapshot.js";
import type {
    StrikeLegMomentum,
    MetricMomentum,
} from "../models/StrikeLegMomentum.js";

function calculateMomentum(
    previousValue: number,
    currentValue: number,
    latestValue: number
): MetricMomentum {

    const previousVelocity = currentValue - previousValue;

    const latestVelocity = latestValue - currentValue;

    const acceleration =
        latestVelocity - previousVelocity;

    const momentumScore = Number(
        (
            Math.abs(latestVelocity) +
            Math.abs(acceleration)
        ).toFixed(2)
    );

    return {
        velocity: latestVelocity,
        acceleration,
        momentumScore,
    };
}

export function analyzeStrikeMomentum(
    history: readonly StrikeWindowSnapshot[]
): StrikeLegMomentum[] {

    if (history.length < 3) {
        return [];
    }

    const previous = history[history.length - 3];
    const current = history[history.length - 2];
    const latest = history[history.length - 1];

    const momentum: StrikeLegMomentum[] = [];

    for (const latestStrike of latest.strikes) {

        const currentStrike = current.strikes.find(
            strike => strike.strike === latestStrike.strike
        );

        const previousStrike = previous.strikes.find(
            strike => strike.strike === latestStrike.strike
        );

        if (!currentStrike || !previousStrike) {
            continue;
        }

        momentum.push({
            strike: latestStrike.strike,
            side: "CE",

            premium: calculateMomentum(
                previousStrike.ceLastPrice,
                currentStrike.ceLastPrice,
                latestStrike.ceLastPrice
            ),

            oi: calculateMomentum(
                previousStrike.ceOI,
                currentStrike.ceOI,
                latestStrike.ceOI
            ),

            volume: calculateMomentum(
                previousStrike.ceVolume,
                currentStrike.ceVolume,
                latestStrike.ceVolume
            ),

            gamma: calculateMomentum(
                previousStrike.ceGamma,
                currentStrike.ceGamma,
                latestStrike.ceGamma
            ),

            iv: calculateMomentum(
                previousStrike.ceIV,
                currentStrike.ceIV,
                latestStrike.ceIV
            ),
        });

        momentum.push({
            strike: latestStrike.strike,
            side: "PE",

            premium: calculateMomentum(
                previousStrike.peLastPrice,
                currentStrike.peLastPrice,
                latestStrike.peLastPrice
            ),

            oi: calculateMomentum(
                previousStrike.peOI,
                currentStrike.peOI,
                latestStrike.peOI
            ),

            volume: calculateMomentum(
                previousStrike.peVolume,
                currentStrike.peVolume,
                latestStrike.peVolume
            ),

            gamma: calculateMomentum(
                previousStrike.peGamma,
                currentStrike.peGamma,
                latestStrike.peGamma
            ),

            iv: calculateMomentum(
                previousStrike.peIV,
                currentStrike.peIV,
                latestStrike.peIV
            ),
        });
    }

    return momentum;
}
