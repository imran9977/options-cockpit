import type { MarketEvidence } from "../models/MarketEvidence.js";

export class EvidenceEngine {

    private readonly evidence: MarketEvidence[] = [];

    add(evidence: MarketEvidence): void {

        this.evidence.push(evidence);

    }

    addMany(evidence: MarketEvidence[]): void {

        this.evidence.push(...evidence);

    }

    getAll(): MarketEvidence[] {

        return [...this.evidence];

    }

    clear(): void {

        this.evidence.length = 0;

    }

}