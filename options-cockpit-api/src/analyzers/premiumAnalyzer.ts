import type { StrikeDelta } from "../models/StrikeDelta.js";
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

    return (
        Math.abs(delta.cePremiumChange) +
        Math.abs(delta.pePremiumChange)
    );
}