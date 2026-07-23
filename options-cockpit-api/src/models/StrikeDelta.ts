export interface StrikeDelta {

    strike: number;

    cePremiumChange: number;
    pePremiumChange: number;

    ceOIChange: number;
    peOIChange: number;

    ceVolumeChange: number;
    peVolumeChange: number;

    ceIVChange: number;
    peIVChange: number;

    ceGammaChange: number;
    peGammaChange: number;
}