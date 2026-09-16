import type { SMCZone } from "../models/SMCAnalysis.js";
import type { SignalCandidate } from "../models/PriceStructureSignal.js";
import type { PivotLevels } from "../models/ClassicalLevels.js";

const OVERLAP_TOLERANCE_POINTS = 15;

function near(a: number, b: number): boolean {
    return Math.abs(a - b) <= OVERLAP_TOLERANCE_POINTS;
}

function withinZone(price: number, zone: SMCZone): boolean {
    return price >= zone.bottom - OVERLAP_TOLERANCE_POINTS && price <= zone.top + OVERLAP_TOLERANCE_POINTS;
}

function stackedWeeklyLevels(
    daily: PivotLevels,
    weekly: PivotLevels | null
): { label: string; price: number }[] {

    if (!weekly) {
        return [];
    }

    const pairs: { label: string; dailyPrice: number; weeklyPrice: number }[] = [
        { label: "R1", dailyPrice: daily.r1, weeklyPrice: weekly.r1 },
        { label: "R2", dailyPrice: daily.r2, weeklyPrice: weekly.r2 },
        { label: "S1", dailyPrice: daily.s1, weeklyPrice: weekly.s1 },
        { label: "S2", dailyPrice: daily.s2, weeklyPrice: weekly.s2 },
        { label: "Pivot", dailyPrice: daily.pivot, weeklyPrice: weekly.pivot },
    ];

    return pairs
        .filter(pair => near(pair.dailyPrice, pair.weeklyPrice))
        .map(pair => ({ label: `Weekly ${pair.label}`, price: pair.weeklyPrice }));
}

// Bumps a fresh candidate to CONFLUENCE when it lines up with a
// second, independent piece of structure - another active SMC zone
// (this is what covers "touches an OB that's also sitting inside an
// FVG"), or a daily pivot stacking near its weekly counterpart. A
// plain price-range-overlap check, not a weighted model - there's no
// live data yet to tune anything fancier against, same caveat as
// every other threshold in this codebase.
export function scoreConfluence(
    candidates: readonly SignalCandidate[],
    activeZones: readonly SMCZone[],
    dailyPivot: PivotLevels,
    weeklyPivot: PivotLevels | null
): SignalCandidate[] {

    const stackedLevels = stackedWeeklyLevels(dailyPivot, weeklyPivot);

    return candidates.map(candidate => {

        if (candidate.kind !== "ZONE_REACTION" && candidate.kind !== "RETEST_HOLD" && candidate.kind !== "LEVEL_BREAK") {
            return candidate;
        }

        const confluenceReasons: string[] = [];

        for (const zone of activeZones) {

            const zoneLabel = `${zone.type} ${Math.round(zone.bottom)}-${Math.round(zone.top)}`;

            if (candidate.levelLabel === zoneLabel) {
                continue;
            }

            if (withinZone(candidate.price, zone)) {
                confluenceReasons.push(
                    `Also sits inside an active ${zoneLabel} zone`
                );
            }
        }

        for (const stacked of stackedLevels) {
            if (near(candidate.price, stacked.price)) {
                confluenceReasons.push(
                    `Lines up with ${stacked.label} (${stacked.price.toFixed(2)}) - daily and weekly pivots stacking here`
                );
            }
        }

        if (confluenceReasons.length === 0) {
            return candidate;
        }

        return {
            ...candidate,
            kind: "CONFLUENCE" as const,
            confidence: "high" as const,
            headline: `${candidate.headline} - with confluence`,
            reasoning: [...candidate.reasoning, ...confluenceReasons],
        };
    });
}
