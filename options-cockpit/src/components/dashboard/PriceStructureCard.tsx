function PriceStructureCard() {
    return (
          <section className="section section-green">
        <div className="section-title">2 • PRICE STRUCTURE</div>

        <div className="grid-4">

            <div className="card">
                <div className="info">i</div>
                <div className="label">SUPPORT</div>
                <div className="value">25,180</div>
                <div className="sub">24 pts away</div>
                <div className="caption">HOLDING</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">RESISTANCE</div>
                <div className="value">25,320</div>
                <div className="sub">81 pts away</div>
                <div className="caption">HOLDING</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">VWAP</div>
                <div className="value">25,218.40</div>
                <div className="sub green">Price +27.25</div>
                <div className="caption">ABOVE</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">ORB RANGE</div>
                <div className="status">High / Low</div>
                <div className="sub">Range Intact</div>
                <div className="caption">INSIDE RANGE</div>
            </div>

        </div>
    </section>

    );
}

export default PriceStructureCard;