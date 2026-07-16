function PositionBuildUpCard() {
    return (
        <div className="metric-card position-build-up-card">

            <div className="metric-header">

                <h3 className="metric-title">
                    Position Build-up
                </h3>

                <span className="metric-status">
                    LIVE
                </span>

            </div>

            <div className="metric-body">

                <div className="metric-row">

                    <span className="metric-label">
                        Long Build-up
                    </span>

                    <span className="metric-value">
                        Active
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Short Build-up
                    </span>

                    <span className="metric-value">
                        Weak
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Long Unwinding
                    </span>

                    <span className="metric-value">
                        Low
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Short Covering
                    </span>

                    <span className="metric-value">
                        Moderate
                    </span>

                </div>

                <div className="metric-row">

                    <span className="metric-label">
                        Dominant
                    </span>

                    <span className="metric-value">
                        Long Build-up
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

export default PositionBuildUpCard;