interface MetricRange {
    label: string;
    min?: number;
    max?: number;
}

interface MetricPopoverProps {
    title: string;
    currentValue: number;
    ranges: MetricRange[];
}

function MetricPopover({
    title,
    currentValue,
    ranges,
}: MetricPopoverProps) {

    const isCurrentRange = (
        range: MetricRange
    ) => {

        const min =
            range.min ?? Number.NEGATIVE_INFINITY;

        const max =
            range.max ?? Number.POSITIVE_INFINITY;

        return (
            currentValue >= min &&
            currentValue < max
        );

    };

    const getRangeText = (
        range: MetricRange
    ) => {

        if (
            range.min !== undefined &&
            range.max !== undefined
        ) {
            return `${range.min} - ${range.max}`;
        }

        if (range.min !== undefined) {
            return `> ${range.min}`;
        }

        return `< ${range.max}`;

    };

    return (
        <div className="metric-popover">

            <div className="metric-popover-title">
                {title}
            </div>

            <div className="metric-popover-current">
                Current : {currentValue}
            </div>

            <div className="metric-popover-divider" />

            {
                ranges.map((range) => {

                    const active =
                        isCurrentRange(range);

                    return (

                        <div
                            key={range.label}
                            className={`metric-row ${active ? "active" : ""}`}
                        >

                            <span>
                                {getRangeText(range)}
                            </span>

                            <span>
                                {range.label}
                            </span>

                        </div>

                    );

                })
            }

        </div>
    );

}

export default MetricPopover;