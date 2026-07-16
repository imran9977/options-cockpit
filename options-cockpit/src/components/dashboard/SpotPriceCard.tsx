function SpotPriceCard() {
    return (
        <section className="section section-blue">
        <div className="section-title">1 • MARKET HEALTH</div>

        <div className="grid-3">

            <div className="card">
                <div className="info">i</div>
                <div className="label">NIFTY SPOT</div>
                <div className="value">25,245.65</div>
                <div className="sub green">+42.30 (+0.17%)</div>
                <div className="caption">ABOVE VWAP</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">SENSEX SPOT</div>
                <div className="value">82,410.20</div>
                <div className="sub green">+128.45 (+0.16%)</div>
                <div className="caption">ABOVE VWAP</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">INDIA VIX</div>
                <div className="value">13.82</div>
                <div className="sub red">-0.24 (-1.70%)</div>
                <div className="caption">COOLING</div>
            </div>

        </div>
    </section>
    );
}

export default SpotPriceCard;