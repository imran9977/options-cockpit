import { config } from "../config/config.js";
import { INSTRUMENTS } from "../config/instruments.js";

function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

function getHistoricalDateRange(days: number) {
    const toDate = new Date();

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    return {
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
    };
}

export async function getMarketQuote() {
    const url = `${config.dhan.baseUrl}/v2/marketfeed/ohlc`;
// console.log("[getMarketQuote] Called", new Date().toISOString());
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
    const errorBody = await response.text();

    console.error("Dhan Market Quote Error");
    console.error("Status:", response.status);
    console.error("Body:", errorBody);

    throw new Error(`Dhan API Error: ${response.status}`);
}

    const data = await response.json();
// console.log("[getMarketQuote] Success");
    return data;
}

export async function getHistoricalVix() {

    const { fromDate, toDate } = getHistoricalDateRange(20);

    const url = `${config.dhan.baseUrl}/v2/charts/historical`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "access-token": config.dhan.accessToken,
            "client-id": config.dhan.clientId,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            securityId: INSTRUMENTS.INDIA_VIX,
            exchangeSegment: "IDX_I",
            instrument: "INDEX",
            fromDate,
            toDate
        })
    });

    if (!response.ok) {
        throw new Error(
            `Dhan Historical VIX API Error: ${response.status}`
        );
    }

    return response.json();
}

export async function getCommodityQuote(
    securityIds: number[]
) {

    const url = `${config.dhan.baseUrl}/v2/marketfeed/quote`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "access-token": config.dhan.accessToken,
            "client-id": config.dhan.clientId,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            MCX_COMM: securityIds
        })
    });

    if (!response.ok) {
        throw new Error(
            `Commodity Quote API Error: ${response.status}`
        );
    }

    const data = await response.json();

    return data;

    return response.json();
}