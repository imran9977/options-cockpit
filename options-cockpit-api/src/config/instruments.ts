export const INSTRUMENTS = {
    NIFTY: 13,
    SENSEX: 51,
    INDIA_VIX: 21,
} as const;

export type Underlying = "NIFTY" | "SENSEX";

// Dhan's option chain API returns oi/volume as raw share quantity,
// while NSE's website (and everyone's mental model of "OI") displays
// it in number of lots/contracts. Divide by lot size to match.
// Nifty lot size changed 75 -> 65 effective Jan 2026 (NSE index F&O
// revision). Sensex lot size (20) confirmed against Dhan's own
// scrip-master CSV (SEM_LOT_UNITS), not assumed, for the same reason.
export const UNDERLYING_CONFIG: Record<
    Underlying,
    { scrip: number; seg: string; lotSize: number }
> = {
    NIFTY: { scrip: INSTRUMENTS.NIFTY, seg: "IDX_I", lotSize: 65 },
    SENSEX: { scrip: INSTRUMENTS.SENSEX, seg: "IDX_I", lotSize: 20 },
};

// Single place the HTTP boundary defaults an unrecognized/missing
// underlying to Nifty - keeps that default from being copy-pasted
// across every route that accepts one.
export function parseUnderlying(value: unknown): Underlying {
    return typeof value === "string" && value.toUpperCase() === "SENSEX"
        ? "SENSEX"
        : "NIFTY";
}