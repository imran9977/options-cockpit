export interface ATMOptionSnapshot {
    timestamp: number;

    spotPrice: number;
    atmStrike: number;

    ceLastPrice: number;
    peLastPrice: number;

    ceOI: number;
    peOI: number;

    ceOIChange: number;
    peOIChange: number;

    ceIV: number;
    peIV: number;

    ceGamma: number;
    peGamma: number;
}