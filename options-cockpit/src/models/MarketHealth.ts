export interface MarketObservation {
    trend: string;
    opening: string;
    structure: string;
    rangeState: string;
    momentum: string;
}

export interface MarketHealth {
    nifty: MarketObservation;
    sensex: MarketObservation;
}