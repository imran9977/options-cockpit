import Header from "../components/Header";
import SpotPriceCard from "../components/dashboard/SpotPriceCard";
import PriceStructureCard from "../components/dashboard/PriceStructureCard";
import OptionChainCard from "../components/dashboard/OptionChainCard";
import PositionBuildUpCard from "../components/dashboard/PositionBuildUpCard";
import GreeksCard from "../components/dashboard/GreeksCard";
import ConfirmationCard from "../components/dashboard/ConfirmationCard";
import { useEffect, useState } from "react";
import { getMarketSnapshot, getSMCAnalysis, getPriceStructureSignals } from "../services/dhanApi";
import type { MarketSnapshot } from "../models/MarketSnapshot";
import type { MarketMetrics } from "../models/MarketMetrics";
import type { OptionAnalysis, OptionAnalysisByIndex } from "../models/OptionAnalysis";
import type { MarketHealth } from "../models/MarketHealth";
import type { VixHealth } from "../models/VixHealth";
import type { Underlying } from "../models/Underlying";
import type { SMCAnalysis, SMCAnalysisByIndex } from "../models/SMCAnalysis";
import type { PriceStructureSignalsByIndex } from "../models/PriceStructureSignal";
import IndexTabs from "../components/IndexTabs";
import EGBDCard from "../components/dashboard/EGBDCard";
import PriceStructureTable from "../components/PriceStructureTable";
import SuggestionsPanel from "../components/SuggestionsPanel";

const emptyOptionAnalysis: OptionAnalysis = {
  spotPrice: 0,
  atmStrike: 0,
  pcr: 0,

  primarySupport: 0,
  secondarySupport: 0,

  primaryResistance: 0,
  secondaryResistance: 0,

  pivotPoint: 0,
  weeklyPrimarySupport: null,
  weeklyPrimaryResistance: null,

  maxCallOI: 0,
  maxCallOIStrike: null,

  maxPutOI: 0,
  maxPutOIStrike: null,

  maxPain: null,

  totalCallOIChange: 0,
  totalPutOIChange: 0,
  maxCallOIAddition: 0,
  maxCallOIAdditionStrike: null,
  maxCallOIExit: 0,
  maxCallOIExitStrike: null,
  maxPutOIAddition: 0,
  maxPutOIAdditionStrike: null,
  maxPutOIExit: 0,
  maxPutOIExitStrike: null,

  oiFlowVerdict: "Balanced Positioning",

  callNetFlow: "Balanced",
  putNetFlow: "Balanced",

  callContribution: 0,
  putContribution: 0,

  longBuildUp: "Low",
  longBuildUpCount: 0,
  longBuildUpPercentage: 0,

  shortBuildUp: "Low",
  shortBuildUpCount: 0,
  shortBuildUpPercentage: 0,

  shortCovering: "Low",
  shortCoveringCount: 0,
  shortCoveringPercentage: 0,

  longUnwinding: "Low",
  longUnwindingCount: 0,
  longUnwindingPercentage: 0,

  callPositionBuildUp: {
    longBuildUp: "Low", longBuildUpCount: 0, longBuildUpPercentage: 0,
    shortBuildUp: "Low", shortBuildUpCount: 0, shortBuildUpPercentage: 0,
    shortCovering: "Low", shortCoveringCount: 0, shortCoveringPercentage: 0,
    longUnwinding: "Low", longUnwindingCount: 0, longUnwindingPercentage: 0,
  },
  putPositionBuildUp: {
    longBuildUp: "Low", longBuildUpCount: 0, longBuildUpPercentage: 0,
    shortBuildUp: "Low", shortBuildUpCount: 0, shortBuildUpPercentage: 0,
    shortCovering: "Low", shortCoveringCount: 0, shortCoveringPercentage: 0,
    longUnwinding: "Low", longUnwindingCount: 0, longUnwindingPercentage: 0,
  },
  positionBuildUpHint: "NO CLEAR SETUP",

  atmIV: 0,
  atmDelta: 0,
  atmGamma: 0,
  atmTheta: 0,

  atmPutIV: 0,
  atmPutDelta: 0,
  atmPutGamma: 0,
  atmPutTheta: 0,
  ivSkew: 0,
  expectedMove: 0,

  greeksPremiumLabel: "Fair Premium",
  greeksMovementLabel: "Steady Conditions",
  greeksEnvironment: "Fair Premium · Steady Conditions",

  marketBias: "Neutral",
  confidence: "Low",

  observations: [],
  strikeObservations: [],
  isExpiryDay: false,
};

