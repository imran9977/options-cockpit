import { config } from "../config/config.js";
import { getCurrentExpiry } from "./expiryService.js";

const NIFTY_UNDERLYING_SCRIP = 13;
const NIFTY_UNDERLYING_SEG = "IDX_I";

export async function getOptionChain() {
    const expiry = await getCurrentExpiry();

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
            UnderlyingScrip: NIFTY_UNDERLYING_SCRIP,
            UnderlyingSeg: NIFTY_UNDERLYING_SEG,
            Expiry: expiry,
        }),
    });

    if (!response.ok) {
        throw new Error(`Dhan Option Chain API Error: ${response.status}`);
    }

    const data = await response.json();

    return data;
}