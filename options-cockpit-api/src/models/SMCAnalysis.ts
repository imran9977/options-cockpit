export interface IntradayCandle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export type SMCZoneType = "OB" | "FVG" | "IFVG" | "SWEEP";

export interface SMCZone {
    id: string;
    type: SMCZoneType;

    // Describes the candles that formed the zone - not reinterpreted
    // retroactively when an FVG inverts into an IFVG.
    direction: "bullish" | "bearish";

    // Only meaningful once a zone has a live role to play (support vs
    // resistance) - distinct from direction, which is historical.
    role?: "support" | "resistance";

    top: number;
    bottom: number;

    startTime: number;
    endTime: number | null;

    status: "active" | "filled" | "invalidated";

    // How many "average recent candles" wide this zone is - the
    // displacement that created it, relative to typical range at the
    // time. Bigger = a more forceful, meaningful move, not just a
    // technically-qualifying one. Carried over unchanged when an FVG
    // inverts into an IFVG (same underlying displacement).
    strength: number;
}

export interface SMCAnalysis {
    underlying: "NIFTY" | "SENSEX";
    intervalMinutes: number;
    candles: IntradayCandle[];
    zones: SMCZone[];
    lastUpdated: number;
}
