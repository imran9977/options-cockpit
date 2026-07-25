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
                        Market Observations <div className="observations-chip">{
                            observations.filter(
                                observation =>
                                    new Date(observation.expiresAt).getTime() > Date.now()
                            ).length
                        }</div>
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

                <div className="observations-section">

                    <div className="observations-section-title">
                        🧠 MARKET INTELLIGENCE
                    </div>

                    {observations
                        .filter(
                            observation =>
                                new Date(observation.expiresAt).getTime() > Date.now()
                        )
                        .map((observation) => (

                            <div
                                key={observation.id}
                                className={`observation-card ${getObservationTypeClass(observation.type)}`}
                            >

                                <div className="observation-indicator"></div>

                                <div className="observation-content">

                                    <div className="observation-header">

                                        <div className="observation-headline">
                                            {observation.headline}
                                        </div>

                                        <div
                                            className={`observation-priority priority-${observation.priority}`}
                                        >
                                            {observation.priority.toUpperCase()}
                                        </div>

                                    </div>

                                    <div className="observation-summary">
                                        {observation.summary}
                                    </div>

                                    {observation.evidence?.length > 0 && (
                                        <div className="observation-evidence">

                                            {observation.evidence?.map((item, index) => (

                                                <span
                                                    key={index}
                                                    className="observation-evidence-chip"
                                                >
                                                    {item}
                                                </span>

                                            ))}

                                        </div>
                                    )}

                                    {observation.watchFor && (
                                        <div className="observation-watch-for">

                                            <div className="observation-watch-title">
                                                Watch For
                                            </div>

                                            <div className="observation-watch-message">
                                                {observation.watchFor}
                                            </div>

                                        </div>
                                    )}

                                    <div className="observation-footer">

                                        <div className="observation-driver">
                                            {observation.driver.replace("_", " ")}
                                        </div>

                                        <div className="observation-time">
                                            {observation.timestamp}
                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                </div>

                <div className="observations-section">

                    <div className="observations-section-title">
                        🎯 STRIKE INTELLIGENCE
                    </div>

                    {strikeObservations
                        .filter(
                            observation =>
                                new Date(observation.expiresAt).getTime() > Date.now()
                        )
                        .map((observation) => (

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

                                    <div className="observation-headline">
                                        {observation.headline}
                                    </div>

                                    <div className="observation-summary">
                                        {observation.summary}
                                    </div>

                                </div>

                            </div>

                        ))}

                </div>

            </div>

        </div>

    );

}