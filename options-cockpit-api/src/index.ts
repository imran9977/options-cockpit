import express from "express";
import { config } from "./config/config.js";
import { getMarketQuote } from "./services/dhanApi.js";
import cors from "cors";
import { toMarketSnapshot } from "./mappers/marketSnapshotMapper.js";
import { getMarketSnapshot } from "./services/marketSnapshotService.js";
import { getOptionChain } from "./services/optionChainService.js";
import { getCommodityRibbon } from "./services/commodityRibbonService.js";
import { startMarketPolling } from "./services/marketPoller.js";
import { getAllSignals, getSignalStats } from "./services/signalLogger.js";
import { getTodayEGBDLog } from "./services/egbdLogger.js";
import { parseUnderlying } from "./config/instruments.js";
import { getSMCAnalysisByIndex } from "./services/smcService.js";
import { getPriceStructureSignalsByIndex } from "./services/priceStructureSignalService.js";

const PORT = config.port;
const app = express();

app.use(cors());

app.get("/health", (req, res) => {
    res.send("Options Cockpit API is running");
});

app.get("/option-chain", async (req, res) => {
    try {
        const data = await getOptionChain(parseUnderlying(req.query.underlying));

        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch option chain",
        });
    }
});

app.get("/market-quote", async (_, res) => {
    try {
        const data = await getMarketSnapshot();

        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
    }
});

app.get("/commodities", async (_, res) => {
    try {
        const data = await getCommodityRibbon();

        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch commodity ribbon",
        });
    }
});
app.get("/signal-log", (req, res) => {
    res.json(getAllSignals(parseUnderlying(req.query.underlying)));
});

app.get("/signal-stats", (req, res) => {
    res.json(getSignalStats(parseUnderlying(req.query.underlying)));
});

app.get("/egbd-log", (req, res) => {
    res.json(getTodayEGBDLog(parseUnderlying(req.query.underlying)));
});

app.get("/smc-analysis", async (_, res) => {
    try {
        const data = await getSMCAnalysisByIndex();

        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
        });
    }
});

app.get("/price-structure-signals", async (_, res) => {
    try {
        const data = await getPriceStructureSignalsByIndex();

        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
        });
    }
});

startMarketPolling();
app.listen(PORT);