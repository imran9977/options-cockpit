import { useState } from "react";
import DailyLevelsModal from "./DailyLevelsModal/DailyLevelsModal";

function Header() {

  const [isDailyLevelsOpen, setIsDailyLevelsOpen] = useState(false);

  return (
    <>
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
          <img
            src="/logo.svg"
            alt="Logo"
            style={{
              height: "20px",
              marginRight: "12px",
            }}
          />
          Options Cockpit
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: "14px",
          }}
        >
          <button
            className="daily-level-button"
            onClick={() => setIsDailyLevelsOpen(true)}
          >
            Daily Levels
          </button>

          {/* <button>⚙</button> */}
        </div>
      </header>

      <DailyLevelsModal
        isOpen={isDailyLevelsOpen}
        onClose={() => setIsDailyLevelsOpen(false)}
      />
    </>
  );
}

export default Header;