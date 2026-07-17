import { config } from "../config/config.js";
import { INSTRUMENTS } from "../config/instruments.js";

export async function getMarketQuote() {
    const url = `${config.dhan.baseUrl}/v2/marketfeed/ohlc`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "access-token": config.dhan.accessToken,
            "client-id": config.dhan.clientId,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            IDX_I: [
                INSTRUMENTS.NIFTY,
                INSTRUMENTS.SENSEX,
                INSTRUMENTS.INDIA_VIX,
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Dhan API Error: ${response.status}`);
    }

    const data = await response.json();
    // console.log('imran', JSON.stringify(data, null, 2));
    return data;
}