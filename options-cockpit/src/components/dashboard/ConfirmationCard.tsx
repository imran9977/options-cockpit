import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface ConfirmationCardProps {
    optionAnalysis: OptionAnalysis;
}

function ConfirmationCard({
    optionAnalysis,
}: ConfirmationCardProps) {
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
        </section>
    );
}

export default ConfirmationCard;