import type { IntradayCandle } from "../models/SMCAnalysis.js";
import type { SignalCandidate } from "../models/PriceStructureSignal.js";

export interface LevelDefinition {
    id: string;
    label: string;
    price: number;
}

export interface LevelBreakResult {
    candidate: SignalCandidate;
    levelId: string;
    candleIndex: number;
}

// Scoped to the newly-closed tail (fromIndex onward), same idiom as
// smcZoneDetector.ts's detectNewZones. alreadyBroken tracks which
// level ids have already fired today so each level only breaks once -
// otherwise a level price would re-fire on every candle it oscillates
// around. A break requires the PRIOR candle to have been on the other
// side, so the very first scanned candle can't trivially "break"
// every level already on its far side.
export function detectLevelBreaks(
    candles: readonly IntradayCandle[],
    levels: readonly LevelDefinition[],
    fromIndex: number,
    alreadyBroken: ReadonlySet<string>
): LevelBreakResult[] {

    const list = candles as IntradayCandle[];
    const results: LevelBreakResult[] = [];
    const brokenThisPass = new Set<string>();
    const start = Math.max(1, fromIndex);

    for (let i = start; i < list.length; i++) {

        const candle = list[i];
        const previous = list[i - 1];

        for (const level of levels) {

            if (alreadyBroken.has(level.id) || brokenThisPass.has(level.id)) {
                continue;
            }

            const brokeUp = candle.close > level.price && previous.close <= level.price;
            const brokeDown = candle.close < level.price && previous.close >= level.price;

            if (!brokeUp && !brokeDown) {
                continue;
            }

            const direction: "bullish" | "bearish" = brokeUp ? "bullish" : "bearish";

            results.push({
                candidate: {
                    kind: "LEVEL_BREAK",
                    direction,
                    confidence: "medium",
                    headline: `${level.label} broken to the ${brokeUp ? "upside" : "downside"}`,
                    reasoning: [
                        `Candle closed at ${candle.close.toFixed(2)}, ${brokeUp ? "above" : "below"} ${level.label} (${level.price.toFixed(2)})`,
                    ],
                    levelLabel: level.label,
                    price: level.price,
                    triggeredAt: candle.timestamp,
                },
                levelId: level.id,
                candleIndex: i,
            });

            brokenThisPass.add(level.id);
        }
    }

    return results;
}
