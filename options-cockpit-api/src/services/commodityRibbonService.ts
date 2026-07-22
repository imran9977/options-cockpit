import { getCommodityQuote } from "./dhanApi.js";

interface CommodityConfig {
    name: string;
    securityId: number;
}

interface CommodityRibbonItem {
    name: string;
    ltp: number;
    change: number;
    changePercent: number;
}

const COMMODITIES: CommodityConfig[] = [
    {
        name: "Gold",
        securityId: 466583,
    },
    {
        name: "Silver",
        securityId: 471725,
    },
    {
        name: "Crude Oil",
        securityId: 560977,
    },
    {
        name: "Natural Gas",
        securityId: 538685,
    },
];

export async function getCommodityRibbon() {

    const securityIds = COMMODITIES.map(
        commodity => commodity.securityId
    );

    const data = await getCommodityQuote(
        securityIds
    );

    const marketData = data.data.MCX_COMM;

    const commodities = COMMODITIES
        .map((commodity) => {

            const quote = marketData[commodity.securityId];

            if (!quote) {
             console.log(
        `[CommodityRibbon] Missing quote for ${commodity.name} (${commodity.securityId})`
    );
                return null;
            }

            const ltp = quote.last_price;

            const change = quote.net_change;

            const changePercent = Number(
                (
                    (change / quote.ohlc.close) * 100
                ).toFixed(2)
            );

            return {
                name: commodity.name,
                ltp,
                change,
                changePercent,
            };
        });

    return {
        commodities,
    };
}