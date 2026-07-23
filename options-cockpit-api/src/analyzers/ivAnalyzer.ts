import type { StrikeDelta } from "../models/StrikeDelta.js";

export function analyzeIV(
    delta: StrikeDelta,
    evidence: string[]
): number {

    const ceIVRaw = delta.ceIVChange;
    const peIVRaw = delta.peIVChange;

    const ceIV = Math.abs(ceIVRaw);
    const peIV = Math.abs(peIVRaw);

    let strength = 0;

    if (ceIV === 0 && peIV === 0) {
        evidence.push("No IV change");
        return strength;
    }

    if (ceIV !== 0 && peIV === 0) {
        strength += 2;
        evidence.push(`Only CE IV changed (${ceIVRaw.toFixed(2)})`);
        return strength;
    }

    if (peIV !== 0 && ceIV === 0) {
        strength += 2;
        evidence.push(`Only PE IV changed (${peIVRaw.toFixed(2)})`);
        return strength;
    }

    if (ceIV > peIV) {
        strength += 2;
        evidence.push(`CE IV dominant (${ceIVRaw.toFixed(2)})`);
    }
    else if (peIV > ceIV) {
        strength += 2;
        evidence.push(`PE IV dominant (${peIVRaw.toFixed(2)})`);
    }
    else {
        evidence.push("Balanced IV");
    }

    return strength;
}