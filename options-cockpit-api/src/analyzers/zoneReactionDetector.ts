import type { IntradayCandle, SMCZone } from "../models/SMCAnalysis.js";
import type { SignalCandidate } from "../models/PriceStructureSignal.js";

function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
    });
}

// Detects price re-entering an active OB/FVG/IFVG zone after having
// been away from it - a candle must first be OUTSIDE the zone before
// a later re-entry counts as a "reaction," otherwise the candle that
// formed the zone would trivially react to itself.
export function detectZoneReactions(
    candles: readonly IntradayCandle[],
    zones: readonly SMCZone[],
    fromIndex: number
): SignalCandidate[] {

    const list = candles as IntradayCandle[];
    const candidates: SignalCandidate[] = [];
    const start = Math.max(1, fromIndex);

    const activeZones = zones.filter(
        zone =>
            zone.status === "active" &&
            (zone.type === "OB" || zone.type === "FVG" || zone.type === "IFVG")
    );

    for (let i = start; i < list.length; i++) {

        const candle = list[i];
        const previous = list[i - 1];

        for (const zone of activeZones) {

            if (candle.timestamp <= zone.startTime) {
                continue;
            }

            const wasOutside = previous.high < zone.bottom || previous.low > zone.top;
            const isInside = candle.low <= zone.top && candle.high >= zone.bottom;

            if (!wasOutside || !isInside) {
                continue;
            }

            const zoneBias: "bullish" | "bearish" =
                zone.role === "resistance" ? "bearish"
                    : zone.role === "support" ? "bullish"
                        : zone.direction;

            candidates.push({
                kind: "ZONE_REACTION",
                direction: zoneBias,
                confidence: zone.strength >= 2 ? "high" : "medium",
                headline: `Price reacting to ${zone.type} zone (${Math.round(zone.bottom)}-${Math.round(zone.top)})`,
                reasoning: [
                    `${zone.type} zone formed at ${formatTime(zone.startTime)}, price just re-entered it`,
                ],
                levelLabel: `${zone.type} ${Math.round(zone.bottom)}-${Math.round(zone.top)}`,
                price: (zone.top + zone.bottom) / 2,
                triggeredAt: candle.timestamp,
            });
        }
    }

    return candidates;
}
