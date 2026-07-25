import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface ConfirmationCardProps {
    optionAnalysis: OptionAnalysis;
}

function ConfirmationCard({
    optionAnalysis,
}: ConfirmationCardProps) {
    let confirmationTitle = "Wait for Better Confirmation";
    let confirmationMessage =
        "Current market signals are mixed or weak. Wait for better confirmation before considering a trade.";

    if (
        optionAnalysis.marketBias === "Bullish" &&
        optionAnalysis.confidence === "Strong"
    ) {

        confirmationTitle = "🟢 Strong Bullish Confirmation";
        confirmationMessage =
            "Market structure strongly favors buyers. Trade may be considered once your execution trigger confirms the setup.";

    } else if (
        optionAnalysis.marketBias === "Bullish" &&
        optionAnalysis.confidence === "Moderate"
    ) {

        confirmationTitle = "🟢 Bullish Confirmation";
        confirmationMessage =
            "Market structure favors buyers. Trade may be considered once your execution trigger confirms the setup.";

    } else if (
        optionAnalysis.marketBias === "Bearish" &&
        optionAnalysis.confidence === "Strong"
    ) {

        confirmationTitle = "🔴 Strong Bearish Confirmation";
        confirmationMessage =
            "Market structure strongly favors sellers. Consider bearish opportunities only after your execution trigger confirms the setup.";

    } else if (
        optionAnalysis.marketBias === "Bearish" &&
        optionAnalysis.confidence === "Moderate"
    ) {

        confirmationTitle = "🔴 Bearish Confirmation";
        confirmationMessage =
            "Market structure favors sellers. Consider bearish opportunities only after your execution trigger confirms the setup.";

    }

    return (
        <section className="section section-cyan">
            <div className="section-title">
                6 • CONFIRMATION
            </div>

            <div className="grid-2">

                <div className="card">
                    <div className="info">i</div>
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
                    <div className="info">i</div>
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
                <div className="info">i</div>

                <div className="label">
                    FINAL CONFIRMATION
                </div>

                <div className="value">
                    {confirmationTitle}
                </div>

                <div className="sub">
                    {confirmationMessage}
                </div>

                <div className="caption">
                    LIVE
                </div>
            </div>
        </section>
    );
}

export default ConfirmationCard;