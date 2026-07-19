import Header from "../components/Header";
import SpotPriceCard from "../components/dashboard/SpotPriceCard";
import PriceStructureCard from "../components/dashboard/PriceStructureCard";
import OptionChainCard from "../components/dashboard/OptionChainCard";
import PositionBuildUpCard from "../components/dashboard/PositionBuildUpCard";
import GreeksCard from "../components/dashboard/GreeksCard";
import ConfirmationCard from "../components/dashboard/ConfirmationCard";
import { useEffect, useState } from "react";
import { getMarketSnapshot } from "../services/dhanApi";
import type { MarketSnapshot } from "../models/MarketSnapshot";
import type { MarketMetrics } from "../models/MarketMetrics";
import type { OptionAnalysis } from "../models/OptionAnalysis";
import type { MarketHealth } from "../models/MarketHealth";
import type { VixHealth } from "../models/VixHealth";
import MarketObservationsPanel from "../components/MarketObservationsPanel";
import MarketRibbon from "../components/MarketRibbon";

function Dashboard() {

  const [optionAnalysis, setOptionAnalysis] =
    useState<OptionAnalysis>({
      spotPrice: 0,
      atmStrike: 0,
      pcr: 0,

      primarySupport: null,
      secondarySupport: null,

      primaryResistance: null,
      secondaryResistance: null,

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

      atmIV: 0,
      atmDelta: 0,
      atmGamma: 0,
      atmTheta: 0,

      marketBias: "Neutral",
      confidence: "Low",

      observations: [],
    });

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
        console.error("Failed to load market snapshot:", error);
      }
    }

    // Initial load
    loadMarketSnapshot();

    // Refresh every 5 seconds
    const intervalId = setInterval(() => {
      loadMarketSnapshot();
    }, 300000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Header />
  <MarketRibbon />
      <main className="flex gap-6 p-6">

        <div className="flex-1">

          <section>
            <h2>Market Health</h2>

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
            <h2>Price Structure</h2>

            <PriceStructureCard optionAnalysis={optionAnalysis} />
          </section>

          <section>
            <h2>Option Chain Intelligence</h2>

            <OptionChainCard optionAnalysis={optionAnalysis} />
          </section>

          <section>
            <h2>Position Build-up</h2>

            <PositionBuildUpCard optionAnalysis={optionAnalysis} />
          </section>

          <section>
            <h2>Greeks</h2>

            <GreeksCard optionAnalysis={optionAnalysis} />
          </section>

          <section>
            <h2>Confirmation</h2>

            <ConfirmationCard optionAnalysis={optionAnalysis} />
          </section>

        </div>

        <aside className="w-[340px] shrink-0">

          <MarketObservationsPanel
            observations={optionAnalysis.observations}
          />

        </aside>

      </main>
    </>
  );
}

export default Dashboard;