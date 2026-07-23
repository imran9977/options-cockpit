import type { ATMOptionSnapshot } from "../models/ATMOptionSnapshot.js";
import type { StrikeMomentum } from "../models/StrikeMomentum.js";


export function analyzeOptionMomentum(
    history: readonly ATMOptionSnapshot[]
): StrikeMomentum {

    if (history.length < 3) {
        return {
            strike: 0,

            ceVelocity: 0,
            peVelocity: 0,

            ceAcceleration: 0,
            peAcceleration: 0,

            dominantSide: "Neutral",

            momentumScore: 0,
        };
    }

    const previous = history[history.length - 3];
    const current = history[history.length - 2];
    const latest = history[history.length - 1];

    const previousCEVelocity =
        current.ceLastPrice - previous.ceLastPrice;

    const latestCEVelocity =
        latest.ceLastPrice - current.ceLastPrice;

    const previousPEVelocity =
        current.peLastPrice - previous.peLastPrice;

    const latestPEVelocity =
        latest.peLastPrice - current.peLastPrice;

    const ceAcceleration =
        latestCEVelocity - previousCEVelocity;

    const peAcceleration =
        latestPEVelocity - previousPEVelocity;

    const dominantSide =
        ceAcceleration > peAcceleration
            ? "CE"
            : peAcceleration > ceAcceleration
                ? "PE"
                : "Neutral";

    const momentumScore = Number(
        (
            Math.abs(latestCEVelocity) +
            Math.abs(latestPEVelocity) +
            Math.abs(ceAcceleration) +
            Math.abs(peAcceleration)
        ).toFixed(2)
    );

    return {
        strike: latest.atmStrike,

        ceVelocity: latestCEVelocity,
        peVelocity: latestPEVelocity,

        ceAcceleration,
        peAcceleration,

        dominantSide,

        momentumScore,
    };
}