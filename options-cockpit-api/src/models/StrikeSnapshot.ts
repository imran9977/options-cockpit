export interface StrikeSnapshot {

    strike: number;

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

    ceVolume: number;
    peVolume: number;
}