function Header() {
  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid #ddd",
        background: "#ffffff",
      }}
    >
      <h2>
        <img src="/logo.svg" alt="Logo" style={{ height: "20px", marginRight: "12px" }} />
        Options Cockpit</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          fontSize: "14px",
        }}
      >

        {/* <button>Learn</button>

        <button>⚙</button> */}
      </div>
    </header>
  );
}

export default Header;