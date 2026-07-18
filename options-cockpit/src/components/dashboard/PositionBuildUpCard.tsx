import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface PositionBuildUpCardProps {
    optionAnalysis: OptionAnalysis;
}

function PositionBuildUpCard({
    optionAnalysis,
}: PositionBuildUpCardProps) {

    const score =
        (optionAnalysis.longBuildUpPercentage * 4) +
        (optionAnalysis.shortCoveringPercentage * 2) -
        (optionAnalysis.shortBuildUpPercentage * 4) -
        (optionAnalysis.longUnwindingPercentage * 2);

    let verdict = "POSITIONING BALANCED";
    let verdictClass = "neutral";

    if (score >= 40) {

        verdict = "BUYERS GAINING CONTROL";
        verdictClass = "bullish";

    } else if (score <= -40) {

        verdict = "SELLERS GAINING CONTROL";
        verdictClass = "bearish";

    } else {

        verdict = "MARKET AWAITS DIRECTION";
        verdictClass = "neutral";

    }

    return (
        <section className="section section-pink">

            <div className="section-header">

                <div className="section-title">
                    4 • POSITION BUILD-UP
                </div>

                <div className={`position-summary ${verdictClass}`}>
                    {verdict}
                </div>

            </div>

            <div className="grid-4">

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">SHORT COVERING</div>
                    <div className="status">
                        {optionAnalysis.shortCovering}
                    </div>
                    <div className="sub green">
                        {optionAnalysis.shortCoveringCount} Strikes
                    </div>
                    <div className="caption">
                        {optionAnalysis.shortCoveringPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">LONG BUILD-UP</div>
                    <div className="status">
                        {optionAnalysis.longBuildUp}
                    </div>
                    <div className="sub green">
                        {optionAnalysis.longBuildUpCount} Strikes
                    </div>
                    <div className="caption">
                        {optionAnalysis.longBuildUpPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">LONG UNWINDING</div>
                    <div className="status">
                        {optionAnalysis.longUnwinding}
                    </div>
                    <div className="sub">
                        {optionAnalysis.longUnwindingCount} Strikes
                    </div>
                    <div className="caption">
                        {optionAnalysis.longUnwindingPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">SHORT BUILD-UP</div>
                    <div className="status">
                        {optionAnalysis.shortBuildUp}
                    </div>
                    <div className="sub">
                        {optionAnalysis.shortBuildUpCount} Strikes
                    </div>
                    <div className="caption">
                        {optionAnalysis.shortBuildUpPercentage}% Participation
                    </div>
                </div>

            </div>
        </section>
    );
}

export default PositionBuildUpCard;