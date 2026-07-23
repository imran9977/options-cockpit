import type { StrikeSnapshot } from "./StrikeSnapshot.js";

export interface StrikeWindowSnapshot {

    timestamp: number;

    spotPrice: number;

    atmStrike: number;

    strikes: StrikeSnapshot[];
}