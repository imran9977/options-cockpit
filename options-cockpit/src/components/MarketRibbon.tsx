function MarketRibbon() {
  const itemStyle = {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  };

  return (
    <section
      style={{
        display: "flex",
        gap: "28px",
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
        background: "#fafafa",
        fontSize: "14px",
      }}
    >
      <div style={itemStyle}>
        <strong>NIFTY</strong>
        <span>25,245.65</span>
      </div>

      <div style={itemStyle}>
        <strong>ATM</strong>
        <span>25,250</span>
      </div>

      <div style={itemStyle}>
        <strong>Support</strong>
        <span>25,180</span>
      </div>

      <div style={itemStyle}>
        <strong>Resistance</strong>
        <span>25,320</span>
      </div>

      <div style={itemStyle}>
        <strong>Day High</strong>
        <span>25,268</span>
      </div>

      <div style={itemStyle}>
        <strong>Day Low</strong>
        <span>25,192</span>
      </div>
    </section>
  );
}

export default MarketRibbon;