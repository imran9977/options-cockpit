import Header from "../components/Header";
import MarketRibbon from "../components/MarketRibbon";
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

function Dashboard() {
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

  useEffect(() => {
    async function loadMarketSnapshot() {
      try {
        const response = await getMarketSnapshot();

        setMarketSnapshot(response.marketSnapshot);
        setMarketMetrics(response.marketMetrics);
      } catch (error) {
        console.error("Failed to load market snapshot:", error);
      }
    }

    // Initial load
    loadMarketSnapshot();

    // Refresh every 5 seconds
    const intervalId = setInterval(() => {
      loadMarketSnapshot();
    }, 5000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Header />

      <MarketRibbon />

      <main>
        <section >
          <h2>Market Health</h2>

          <SpotPriceCard
            niftySpot={marketSnapshot.niftySpot}
            niftyOpen={marketSnapshot.niftyOpen}
            niftyPreviousClose={marketSnapshot.niftyPreviousClose}
            niftyDayHigh={marketSnapshot.niftyDayHigh}
            niftyDayLow={marketSnapshot.niftyDayLow}
            niftyGap={marketMetrics.niftyGap}

            sensexSpot={marketSnapshot.sensexSpot}
            sensexOpen={marketSnapshot.sensexOpen}
            sensexPreviousClose={marketSnapshot.sensexPreviousClose}
            sensexDayHigh={marketSnapshot.sensexDayHigh}
            sensexDayLow={marketSnapshot.sensexDayLow}
            sensexGap={marketMetrics.sensexGap}

            indiaVix={marketSnapshot.indiaVix}
          />
        </section>

        <section >
          <h2>Price Structure</h2>

          <PriceStructureCard />
        </section>

        <section >
          <h2>Option Chain Intelligence</h2>

          <OptionChainCard />
        </section>

        <section >
          <h2>Position Build-up</h2>

          <PositionBuildUpCard />
        </section>

        <section >
          <h2>Greeks</h2>

          <GreeksCard />
        </section>

        <section>
          <h2>Confirmation</h2>

          <ConfirmationCard />
        </section>
      </main>
    </>
  );
}

export default Dashboard;