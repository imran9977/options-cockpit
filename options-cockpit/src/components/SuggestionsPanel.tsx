import type { PriceStructureSignal } from "../models/PriceStructureSignal";
import type { Underlying } from "../models/Underlying";

type SuggestionsPanelProps = {
    signals: PriceStructureSignal[];
    underlying: Underlying;
};

// A short, curated feed, not a log of every candidate - same
// reasoning as PriceStructureTable's own MAX_ROWS.
const MAX_ROWS = 8;

function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
    });
}

function confidenceLabel(confidence: PriceStructureSignal["confidence"]): string {
    if (confidence === "high") return "High";
    if (confidence === "medium") return "Medium";
    return "Low";
}

function SuggestionsPanel({ signals, underlying }: SuggestionsPanelProps) {

    const active = signals
        .filter(signal => signal.status === "active")
        .sort((a, b) => b.triggeredAt - a.triggeredAt)
        .slice(0, MAX_ROWS);

    return (
        <div className="suggestions-panel">

            <div className="suggestions-panel-header">
                <div className="suggestions-panel-title">Suggestions</div>
                <div className="suggestions-panel-subtitle">{underlying}</div>
            </div>

            <div className="suggestions-list">

                {active.length === 0 && (
                    <div className="suggestions-empty">
                        No active signals right now
                    </div>
                )}

                {active.map(signal => {

                    // Confirmed continuation or two independent
                    // signals lining up - the two kinds worth visually
                    // standing out from a plain, unconfirmed break.
                    const isStrong =
                        signal.kind === "CONFLUENCE" ||
                        signal.kind === "RETEST_HOLD" ||
                        signal.kind === "IV_CRASH";

                    const isCounterTrend =
                        signal.trendContext !== "" &&
                        signal.trendContext !== "Neutral" &&
                        signal.trendContext.toLowerCase() !== signal.direction;

                    return (
                        <div
                            key={signal.id}
                            className={
                                (signal.direction === "bullish"
                                    ? "suggestion-row decision-positive"
                                    : "suggestion-row decision-negative") +
                                (isStrong ? " suggestion-row-strong" : "")
                            }
                        >
                            <div className="suggestion-row-top">
                                <span className="suggestion-time">{formatTime(signal.triggeredAt)}</span>
                                <span className="suggestion-confidence">{confidenceLabel(signal.confidence)} confidence</span>
                            </div>

                            <div className="suggestion-headline">{signal.headline}</div>

                            <ul className="suggestion-reasoning">
                                {signal.reasoning.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>

                            {isCounterTrend && (
                                <div className="suggestion-counter-trend">
                                    Counter-trend (day's trend: {signal.trendContext})
                                </div>
                            )}

                            {signal.optionChainAgreement === "confirms" && (
                                <div className="suggestion-agreement suggestion-agreement-confirms">
                                    Option-chain confirms
                                </div>
                            )}

                            {signal.optionChainAgreement === "contradicts" && (
                                <div className="suggestion-agreement suggestion-agreement-contradicts">
                                    Option-chain contradicts
                                </div>
                            )}
                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default SuggestionsPanel;
