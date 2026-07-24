import type { StrikeDelta } from "../models/StrikeDelta.js";

export function analyzeIV(
    delta: StrikeDelta,
    evidence: string[]
): number {

    const ceIV = delta.ceIVChange;
    const peIV = delta.peIVChange;

    const ceIncreasing = ceIV > 0;
    const peIncreasing = peIV > 0;

    let strength = 0;

    // ---------------------------------------------------------
    // IV Change Analysis
    // ---------------------------------------------------------

    if (ceIncreasing && peIncreasing) {

        strength = 3;

        if (ceIV > peIV) {
            evidence.push("IV increasing on both sides (CE leading)");
        }
        else if (peIV > ceIV) {
            evidence.push("IV increasing on both sides (PE leading)");
        }
        else {
            evidence.push("IV increasing equally on both sides");
        }
    }

    else if (ceIncreasing) {

        strength = 2;
        evidence.push("Call IV increasing");
    }

    else if (peIncreasing) {

        strength = 2;
        evidence.push("Put IV increasing");
    }

    else {

        strength = 0;

        if (ceIV < 0 && peIV < 0) {
            evidence.push("IV reducing on both sides");
        }
        else {
            evidence.push("Stable IV");
        }
    }

    return strength;
}