import type { StrikeDelta } from "../models/StrikeDelta.js";

export function analyzeOI(
    delta: StrikeDelta,
    evidence: string[]
): number {

    const ceOI = delta.ceOIChange;
    const peOI = delta.peOIChange;

    let strength = 0;

    // No OI update
    if (ceOI === 0 && peOI === 0) {
        evidence.push("No OI change");
        return strength;
    }

    // Only CE updated
    if (ceOI !== 0 && peOI === 0) {
        strength += 2;
        evidence.push("Only CE OI changed");
        return strength;
    }

    // Only PE updated
    if (peOI !== 0 && ceOI === 0) {
        strength += 2;
        evidence.push("Only PE OI changed");
        return strength;
    }

    // Both updated
    if (ceOI > peOI) {
        strength += 2;
        evidence.push("CE OI dominant");
    }
    else if (peOI > ceOI) {
        strength += 2;
        evidence.push("PE OI dominant");
    }
    else {
        evidence.push("Balanced OI");
    }

    return strength;
}