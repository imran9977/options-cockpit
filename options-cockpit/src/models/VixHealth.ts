export interface VixHealth {
    current: number;
    previous: number;
    average20Day: number;
    high20Day: number;
    low20Day: number;

    regime: string;
    momentum: string;
    premiumOutlook: string;
    tradingEnvironment: string;
}