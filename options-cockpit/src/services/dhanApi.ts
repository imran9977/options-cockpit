import { config } from "../config/config";

export async function getMarketQuote() {
    const response = await fetch(
        `${config.dhan.baseUrl}/v2/marketfeed/ltp`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "access-token": config.dhan.accessToken,
                "client-id": config.dhan.clientId,
            },
            body: JSON.stringify({
                NSE_INDEX: [
                    /* Security ID goes here */
                ],
            }),
        }
    );

    const data = await response.json();

    console.log(data);

    return data;
}