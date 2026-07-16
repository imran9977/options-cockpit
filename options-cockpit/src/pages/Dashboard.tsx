import Header from "../components/Header";
import MarketRibbon from "../components/MarketRibbon";
import SpotPriceCard from "../components/dashboard/SpotPriceCard";
import PriceStructureCard from "../components/dashboard/PriceStructureCard";
import OptionChainCard from "../components/dashboard/OptionChainCard";
import PositionBuildUpCard from "../components/dashboard/PositionBuildUpCard";
import GreeksCard from "../components/dashboard/GreeksCard";
import ConfirmationCard from "../components/dashboard/ConfirmationCard";

function Dashboard() {
  const cardStyle: React.CSSProperties = {
    width: "280px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "16px",
    background: "#fff",
    marginTop: "12px",
  };

  const sectionStyle: React.CSSProperties = {
    margin: "28px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    background: "#f7f7f7",
  };

  return (
    <>
      <Header />

      <MarketRibbon />

      <main>
        <section style={sectionStyle}>
          <h2>Market Health</h2>

          <SpotPriceCard />
        </section>

        <section style={sectionStyle}>
          <h2>Price Structure</h2>

          <PriceStructureCard />
        </section>

        <section style={sectionStyle}>
          <h2>Option Chain Intelligence</h2>

          <OptionChainCard />
        </section>

        <section style={sectionStyle}>
          <h2>Position Build-up</h2>

          <PositionBuildUpCard />
        </section>

        <section style={sectionStyle}>
          <h2>Greeks</h2>

          <GreeksCard />
        </section>

        <section style={sectionStyle}>
          <h2>Confirmation</h2>

          <ConfirmationCard />
        </section>
      </main>
    </>
  );
}

export default Dashboard;