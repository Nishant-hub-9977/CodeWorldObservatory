// ─── Simulation Types ─────────────────────────────────────────────
// Phase 7 introduces controlled, machine-readable simulation sessions
// and an empirical benchmark harness to compare counterfactual branches.

import type { InterventionTarget, InterventionBranch } from "./intervention";
import type { BranchOutcomeProjection } from "./future-state";

/**
 * Bounds the qualitative outcome of a branch simulation.
 * Used for high-level ranking and governance gating.
 */
export type SimulationOutcomeClass =
    | "structurally-favorable" // Low verification burden, contained risk
    | "review-heavy"           // High validation burden, cross-module risk
    | "calibration-weak"       // Simulation reveals low confidence in prediction
    | "blocked-by-evidence"    // Explicitly unviable path based on structural evidence
    | "governance-constrained"; // Blocked by policy (e.g. requires manual override)

/**
 * The input parameters necessary to simulate a single branch.
 */
export interface SimulationBranchInput {
    branch: InterventionBranch;
    projection: BranchOutcomeProjection; // Prior Phase 3 projection
    // Additional derived context could go here
}

/**
 * The structured request payload to begin a simulation session.
 */
export interface SimulationRequest {
    experimentId?: string | null;
    objective: InterventionTarget;
    baselineWorldStateId: string;
    branchInputs: SimulationBranchInput[];
    requestedBy: "human" | "agent";
    requestId: string;
}

/**
 * Detailed simulation output for a specific branch.
 * This represents the "evidence" gathered during the session.
 */
export interface SimulationResult {
    branchId: string;
    strategyClass?: string; // First-class strategy identity from InterventionBranch.strategy
    outcomeClass: SimulationOutcomeClass;
    evidenceSufficiency: "strong" | "adequate" | "insufficient";
    governanceBlockers: string[];
    structuralNotes: string;
    simulationScore: number; // 0.0 - 1.0 heuristic score for ranking
}

/**
 * Top-level record for an intervention's simulation attempt.
 * A session evaluates multiple branches concurrently.
 */
export interface SimulationSession {
    id: string;
    requestId: string;
    experimentId?: string | null;
    objective: InterventionTarget;
    baselineWorldStateId: string;
    simulatedAt: string; // ISO 8601
    branchResults: SimulationResult[];
    status: "completed" | "failed" | "aborted";
}

/**
 * Represents the ranking and rationale for a single branch
 * compared within a Benchmark Harness run.
 */
export interface BranchBenchmarkRecord {
    branchId: string;
    strategyClass?: string; // Propagated from SimulationResult for trend tracking
    rank: number; // 1 = preferred, 2 = alternate, etc.
    simulationScore: number;
    outcomeClass: SimulationOutcomeClass;
    comparativeRationale: string;
}

/**
 * The output of the Benchmark Harness.
 * A structural evaluation comparing multiple simulated branches.
 */
export interface BenchmarkHarnessRun {
    id: string;
    sessionId: string; // The SimulationSession this benchmark is based on
    experimentId?: string | null;
    objectiveHeader: string;
    evaluatedAt: string; // ISO 8601
    strongestCandidateId: string | null;
    rankings: BranchBenchmarkRecord[];
    overallEvidenceSufficiency: "strong" | "adequate" | "insufficient";
    harnessNotes: string; // High-level synthesis of the experiment
}
