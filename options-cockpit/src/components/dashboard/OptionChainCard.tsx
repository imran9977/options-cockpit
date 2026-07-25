import type { OptionAnalysis } from "../../models/OptionAnalysis";
import { formatNumber } from "../../utils/formatNumber";
import OIFlowPopover from "../common/OIFlowPopover";

interface OptionChainCardProps {
    optionAnalysis: OptionAnalysis;
}

function OptionChainCard({
    optionAnalysis,
}: OptionChainCardProps) {
    let verdict = "Balanced Positioning";
    let verdictClass = "neutral";

    const callFlow = Number(optionAnalysis.callNetFlow ?? 0);
    const putFlow = Number(optionAnalysis.putNetFlow ?? 0);

    const threshold = 50000;

    if (
        putFlow > threshold &&
        putFlow > callFlow
    ) {
        verdict = "Put Writers Active";
        verdictClass = "bullish";
    }
    else if (
        callFlow > threshold &&
        callFlow > putFlow
    ) {
        verdict = "Call Writers Active";
        verdictClass = "bearish";
    }
    else if (
        Math.abs(callFlow) < threshold &&
        Math.abs(putFlow) < threshold
    ) {
        verdict = "Low Writer Activity";
        verdictClass = "neutral";
    }
    return (
        <section className="section section-yellow">
            <div className="section-header">

                <div className="section-title">
                    3 • OPTION CHAIN INTELLIGENCE
                </div>

                <div className={`position-summary ${verdictClass}`}>
                    {verdict}
                </div>

            </div>

            <div className="grid-3">


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
                    <div className="info metric-info">
                        i

                        <OIFlowPopover
                            title="CALL OI FLOW"
                            totalChange={optionAnalysis.totalCallOIChange}
                            largestAddition={optionAnalysis.maxCallOIAddition}
                            largestAdditionStrike={optionAnalysis.maxCallOIAdditionStrike}
                            largestExit={optionAnalysis.maxCallOIExit}
                            largestExitStrike={optionAnalysis.maxCallOIExitStrike}
                            netFlow={optionAnalysis.callNetFlow}
                            contribution={optionAnalysis.callContribution}
                        />
                    </div>

                    <div className="label">CHANGE IN CALL OI</div>

                    <div className="value">
                        {formatNumber(optionAnalysis.totalCallOIChange)}
                    </div>

                    <div className="sub">
                        Added : {formatNumber(optionAnalysis.maxCallOIAddition)} (
                        {optionAnalysis.maxCallOIAdditionStrike ?? "-"})
                    </div>

                    <div className="caption">
                        Exited :{formatNumber(optionAnalysis.maxCallOIExit)} (
                        {optionAnalysis.maxCallOIExitStrike ?? "-"})
                    </div>
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

                {/* <div className="card">
                    <div className="info">i</div>
                    <div className="label">PCR</div>
                    <div className="value">
                        {optionAnalysis.pcr}
                    </div>
                    <div className="caption">
                        ATM ± 10 Strikes
                    </div>
                </div> */}

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">PUT OI</div>
                    <div className="value">
                        {formatNumber(optionAnalysis.maxPutOI)}
                    </div>
                    <div className="caption">
                        Max @ {optionAnalysis.maxPutOIStrike ?? "-"}
                    </div>
                </div>

                <div className="card">
                    <div className="info metric-info">
                        i

                        <OIFlowPopover
                            title="PUT OI FLOW"
                            totalChange={optionAnalysis.totalPutOIChange}
                            largestAddition={optionAnalysis.maxPutOIAddition}
                            largestAdditionStrike={optionAnalysis.maxPutOIAdditionStrike}
                            largestExit={optionAnalysis.maxPutOIExit}
                            largestExitStrike={optionAnalysis.maxPutOIExitStrike}
                            netFlow={optionAnalysis.putNetFlow}
                            contribution={optionAnalysis.putContribution}
                        />
                    </div>

                    <div className="label">CHANGE IN PUT OI</div>

                    <div className="value">
                        {formatNumber(optionAnalysis.totalPutOIChange)}
                    </div>

                    <div className="sub">
                        Added : {formatNumber(optionAnalysis.maxPutOIAddition ?? 0)} (
                        {optionAnalysis.maxPutOIAdditionStrike ?? "-"})
                    </div>

                    <div className="caption">
                        Exited : {formatNumber(optionAnalysis.maxPutOIExit ?? 0)} (
                        {optionAnalysis.maxPutOIExitStrike ?? "-"})
                    </div>
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