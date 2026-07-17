import express from "express";
import { config } from "./config/config.js";
import { getMarketQuote } from "./services/dhanApi.js";

const PORT = config.port;
const app = express();

app.get("/health", (req, res) => {
    res.send("Options Cockpit API is running");
});

app.get("/market-quote", async (req, res) => {
    try {
        const data = await getMarketQuote();
        res.json(data);
    } catch (error) {
        console.error("Market Quote Error:", error);

        res.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Options Cockpit API running on port ${PORT}`);
});