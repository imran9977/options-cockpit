import type { StrikeDelta } from "../models/StrikeDelta.js";

export function analyzeVolume(
    delta: StrikeDelta,
    evidence: string[]
): number {

    const ceVolume = delta.ceVolumeChange;
    const peVolume = delta.peVolumeChange;

    let strength = 0;

    // Strong CE participation
    if (ceVolume > peVolume) {
        strength += 2;
        evidence.push("CE volume dominant");
    }

    // Strong PE participation
    else if (peVolume > ceVolume) {
        strength += 2;
        evidence.push("PE volume dominant");
    }

    // Balanced participation
    else {
        evidence.push("Balanced volume");
    }

    return strength;
}