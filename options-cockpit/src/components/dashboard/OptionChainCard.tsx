function OptionChainCard() {
    return (
   <section className="section section-yellow">
        <div className="section-title">3 • OPTION CHAIN INTELLIGENCE</div>

        <div className="grid-4">

            <div className="card">
                <div className="info">i</div>
                <div className="label">ATM STRIKE</div>
                <div className="value">25,250 CE/PE</div>
                <div className="caption">Nearest to spot</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">CALL OI</div>
                <div className="value">1.24 Cr</div>
                <div className="caption">Max @ 25,300</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">PUT OI</div>
                <div className="value">1.41 Cr</div>
                <div className="caption">Max @ 25,200</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">CHANGE IN CALL OI</div>
                <div className="value">+8.42 L</div>
                <div className="sub red">vs prev day</div>
                <div className="caption">WRITING</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">CHANGE IN PUT OI</div>
                <div className="value">+12.10 L</div>
                <div className="sub green">vs prev day</div>
                <div className="caption">WRITING</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">PCR</div>
                <div className="value">1.08</div>
                <div className="sub green">+0.03</div>
                <div className="caption">INCREASING</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">MAX PAIN</div>
                <div className="value">25,250</div>
                <div className="sub">5 pts from spot</div>
                <div className="caption">MAGNET</div>
            </div>

        </div>
    </section>

    );
}

export default OptionChainCard;