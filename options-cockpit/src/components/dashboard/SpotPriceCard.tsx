function SpotPriceCard() {
    return (
        <div className="metric-card spot-price-card">

            <div className="metric-header">
                <h3 className="metric-title">
                    Spot Price
                </h3>

                <span className="metric-status">
                    LIVE
                </span>
            </div>

            <div className="metric-body">

                <div className="metric-row">

                    <span className="metric-label">
                        NIFTY
                    </span>

                    <span className="metric-value">
                        25,245.65
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Change
                    </span>

                    <span className="metric-value positive">
                        +42.30
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Change %
                    </span>

                    <span className="metric-value positive">
                        +0.17%
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

export default SpotPriceCard;