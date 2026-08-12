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

  evidence: string[];
}

export interface GammaExposureRow {
  strike: number;
  callGamma: number;
  putGamma: number;
  isATM: boolean;
}
export interface EGBDResult {

    signals: EGBDSignal[];

    activeSignal?: EGBDSignal;

    primaryTrigger: number;

    secondaryTrigger: number;

    invalidation: number;

    observation: string;

    gammaExposureTable: GammaExposureRow[];
}