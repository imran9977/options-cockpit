import type { StrikeDelta } from "../models/StrikeDelta.js";

// Same 0/2/3 scale as analyzeVolume/analyzeOI/analyzeGamma/analyzeIV.
// Previously returned an unbounded raw rupee sum, which made
// isTriggerArmed's "premiumStrength > 0" check almost a no-op - true
// on nearly any tick where premium moved at all, regardless of size.
export function analyzePremium(
    delta: StrikeDelta,
    evidence: string[]
): number {

    evidence.push(
        `CE Premium ${delta.cePremiumChange >= 0 ? "+" : ""}${delta.cePremiumChange.toFixed(2)}`
    );

    evidence.push(
        `PE Premium ${delta.pePremiumChange >= 0 ? "+" : ""}${delta.pePremiumChange.toFixed(2)}`
    );

    const ceIncreasing = delta.cePremiumChange > 0;
    const peIncreasing = delta.pePremiumChange > 0;

    if (ceIncreasing && peIncreasing) {
        return 3;
    }

    if (ceIncreasing || peIncreasing) {
        return 2;
    }

    return 0;
}