export interface StrikeMomentum {

    strike: number;

    ceVelocity: number;
    peVelocity: number;

    ceAcceleration: number;
    peAcceleration: number;

    dominantSide: "CE" | "PE" | "Neutral";

    momentumScore: number;
}