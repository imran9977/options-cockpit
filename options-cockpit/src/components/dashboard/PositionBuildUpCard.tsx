function PositionBuildUpCard() {
    return (
 <section className="section section-pink">
        <div className="section-title">4 • POSITION BUILD-UP</div>

        <div className="grid-4">

            <div className="card">
                <div className="info">i</div>
                <div className="label">SHORT COVERING</div>
                <div className="status">Moderate</div>
                <div className="sub green">Price ↑ OI ↓</div>
                <div className="caption">DETECTED</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">LONG BUILD-UP</div>
                <div className="status">Strong</div>
                <div className="sub green">Price ↑ OI ↑</div>
                <div className="caption">CONFIRMED</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">LONG UNWINDING</div>
                <div className="status">Low</div>
                <div className="sub">Price ↓ OI ↓</div>
                <div className="caption">IDLE</div>
            </div>

            <div className="card">
                <div className="info">i</div>
                <div className="label">SHORT BUILD-UP</div>
                <div className="status">Low</div>
                <div className="sub">Price ↓ OI ↑</div>
                <div className="caption">IDLE</div>
            </div>

        </div>
    </section>

    );
}

export default PositionBuildUpCard;