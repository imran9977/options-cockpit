export type SignalDirection = "bullish" | "bearish";

export interface SignalCheckpoint {
    price: number | null;
    deltaPoints: number | null;
    deltaPercent: number | null;
    filledAt: number | null;
}

export interface SignalCheckpoints {
    min5: SignalCheckpoint;
    min15: SignalCheckpoint;
    min30: SignalCheckpoint;
    min60: SignalCheckpoint;
}

export interface SignalLogEntry {
    id: string;
    firedAt: number;
    firedAtLabel: string;
    direction: SignalDirection;
    confidence: number;
    entrySpotPrice: number;
    entryAtmStrike: number;
    checkpoints: SignalCheckpoints;
}

export interface HorizonStats {
    horizon: keyof SignalCheckpoints;
    sampleSize: number;
    correctCount: number;
    incorrectCount: number;
    winRate: number | null;
}
