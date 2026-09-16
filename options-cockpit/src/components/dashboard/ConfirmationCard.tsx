import type { OptionAnalysis } from "../../models/OptionAnalysis";
import type { PriceStructureSignal } from "../../models/PriceStructureSignal";
import { EGBDStage } from "../../models/EGBD";

interface ConfirmationCardProps {
    optionAnalysis: OptionAnalysis;
    signals: PriceStructureSignal[];
}

type Bias = "Bullish" | "Bearish" | "Neutral";
type Confidence = "Strong" | "Moderate" | "Low";

// All 9 bias x confidence combinations get their own read - the
// previous version only handled 4 and dumped the other 5 (every
// Low-confidence case, and all of Neutral) into one generic fallback.
const BASE_CONFIRMATION: Record<Bias, Record<Confidence, { title: string; message: string }>> = {
    Bullish: {
        Strong: { title: "Strong Bullish Confirmation", message: "Market structure strongly favors buyers. Consider a trade once your execution trigger confirms the setup." },
        Moderate: { title: "Bullish Confirmation", message: "Market structure favors buyers. Consider a trade once your execution trigger confirms the setup." },
        Low: { title: "Weak Bullish Lean", message: "A slight bullish lean, but conviction is low - treat this as a watch, not a confirmation." },
    },
    Bearish: {
        Strong: { title: "Strong Bearish Confirmation", message: "Market structure strongly favors sellers. Consider bearish opportunities once your execution trigger confirms the setup." },
        Moderate: { title: "Bearish Confirmation", message: "Market structure favors sellers. Consider bearish opportunities once your execution trigger confirms the setup." },
        Low: { title: "Weak Bearish Lean", message: "A slight bearish lean, but conviction is low - treat this as a watch, not a confirmation." },
    },
    Neutral: {
        Strong: { title: "Balanced, High-Conviction Standoff", message: "Strong signals are pulling both ways and offsetting each other. Wait for one side to break the tie." },
        Moderate: { title: "Mixed Signals", message: "No clear directional edge right now - conditions could resolve either way." },
        Low: { title: "No Clear Setup", message: "Weak, directionless conditions. Best to wait for a real setup to develop." },
    },
};

// WATCHING/RESET mean "nothing confirmed yet," not a real read - same
// threshold used for option-chain agreement scoring in the
// Suggestions Panel backend.
const CONFIRMED_EGBD_STAGES = new Set<EGBDStage>([
    EGBDStage.TRIGGER_ARMED,
    EGBDStage.ENTRY_WINDOW,
    EGBDStage.MOMENTUM_BUILDING,
    EGBDStage.MOMENTUM_STRONG,
    EGBDStage.MOMENTUM_WEAKENING,
    EGBDStage.EXIT_WINDOW,
]);

function biasDirection(bias: Bias): "bullish" | "bearish" | null {
    if (bias === "Bullish") return "bullish";
    if (bias === "Bearish") return "bearish";
    return null;
}

// Additive only, never a gate - this card's title/message always
// comes from bias+confidence alone. EGBD and the Suggestions Panel
// just add honest color commentary on top, agreeing or not.
function egbdNote(optionAnalysis: OptionAnalysis, bias: Bias): string | null {

    const active = optionAnalysis.egbd?.activeSignal;

    if (!active || !CONFIRMED_EGBD_STAGES.has(active.stage)) {
        return null;
    }

    const sideDirection = active.side === "CE" ? "bullish" : "bearish";
    const direction = biasDirection(bias);
    const label = `${active.strike}${active.side} at ${active.stage}`;

    if (direction === null) {
        return `EGBD is tracking ${label}.`;
    }

    return sideDirection === direction
        ? `EGBD is also tracking ${label} - momentum building on the same side.`
        : `Note: EGBD is tracking ${label} - that's the opposite side, worth watching before acting.`;
}

// The single best currently-active signal from the Suggestions Panel,
// if any - high confidence only, so this stays a rare, meaningful
// mention rather than restating every minor level break.
function pickBestSignal(signals: PriceStructureSignal[]): PriceStructureSignal | null {

    const strong = signals.filter(
        signal => signal.status === "active" && signal.confidence === "high"
    );

    if (strong.length === 0) {
        return null;
    }

    return strong.reduce((best, current) =>
        current.triggeredAt > best.triggeredAt ? current : best
    );
}

function signalNote(signal: PriceStructureSignal | null, bias: Bias): string | null {

    if (!signal) {
        return null;
    }

    const direction = biasDirection(bias);
    const label = `"${signal.headline}"`;

    if (direction === null) {
        return `Suggestions Panel: ${label}.`;
    }

    return signal.direction === direction
        ? `Suggestions Panel agrees: ${label}.`
        : `Note: Suggestions Panel currently shows ${label} - the opposite side.`;
}

function ConfirmationCard({
    optionAnalysis,
    signals,
}: ConfirmationCardProps) {

    const bias = optionAnalysis.marketBias;
    const confidence = optionAnalysis.confidence;
    const base = BASE_CONFIRMATION[bias][confidence];
    const bestSignal = pickBestSignal(signals);

    const notes = [
        egbdNote(optionAnalysis, bias),
        signalNote(bestSignal, bias),
    ].filter((note): note is string => note !== null);

    return (
        <section className="section section-cyan">
            <div className="section-title">
                6 • CONFIRMATION
            </div>

            <div className="grid-2">

                <div className="card">
                    <div className="label">MARKET BIAS</div>
                    <div className="value">
                        {optionAnalysis.marketBias}
                    </div>
                    <div className="sub">
                        Option Chain
                    </div>
                    <div className="caption">
                        LIVE
                    </div>
                </div>

                <div className="card">
                    <div className="label">CONFIDENCE</div>
                    <div className="value">
                        {optionAnalysis.confidence}
                    </div>
                    <div className="sub">
                        Signal Strength
                    </div>
                    <div className="caption">
                        LIVE
                    </div>
                </div>

            </div>

            <div className="card confirmation-summary" style={{ marginTop: "1.2rem" }}>

                <div className="label">
                    FINAL CONFIRMATION
                </div>

                <div className="value">
                    {base.title}
                </div>

                <div className="sub">
                    {base.message}
                </div>

                {notes.length > 0 && (
                    <ul className="confirmation-notes">
                        {notes.map((note, index) => (
                            <li key={index}>{note}</li>
                        ))}
                    </ul>
                )}

                <div className="caption">
                    LIVE
                </div>
            </div>
        </section>
    );
}

export default ConfirmationCard;
