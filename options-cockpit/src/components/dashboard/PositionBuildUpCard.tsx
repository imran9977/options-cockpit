import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface PositionBuildUpCardProps {
    optionAnalysis: OptionAnalysis;
}

function PositionBuildUpCard({
    optionAnalysis,
}: PositionBuildUpCardProps) {
    return (
        <section className="section section-pink">
            <div className="section-title">
                4 • POSITION BUILD-UP
            </div>

            <div className="grid-4">

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">SHORT COVERING</div>
                    <div className="status">
                        {optionAnalysis.shortCovering}
                    </div>
                    <div className="sub green">
                        Price ↑ OI ↓
                    </div>
                    <div className="caption">
                        DETECTED
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">LONG BUILD-UP</div>
                    <div className="status">
                        {optionAnalysis.longBuildUp}
                    </div>
                    <div className="sub green">
                        Price ↑ OI ↑
                    </div>
                    <div className="caption">
                        CONFIRMED
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">LONG UNWINDING</div>
                    <div className="status">
                        {optionAnalysis.longUnwinding}
                    </div>
                    <div className="sub">
                        Price ↓ OI ↓
                    </div>
                    <div className="caption">
                        IDLE
                    </div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">SHORT BUILD-UP</div>
                    <div className="status">
                        {optionAnalysis.shortBuildUp}
                    </div>
                    <div className="sub">
                        Price ↓ OI ↑
                    </div>
                    <div className="caption">
                        IDLE
                    </div>
                </div>

            </div>
        </section>
    );
}

export default PositionBuildUpCard;