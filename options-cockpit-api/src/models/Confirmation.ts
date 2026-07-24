export interface Confirmation {

    score: number;

    level:
        | "None"
        | "Weak"
        | "Moderate"
        | "Strong";

}