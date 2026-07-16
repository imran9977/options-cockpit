function SpotPriceCard() {
    return (
        <div className="metric-card spot-price-card">
            <div className="metric-header">
                <h3 className="metric-title">
                    Spot Price
                </h3>
            </div>

            <div className="metric-body">
                <span className="metric-value">
                    ---.--
                </span>
            </div>
        </div>
    );
}

export default SpotPriceCard;