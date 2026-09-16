import React from "react";
import type { OptionAnalysis } from "../../models/OptionAnalysis";
import type { GammaExposureRow, EGBDSignal } from "../../models/EGBD";
import type { Underlying } from "../../models/Underlying";

type EGBDCardProps = {
  optionAnalysis: OptionAnalysis;
  indexLabel: Underlying;
};

// Backend scans the full ATM ± 10 window for analysis - more
// candidates scanned means a better chance of catching a blast
// wherever it actually happens. Displaying all 21 rows here would
// crowd out the rest of the dashboard, so this only trims what's
// shown, centered on whatever EGBD is actually watching right now
// (falling back to the ATM row when nothing's currently armed).
const DISPLAY_RADIUS = 2;

function getDisplayRows(
  table: GammaExposureRow[],
  activeSignal: EGBDSignal | undefined
): GammaExposureRow[] {

  if (table.length === 0) {
    return table;
  }

  const centerStrike =
    activeSignal?.strike ??
    table.find(row => row.isATM)?.strike;

  const centerIndex = table.findIndex(
    row => row.strike === centerStrike
  );

  if (centerIndex === -1) {
    return table;
  }

  const start = Math.max(0, centerIndex - DISPLAY_RADIUS);
  const end = Math.min(table.length, centerIndex + DISPLAY_RADIUS + 1);

  return table.slice(start, end);
}

// Same green=bullish/red=bearish principle as the rest of the
// dashboard: Call OI building is bearish (resistance strengthening),
// Put OI building is bullish (support strengthening) - mirrored.
function callOIChangeClass(value: number): string {
  if (value > 0) return "decision-negative";
  if (value < 0) return "decision-positive";
  return "decision-neutral";
}

function putOIChangeClass(value: number): string {
  if (value > 0) return "decision-positive";
  if (value < 0) return "decision-negative";
  return "decision-neutral";
}

