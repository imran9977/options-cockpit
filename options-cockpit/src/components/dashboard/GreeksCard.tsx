function GreeksCard() {
    return (
        <div className="metric-card greeks-card">

            <div className="metric-header">

                <h3 className="metric-title">
                    Greeks
                </h3>

                <span className="metric-status">
                    LIVE
                </span>

            </div>

            <div className="metric-body">

                <div className="metric-row">

                    <span className="metric-label">
                        Delta
                    </span>

                    <span className="metric-value">
                        0.52
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Gamma
                    </span>

                    <span className="metric-value">
                        0.018
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Theta
                    </span>

                    <span className="metric-value">
                        -12.45
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Vega
                    </span>

                    <span className="metric-value">
                        8.92
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        IV
                    </span>

                    <span className="metric-value">
                        14.35%
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

export default GreeksCard;