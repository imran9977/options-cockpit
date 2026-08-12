export interface MetricMomentum {

    velocity: number;

    acceleration: number;

    momentumScore: number;
}

export interface StrikeLegMomentum {

    strike: number;

    side: "CE" | "PE";

    premium: MetricMomentum;

    oi: MetricMomentum;

    volume: MetricMomentum;

    gamma: MetricMomentum;

    iv: MetricMomentum;
}