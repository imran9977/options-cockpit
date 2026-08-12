import type { StrikeAnalysis } from "./StrikeAnalysis.js";
import type { StrikeSnapshot } from "./StrikeSnapshot.js";

export interface StrikeWindowAnalysis {

    timestamp: number;

    spotPrice: number;

    atmStrike: number;

    strikes: StrikeSnapshot[];

    analyses: StrikeAnalysis[];
}