import type { StrikeDelta } from "../models/StrikeDelta.js";

export function analyzeVolume(
    delta: StrikeDelta,
    evidence: string[]
): number {

    const ceVolume = delta.ceVolumeChange;
    const peVolume = delta.peVolumeChange;

    const ceIncreasing = ceVolume > 0;
    const peIncreasing = peVolume > 0;

    let strength = 0;

    // ---------------------------------------------------------
    // Participation Analysis
    // ---------------------------------------------------------

    if (ceIncreasing && peIncreasing) {

        strength = 3;

        if (ceVolume > peVolume) {
            evidence.push("Participation increasing on both sides (CE leading)");
        }
        else if (peVolume > ceVolume) {
            evidence.push("Participation increasing on both sides (PE leading)");
        }
        else {
            evidence.push("Participation increasing equally on both sides");
        }
    }

    else if (ceIncreasing) {

        strength = 2;
        evidence.push("Call participation increasing");
    }

    else if (peIncreasing) {

        strength = 2;
        evidence.push("Put participation increasing");
    }

    else {

        strength = 0;

        if (ceVolume < 0 && peVolume < 0) {
            evidence.push("Participation weakening");
        }
        else {
            evidence.push("Low participation");
        }
    }

    return strength;
}