import type { OptionAnalysis } from "../../models/OptionAnalysis";
import { getDailyLevels } from "../../services/dailyLevelsStorage";

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

    const dailyLevels = getDailyLevels();

    const displayPrimarySupport =
        dailyLevels?.nifty.primarySupport;

    const displaySecondarySupport =
        dailyLevels?.nifty.secondarySupport;

    const displayPrimaryResistance =
        dailyLevels?.nifty.primaryResistance;

    const displaySecondaryResistance =
        dailyLevels?.nifty.secondaryResistance;

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
                        {displayPrimarySupport ?? "-"}
                    </div>
                    <div className="sub text-secondary">
                        Secondary:{" "}
                        {displaySecondarySupport ?? "-"}
                    </div>
                    <div className="caption text-muted">
                        SUPPORT ZONE
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">
                        PRIMARY RESISTANCE
                    </div>
                    <div className="value decision-value decision-negative">
                        {displayPrimaryResistance ?? "-"}
                    </div>

                    <div className="sub text-secondary">
                        Secondary:{" "}
                        {displaySecondaryResistance ?? "-"}
                    </div>

                    <div className="caption text-muted">
                        RESISTANCE ZONE
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">ATM STRIKE</div>
                    <div className="value decision-value">
                        {optionAnalysis.atmStrike}
                    </div>

                    <div className="sub text-secondary">
                        Spot: {optionAnalysis.spotPrice}
                    </div>

                    <div className="caption text-muted">
                        CURRENT ATM
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