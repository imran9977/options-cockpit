function OptionChainCard() {
    return (
        <div className="metric-card option-chain-card">

            <div className="metric-header">

                <h3 className="metric-title">
                    Option Chain
                </h3>

                <span className="metric-status">
                    LIVE
                </span>

            </div>

            <div className="metric-body">

                <div className="metric-row">

                    <span className="metric-label">
                        PCR
                    </span>

                    <span className="metric-value">
                        0.98
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        ATM Strike
                    </span>

                    <span className="metric-value">
                        25250
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Support
                    </span>

                    <span className="metric-value">
                        25100 PE
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Resistance
                    </span>

                    <span className="metric-value">
                        25300 CE
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Max Pain
                    </span>

                    <span className="metric-value">
                        25200
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

export default OptionChainCard;