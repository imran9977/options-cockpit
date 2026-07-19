interface InfoSectionRow {
    label: string;
    value: string | number;
    valueClassName?: string;
}

interface InfoSection {
    title: string;
    rows: InfoSectionRow[];
}

interface InfoPopoverProps {
    title: string;
    sections: InfoSection[];
}

function InfoPopover({
    title,
    sections,
}: InfoPopoverProps) {

    return (
        <div className="info-popover">

            <div className="info-popover-title">
                {title}
            </div>

            {sections.map((section) => (
                <div
                    key={section.title}
                    className="info-popover-section"
                >

                    <div className="info-popover-section-title">
                        {section.title}
                    </div>

                    {section.rows.map((row) => (
                        <div
                            key={row.label}
                            className="info-popover-row"
                        >
                            <span className="info-popover-label">
                                {row.label}
                            </span>

                            <span
                                className={
                                    row.valueClassName
                                        ? `info-popover-value ${row.valueClassName}`
                                        : "info-popover-value"
                                }
                            >
                                {row.value}
                            </span>
                        </div>
                    ))}

                </div>
            ))}

        </div>
    );

}

export default InfoPopover;