import Header from "../components/Header";
import MarketRibbon from "../components/MarketRibbon";

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

          <div style={cardStyle}>
            <h4>NIFTY Spot</h4>

            <h1>25,245.65</h1>

            <p>+42.30 (+0.17%)</p>

            <p>Above VWAP</p>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2>Price Structure</h2>

          <div style={cardStyle}>
            <h4>Support</h4>

            <h1>25,180</h1>

            <p>24 pts away</p>

            <p>Holding</p>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2>Option Chain Intelligence</h2>

          <div style={cardStyle}>
            <h4>PCR</h4>

            <h1>1.08</h1>

            <p>+0.03</p>

            <p>Increasing</p>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2>Position Build-up</h2>

          <div style={cardStyle}>
            <h4>Short Covering</h4>

            <h1>HIGH</h1>

            <p>OI ↓</p>

            <p>Bullish</p>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2>Greeks</h2>

          <div style={cardStyle}>
            <h4>IV</h4>

            <h1>18.42</h1>

            <p>-0.42</p>

            <p>Cooling</p>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2>Confirmation</h2>

          <div style={cardStyle}>
            <h4>FII Activity</h4>

            <h1>₹1,250 Cr</h1>

            <p>Net Buying</p>

            <p>Positive</p>
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;