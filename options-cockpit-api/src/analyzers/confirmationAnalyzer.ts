export type EngineBias =
    | "Bullish"
    | "Bearish"
    | "Neutral";

export interface EngineVote {
    engine: string;
    bias: EngineBias;
}

export interface ConfirmationResult {
    marketBias: EngineBias;

    confidence:
        | "High"
        | "Moderate"
        | "Low"
        | "None";

    agreement: {
        supporting: number;
        total: number;
    };

    evidence: EngineVote[];
}

export function calculateConfirmation(
    votes: EngineVote[]
): ConfirmationResult {

    let bullish = 0;
    let bearish = 0;
    let neutral = 0;

    for (const vote of votes) {

        switch (vote.bias) {

            case "Bullish":
                bullish++;
                break;

            case "Bearish":
                bearish++;
                break;

            default:
                neutral++;
                break;
        }
    }

    let marketBias: EngineBias;

    if (bullish > bearish) {
        marketBias = "Bullish";
    } else if (bearish > bullish) {
        marketBias = "Bearish";
    } else {
        marketBias = "Neutral";
    }

    const supporting =
        marketBias === "Bullish"
            ? bullish
            : marketBias === "Bearish"
                ? bearish
                : neutral;

    let confidence:
        | "High"
        | "Moderate"
        | "Low"
        | "None";

    switch (supporting) {

        case 4:
            confidence = "High";
            break;

        case 3:
            confidence = "Moderate";
            break;

        case 2:
            confidence = "Low";
            break;

        default:
            confidence = "None";
    }

    return {

        marketBias,

        confidence,

        agreement: {
            supporting,
            total: votes.length,
        },

        evidence: votes,
    };

}