import { config } from "../config/config.js";

const NIFTY_UNDERLYING_SCRIP = 13;
const NIFTY_UNDERLYING_SEG = "IDX_I";

let cachedExpiry: string | null = null;

export async function refreshExpiry(): Promise<string> {
    const url = `${config.dhan.baseUrl}/v2/optionchain/expirylist`;

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
        }),
    });

    if (!response.ok) {
        throw new Error(`Dhan Expiry API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data?.data) || data.data.length === 0) {
        throw new Error("No expiries returned from Dhan");
    }

    const nearestExpiry = data.data[0] as string;

    cachedExpiry = nearestExpiry;

    return nearestExpiry;
}

export async function getCurrentExpiry(): Promise<string> {
    if (cachedExpiry !== null) {
        return cachedExpiry;
    }

    const expiry = await refreshExpiry();

    return expiry;
}