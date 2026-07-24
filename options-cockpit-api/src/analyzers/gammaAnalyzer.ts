import type { StrikeDelta } from "../models/StrikeDelta.js";

export function analyzeGamma(
    delta: StrikeDelta,
    evidence: string[]
): number {

    const ceGamma = delta.ceGammaChange;
    const peGamma = delta.peGammaChange;

    const ceIncreasing = ceGamma > 0;
    const peIncreasing = peGamma > 0;

    let strength = 0;

    // ---------------------------------------------------------
    // Gamma Change Analysis
    // ---------------------------------------------------------

    if (ceIncreasing && peIncreasing) {

        strength = 3;

        if (ceGamma > peGamma) {
            evidence.push("Gamma increasing on both sides (CE leading)");
        }
        else if (peGamma > ceGamma) {
            evidence.push("Gamma increasing on both sides (PE leading)");
        }
        else {
            evidence.push("Gamma increasing equally on both sides");
        }
    }

    else if (ceIncreasing) {

        strength = 2;
        evidence.push("Call gamma increasing");
    }

    else if (peIncreasing) {

        strength = 2;
        evidence.push("Put gamma increasing");
    }

    else {

        strength = 0;

        if (ceGamma < 0 && peGamma < 0) {
            evidence.push("Gamma reducing on both sides");
        }
        else {
            evidence.push("Stable gamma");
        }
    }

    return strength;
}