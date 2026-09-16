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
    direction: "bullish" | "bearish";
    role?: "support" | "resistance";
    top: number;
    bottom: number;
    startTime: number;
    endTime: number | null;
    status: "active" | "filled" | "invalidated";
    strength: number;
}

export interface SMCAnalysis {
    underlying: "NIFTY" | "SENSEX";
    intervalMinutes: number;
    candles: IntradayCandle[];
    zones: SMCZone[];
    lastUpdated: number;
}

export interface SMCAnalysisByIndex {
    nifty: SMCAnalysis;
    sensex: SMCAnalysis;
}
