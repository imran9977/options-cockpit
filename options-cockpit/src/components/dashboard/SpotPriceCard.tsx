type SpotPriceCardProps = {
    niftySpot: number;
    niftyOpen: number;
    niftyPreviousClose: number;
    niftyDayHigh: number;
    niftyDayLow: number;
    niftyDistanceFromHigh: number;
    niftyDistanceFromLow: number;
    niftyDayRange: number;
    niftyGap: number;

    sensexSpot: number;
    sensexOpen: number;
    sensexPreviousClose: number;
    sensexDayHigh: number;
    sensexDayLow: number;
    sensexDistanceFromHigh: number;
    sensexDistanceFromLow: number;
    sensexDayRange: number;
    sensexGap: number;

    indiaVix: number;
};

function SpotPriceCard({ niftySpot,
    niftyOpen,
    niftyPreviousClose,
    niftyDayHigh,
    niftyDayLow,
    niftyGap,
    niftyDistanceFromHigh,
    niftyDistanceFromLow,
    niftyDayRange,

    sensexSpot,
    sensexOpen,
    sensexPreviousClose,
    sensexDayHigh,
    sensexDayLow,
    sensexGap,
    sensexDistanceFromHigh,
    sensexDistanceFromLow,
    sensexDayRange,

    indiaVix, }: SpotPriceCardProps) {
    return (
        <section className="section section-blue">
            <div className="section-title">1 • MARKET HEALTH</div>

            <div className="grid-3">

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">NIFTY SPOT</div>
                    <div className="value">{niftySpot.toFixed(2)}</div>
                    <div className="caption">Open : {niftyOpen.toFixed(2)}</div>
                    <div className="caption">Prev Close : {niftyPreviousClose.toFixed(2)}</div>
                    <div className="caption">High : {niftyDayHigh.toFixed(2)}</div>
                    <div className="caption">Low : {niftyDayLow.toFixed(2)}</div>
                    <div className="caption">Dist. High : {niftyDistanceFromHigh.toFixed(2)}</div>
                    <div className="caption">Dist. Low : {niftyDistanceFromLow.toFixed(2)}</div>
                    <div className="caption">Range : {niftyDayRange.toFixed(2)}</div>
                    <div className="caption">Gap : {niftyGap.toFixed(2)}</div>
                    <div className="sub green">+42.30 (+0.17%)</div>
                    <div className="caption">ABOVE VWAP</div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">SENSEX SPOT</div>
                    <div className="value">{sensexSpot.toFixed(2)}</div>
                    <div className="caption">Open : {sensexOpen.toFixed(2)}</div>
                    <div className="caption">Prev Close : {sensexPreviousClose.toFixed(2)}</div>
                    <div className="caption">High : {sensexDayHigh.toFixed(2)}</div>
                    <div className="caption">Low : {sensexDayLow.toFixed(2)}</div>
                    <div className="caption">Dist. High : {sensexDistanceFromHigh.toFixed(2)}</div>
                    <div className="caption">Dist. Low : {sensexDistanceFromLow.toFixed(2)}</div>
                    <div className="caption">Range : {sensexDayRange.toFixed(2)}</div>
                    <div className="caption">Gap : {sensexGap.toFixed(2)}</div>
                    <div className="sub green">+128.45 (+0.16%)</div>
                    <div className="caption">ABOVE VWAP</div>
                </div>

                <div className="card">
                    <div className="info">i</div>
                    <div className="label">INDIA VIX</div>
                    <div className="value">{indiaVix.toFixed(2)}</div>
                    <div className="sub red">-0.24 (-1.70%)</div>
                    <div className="caption">COOLING</div>
                </div>

            </div>
        </section>
    );
}

export default SpotPriceCard;