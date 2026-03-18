// ─── Future State Types ──────────────────────────────────────────
// Represents a predicted or simulated state of the repository that
// has not yet materialized. Future states are the outputs of
// counterfactual planning passes. They exist in an imagined branch
// of the world model until intervention is approved and applied.

import type { RiskLevel } from "./intervention";

export type DivergenceCategory =
    | "safe"        // diverges minimally, bounded risk
    | "moderate"    // meaningful drift, requires review
    | "significant" // large drift, high attention required
    | "critical";   // fundamental structural divergence

export interface DivergenceScore {
    overall: number; // 0.0 – 1.0, higher = more diverged from baseline
    category: DivergenceCategory;
    filesDelta: number;   // net change in file count
    linesDelta: number;   // net change in total lines
    breakingChanges: number;
    testRegressions: number;
}

export interface PredictedOutcome {
    summary: string;
    sideEffects: string[];
    timeToImplement: string; // e.g., "~2 hours"
    confidenceScore: number; // 0.0 – 1.0
    uncertainRegions: string[]; // paths with low model confidence
    testDelta: {
        passing: number;
        failing: number;
        new: number;
    };
}

export type UncertaintyLevel = "low" | "medium" | "high" | "extreme";

export interface FailureSurface {
    path: string;
    reason: string;
    riskLevel: RiskLevel;
}

export interface PredictedImpact {
    estimatedTime: string; // e.g., "~2 hours"
    validationBurden: "low" | "moderate" | "heavy";
    instabilityZones: string[];
    executionReadiness: "ready" | "needs-review" | "blocked";
}

export interface UncertaintySignal {
    signalId: string;
    level: UncertaintyLevel;
    rationale: string;
    affectedSurfaces: string[];
    limitationSource: "scope-depth" | "alias-resolution" | "observability-gap" | "cross-cutting" | "structural-complexity";
}

export interface BranchOutcomeProjection {
    branchId: string;
    label: string;
    summary: string;
    likelyTouchedSurfaces: string[];
    impact: PredictedImpact;
    failureSurfaces: FailureSurface[];
    outlook: "stable-forward path" | "contained-risk path" | "structurally expensive path";
    uncertainty: UncertaintySignal[];
    divergenceScore?: DivergenceScore; // optional linking to old metrics if needed
}

export interface CounterfactualBranch {
    id: string;
    label: string;
    description: string;
    baselineWorldStateId: string;
    interventionId: string;
    createdAt: string; // ISO 8601
    // Keep old types for compatibility with older parts if needed
    divergenceScore?: DivergenceScore;
    predictedOutcome?: PredictedOutcome;
    selected: boolean;
}

export interface FuturesSummary {
    totalBranches: number;
    recommendedPathId: string | null;
    primaryUncertaintySources: string[];
    overallExecutionReadiness: "ready" | "needs-review" | "blocked";
}

export interface FutureState {
    id: string;
    generatedAt: string; // ISO 8601
    horizon: string;     // e.g., "next intervention", "end of sprint"
    baselineWorldStateId: string;
    branches: CounterfactualBranch[];
    recommendedBranchId: string | null;
    planningAgentId: string;
}

export interface FuturesApiResponse {
    futures: BranchOutcomeProjection[];
    summary: FuturesSummary;
    generatedAt: string; // ISO 8601
}
