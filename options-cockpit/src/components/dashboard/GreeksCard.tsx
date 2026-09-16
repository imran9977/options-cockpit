import type { OptionAnalysis } from "../../models/OptionAnalysis";
import type { Underlying } from "../../models/Underlying";
import MetricPopover from "../common/MetricPopover";
interface GreeksCardProps {
    optionAnalysis: OptionAnalysis;
    indexLabel: Underlying;
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

function greeksVerdictClass(
    premiumLabel: string,
    movementLabel: string
): string {
    if (premiumLabel === "Cheap Premium" && movementLabel === "Fast-Moving Setup") {
        return "bullish";
    }
    if (premiumLabel === "Expensive Premium" && movementLabel === "Heavy Time Decay") {
        return "bearish";
    }
    return "neutral";
}

function skewReading(ivSkew: number): string {
    if (ivSkew > 0.5) return "Puts pricier - fear/hedging rising";
    if (ivSkew < -0.5) return "Calls pricier - unusual, check news";
    return "Calls and Puts priced about the same";
}

function GreeksCard({
    optionAnalysis,
    indexLabel,
}: GreeksCardProps) {

    const verdictClass = greeksVerdictClass(
        optionAnalysis.greeksPremiumLabel,
        optionAnalysis.greeksMovementLabel
    );

    return (
        <section className="section section-purple">
            <div className="section-header">

                <div className="section-title">
                    5 • GREEKS
                </div>

                <div className={`position-summary ${verdictClass}`}>
                    {optionAnalysis.greeksEnvironment}
                </div>

            </div>

            <div className="build-up-side-label">
                WHAT THE MARKET IS PRICING IN
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="label">IV SKEW (PUT − CALL)</div>
                    <div className="value decision-value">
                        {optionAnalysis.ivSkew >= 0 ? "+" : ""}
                        {optionAnalysis.ivSkew}
                    </div>
                    <div className="sub text-secondary">
                        {skewReading(optionAnalysis.ivSkew)}
                    </div>
                    <div className="caption text-muted">
                        WHO'S PAYING MORE FOR PROTECTION
                    </div>
                </div>

                <div className="card">
                    <div className="label">EXPECTED MOVE</div>
                    <div className="value decision-value">
                        ± {optionAnalysis.expectedMove}
                    </div>
                    <div className="sub text-secondary">
                        ATM Call + Put premium - market's own guess at the swing by expiry
                    </div>
                    <div className="caption text-muted">
                        ATM STRADDLE PRICE
                    </div>
                </div>
            </div>

            <div className="build-up-side-label">CALL GREEKS</div>

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
                    <div className="value decision-value">
                        {optionAnalysis.atmIV}
                    </div>
                    <div className="sub text-secondary">
                        How pricey this Call is right now
                    </div>
                    <div className="caption text-muted">
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
                    <div className="value decision-value">
                        {optionAnalysis.atmDelta}
                    </div>
                    <div className="sub text-secondary">
                        Moves ₹{optionAnalysis.atmDelta} for every ₹1 {indexLabel} moves
                    </div>
                    <div className="caption text-muted">
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
                    <div className="value decision-value">
                        {optionAnalysis.atmGamma}
                    </div>
                    <div className="sub text-secondary">
                        How fast that Delta itself can change
                    </div>
                    <div className="caption text-muted">
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
                    <div className="value decision-value">
                        {optionAnalysis.atmTheta}
                    </div>
                    <div className="sub text-secondary">
                        Loses ₹{Math.abs(optionAnalysis.atmTheta)} in value per day, doing nothing
                    </div>
                    <div className="caption text-muted">
                        LIVE
                    </div>
                </div>

            </div>

            <div className="build-up-side-label">PUT GREEKS</div>

            <div className="grid-4">

                <div className="card">
                    <div className="info metric-info">
                        i
                        <MetricPopover
                            title="ATM PUT IV"
                            currentValue={optionAnalysis.atmPutIV}
                            ranges={IV_GUIDE}
                        />
                    </div>
                    <div className="label">IV</div>
                    <div className="value decision-value">
                        {optionAnalysis.atmPutIV}
                    </div>
                    <div className="sub text-secondary">
                        How pricey this Put is right now
                    </div>
                    <div className="caption text-muted">
                        LIVE
                    </div>
                </div>

                <div className="card">
                    <div className="info metric-info">
                        i
                        <MetricPopover
                            title="ATM PUT DELTA"
                            currentValue={Math.abs(optionAnalysis.atmPutDelta)}
                            ranges={DELTA_GUIDE}
                        />
                    </div>
                    <div className="label">DELTA</div>
                    <div className="value decision-value">
                        {optionAnalysis.atmPutDelta}
                    </div>
                    <div className="sub text-secondary">
                        Moves ₹{Math.abs(optionAnalysis.atmPutDelta)} for every ₹1 {indexLabel} moves
                    </div>
                    <div className="caption text-muted">
                        LIVE
                    </div>
                </div>

                <div className="card">
                    <div className="info metric-info">
                        i
                        <MetricPopover
                            title="ATM PUT GAMMA"
                            currentValue={optionAnalysis.atmPutGamma}
                            ranges={GAMMA_GUIDE}
                        />
                    </div>
                    <div className="label">GAMMA</div>
                    <div className="value decision-value">
                        {optionAnalysis.atmPutGamma}
                    </div>
                    <div className="sub text-secondary">
                        How fast that Delta itself can change
                    </div>
                    <div className="caption text-muted">
                        LIVE
                    </div>
                </div>

                <div className="card">
                    <div className="info metric-info">
                        i
                        <MetricPopover
                            title="ATM PUT THETA"
                            currentValue={Math.abs(optionAnalysis.atmPutTheta)}
                            ranges={THETA_GUIDE}
                        />
                    </div>
                    <div className="label">THETA</div>
                    <div className="value decision-value">
                        {optionAnalysis.atmPutTheta}
                    </div>
                    <div className="sub text-secondary">
                        Loses ₹{Math.abs(optionAnalysis.atmPutTheta)} in value per day, doing nothing
                    </div>
                    <div className="caption text-muted">
                        LIVE
                    </div>
                </div>

            </div>

        </section>
    );
}

export default GreeksCard;