function formatOIChange(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function formatVolumeChange(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}`;
}

// Holder-centric, not market-direction: is this specific option above
// or below where it would have been bought (reference/peak), not
// whether the market is bullish or bearish.
function multipleClass(multiple: number): string {
  return multiple >= 1 ? "decision-positive" : "decision-negative";
}

function pullbackClass(pullbackPercent: number): string {
  return pullbackPercent <= 0 ? "decision-positive" : "decision-negative";
}

function EGBDCard({
  optionAnalysis,
  indexLabel,
}: EGBDCardProps) {

  // EGBD only watches for gamma blasts on the actual expiry day -
  // that's specifically when this squeeze dynamic happens, checked
  // against the real Dhan expiry date rather than assuming a fixed
  // weekday (Nifty and Sensex don't even share the same one).
  // Shown as its own distinct state rather than a busy card sitting
  // on "WATCHING" all day, which would look identical to "quiet."
  if (!optionAnalysis.isExpiryDay) {
    return (
      <section className="section">
        <div className="card egbd-panel">

          <div className="egbd-header">
            <h2 className="egbd-title">
              EARLY GAMMA BLAST DETECTION
            </h2>

            <div className="egbd-chip-group">
              <span className="egbd-chip inactive">
                INACTIVE
              </span>
            </div>
          </div>

          <div className="egbd-inactive-message">
            Not an expiry day. EGBD only watches for gamma blasts on {indexLabel}'s
            actual expiry day, since that&apos;s specifically when this
            squeeze dynamic happens - check back then.
          </div>

        </div>
      </section>
    );
  }

  const egbd = optionAnalysis.egbd;

  const activeSignal = egbd?.activeSignal;

  const displayRows = getDisplayRows(
    egbd?.gammaExposureTable ?? [],
    activeSignal
  );

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
                ? activeSignal.momentumScore >= 15
                  ? "HIGH"
                  : activeSignal.momentumScore >= 7
                    ? "MEDIUM"
                    : "LOW"
                : "LOW"}
            </span>

            <span className="egbd-chip oi-backing" title="How this strike's OI compares to the biggest OI wall in the window">
              {activeSignal
                ? activeSignal.oiConcentration >= 0.7
                  ? "STRONG WALL"
                  : activeSignal.oiConcentration >= 0.3
                    ? "MODERATE WALL"
                    : "THIN WALL"
                : "THIN WALL"}
            </span>

          </div>

        </div>

        <div className="egbd-divider" />

        {/* Lifecycle */}

        <div className="egbd-lifecycle">

          {lifecycle.map((stage, index) => {

            const isActive = stage === activeStage;

            return (

              <React.Fragment key={stage}>

                <div
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

              </React.Fragment>

            );

          })}

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

              <div className="label">Since Entry</div>

              {activeSignal?.referenceEntryPrice != null &&
                activeSignal.peakPremiumSinceEntry != null &&
                activeSignal.multipleFromEntry != null &&
                activeSignal.pullbackFromPeakPercent != null ? (
                <>
                  <div className="egbd-price-row">
                    <span>Entry</span>
                    <span>₹{activeSignal.referenceEntryPrice.toFixed(2)}</span>
                  </div>

                  <div className="egbd-price-row">
                    <span>Now</span>
                    <span className={multipleClass(activeSignal.multipleFromEntry)}>
                      ₹{activeSignal.currentPremium.toFixed(2)} ({activeSignal.multipleFromEntry}x)
                    </span>
                  </div>

                  <div className="egbd-price-row">
                    <span>Peak</span>
                    <span className={pullbackClass(activeSignal.pullbackFromPeakPercent)}>
                      ₹{activeSignal.peakPremiumSinceEntry.toFixed(2)} (-{activeSignal.pullbackFromPeakPercent}%)
                    </span>
                  </div>
                </>
              ) : (
                <div className="egbd-price-placeholder">
                  Not armed yet
                </div>
              )}

            </div>

            {/* <div className="egbd-observation">

              <div className="label">
                Observation
              </div>

              <div className="egbd-observation-text">

                {egbd?.observation ??
                  "Monitoring for early gamma expansion around the ATM strike."}

              </div>

            </div> */}
          </div>

          {/* Right Panel */}

          <div className="egbd-right-panel">

            <div className="egbd-table-header">

              <div className="egbd-table-title">
                {activeSignal
                  ? `LIVE GAMMA EXPOSURE (AROUND ${activeSignal.strike} ${activeSignal.side})`
                  : `LIVE GAMMA EXPOSURE (ATM ± ${DISPLAY_RADIUS} STRIKES)`}
              </div>

              <div className="egbd-refresh">

                Refresh: 5s

                <span className="live-dot"></span>

              </div>

            </div>

            {/* Table comes next */}
            <div className="egbd-gamma-table">

              <div className="egbd-gamma-header">
                <div>CE Prem</div>
                <div>CE ΔVol</div>
                <div>CE ΔOI</div>
                <div>CE Γ</div>
                <div>Strike</div>
                <div>PE Γ</div>
                <div>PE ΔOI</div>
                <div>PE ΔVol</div>
                <div>PE Prem</div>
              </div>

              {displayRows.length > 0 ? (

                displayRows.map((row) => (

                  <div
                    key={row.strike}
                    className={
                      row.isATM
                        ? "egbd-gamma-row atm"
                        : "egbd-gamma-row"
                    }
                  >

                    <div className="egbd-premium">
                      ₹{row.callPremium.toFixed(2)}
                    </div>

                    <div className="egbd-volume-change">
                      {formatVolumeChange(row.callVolumeChange)}
                    </div>

                    <div className={`egbd-oi-change ${callOIChangeClass(row.callOIChange)}`}>
                      {formatOIChange(row.callOIChange)}
                    </div>

                    <div className="gamma-call">
                      {row.callGamma.toFixed(3)}
                    </div>

                    <div className="gamma-strike">
                      {row.strike}
                    </div>

                    <div className="gamma-put">
                      {row.putGamma.toFixed(3)}
                    </div>

                    <div className={`egbd-oi-change ${putOIChangeClass(row.putOIChange)}`}>
                      {formatOIChange(row.putOIChange)}
                    </div>

                    <div className="egbd-volume-change">
                      {formatVolumeChange(row.putVolumeChange)}
                    </div>

                    <div className="egbd-premium">
                      ₹{row.putPremium.toFixed(2)}
                    </div>

                  </div>

                ))

              ) : (

                // Blank placeholder rows while the window is still
                // warming up (e.g. right after server start) - fixed
                // fake numbers here used to be Nifty-scale, which read
                // as an actual bug on Sensex's ~80,000-level strikes.
                <>
                  <div className="egbd-gamma-row">
                    <div className="egbd-premium">--</div>
                    <div className="egbd-volume-change">--</div>
                    <div className="egbd-oi-change decision-neutral">--</div>
                    <div>--</div>
                    <div>--</div>
                    <div>--</div>
                    <div className="egbd-oi-change decision-neutral">--</div>
                    <div className="egbd-volume-change">--</div>
                    <div className="egbd-premium">--</div>
                  </div>

                  <div className="egbd-gamma-row atm">
                    <div className="egbd-premium">--</div>
                    <div className="egbd-volume-change">--</div>
                    <div className="egbd-oi-change decision-neutral">--</div>
                    <div>--</div>
                    <div>--</div>
                    <div>--</div>
                    <div className="egbd-oi-change decision-neutral">--</div>
                    <div className="egbd-volume-change">--</div>
                    <div className="egbd-premium">--</div>
                  </div>

                  <div className="egbd-gamma-row">
                    <div className="egbd-premium">--</div>
                    <div className="egbd-volume-change">--</div>
                    <div className="egbd-oi-change decision-neutral">--</div>
                    <div>--</div>
                    <div>--</div>
                    <div>--</div>
                    <div className="egbd-oi-change decision-neutral">--</div>
                    <div className="egbd-volume-change">--</div>
                    <div className="egbd-premium">--</div>
                  </div>
                </>

              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default EGBDCard;