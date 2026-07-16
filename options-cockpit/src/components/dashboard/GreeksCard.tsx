function GreeksCard() {
    return (
  <section className="section section-purple">
        <div className="section-title">5 • GREEKS</div>

        <div className="grid-4">

            <div className="card">
                <div className="info">i</div>
                <div className="label">IV</div>
                <div className="value">18.42</div>
                <div className="sub red">-0.42</div>
                <div className="caption">DECREASING</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">DELTA</div>
                <div className="value">0.52</div>
                <div className="sub">ATM Call</div>
                <div className="caption">NEUTRAL</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">GAMMA</div>
                <div className="value">0.014</div>
                <div className="sub">ATM</div>
                <div className="caption">ELEVATED</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">THETA</div>
                <div className="value">-8.20</div>
                <div className="sub red">per day</div>
                <div className="caption">BLEEDING</div>
            </div>

        </div>
    </section>

    );
}

export default GreeksCard;