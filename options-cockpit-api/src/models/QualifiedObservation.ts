export interface QualifiedObservation {

    direction: "bullish" | "bearish";

    confidence: number;

    evidenceCount: number;

    supportingReasons: string[];

}