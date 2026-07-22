import type { MarketHealth } from "../../models/MarketHealth";
import type { VixHealth } from "../../models/VixHealth";
import InfoPopover from "../common/InfoPopover";

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
    marketHealth: MarketHealth;
    vixHealth: VixHealth;
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

    indiaVix, marketHealth, vixHealth }: SpotPriceCardProps) {
    function observationClass(value: string): string {

        const positive = [
            "Bullish",
            "Gap Up",
            "Above VWAP",
            "Strong Buying",
            "Moderate Buying"
        ];

        const negative = [
            "Bearish",
            "Gap Down",
            "Below VWAP",
            "Strong Selling",
            "Moderate Selling"
        ];

        if (positive.includes(value))
            return "oc-observation-value oc-observation-positive";

        if (negative.includes(value))
            return "oc-observation-value oc-observation-negative";

        return "oc-observation-value oc-observation-neutral";
    }
    return (
        <section className="section section-blue">
            <div className="section-title">1 • MARKET HEALTH</div>

            <div className="grid-3">

                <div className="card">
                    <div className="info metric-info">
                        i

                        <InfoPopover
                            title="NIFTY"
                            sections={[
                                {
                                    title: "Current Market",
                                    rows: [
                                        {
                                            label: "Spot",
                                            value: niftySpot.toFixed(2),
                                        },
                                        {
                                            label: "Open",
                                            value: niftyOpen.toFixed(2),
                                        },
                                        {
                                            label: "Previous Close",
                                            value: niftyPreviousClose.toFixed(2),
                                        },
                                        {
                                            label: "High",
                                            value: niftyDayHigh.toFixed(2),
                                        },
                                        {
                                            label: "Low",
                                            value: niftyDayLow.toFixed(2),
                                        },
                                    ],
                                },

                                {
                                    title: "Observations",
                                    rows: [
                                        {
                                            label: "Trend",
                                            value: marketHealth.nifty.trend,
                                            valueClassName: observationClass(marketHealth.nifty.trend),
                                        },
                                        {
                                            label: "Opening",
                                            value: marketHealth.nifty.opening,
                                            valueClassName: observationClass(marketHealth.nifty.opening),
                                        },
                                        {
                                            label: "Structure",
                                            value: marketHealth.nifty.structure,
                                            valueClassName: observationClass(marketHealth.nifty.structure),
                                        },
                                        {
                                            label: "Range",
                                            value: marketHealth.nifty.rangeState,
                                            valueClassName: observationClass(marketHealth.nifty.rangeState),
                                        },
                                        {
                                            label: "Momentum",
                                            value: marketHealth.nifty.momentum,
                                            valueClassName: observationClass(marketHealth.nifty.momentum),
                                        },
                                    ],
                                },
                            ]}
                        />

                    </div>
                    <div className="label">NIFTY SPOT</div>
                    <div className="value">{niftySpot.toFixed(2)}</div>

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Trend</span>
                        <span className={observationClass(marketHealth.nifty.trend)}>
                            {marketHealth.nifty.trend}
                        </span>
                    </div>

                    {/* <div className="oc-observation-row">
                        <span className="oc-observation-label">Opening</span>
                        <span className={observationClass(marketHealth.nifty.opening)}>
                            {marketHealth.nifty.opening}
                        </span>
                    </div> */}

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Structure</span>
                        <span className={observationClass(marketHealth.nifty.structure)}>
                            {marketHealth.nifty.structure}
                        </span>
                    </div>

                    {/* <div className="oc-observation-row">
                        <span className="oc-observation-label">Range</span>
                        <span className={observationClass(marketHealth.nifty.rangeState)}>
                            {marketHealth.nifty.rangeState}
                        </span>
                    </div> */}

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Momentum</span>
                        <span className={observationClass(marketHealth.nifty.momentum)}>
                            {marketHealth.nifty.momentum}
                        </span>
                    </div>
                </div>

                <div className="card">
                    <div className="info metric-info">
                        i

                        <InfoPopover
                            title="SENSEX"
                            sections={[
                                {
                                    title: "Current Market",
                                    rows: [
                                        {
                                            label: "Spot",
                                            value: sensexSpot.toFixed(2),
                                        },
                                        {
                                            label: "Open",
                                            value: sensexOpen.toFixed(2),
                                        },
                                        {
                                            label: "Previous Close",
                                            value: sensexPreviousClose.toFixed(2),
                                        },
                                        {
                                            label: "High",
                                            value: sensexDayHigh.toFixed(2),
                                        },
                                        {
                                            label: "Low",
                                            value: sensexDayLow.toFixed(2),
                                        },
                                    ],
                                },

                                {
                                    title: "Observations",
                                    rows: [
                                        {
                                            label: "Trend",
                                            value: marketHealth.sensex.trend,
                                            valueClassName: observationClass(marketHealth.sensex.trend),
                                        },
                                        {
                                            label: "Opening",
                                            value: marketHealth.sensex.opening,
                                            valueClassName: observationClass(marketHealth.sensex.opening),
                                        },
                                        {
                                            label: "Structure",
                                            value: marketHealth.sensex.structure,
                                            valueClassName: observationClass(marketHealth.sensex.structure),
                                        },
                                        {
                                            label: "Range",
                                            value: marketHealth.sensex.rangeState,
                                            valueClassName: observationClass(marketHealth.sensex.rangeState),
                                        },
                                        {
                                            label: "Momentum",
                                            value: marketHealth.sensex.momentum,
                                            valueClassName: observationClass(marketHealth.sensex.momentum),
                                        },
                                    ],
                                },
                            ]}
                        />

                    </div>
                    <div className="label">SENSEX SPOT</div>
                    <div className="value">{sensexSpot.toFixed(2)}</div>

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Trend</span>
                        <span className={observationClass(marketHealth.sensex.trend)}>
                            {marketHealth.sensex.trend}
                        </span>
                    </div>

                    {/* <div className="oc-observation-row">
                        <span className="oc-observation-label">Opening</span>
                        <span className={observationClass(marketHealth.sensex.opening)}>
                            {marketHealth.sensex.opening}
                        </span>
                    </div> */}

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Structure</span>
                        <span className={observationClass(marketHealth.sensex.structure)}>
                            {marketHealth.sensex.structure}
                        </span>
                    </div>

                    {/* <div className="oc-observation-row">
                        <span className="oc-observation-label">Range</span>
                        <span className={observationClass(marketHealth.sensex.rangeState)}>
                            {marketHealth.sensex.rangeState}
                        </span>
                    </div> */}

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Momentum</span>
                        <span className={observationClass(marketHealth.sensex.momentum)}>
                            {marketHealth.sensex.momentum}
                        </span>
                    </div>
                </div>

                <div className="card">
                    <div className="info metric-info">
                        i

                        <InfoPopover
                            title="INDIA VIX"
                            sections={[
                              
                                {
                                    title: "Historical",
                                    rows: [
                                        {
                                            label: "Previous",
                                            value: vixHealth.previous.toFixed(2),
                                        },
                                        {
                                            label: "20D Average",
                                            value: vixHealth.average20Day.toFixed(2),
                                        },
                                        {
                                            label: "20D High",
                                            value: vixHealth.high20Day.toFixed(2),
                                        },
                                        {
                                            label: "20D Low",
                                            value: vixHealth.low20Day.toFixed(2),
                                        },
                                    ],
                                }
                               
                            ]}
                        />
                    </div>
                    <div className="label">INDIA VIX</div>
                    <div className="value">{indiaVix.toFixed(2)}</div>
                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Regime</span>
                        <span className="oc-observation-value oc-observation-neutral">{vixHealth.regime}</span>
                    </div>

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Momentum</span>
                        <span className="oc-observation-value oc-observation-negative">{vixHealth.momentum}</span>
                    </div>

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Premium</span>
                        <span className="oc-observation-value oc-observation-negative">{vixHealth.premiumOutlook}</span>
                    </div>

                    <div className="oc-observation-row">
                        <span className="oc-observation-label">Environment</span>
                        <span className="oc-observation-value oc-observation-positive">{vixHealth.tradingEnvironment}</span>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default SpotPriceCard;