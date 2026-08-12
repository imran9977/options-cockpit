import type { OptionAnalysis } from "../../models/OptionAnalysis";

type EGBDCardProps = {
  optionAnalysis: OptionAnalysis;
};

function EGBDCard({
  optionAnalysis,
}: EGBDCardProps) {
  const egbd = optionAnalysis.egbd;

  const activeSignal = egbd?.activeSignal;

  const lifecycle = [
    "Watching",
    "Trigger Armed",
    "Window Open",
    "Building",
    "Strong",
    "Weakening",
    "Exit Window",
    "Reset",
  ];



  const activeStage = activeSignal
    ? String(activeSignal.stage)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
    : "Watching";

  return (
    <section className="section">
     

      <div className="card egbd-panel">

        {/* Header */}

        <div className="egbd-header">

          <h2 className="egbd-title">
            EARLY GAMMA BLAST DETECTION
          </h2>

          <div className="egbd-chip-group">

            <span className="egbd-chip status">
              {activeSignal?.stage ?? "WATCHING"}
            </span>

            <span className="egbd-chip confidence">
              {activeSignal
                ? activeSignal.momentumScore >= 20
                  ? "HIGH"
                  : activeSignal.momentumScore >= 10
                    ? "MEDIUM"
                    : "LOW"
                : "LOW"}
            </span>

          </div>

        </div>

        {/* Main Content */}

        <div className="egbd-content">

          {/* Left Panel */}

          <div className="egbd-left-panel">

            <div className="egbd-trigger-block">

              <div className="label">Candidate</div>

              <div className="egbd-candidate">
                {activeSignal
                  ? `${activeSignal.strike} ${activeSignal.side}`
                  : "--"}
              </div>

            </div>

            <div className="egbd-trigger-block">

              <div className="label">Primary</div>

              <div className="egbd-trigger-value">
              {egbd?.primaryTrigger ?? "--"}
              </div>

            </div>

            <div className="egbd-trigger-block">

              <div className="label">Secondary</div>

              <div className="egbd-trigger-value">
               {egbd?.secondaryTrigger ?? "--"}
              </div>

            </div>

            <div className="egbd-trigger-block">

              <div className="label">Invalidation</div>

              <div className="egbd-trigger-value decision-negative">
                {egbd?.invalidation ?? "--"}
              </div>

            </div>
            <div className="egbd-observation">

              <div className="label">
                Observation
              </div>

              <div className="egbd-observation-text">

                {egbd?.observation ??
                  "Monitoring for early gamma expansion around the ATM strike."}

              </div>

            </div>
          </div>

          {/* Right Panel */}

          <div className="egbd-right-panel">

            <div className="egbd-table-header">

              <div className="egbd-table-title">
                LIVE GAMMA EXPOSURE (ATM ± 2 STRIKES)
              </div>

              <div className="egbd-refresh">

                Refresh: 5s

                <span className="live-dot"></span>

              </div>

            </div>

            {/* Table comes next */}
            <div className="egbd-gamma-table">

              <div className="egbd-gamma-header">
                <div>CE Γ</div>
                <div>Strike</div>
                <div>PE Γ</div>
              </div>

              {(egbd?.gammaExposureTable?.length ?? 0) > 0 ? (

                egbd!.gammaExposureTable.map((row) => (

                  <div
                    key={row.strike}
                    className={
                      row.isATM
                        ? "egbd-gamma-row atm"
                        : "egbd-gamma-row"
                    }
                  >

                    <div className="gamma-call">
                      {row.callGamma.toFixed(3)}
                    </div>

                    <div className="gamma-strike">
                      {row.strike}
                    </div>

                    <div className="gamma-put">
                      {row.putGamma.toFixed(3)}
                    </div>

                  </div>

                ))

              ) : (

                <>
                  <div className="egbd-gamma-row">
                    <div>0.145</div>
                    <div>24250</div>
                    <div>0.118</div>
                  </div>

                  <div className="egbd-gamma-row atm">
                    <div>0.182</div>
                    <div>24300</div>
                    <div>0.176</div>
                  </div>

                  <div className="egbd-gamma-row">
                    <div>0.131</div>
                    <div>24350</div>
                    <div>0.154</div>
                  </div>
                </>

              )}

            </div>

          </div>

        </div>

        <div className="egbd-divider" />

        {/* Lifecycle */}

        <div className="egbd-lifecycle">

          {lifecycle.map((stage, index) => {

            const isActive = stage === activeStage;

            return (

              <>

                <div
                  key={stage}
                  className={
                    isActive
                      ? "egbd-stage active"
                      : "egbd-stage"
                  }
                >
                  {stage}
                </div>

                {index < lifecycle.length - 1 && (
                  <div className="egbd-stage-connector" />
                )}

              </>

            );

          })}

        </div>


      </div>
    </section>
  );
}

export default EGBDCard;