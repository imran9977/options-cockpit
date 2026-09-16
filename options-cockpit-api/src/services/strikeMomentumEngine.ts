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

// ~15s at the poller's 5s interval. A single-tick (adjacent-sample)
// velocity is dominated by quote jitter on a fast-moving quantity
// like option premium during a squeeze - averaging over a short
// window fixes that without adding so much lag that a genuinely
// fast blast gets missed early. Not the same window as Market
// Health's spot-velocity fix (60s) - that's a slower-moving index
// value, this is option premium/OI/volume/gamma during a squeeze,
// which the whole point of EGBD is to catch early.
const MOMENTUM_LOOKBACK = 3;

// Exported so callers can gate on the real minimum instead of a
// stale, separately-hardcoded number.
export const MOMENTUM_MIN_HISTORY = 2 * MOMENTUM_LOOKBACK + 1;

export function analyzeStrikeMomentum(
    history: readonly StrikeWindowSnapshot[]
): StrikeLegMomentum[] {

    if (history.length < MOMENTUM_MIN_HISTORY) {
        return [];
    }

    const previous = history[history.length - 1 - 2 * MOMENTUM_LOOKBACK];
    const current = history[history.length - 1 - MOMENTUM_LOOKBACK];
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
