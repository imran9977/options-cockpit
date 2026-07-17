import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface GreeksCardProps {
    optionAnalysis: OptionAnalysis;
}

function GreeksCard({
    optionAnalysis,
}: GreeksCardProps) {
    return (
        <section className="section section-purple">
            <div className="section-title">
                5 • GREEKS
            </div>

            <div className="grid-4">

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">IV</div>
                    <div className="value">
                        {optionAnalysis.atmIV}
                    </div>
                    <div className="sub">
                        ATM Call IV
                    </div>
                    <div className="caption">
                        LIVE
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">DELTA</div>
                    <div className="value">
                        {optionAnalysis.atmDelta}
                    </div>
                    <div className="sub">
                        ATM Call
                    </div>
                    <div className="caption">
                        LIVE
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">GAMMA</div>
                    <div className="value">
                        {optionAnalysis.atmGamma}
                    </div>
                    <div className="sub">
                        ATM Call
                    </div>
                    <div className="caption">
                        LIVE
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">THETA</div>
                    <div className="value">
                        {optionAnalysis.atmTheta}
                    </div>
                    <div className="sub red">
                        Per Day
                    </div>
                    <div className="caption">
                        LIVE
                    </div>
                </div>

            </div>
        </section>
    );
}

export default GreeksCard;