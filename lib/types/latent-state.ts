// ─── Phase 9: Latent State Approximation Types ────────────────────────
// Typed latent-state descriptors for repository structural conditions.
// These are NOT learned embeddings. They are deterministic, compositional
// structural descriptors derived from observable world state signals.
//
// HONESTY CONSTRAINT: All representations in this file are typed
// latent-state approximations — not neural latent variables, not
// trained JEPA representations, and not inferred embeddings.

import type { BranchStrategy } from "./intervention";

// ─── Structural Complexity ───────────────────────────────────────────

export type ComplexityPosture = "low" | "moderate" | "high" | "extreme";

export interface StructuralComplexityDescriptor {
    posture: ComplexityPosture;
    totalFiles: number;
    moduleBoundaryCount: number;
    averageEdgesPerFile: number;
    deepNestingPaths: number;   // files with > 3 directory levels
    rationale: string;
}

// ─── Dependency Pressure ─────────────────────────────────────────────

export type PressureLevel = "contained" | "moderate" | "concentrated" | "systemic";

export interface DependencyPressureDescriptor {
    level: PressureLevel;
    maxInboundEdges: number;   // highest inbound connectivity in the graph
    orphanFileCount: number;   // files with zero dependency edges
    concentrationRatio: number; // top-5 files' edge share of total (0-1)
    hotspotPaths: string[];    // top 3 most-connected files
    rationale: string;
}

// ─── Validation Burden ───────────────────────────────────────────────

export type BurdenLevel = "low" | "moderate" | "heavy" | "prohibitive";

export interface ValidationBurdenDescriptor {
    level: BurdenLevel;
    openProblemsCount: number;
    testCoverage: number | null; // 0-100, null if unknown
    recentMutationRate: number;  // mutations in last session window
    rationale: string;
}

// ─── Governance Friction ─────────────────────────────────────────────

export type FrictionLevel = "smooth" | "cautious" | "gated" | "blocked";

export interface GovernanceFrictionDescriptor {
    level: FrictionLevel;
    activeBlockerCount: number;
    recurringBlockerCategories: string[];
    governanceConstrainedSessionRate: number; // 0-1, share of sessions that hit governance blockers
    rationale: string;
}

// ─── Evidence Sufficiency ────────────────────────────────────────────

export type SufficiencyPosture = "strong" | "adequate" | "thin" | "insufficient";

export interface EvidenceSufficiencyDescriptor {
    posture: SufficiencyPosture;
    strongEvidenceRate: number;   // share of benchmark runs with strong evidence (0-1)
    insufficientEvidenceRate: number; // share with insufficient (0-1)
    totalBenchmarkRuns: number;
    rationale: string;
}

// ─── Strategy Compatibility ──────────────────────────────────────────

export type CompatibilityClass =
    | "favorable"              // Strategy is structurally well-suited
    | "viable-with-review"     // Can work but needs human oversight
    | "structurally-misaligned"; // Poor fit given current repo conditions

export interface StrategyCompatibilityAssessment {
    strategy: BranchStrategy;
    compatibility: CompatibilityClass;
    suitabilityScore: number;  // 0-1, higher = better fit
    reasoning: string;         // bounded architectural explanation
    keyFactors: string[];      // which latent descriptors most influence this rating
}

// ─── Transition Pattern ──────────────────────────────────────────────

export interface TransitionPatternRecord {
    patternId: string;
    description: string;
    occurrences: number;
    latentConditions: {
        complexityPosture: ComplexityPosture;
        pressureLevel: PressureLevel;
        frictionLevel: FrictionLevel;
    };
    dominantStrategy: BranchStrategy | "mixed";
    dominantOutcome: string;
    confidence: "high" | "medium" | "low";
}

// ─── Composite Latent Repo State ─────────────────────────────────────

export interface LatentRepoState {
    id: string;
    derivedAt: string;  // ISO 8601
    sourceWorldStateId: string;

    complexity: StructuralComplexityDescriptor;
    dependencyPressure: DependencyPressureDescriptor;
    validationBurden: ValidationBurdenDescriptor;
    governanceFriction: GovernanceFrictionDescriptor;
    evidenceSufficiency: EvidenceSufficiencyDescriptor;

    compositePosture: "stable" | "cautious" | "pressured" | "fragile";
    compositeRationale: string;
}

// ─── Latent State Transition Summary ─────────────────────────────────
// Extends the SE-JEPA chain with explicit latent descriptors bridging
// observation to strategy selection.

export interface LatentStateTransitionSummary {
    id: string;
    generatedAt: string; // ISO 8601
    latentState: LatentRepoState;
    strategyCompatibility: StrategyCompatibilityAssessment[];
    transitionPatterns: TransitionPatternRecord[];
    chainLink: {
        observationStateId: string;
        latentStateId: string;
        selectedStrategyClass: BranchStrategy | null;
        predictedFutureStateId: string | null;
        calibrationDelta: number | null; // predicted vs actual fidelity, if available
    };
}

// ─── API Response Envelopes ──────────────────────────────────────────

export interface LatentStateApiResponse {
    latentState: LatentRepoState;
    generatedAt: string;
}

export interface StrategyCompatibilityApiResponse {
    latentStateId: string;
    assessments: StrategyCompatibilityAssessment[];
    generatedAt: string;
}

export interface TransitionPatternsApiResponse {
    patterns: TransitionPatternRecord[];
    totalSessionsAnalyzed: number;
    generatedAt: string;
}
