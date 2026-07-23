import type { StrikeAnalysis } from "./StrikeAnalysis.js";

export interface StrikeWindowAnalysis {
    timestamp: number;
    spotPrice: number;
    atmStrike: number;
    analyses: StrikeAnalysis[];
}