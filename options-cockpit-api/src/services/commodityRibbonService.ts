import { getCommodityQuote } from "./dhanApi.js";
import {
    ensureInstrumentMasterLoaded,
    getNearestFuture,
} from "./instrumentMasterService.js";

interface CommodityConfig {
    name: string;
    // Must match Dhan's SM_SYMBOL_NAME column exactly.
    symbolName: string;
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
        symbolName: "GOLD",
    },
    {
        name: "Silver",
        symbolName: "SILVER",
    },
    {
        name: "Crude Oil",
        symbolName: "CRUDEOIL",
    },
    {
        name: "Natural Gas",
        symbolName: "NATURALGAS",
    },
];

export async function getCommodityRibbon() {

    await ensureInstrumentMasterLoaded();

    const resolved = COMMODITIES
        .map(commodity => {

            const contract = getNearestFuture(commodity.symbolName);

            return {
                name: commodity.name,
                securityId: contract?.securityId ?? null,
            };
        })
        .filter(
            (commodity): commodity is { name: string; securityId: number } =>
                commodity.securityId !== null
        );

    if (resolved.length === 0) {
        return {
            commodities: [],
        };
    }

    const securityIds = resolved.map(
        commodity => commodity.securityId
    );

    const data = await getCommodityQuote(
        securityIds
    );

    const marketData = data.data.MCX_COMM;

    const commodities = resolved
        .map((commodity) => {

            const quote = marketData[commodity.securityId];

            if (!quote) {
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