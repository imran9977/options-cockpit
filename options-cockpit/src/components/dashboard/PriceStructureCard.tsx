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
                    <div className="info">i</div>
                    <div className="label">
                        PRIMARY SUPPORT
                    </div>
                    <div className="value">
                        {optionAnalysis.primarySupport ?? "-"}
                    </div>
                    <div className="sub">
                        Secondary:{" "}
                        {optionAnalysis.secondarySupport ?? "-"}
                    </div>
                    <div className="caption">
                        SUPPORT ZONE
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">
                        PRIMARY RESISTANCE
                    </div>
                    <div className="value">
                        {optionAnalysis.primaryResistance ?? "-"}
                    </div>
                    <div className="sub">
                        Secondary:{" "}
                        {optionAnalysis.secondaryResistance ?? "-"}
                    </div>
                    <div className="caption">
                        RESISTANCE ZONE
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">ATM STRIKE</div>
                    <div className="value">
                        {optionAnalysis.atmStrike}
                    </div>
                    <div className="sub">
                        Spot: {optionAnalysis.spotPrice}
                    </div>
                    <div className="caption">
                        CURRENT ATM
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">PCR</div>
                    <div className="value">
                        {optionAnalysis.pcr}
                    </div>
                    <div className="sub">
                        ATM ± 10 Strikes
                    </div>
                    <div className="caption">
                        PUT/CALL RATIO
                    </div>
                </div>
            </div>
        </section>
    );
}

export default PriceStructureCard;