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
                    {/* <div className="info">i</div> */}
                    <div className="label">SHORT COVERING</div>
                    <div className="status decision-value decision-positive">
                        {optionAnalysis.shortCovering}
                    </div>

                    <div className="sub text-secondary">
                        <span className="support-value decision-positive">
                            {optionAnalysis.shortCoveringCount} Strikes
                        </span>
                    </div>

                    <div className="caption text-muted">
                        {optionAnalysis.shortCoveringPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">LONG BUILD-UP</div>
                    <div className="status decision-value decision-positive">
                        {optionAnalysis.longBuildUp}
                    </div>

                    <div className="sub text-secondary">
                        <span className="support-value decision-positive">
                            {optionAnalysis.longBuildUpCount} Strikes
                        </span>
                    </div>

                    <div className="caption text-muted">
                        {optionAnalysis.longBuildUpPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">LONG UNWINDING</div>
                    <div className="status decision-value decision-negative">
                        {optionAnalysis.longUnwinding}
                    </div>

                    <div className="sub text-secondary">
                        <span className="support-value decision-negative">
                            {optionAnalysis.longUnwindingCount} Strikes
                        </span>
                    </div>

                    <div className="caption text-muted">
                        {optionAnalysis.longUnwindingPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    {/* <div className="info">i</div> */}
                    <div className="label">SHORT BUILD-UP</div>
                    <div className="status decision-value decision-negative">
                        {optionAnalysis.shortBuildUp}
                    </div>

                    <div className="sub text-secondary">
                        <span className="support-value decision-negative">
                            {optionAnalysis.shortBuildUpCount} Strikes
                        </span>
                    </div>

                    <div className="caption text-muted">
                        {optionAnalysis.shortBuildUpPercentage}% Participation
                    </div>
                </div>

            </div>
        </section>
    );
}

export default PositionBuildUpCard;