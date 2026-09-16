import type { IntradayCandle } from "../models/SMCAnalysis.js";
import type { SignalCandidate } from "../models/PriceStructureSignal.js";

export interface PendingRetest {
    levelId: string;
    levelLabel: string;
    levelPrice: number;
    breakDirection: "bullish" | "bearish";
    brokeAtIndex: number;
}

// ~30 minutes of 5-min candles - long enough for a real retest to
// show up, short enough that "no retest happened" is a timely,
// meaningful answer rather than waiting on it all day.
const RETEST_WINDOW_CANDLES = 6;

export interface RetestOutcome {
    candidate: SignalCandidate | null;
    // true once this pending retest no longer needs tracking, either
    // because it resolved (hold/fail) or its window simply expired
    // with no retest at all.
    resolved: boolean;
}

// Scans the candles since a level broke for a return to that level.
// HOLD if the close stays on the breakout side (continuation
// confirmed), FAIL if it closes back through against the break - the
// same "closed through against bias" test smcZoneDetector.ts already
// uses to flip an FVG into an IFVG.
export function checkRetest(
    candles: readonly IntradayCandle[],
    pending: PendingRetest,
    fromIndex: number,
    toIndexExclusive: number
): RetestOutcome {

    const list = candles as IntradayCandle[];
    const { levelPrice, breakDirection, levelLabel } = pending;

    const scanStart = Math.max(fromIndex, pending.brokeAtIndex + 1);

    for (let i = scanStart; i < toIndexExclusive; i++) {

        const elapsed = i - pending.brokeAtIndex;
        const candle = list[i];

        const touchedLevel = candle.low <= levelPrice && candle.high >= levelPrice;

        if (!touchedLevel) {
            if (elapsed >= RETEST_WINDOW_CANDLES) {
                return { candidate: null, resolved: true };
            }
            continue;
        }

        const heldBreakoutSide =
            breakDirection === "bullish"
                ? candle.close >= levelPrice
                : candle.close <= levelPrice;

        if (heldBreakoutSide) {
            return {
                candidate: {
                    kind: "RETEST_HOLD",
                    direction: breakDirection,
                    confidence: "high",
                    headline: `${levelLabel} retested and held`,
                    reasoning: [
                        `Price returned to ${levelLabel} (${levelPrice.toFixed(2)}) and closed at ${candle.close.toFixed(2)}, staying on the breakout side`,
                    ],
                    levelLabel,
                    price: levelPrice,
                    triggeredAt: candle.timestamp,
                },
                resolved: true,
            };
        }

        const oppositeDirection: "bullish" | "bearish" =
            breakDirection === "bullish" ? "bearish" : "bullish";

        return {
            candidate: {
                kind: "RETEST_FAIL",
                direction: oppositeDirection,
                confidence: "high",
                headline: `${levelLabel} break failed - likely fakeout`,
                reasoning: [
                    `Price returned to ${levelLabel} (${levelPrice.toFixed(2)}) and closed at ${candle.close.toFixed(2)}, back through the level against the original break`,
                ],
                levelLabel,
                price: levelPrice,
                triggeredAt: candle.timestamp,
            },
            resolved: true,
        };
    }

    return { candidate: null, resolved: false };
}
