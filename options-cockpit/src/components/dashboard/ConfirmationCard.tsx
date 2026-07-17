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

            <div className="grid-4">

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

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">PCR</div>
                    <div className="value">
                        {optionAnalysis.pcr}
                    </div>
                    <div className="sub">
                        Put / Call Ratio
                    </div>
                    <div className="caption">
                        LIVE
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">ATM DELTA</div>
                    <div className="value">
                        {optionAnalysis.atmDelta}
                    </div>
                    <div className="sub">
                        Directional Signal
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