import Header from "../components/Header";
import MarketRibbon from "../components/MarketRibbon";
import SpotPriceCard from "../components/dashboard/SpotPriceCard";
import PriceStructureCard from "../components/dashboard/PriceStructureCard";
import OptionChainCard from "../components/dashboard/OptionChainCard";
import PositionBuildUpCard from "../components/dashboard/PositionBuildUpCard";
import GreeksCard from "../components/dashboard/GreeksCard";
import ConfirmationCard from "../components/dashboard/ConfirmationCard";

function Dashboard() {

  return (
    <>
      <Header />

      <MarketRibbon />

      <main>
        <section >
          <h2>Market Health</h2>

          <SpotPriceCard />
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