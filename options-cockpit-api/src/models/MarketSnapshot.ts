export interface MarketSnapshot {
    niftySpot: number;
    niftyDayHigh: number;
    niftyDayLow: number;

    sensexSpot: number;
    sensexDayHigh: number;
    sensexDayLow: number;

    indiaVix: number;

    niftyOpen: number;
    niftyPreviousClose: number;

    sensexOpen: number;
    sensexPreviousClose: number;
}