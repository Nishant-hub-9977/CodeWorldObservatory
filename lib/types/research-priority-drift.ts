import type { ResearchPriorityClass, ResearchPriorityLevel, ResearchPrioritySignal, ResearchPrioritizationContext } from "./research-prioritization";

// ─── Priority Drift Types ────────────────────────────────────────────
// Phase 20: Typed model for tracking how research prioritization
// posture changes across successive computations. Drift is descriptive,
// not causal proof. It records observable changes in priority class,
// advisory level, evidence gaps, and recommended focus — bounded by
// whatever snapshot history is available.

export type PriorityDriftKind =
    | "appeared"          // signal absent in prior snapshot, present now
    | "disappeared"       // signal present in prior snapshot, absent now
    | "class-stable"      // same priority class, but other fields changed
    | "level-changed"     // advisory level changed within the same class
    | "focus-shifted";    // recommended focus text changed materially

export interface PriorityDriftChangeDriver {
    field: "advisoryLevel" | "evidenceGaps" | "recommendedFocus" | "summary" | "rationale" | "experimentId";
    previousValue: string | string[] | null;
    currentValue: string | string[] | null;
    note: string;
}

export interface PriorityDriftRecord {
    driftId: string;
    priorityClass: ResearchPriorityClass;
    driftKind: PriorityDriftKind;
    previousSignal: ResearchPrioritySignal | null;
    currentSignal: ResearchPrioritySignal | null;
    changeDrivers: PriorityDriftChangeDriver[];
    caveats: string[];
    detectedAt: string;
}

export interface PriorityDriftHistory {
    generatedAt: string;
    currentSnapshotAt: string;
    priorSnapshotAt: string | null;
    driftRecords: PriorityDriftRecord[];
    totalDrifts: number;
    summary: string;
    governanceCaveat: string;
}

// ─── Recommendation Governance Types ─────────────────────────────────
// Phase 20: Every recommendation must carry explicit governance context
// so that no recommendation is mistaken for execution authority.

export interface GovernedRecommendation {
    text: string;
    supportingEvidenceClasses: string[];
    missingEvidenceClasses: string[];
    confidenceLimitation: string;
    advisoryBoundary: string;
    nonExecutionCaveat: string;
}

export interface RecommendationGovernanceContext {
    generatedAt: string;
    governedRecommendations: GovernedRecommendation[];
    governanceSummary: string;
    governanceCaveat: string;
}

// ─── API Response ────────────────────────────────────────────────────

export interface PriorityDriftApiResponse {
    drift: PriorityDriftHistory;
    governance: RecommendationGovernanceContext;
    generatedAt: string;
}
