import type { SMCAnalysis, SMCZone } from "../models/SMCAnalysis";
import type { Underlying } from "../models/Underlying";

type PriceStructureTableProps = {
    data: SMCAnalysis;
    underlying: Underlying;
};

// A short, curated watchlist, not a log of every qualifying pattern -
// the whole point is 2-3 trades a day, not dozens of rows.
const MAX_ROWS = 6;

function distanceFromSpot(zone: SMCZone, spot: number): number {
    if (spot >= zone.bottom && spot <= zone.top) {
        return 0;
    }
    return Math.min(Math.abs(spot - zone.top), Math.abs(spot - zone.bottom));
}

function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
    });
}

function PriceStructureTable({ data, underlying }: PriceStructureTableProps) {

    const spot = data.candles[data.candles.length - 1]?.close ?? 0;

    // data.zones is already scoped to today by the backend - no
    // separate recency cutoff needed here.
    const candidates = data.zones
        .filter(zone => zone.status !== "invalidated")
        .map(zone => ({ zone, distance: distanceFromSpot(zone, spot) }));

    // The single biggest displacement in the pool - a bigger move
    // relative to typical recent range is a more forceful, meaningful
    // zone, not just one that technically qualified. Pinned first and
    // badged regardless of how recent it is; everything else stays
    // latest-first below it.
    const strongest = candidates.length > 0
        ? candidates.reduce((best, current) => current.zone.strength > best.zone.strength ? current : best)
        : null;

    const rest = candidates
        .filter(candidate => candidate !== strongest)
        .sort((a, b) => b.zone.startTime - a.zone.startTime)
        .slice(0, strongest ? MAX_ROWS - 1 : MAX_ROWS);

    const rows = strongest ? [strongest, ...rest] : rest;

    return (
        <div className="smc-panel">

            <div className="smc-panel-header">
                <div className="smc-panel-title">Price structure</div>
                <div className="smc-panel-subtitle">
                    {underlying} &middot; {data.intervalMinutes}m
                </div>
            </div>

            <div className="smc-legend">
                <span className="smc-legend-item">
                    <span className="smc-legend-dot smc-legend-bullish" />
                    Bullish
                </span>
                <span className="smc-legend-item">
                    <span className="smc-legend-dot smc-legend-bearish" />
                    Bearish
                </span>
                <span className="smc-legend-item">
                    Spot {Math.round(spot).toLocaleString("en-IN")}
                </span>
            </div>

            <div className="smc-zone-table">

                <div className="smc-zone-table-header">
                    <span>Time</span>
                    <span>Type</span>
                    <span>Range</span>
                    <span>Status</span>
                    <span>From spot</span>
                </div>

                {rows.length === 0 && (
                    <div className="smc-zone-empty">
                        No zones worth watching right now
                    </div>
                )}

                {rows.map((row, index) => (
                    <div
                        key={row.zone.id}
                        className={
                            (row.zone.direction === "bullish"
                                ? "smc-zone-row decision-positive"
                                : "smc-zone-row decision-negative") +
                            (index === 0 && strongest ? " smc-zone-row-strongest" : "")
                        }
                    >
                        <span className="smc-zone-time">{formatTime(row.zone.startTime)}</span>
                        <span className="smc-zone-type">{row.zone.type}</span>
                        <span className="smc-zone-range">
                            {Math.round(row.zone.bottom).toLocaleString("en-IN")} - {Math.round(row.zone.top).toLocaleString("en-IN")}
                        </span>
                        <span className="smc-zone-status">{row.zone.status}</span>
                        <span className="smc-zone-distance">
                            {row.distance === 0 ? "At spot" : `${Math.round(row.distance).toLocaleString("en-IN")} pts`}
                        </span>
                    </div>
                ))}

            </div>

        </div>
    );
}

export default PriceStructureTable;
