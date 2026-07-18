export interface Greeks {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
}

export interface OptionLeg {
    average_price: number;
    greeks: Greeks;
    implied_volatility: number;
    last_price: number;
    oi: number;
    previous_close_price: number;
    previous_oi: number;
    previous_volume: number;
    security_id: number;
    top_ask_price: number;
    top_ask_quantity: number;
    top_bid_price: number;
    top_bid_quantity: number;
    volume: number;
}

export interface OptionStrike {
    ce?: OptionLeg;
    pe?: OptionLeg;
}

export type OptionChain = Record<string, OptionStrike>;