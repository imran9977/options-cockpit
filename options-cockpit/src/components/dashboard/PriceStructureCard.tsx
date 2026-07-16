function PriceStructureCard() {
    return (
        <div className="metric-card price-structure-card">

            <div className="metric-header">

                <h3 className="metric-title">
                    Price Structure
                </h3>

                <span className="metric-status">
                    LIVE
                </span>

            </div>

            <div className="metric-body">

                <div className="metric-row">

                    <span className="metric-label">
                        Trend
                    </span>

                    <span className="metric-value">
                        Bullish
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        VWAP
                    </span>

                    <span className="metric-value">
                        Above
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        ORB
                    </span>

                    <span className="metric-value">
                        Breakout
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Day High
                    </span>

                    <span className="metric-value">
                        25,280
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Day Low
                    </span>

                    <span className="metric-value">
                        25,110
                    </span>

                </div>

            </div>

            <div className="metric-footer">

                <span className="metric-footer-text">
                    Last Updated : --:--:--
                </span>

            </div>

        </div>
    );
}

export default PriceStructureCard;