function ConfirmationCard() {
    return (
    <section className="section section-cyan">
        <div className="section-title">6 • CONFIRMATION</div>

        <div className="grid-4">

            <div className="card">
                <div className="info">i</div>
                <div className="label">VOLUME</div>
                <div className="value">112% of avg</div>
                <div className="sub green">vs 20-day</div>
                <div className="caption">ABOVE AVERAGE</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">FII ACTIVITY</div>
                <div className="value">+₹842 Cr</div>
                <div className="sub green">Index futures</div>
                <div className="caption">NET LONG</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">SECTOR STRENGTH</div>
                <div className="value">7 / 11 Up</div>
                <div className="sub green">Banks leading</div>
                <div className="caption">BROAD</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">ADVANCE / DECLINE</div>
                <div className="value">1.4 : 1</div>
                <div className="sub green">Ratio</div>
                <div className="caption">POSITIVE</div>
            </div>

        </div>
    </section>

    );
}

export default ConfirmationCard;