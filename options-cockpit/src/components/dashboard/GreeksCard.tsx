import type { OptionAnalysis } from "../../models/OptionAnalysis";
import MetricPopover from "../common/MetricPopover";
interface GreeksCardProps {
    optionAnalysis: OptionAnalysis;
}

const IV_GUIDE = [
    {
        max: 12,
        label: "LOW",
    },
    {
        min: 12,
        max: 18,
        label: "NORMAL",
    },
    {
        min: 18,
        max: 25,
        label: "ELEVATED",
    },
    {
        min: 25,
        label: "HIGH",
    },
];

const DELTA_GUIDE = [
    {
        max: 0.40,
        label: "LOW",
    },
    {
        min: 0.40,
        max: 0.60,
        label: "ATM",
    },
    {
        min: 0.60,
        max: 0.80,
        label: "HIGH",
    },
    {
        min: 0.80,
        label: "DEEP ITM",
    },
];

const GAMMA_GUIDE = [
    {
        max: 0.001,
        label: "LOW",
    },
    {
        min: 0.001,
        max: 0.003,
        label: "NORMAL",
    },
    {
        min: 0.003,
        max: 0.006,
        label: "HIGH",
    },
    {
        min: 0.006,
        label: "VERY HIGH",
    },
];

const THETA_GUIDE = [
    {
        max: 10,
        label: "LOW",
    },
    {
        min: 10,
        max: 25,
        label: "NORMAL",
    },
    {
        min: 25,
        max: 40,
        label: "HIGH",
    },
    {
        min: 40,
        label: "VERY HIGH",
    },
];

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
                    <div className="info metric-info">
                        i
                        <MetricPopover
                            title="ATM CALL IV"
                            currentValue={optionAnalysis.atmIV}
                            ranges={IV_GUIDE}
                        />

                    </div>
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
                    <div className="info metric-info">
                        i
                        <MetricPopover
                            title="ATM CALL DELTA"
                            currentValue={optionAnalysis.atmDelta}
                            ranges={DELTA_GUIDE}
                        />

                    </div>
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
                    <div className="info metric-info">
                        i
                        <MetricPopover
                            title="ATM CALL GAMMA"
                            currentValue={optionAnalysis.atmGamma}
                            ranges={GAMMA_GUIDE}
                        />

                    </div>
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
                    <div className="info metric-info">
                        i
                        <MetricPopover
                            title="ATM CALL THETA"
                            currentValue={Math.abs(optionAnalysis.atmTheta)}
                            ranges={THETA_GUIDE}
                        />

                    </div>
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