import { config } from "../config/config.js";

export async function getMarketQuote() {
    const url = `${config.dhan.baseUrl}/v2/marketfeed/ltp`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "access-token": config.dhan.accessToken,
            "client-id": config.dhan.clientId,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            IDX_I: [13]
        })
    });

    if (!response.ok) {
        throw new Error(`Dhan API Error: ${response.status}`);
    }

    return await response.json();
}