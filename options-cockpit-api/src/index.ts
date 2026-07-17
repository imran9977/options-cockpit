import express from "express";
import { config } from "./config/config.js";
import { getMarketQuote } from "./services/dhanApi.js";
import cors from "cors";
import { toMarketSnapshot } from "./mappers/marketSnapshotMapper.js";
import { getMarketSnapshot } from "./services/marketSnapshotService.js";

const PORT = config.port;
const app = express();

app.use(cors());

app.get("/health", (req, res) => {
    res.send("Options Cockpit API is running");
});

app.get("/market-quote", async (_, res) => {
    try {
        const data = await getMarketSnapshot();

res.json(data);
    } catch (error) {
        console.error("Market Snapshot Error:", error);

        res.status(500).json({
            error: "Failed to fetch market snapshot",
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Options Cockpit API running on port ${PORT}`);
});