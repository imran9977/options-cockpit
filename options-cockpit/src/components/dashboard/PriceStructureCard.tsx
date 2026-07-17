import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface PriceStructureCardProps {
    optionAnalysis: OptionAnalysis;
}

function PriceStructureCard({
    optionAnalysis,
}: PriceStructureCardProps) {
    return (
        <section className="section section-green">
            <div className="section-title">
                2 • PRICE STRUCTURE
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