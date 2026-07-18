import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface OptionChainCardProps {
    optionAnalysis: OptionAnalysis;
}

function OptionChainCard({
    optionAnalysis,
}: OptionChainCardProps) {
    return (
        <section className="section section-yellow">
            <div className="section-title">
                3 • OPTION CHAIN INTELLIGENCE
            </div>

            <div className="grid-4">
               

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">CALL OI</div>
                    <div className="value">
                        {optionAnalysis.maxCallOI.toLocaleString()}
                    </div>
                    <div className="caption">
                        Max @ {optionAnalysis.maxCallOIStrike ?? "-"}
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">CHANGE IN CALL OI</div>
                    <div className="value">
                        {optionAnalysis.totalCallOIChange.toLocaleString()}
                    </div>
                    <div className="sub red">vs prev snapshot</div>
                    <div className="caption">WRITING</div>
                </div>

                 <div className="card">
                    <div className="info">i</div>
                    <div className="label">ATM STRIKE</div>
                    <div className="value">
                        {optionAnalysis.atmStrike}
                    </div>
                    <div className="caption">
                        Nearest to spot
                    </div>
                </div>

                  <div className="card">
                    <div className="info">i</div>
                    <div className="label">PCR</div>
                    <div className="value">
                        {optionAnalysis.pcr}
                    </div>
                    <div className="caption">
                        ATM ± 10 Strikes
                    </div>
                </div>

                 <div className="card">
                    <div className="info">i</div>
                    <div className="label">PUT OI</div>
                    <div className="value">
                        {optionAnalysis.maxPutOI.toLocaleString()}
                    </div>
                    <div className="caption">
                        Max @ {optionAnalysis.maxPutOIStrike ?? "-"}
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">CHANGE IN PUT OI</div>
                    <div className="value">
                        {optionAnalysis.totalPutOIChange.toLocaleString()}
                    </div>
                    <div className="sub green">vs prev snapshot</div>
                    <div className="caption">WRITING</div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">MAX PAIN</div>
                    <div className="value">
                        {optionAnalysis.maxPain ?? "-"}
                    </div>
                    <div className="sub">
                        Equilibrium Strike
                    </div>
                    <div className="caption">MAGNET</div>
                </div>
            </div>
        </section>
    );
}

export default OptionChainCard;