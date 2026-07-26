export interface IndexLevels {

    primarySupport: number | null;

    secondarySupport: number | null;

    primaryResistance: number | null;

    secondaryResistance: number | null;

}

export interface DailyLevels {

    date: string;

    nifty: IndexLevels;

    sensex: IndexLevels;

}