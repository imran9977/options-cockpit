export enum EGBDStage {
  WATCHING = "WATCHING",
  TRIGGER_ARMED = "TRIGGER_ARMED",
  ENTRY_WINDOW = "ENTRY_WINDOW",
  MOMENTUM_BUILDING = "MOMENTUM_BUILDING",
  MOMENTUM_STRONG = "MOMENTUM_STRONG",
  MOMENTUM_WEAKENING = "MOMENTUM_WEAKENING",
  EXIT_WINDOW = "EXIT_WINDOW",
  RESET = "RESET",
}

export interface EGBDSignal {
  strike: number;
  side: "CE" | "PE";

  stage: EGBDStage;
  stageAge: number;

  premiumStrength: number;
  volumeStrength: number;
  oiStrength: number;
  gammaStrength: number;
  ivStrength: number;

  momentumScore: number;

  currentPremium: number;
  referenceEntryPrice: number | null;
  peakPremiumSinceEntry: number | null;
  multipleFromEntry: number | null;
  pullbackFromPeakPercent: number | null;
  oiConcentration: number;

  // True once this strike's IV has dropped far enough from its own
  // peak-since-armed, sustained for long enough, to count as a real
  // crash - forces EGBD's own exit and separately feeds the
  // Suggestions Panel's IV_CRASH signal.
  ivCrashed: boolean;

  evidence: string[];
}

export interface GammaExposureRow {
  strike: number;
  callPremium: number;
  putPremium: number;
  callOIChange: number;
  putOIChange: number;
  callVolumeChange: number;
  putVolumeChange: number;
  callGamma: number;
  putGamma: number;
  isATM: boolean;
}
export interface EGBDResult {

    signals: EGBDSignal[];

    activeSignal?: EGBDSignal;

    observation: string;

    gammaExposureTable: GammaExposureRow[];
}