import type { OptionAnalysis } from "../../models/OptionAnalysis";
import { formatNumber } from "../../utils/formatNumber";
import OIFlowPopover from "../common/OIFlowPopover";

interface OptionChainCardProps {
    optionAnalysis: OptionAnalysis;
}

function verdictClassFor(verdict: string): string {
    if (verdict === "Put Writers Active") return "bullish";
    if (verdict === "Call Writers Active") return "bearish";
    return "neutral";
}

// Core principle: green = bullish, red = bearish, applied to what the
// change actually means, not a fixed side-color.
// Call OI building = resistance strengthening = bearish (red).
// Call OI unwinding = resistance clearing = bullish (green).
function callOIChangeClass(totalChange: number): string {
    if (totalChange > 0) return "decision-negative";
    if (totalChange < 0) return "decision-positive";
    return "decision-neutral";
}

// Put OI building = support strengthening = bullish (green).
// Put OI unwinding = support weakening = bearish (red).
function putOIChangeClass(totalChange: number): string {
    if (totalChange > 0) return "decision-positive";
    if (totalChange < 0) return "decision-negative";
    return "decision-neutral";
}

function toFlowDotClass(decisionClass: string): "green" | "red" | "gray" {
    if (decisionClass === "decision-positive") return "green";
    if (decisionClass === "decision-negative") return "red";
    return "gray";
}

function OptionChainCard({
    optionAnalysis,
}: OptionChainCardProps) {
    const verdict = optionAnalysis.oiFlowVerdict;
    const verdictClass = verdictClassFor(verdict);

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
                    {/* <div className="info">i</div> */}
                    <div className="label">CALL OI</div>
                    <div className="value">
                        {formatNumber(optionAnalysis.maxCallOI)}
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
                            flowDotClass={toFlowDotClass(callOIChangeClass(optionAnalysis.totalCallOIChange))}
                        />
                    </div>

                    <div className="label">CHANGE IN CALL OI</div>

                    <div
                        className={`value decision-value ${callOIChangeClass(optionAnalysis.totalCallOIChange)}`}
                    >
                        {formatNumber(optionAnalysis.totalCallOIChange)}
                    </div>

                    <div className="sub text-secondary">
                        Added :
                        <span className="support-value decision-negative">
                            {" "}
                            {formatNumber(optionAnalysis.maxCallOIAddition)}
                        </span>
                        {" "}
                        ({optionAnalysis.maxCallOIAdditionStrike ?? "-"})
                    </div>

                    <div className="caption text-secondary">
                        Exited :
                        <span
                            className={
                                Math.abs(optionAnalysis.maxCallOIExit) > optionAnalysis.maxCallOIAddition
                                    ? "support-value decision-positive"
                                    : "reference-value text-muted"
                            }
                        >
                            {" "}
                            {formatNumber(optionAnalysis.maxCallOIExit)}
                        </span>
                        {" "}
                        ({optionAnalysis.maxCallOIExitStrike ?? "-"})
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
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
                    {/* <div className="info">i</div> */}
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
                            flowDotClass={toFlowDotClass(putOIChangeClass(optionAnalysis.totalPutOIChange))}
                        />
                    </div>

                    <div className="label">CHANGE IN PUT OI</div>

                    <div
                        className={`value decision-value ${putOIChangeClass(optionAnalysis.totalPutOIChange)}`}
                    >
                        {formatNumber(optionAnalysis.totalPutOIChange)}
                    </div>

                    <div className="sub text-secondary">
                        Added :
                        <span className="support-value decision-positive">
                            {" "}
                            {formatNumber(optionAnalysis.maxPutOIAddition ?? 0)}
                        </span>
                        {" "}
                        ({optionAnalysis.maxPutOIAdditionStrike ?? "-"})
                    </div>

                    <div className="caption text-secondary">
                        Exited :
                        <span
                            className={
                                Math.abs(optionAnalysis.maxPutOIExit ?? 0) >
                                    (optionAnalysis.maxPutOIAddition ?? 0)
                                    ? "support-value decision-negative"
                                    : "reference-value text-muted"
                            }
                        >
                            {" "}
                            {formatNumber(optionAnalysis.maxPutOIExit ?? 0)}
                        </span>
                        {" "}
                        ({optionAnalysis.maxPutOIExitStrike ?? "-"})
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
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