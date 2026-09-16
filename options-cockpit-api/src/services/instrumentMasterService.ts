import fs from "fs";
import path from "path";

// Dhan publishes a fresh instrument master file once a day.
// https://docs.dhanhq.co/api/v2/guides/instruments
const SCRIP_MASTER_URL =
    "https://images.dhan.co/api-data/api-scrip-master.csv";

const DATA_DIR = path.resolve(process.cwd(), "data");
const CACHE_FILE = path.join(DATA_DIR, "scrip-master.csv");
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Column positions in the compact CSV. Verified against a live
// download - Dhan does not document these positions directly.
const COLUMN = {
    EXCH_ID: 0,
    SEGMENT: 1,
    SECURITY_ID: 2,
    INSTRUMENT_NAME: 3,
    TRADING_SYMBOL: 5,
    EXPIRY_DATE: 8,
    SYMBOL_NAME: 15,
} as const;

export interface FutureContract {
    securityId: number;
    tradingSymbol: string;
    expiry: Date;
}

// SM_SYMBOL_NAME (e.g. "GOLD") -> all live MCX futures contracts for
// it, sorted by expiry ascending.
let futuresBySymbol: Map<string, FutureContract[]> = new Map();
let lastLoadedAt = 0;

function parseCsv(csvText: string): void {

    const lines = csvText.split("\n");
    const index = new Map<string, FutureContract[]>();

    // line 0 is the header
    for (let i = 1; i < lines.length; i++) {

        const line = lines[i];

        if (!line) {
            continue;
        }

        const columns = line.split(",");

        if (
            columns[COLUMN.EXCH_ID] !== "MCX" ||
            columns[COLUMN.SEGMENT] !== "M" ||
            columns[COLUMN.INSTRUMENT_NAME] !== "FUTCOM"
        ) {
            continue;
        }

        const symbolName = columns[COLUMN.SYMBOL_NAME]?.trim();
        const securityId = Number(columns[COLUMN.SECURITY_ID]);
        const expiry = new Date(columns[COLUMN.EXPIRY_DATE]);

        if (!symbolName || !securityId || Number.isNaN(expiry.getTime())) {
            continue;
        }

        const contract: FutureContract = {
            securityId,
            tradingSymbol: columns[COLUMN.TRADING_SYMBOL],
            expiry,
        };

        const existing = index.get(symbolName) ?? [];
        existing.push(contract);
        index.set(symbolName, existing);
    }

    for (const contracts of index.values()) {
        contracts.sort(
            (a, b) => a.expiry.getTime() - b.expiry.getTime()
        );
    }

    futuresBySymbol = index;
    lastLoadedAt = Date.now();
}

async function downloadAndCache(): Promise<string> {

    const response = await fetch(SCRIP_MASTER_URL);

    if (!response.ok) {
        throw new Error(
            `Failed to download instrument master: ${response.status}`
        );
    }

    const text = await response.text();

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(CACHE_FILE, text);

    return text;
}

function isDiskCacheFresh(): boolean {

    if (!fs.existsSync(CACHE_FILE)) {
        return false;
    }

    const age = Date.now() - fs.statSync(CACHE_FILE).mtimeMs;

    return age < REFRESH_INTERVAL_MS;
}

export async function ensureInstrumentMasterLoaded(): Promise<void> {

    const inMemoryFresh =
        futuresBySymbol.size > 0 &&
        Date.now() - lastLoadedAt < REFRESH_INTERVAL_MS;

    if (inMemoryFresh) {
        return;
    }

    if (isDiskCacheFresh()) {
        parseCsv(fs.readFileSync(CACHE_FILE, "utf-8"));
        return;
    }

    const text = await downloadAndCache();

    parseCsv(text);
}

export function getNearestFuture(
    symbolName: string
): FutureContract | null {

    const contracts = futuresBySymbol.get(symbolName);

    if (!contracts || contracts.length === 0) {
        return null;
    }

    const now = Date.now();

    return (
        contracts.find(contract => contract.expiry.getTime() > now) ?? null
    );
}
