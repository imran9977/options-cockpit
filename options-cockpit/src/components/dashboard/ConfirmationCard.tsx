function ConfirmationCard() {
    return (
        <div className="metric-card confirmation-card">

            <div className="metric-header">

                <h3 className="metric-title">
                    Confirmation
                </h3>

                <span className="metric-status">
                    LIVE
                </span>

            </div>

            <div className="metric-body">

                <div className="metric-row">

                    <span className="metric-label">
                        Market Bias
                    </span>

                    <span className="metric-value">
                        Bullish
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Momentum
                    </span>

                    <span className="metric-value">
                        Strong
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Volume
                    </span>

                    <span className="metric-value">
                        Above Average
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Volatility
                    </span>

                    <span className="metric-value">
                        Moderate
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Confidence
                    </span>

                    <span className="metric-value">
                        High
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

export default ConfirmationCard;