const emptySMCAnalysis: SMCAnalysis = {
  underlying: "NIFTY",
  intervalMinutes: 5,
  candles: [],
  zones: [],
  lastUpdated: 0,
};

function Dashboard() {

  const [activeIndex, setActiveIndex] = useState<Underlying>("NIFTY");

  const [optionAnalysis, setOptionAnalysis] =
    useState<OptionAnalysisByIndex>({
      nifty: emptyOptionAnalysis,
      sensex: emptyOptionAnalysis,
    });
  const [smcAnalysis, setSMCAnalysis] =
    useState<SMCAnalysisByIndex>({
      nifty: emptySMCAnalysis,
      sensex: { ...emptySMCAnalysis, underlying: "SENSEX" },
    });
  const [priceStructureSignals, setPriceStructureSignals] =
    useState<PriceStructureSignalsByIndex>({
      nifty: [],
      sensex: [],
    });
  const [showEGBD, setShowEGBD] = useState(false);
  const [marketSnapshot, setMarketSnapshot] =
    useState<MarketSnapshot>({
      niftySpot: 0,
      niftyOpen: 0,
      niftyPreviousClose: 0,
      niftyDayHigh: 0,
      niftyDayLow: 0,

      sensexSpot: 0,
      sensexOpen: 0,
      sensexPreviousClose: 0,
      sensexDayHigh: 0,
      sensexDayLow: 0,

      indiaVix: 0,
    });

  const [marketMetrics, setMarketMetrics] =
    useState<MarketMetrics>({
      niftyDistanceFromHigh: 0,
      niftyDistanceFromLow: 0,
      niftyDayRange: 0,
      niftyGap: 0,

      sensexDistanceFromHigh: 0,
      sensexDistanceFromLow: 0,
      sensexDayRange: 0,
      sensexGap: 0,
    });

  const [marketHealth, setMarketHealth] =
    useState<MarketHealth>({
      nifty: {
        trend: "",
        opening: "",
        structure: "",
        rangeState: "",
        momentum: "",
      },
      sensex: {
        trend: "",
        opening: "",
        structure: "",
        rangeState: "",
        momentum: "",
      },
    });
  const [vixHealth, setVixHealth] =
    useState<VixHealth>({
      current: 0,
      previous: 0,
      average20Day: 0,
      high20Day: 0,
      low20Day: 0,

      regime: "",
      momentum: "",
      premiumOutlook: "",
      tradingEnvironment: "",
    });

  useEffect(() => {
    async function loadMarketSnapshot() {
      try {
        const response = await getMarketSnapshot();

        setMarketSnapshot(response.marketSnapshot);
        setMarketMetrics(response.marketMetrics);
        setMarketHealth(response.marketHealth);
        setVixHealth(response.vixHealth);
        setOptionAnalysis(response.optionAnalysis);
      } catch (error) {
      }
    }

    // Initial load
    loadMarketSnapshot();

    // Refresh every 3 seconds - matches the backend's own poll
    // interval (also 3s, Dhan's option-chain rate-limit floor).
    const intervalId = setInterval(() => {
      loadMarketSnapshot();
    }, 3000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function loadSMCAnalysis() {
      try {
        const response = await getSMCAnalysis();

        setSMCAnalysis(response);
      } catch (error) {
      }
    }

    loadSMCAnalysis();

    // 5-minute candles don't need 3-second polling - a slower,
    // independent interval from the option-snapshot poll above.
    const intervalId = setInterval(() => {
      loadSMCAnalysis();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function loadPriceStructureSignals() {
      try {
        const response = await getPriceStructureSignals();

        setPriceStructureSignals(response);
      } catch (error) {
      }
    }

    loadPriceStructureSignals();

    // Same cadence as the SMC poll above - signals derive from the
    // same 5-minute candles, no need for faster polling.
    const intervalId = setInterval(() => {
      loadPriceStructureSignals();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const activeAnalysis =
    activeIndex === "NIFTY"
      ? optionAnalysis.nifty
      : optionAnalysis.sensex;

  const activeSMCAnalysis =
    activeIndex === "NIFTY"
      ? smcAnalysis.nifty
      : smcAnalysis.sensex;

  const activePriceStructureSignals =
    activeIndex === "NIFTY"
      ? priceStructureSignals.nifty
      : priceStructureSignals.sensex;

  return (
    <>
      <Header />
      <IndexTabs active={activeIndex} onChange={setActiveIndex} />
      <main className="flex gap-6 p-6">

        <div className="flex-1">
          <section>

            <h2
              className="custom-title"
              style={{ cursor: "pointer" }}
              onClick={() => setShowEGBD(previous => !previous)}
            >
              <span>
                {showEGBD ? "▼" : "▶"} 00. Early Gamma Blast Detection
              </span>
            </h2>
            <div
              className={`egbd-accordion ${showEGBD ? "open" : ""
                }`}
            >
              <EGBDCard
                optionAnalysis={activeAnalysis}
                indexLabel={activeIndex}
              />
            </div>

          </section>
          <section>
            <h2 className="custom-title"><span>01. Market Health</span></h2>

            <SpotPriceCard
              niftySpot={marketSnapshot.niftySpot}
              niftyOpen={marketSnapshot.niftyOpen}
              niftyPreviousClose={marketSnapshot.niftyPreviousClose}
              niftyDayHigh={marketSnapshot.niftyDayHigh}
              niftyDayLow={marketSnapshot.niftyDayLow}
              niftyDistanceFromHigh={marketMetrics.niftyDistanceFromHigh}
              niftyDistanceFromLow={marketMetrics.niftyDistanceFromLow}
              niftyDayRange={marketMetrics.niftyDayRange}
              niftyGap={marketMetrics.niftyGap}

              sensexSpot={marketSnapshot.sensexSpot}
              sensexOpen={marketSnapshot.sensexOpen}
              sensexPreviousClose={marketSnapshot.sensexPreviousClose}
              sensexDayHigh={marketSnapshot.sensexDayHigh}
              sensexDayLow={marketSnapshot.sensexDayLow}
              sensexDistanceFromHigh={marketMetrics.sensexDistanceFromHigh}
              sensexDistanceFromLow={marketMetrics.sensexDistanceFromLow}
              sensexDayRange={marketMetrics.sensexDayRange}
              sensexGap={marketMetrics.sensexGap}

              indiaVix={marketSnapshot.indiaVix}
              marketHealth={marketHealth}
              vixHealth={vixHealth}
            />
          </section>

          <section>
            <h2 className="custom-title"><span>02. Price Structure</span></h2>

            <PriceStructureCard optionAnalysis={activeAnalysis} />
          </section>

          <section>
            <h2 className="custom-title"><span>03. Option Chain Intelligence</span></h2>

            <OptionChainCard optionAnalysis={activeAnalysis} />
          </section>

          <section>
            <h2 className="custom-title"><span>04. Position Build-up</span></h2>

            <PositionBuildUpCard optionAnalysis={activeAnalysis} />
          </section>

          <section>
            <h2 className="custom-title"><span>05. Greeks</span></h2>

            <GreeksCard optionAnalysis={activeAnalysis} indexLabel={activeIndex} />
          </section>

          <section>
            <h2 className="custom-title"><span>06. Confirmation</span></h2>

            <ConfirmationCard optionAnalysis={activeAnalysis} signals={activePriceStructureSignals} />
          </section>

        </div>

        <aside className="w-[357px] shrink-0">

          <div className="sidebar-stack">

            <SuggestionsPanel
              signals={activePriceStructureSignals}
              underlying={activeIndex}
            />

            <PriceStructureTable
              data={activeSMCAnalysis}
              underlying={activeIndex}
            />

          </div>

        </aside>

      </main>
    </>
  );
}

export default Dashboard;
