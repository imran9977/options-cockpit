import type { MarketObservation } from "../models/MarketObservation";

interface MarketObservationsPanelProps {
    observations: MarketObservation[];
    strikeObservations: MarketObservation[];
}

export default function MarketObservationsPanel({
    observations,
    strikeObservations,
}: MarketObservationsPanelProps) {

    const getObservationTypeClass = (
        type: MarketObservation["type"]
    ) => {
        switch (type) {

            case "bullish":
                return "observation-bullish";

            case "bearish":
                return "observation-bearish";

            default:
                return "observation-neutral";

        }
    };

    return (

        <div className="observations-panel">

            <div className="observations-header">

                <div>

                    <div className="observations-title">
                        Market Observations <div className="observations-chip">{observations.length}</div>
                        <div className="observations-live">

                            <span className="live-dot"></span>

                            LIVE

                        </div>
                    </div>

                    <div className="observations-subtitle">
                        Real-time market intelligence
                    </div>

                </div>



            </div>

            {/* <div className="observations-summary">

                <div className="observations-count">
                    {allObservations.length} Active
                </div>

            </div> */}

            <div className="observations-body">

                {observations.length === 0 && (

                    <div className="observations-empty">

                        <div className="empty-icon">
                            📈
                        </div>

                        <div className="empty-title">
                            No Active Observations
                        </div>

                        <div className="empty-description">

                            Monitoring live market conditions...

                        </div>

                        <div className="monitoring-list">

                            <div className="monitor-item">
                                ✓ Put Call Ratio (PCR)
                            </div>

                            <div className="monitor-item">
                                ✓ Position Build-up
                            </div>

                            <div className="monitor-item">
                                ✓ ATM Behaviour
                            </div>

                            <div className="monitor-item">
                                ✓ Delta Momentum
                            </div>

                            <div className="monitor-item">
                                ✓ Support Levels
                            </div>

                            <div className="monitor-item">
                                ✓ Resistance Levels
                            </div>

                            <div className="monitor-item">
                                ✓ Max Pain
                            </div>

                            <div className="monitor-item">
                                ✓ Market Bias
                            </div>

                        </div>

                    </div>

                )}

                {observations.map((observation) => (

                    <div
                        key={observation.id}
                        className={`observation-card ${getObservationTypeClass(observation.type)}`}
                    >

                        <div className="observation-indicator"></div>

                        <div className="observation-content">
                            <div className="observation-footer">

                                <div className="observation-driver">

                                    {observation.driver.replace("_", " ")}

                                </div>

                                <div className="observation-time">

                                    {observation.timestamp}

                                </div>

                            </div>
                            <div className="observation-message">

                                {observation.message}

                            </div>



                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}