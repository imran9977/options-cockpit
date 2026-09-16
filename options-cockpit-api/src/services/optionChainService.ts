import { config } from "../config/config.js";
import { getCurrentExpiry, didExpiryJustChange } from "./expiryService.js";
import { UNDERLYING_CONFIG, type Underlying } from "../config/instruments.js";
import type { OptionChain, OptionLeg } from "../models/OptionChain.js";
import { clearEGBDState } from "./egbdEngine.js";
import { clearStrikeWindowHistory } from "./strikeWindowHistory.js";
import { clearATMOptionHistory } from "./atmOptionHistory.js";

function normalizeLeg(leg: OptionLeg | undefined, lotSize: number): void {

    if (!leg) {
        return;
    }

    leg.oi = Math.round(leg.oi / lotSize);
    leg.previous_oi = Math.round(leg.previous_oi / lotSize);
    leg.volume = Math.round(leg.volume / lotSize);
    leg.previous_volume = Math.round(leg.previous_volume / lotSize);
    leg.top_bid_quantity = Math.round(leg.top_bid_quantity / lotSize);
    leg.top_ask_quantity = Math.round(leg.top_ask_quantity / lotSize);
}

// Dhan returns oi/volume/quantity as raw share counts. Everything
// downstream (analyzers, NSE comparisons, your own intuition) expects
// lots - so this is the single point where that gets corrected.
function normalizeOptionChain(optionChain: OptionChain, lotSize: number): void {

    for (const strike of Object.values(optionChain)) {
        normalizeLeg(strike.ce, lotSize);
        normalizeLeg(strike.pe, lotSize);
    }
}

export async function getOptionChain(underlying: Underlying) {
    const expiry = await getCurrentExpiry(underlying);
    const { scrip, seg, lotSize } = UNDERLYING_CONFIG[underlying];

    // A strike number means a different contract on each side of a
    // rollover - state built against the expired contract (EGBD's
    // stage machine, strike/ATM history) is meaningless once the
    // nearest expiry actually changes. Scoped to this underlying only,
    // so Nifty's Tuesday rollover doesn't wipe Sensex's Thursday state.
    if (didExpiryJustChange(underlying)) {
        clearEGBDState(underlying);
        clearStrikeWindowHistory(underlying);
        clearATMOptionHistory(underlying);
    }

    const url = `${config.dhan.baseUrl}/v2/optionchain`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "access-token": config.dhan.accessToken,
            "client-id": config.dhan.clientId,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            UnderlyingScrip: scrip,
            UnderlyingSeg: seg,
            Expiry: expiry,
        }),
    });

    if (!response.ok) {
        throw new Error(`Dhan Option Chain API Error: ${response.status}`);
    }

    const data = await response.json();

    normalizeOptionChain(data.data.oc, lotSize);

    return data;
}
