import type { StrikeDelta } from "../models/StrikeDelta.js";

export function analyzeOI(
    delta: StrikeDelta,
    evidence: string[]
): number {

    const ceOI = delta.ceOIChange;
    const peOI = delta.peOIChange;

    const ceBuilding = ceOI > 0;
    const peBuilding = peOI > 0;

    let strength = 0;

    // ---------------------------------------------------------
    // Position Build-up Analysis
    // ---------------------------------------------------------

    if (ceBuilding && peBuilding) {

        strength = 3;

        if (ceOI > peOI) {
            evidence.push("Positions building on both sides (CE leading)");
        }
        else if (peOI > ceOI) {
            evidence.push("Positions building on both sides (PE leading)");
        }
        else {
            evidence.push("Positions building equally on both sides");
        }
    }

    else if (ceBuilding) {

        strength = 2;
        evidence.push("Call positions building");
    }

    else if (peBuilding) {

        strength = 2;
        evidence.push("Put positions building");
    }

    else {

        strength = 0;

        if (ceOI < 0 && peOI < 0) {
            evidence.push("Positions reducing on both sides");
        }
        else {
            evidence.push("Low OI activity");
        }
    }

    return strength;
}