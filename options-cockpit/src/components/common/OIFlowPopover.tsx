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
}: OIFlowPopoverProps) {
    const getNetFlowClass = () => {
    switch (netFlow) {
        case "Building":
            return "green";

        case "Unwinding":
            return "red";

        default:
            return "gray";
    }
};
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

    <span className={`flow-status ${getNetFlowClass()}`}>
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