export interface PivotLevels {
    pivot: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
    previousHigh: number;
    previousLow: number;
    previousClose: number;
}

export interface RoundNumberLevels {
    nearestBelow50: number;
    nearestAbove50: number;
    nearestBelow100: number;
    nearestAbove100: number;
}

export interface ClassicalLevels {
    daily: PivotLevels;
    weekly: PivotLevels | null;
    roundNumbers: RoundNumberLevels;
}
