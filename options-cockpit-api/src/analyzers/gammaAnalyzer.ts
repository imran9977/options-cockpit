import type { StrikeDelta } from "../models/StrikeDelta.js";

export function analyzeGamma(
    delta: StrikeDelta,
    evidence: string[]
): number {

    const ceGammaRaw = delta.ceGammaChange;
    const peGammaRaw = delta.peGammaChange;

    const ceGamma = Math.abs(ceGammaRaw);
    const peGamma = Math.abs(peGammaRaw);

    let strength = 0;

    if (ceGamma === 0 && peGamma === 0) {
        evidence.push("No Gamma change");
        return strength;
    }

    if (ceGamma !== 0 && peGamma === 0) {
        strength += 2;
        evidence.push(`Only CE Gamma changed (${ceGammaRaw.toFixed(6)})`);
        return strength;
    }

    if (peGamma !== 0 && ceGamma === 0) {
        strength += 2;
        evidence.push(`Only PE Gamma changed (${peGammaRaw.toFixed(6)})`);
        return strength;
    }

    if (ceGamma > peGamma) {
        strength += 2;
        evidence.push(`CE Gamma dominant (${ceGammaRaw.toFixed(6)})`);
    }
    else if (peGamma > ceGamma) {
        strength += 2;
        evidence.push(`PE Gamma dominant (${peGammaRaw.toFixed(6)})`);
    }
    else {
        evidence.push("Balanced Gamma");
    }

    return strength;
}