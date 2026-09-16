import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface PriceStructureCardProps {
    optionAnalysis: OptionAnalysis;
}

function PriceStructureCard({
    optionAnalysis,
}: PriceStructureCardProps) {
    const spot = optionAnalysis.spotPrice;
    const support = optionAnalysis.primarySupport;
    const resistance = optionAnalysis.primaryResistance;
    const atm = optionAnalysis.atmStrike;

    let verdict = "Inside Trading Range";
    let verdictClass = "neutral";

    if (
        support != null &&
        resistance != null &&
        spot != null
    ) {
        const range = resistance - support;
        const breakoutBuffer = range * 0.10;

        if (spot <= support + breakoutBuffer) {
            verdict = "Holding Above Support";
            verdictClass = "bullish";
        } else if (spot >= resistance - breakoutBuffer) {
            verdict = "Testing Resistance";
            verdictClass = "bearish";
        } else if (
            atm != null &&
            Math.abs(spot - atm) <= 25
        ) {
            verdict = "Near ATM";
            verdictClass = "neutral";
        } else {
            verdict = "Structure Awaits Breakout";
            verdictClass = "neutral";
        }
    }
    return (
        <section className="section section-green">
            <div className="section-header">

                <div className="section-title">
                    2 • PRICE STRUCTURE
                </div>

                <div className={`position-summary ${verdictClass}`}>
                    {verdict}
                </div>

            </div>

            <div className="grid-4">
                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">
                        PRIMARY SUPPORT
                    </div>
                    <div className="value decision-value decision-positive">
                        {optionAnalysis.primarySupport}
                    </div>
                    <div className="sub text-secondary">
                        Secondary:{" "}
                        {optionAnalysis.secondarySupport}
                    </div>
                    <div className="caption text-muted">
                        DAILY PIVOT S1/S2
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">
                        PRIMARY RESISTANCE
                    </div>
                    <div className="value decision-value decision-negative">
                        {optionAnalysis.primaryResistance}
                    </div>

                    <div className="sub text-secondary">
                        Secondary:{" "}
                        {optionAnalysis.secondaryResistance}
                    </div>

                    <div className="caption text-muted">
                        DAILY PIVOT R1/R2
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">
                        PIVOT POINT
                    </div>
                    <div className="value decision-value">
                        {optionAnalysis.pivotPoint}
                    </div>

                    <div className="pivot-weekly-tiles">
                        <div className="pivot-weekly-tile bg-bullish">
                            <div className="pivot-weekly-tile-label">
                                S1 (WEEKLY)
                            </div>
                            <div className="pivot-weekly-tile-value support-value decision-positive">
                                {optionAnalysis.weeklyPrimarySupport ?? "-"}
                            </div>
                        </div>

                        <div className="pivot-weekly-tile bg-bearish">
                            <div className="pivot-weekly-tile-label">
                                R1 (WEEKLY)
                            </div>
                            <div className="pivot-weekly-tile-value support-value decision-negative">
                                {optionAnalysis.weeklyPrimaryResistance ?? "-"}
                            </div>
                        </div>
                    </div>

                    <div className="caption text-muted">
                        PREV. DAY H/L/C
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">PCR</div>
                    <div className="value decision-value">
                        {optionAnalysis.pcr}
                    </div>

                    <div className="sub text-secondary">
                        ATM ± 10 Strikes
                    </div>

                    <div className="caption text-muted">
                        PUT/CALL RATIO
                    </div>
                </div>
            </div>
        </section>
    );
}

export default PriceStructureCard;