import { formatNumber } from "../../utils/formatNumber";

interface OIFlowPopoverProps {
    title: string;

    totalChange: number;

    largestAddition: number;
    largestAdditionStrike: number | null;

    largestExit: number;
    largestExitStrike: number | null;

    netFlow: "Building" | "Unwinding" | "Balanced";

    contribution: number;

    // Whether this net flow is bullish/bearish depends on which side
    // (Call vs Put) is building/unwinding - the caller knows that,
    // this component doesn't, so it's passed in rather than guessed
    // from netFlow alone (that guess was wrong for the Call side).
    flowDotClass: "green" | "red" | "gray";
}

function OIFlowPopover({
    title,
    totalChange,
    largestAddition,
    largestAdditionStrike,
    largestExit,
    largestExitStrike,
    netFlow,
    contribution,
    flowDotClass,
}: OIFlowPopoverProps) {
    return (
        <div className="metric-popover">

            <div className="metric-popover-title">
                {title}
            </div>

            <div className="metric-popover-divider" />

            <div className="metric-row">
                <span>Total Change</span>
                <span>{formatNumber(totalChange)}</span>
            </div>

            <div className="metric-row">
                <span>Largest Addition</span>
                <span>
                    {formatNumber(largestAddition)} @{" "}
                    {largestAdditionStrike ?? "-"}
                </span>
            </div>

            <div className="metric-row">
                <span>Largest Exit</span>
                <span>
                    {formatNumber(largestExit)} @{" "}
                    {largestExitStrike ?? "-"}
                </span>
            </div>

            <div className="metric-row">
    <span>Net Flow</span>

    <span className={`flow-status ${flowDotClass}`}>
        <span className="flow-dot" />
        {netFlow}
    </span>
</div>

            <div className="metric-row">
                <span>Contribution</span>
                <span>{contribution}%</span>
            </div>

        </div>
    );
}

export default OIFlowPopover;