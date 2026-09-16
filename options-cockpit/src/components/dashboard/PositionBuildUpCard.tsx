import type { OptionAnalysis } from "../../models/OptionAnalysis";

interface PositionBuildUpCardProps {
    optionAnalysis: OptionAnalysis;
}

type Side = "CE" | "PE";

const TILE_INFO: Record<Side, Record<"shortCovering" | "longBuildUp" | "longUnwinding" | "shortBuildUp", string>> = {
    CE: {
        shortCovering: "Call writers buying back as price rallies past their strike - confirms bullish pressure.",
        longBuildUp: "Fresh call buyers stepping in, confident the index will keep rising - bullish.",
        longUnwinding: "Call buyers giving up on a bullish bet that's not working - bearish confirmation.",
        shortBuildUp: "Fresh call writers selling, betting price won't rally past their strike - bearish.",
    },
    PE: {
        shortCovering: "Put writers buying back as price falls past their strike - confirms bearish pressure.",
        longBuildUp: "Fresh put buyers stepping in, confident the index will keep falling - bearish.",
        longUnwinding: "Put buyers giving up on a bearish bet that's not working - bullish confirmation.",
        shortBuildUp: "Fresh put writers selling, betting price won't fall past their strike - bullish.",
    },
};

function TileInfo({ text }: { text: string }) {
    return (
        <div className="tile-info">
            i
            <div className="tile-info-popover">
                {text}
            </div>
        </div>
    );
}

function hintClass(hint: string): string {
    if (hint === "BUY CE") return "bullish";
    if (hint === "BUY PE") return "bearish";
    return "neutral";
}

function PositionBuildUpCard({
    optionAnalysis,
}: PositionBuildUpCardProps) {

    const hint = optionAnalysis.positionBuildUpHint;
    const verdictClass = hintClass(hint);

    const call = optionAnalysis.callPositionBuildUp;
    const put = optionAnalysis.putPositionBuildUp;

    return (
        <section className="section section-pink">

            <div className="section-header">

                <div className="section-title">
                    4 • POSITION BUILD-UP
                </div>

                <div className={`position-summary ${verdictClass}`}>
                    {hint}
                </div>

            </div>

            <div className="build-up-side-label">CALL SIDE</div>

            <div className="grid-4">

                <div className="card">
                    <TileInfo text={TILE_INFO.CE.shortCovering} />
                    <div className="label">SHORT COVERING</div>
                    <div className="status decision-value decision-positive">
                        {call.shortCovering}
                    </div>
                    <div className="sub text-secondary">
                        <span className="support-value decision-positive">
                            {call.shortCoveringCount} Strikes
                        </span>
                    </div>
                    <div className="caption text-muted">
                        {call.shortCoveringPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <TileInfo text={TILE_INFO.CE.longBuildUp} />
                    <div className="label">LONG BUILD-UP</div>
                    <div className="status decision-value decision-positive">
                        {call.longBuildUp}
                    </div>
                    <div className="sub text-secondary">
                        <span className="support-value decision-positive">
                            {call.longBuildUpCount} Strikes
                        </span>
                    </div>
                    <div className="caption text-muted">
                        {call.longBuildUpPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <TileInfo text={TILE_INFO.CE.longUnwinding} />
                    <div className="label">LONG UNWINDING</div>
                    <div className="status decision-value decision-negative">
                        {call.longUnwinding}
                    </div>
                    <div className="sub text-secondary">
                        <span className="support-value decision-negative">
                            {call.longUnwindingCount} Strikes
                        </span>
                    </div>
                    <div className="caption text-muted">
                        {call.longUnwindingPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <TileInfo text={TILE_INFO.CE.shortBuildUp} />
                    <div className="label">SHORT BUILD-UP</div>
                    <div className="status decision-value decision-negative">
                        {call.shortBuildUp}
                    </div>
                    <div className="sub text-secondary">
                        <span className="support-value decision-negative">
                            {call.shortBuildUpCount} Strikes
                        </span>
                    </div>
                    <div className="caption text-muted">
                        {call.shortBuildUpPercentage}% Participation
                    </div>
                </div>

            </div>

            <div className="build-up-side-label">PUT SIDE</div>

            <div className="grid-4">

                <div className="card">
                    <TileInfo text={TILE_INFO.PE.shortCovering} />
                    <div className="label">SHORT COVERING</div>
                    <div className="status decision-value decision-negative">
                        {put.shortCovering}
                    </div>
                    <div className="sub text-secondary">
                        <span className="support-value decision-negative">
                            {put.shortCoveringCount} Strikes
                        </span>
                    </div>
                    <div className="caption text-muted">
                        {put.shortCoveringPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <TileInfo text={TILE_INFO.PE.longBuildUp} />
                    <div className="label">LONG BUILD-UP</div>
                    <div className="status decision-value decision-negative">
                        {put.longBuildUp}
                    </div>
                    <div className="sub text-secondary">
                        <span className="support-value decision-negative">
                            {put.longBuildUpCount} Strikes
                        </span>
                    </div>
                    <div className="caption text-muted">
                        {put.longBuildUpPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <TileInfo text={TILE_INFO.PE.longUnwinding} />
                    <div className="label">LONG UNWINDING</div>
                    <div className="status decision-value decision-positive">
                        {put.longUnwinding}
                    </div>
                    <div className="sub text-secondary">
                        <span className="support-value decision-positive">
                            {put.longUnwindingCount} Strikes
                        </span>
                    </div>
                    <div className="caption text-muted">
                        {put.longUnwindingPercentage}% Participation
                    </div>
                </div>

                <div className="card">
                    <TileInfo text={TILE_INFO.PE.shortBuildUp} />
                    <div className="label">SHORT BUILD-UP</div>
                    <div className="status decision-value decision-positive">
                        {put.shortBuildUp}
                    </div>
                    <div className="sub text-secondary">
                        <span className="support-value decision-positive">
                            {put.shortBuildUpCount} Strikes
                        </span>
                    </div>
                    <div className="caption text-muted">
                        {put.shortBuildUpPercentage}% Participation
                    </div>
                </div>

            </div>

        </section>
    );
}

export default PositionBuildUpCard;
