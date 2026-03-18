// ─── Intervention Types ──────────────────────────────────────────
// Represents a proposed, planned, or executed change to the world state.
// Interventions are ALWAYS planned before execution. They are the
// atomic unit of agentic intent in the CodeWorld Observatory model.

import type { WorldState } from "./world-state";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type InterventionStatus =
    | "proposed"
    | "simulated"
    | "approved"
    | "executing"
    | "complete"
    | "rejected";

export type InterventionType =
    | "write"       // create or modify a file
    | "delete"      // remove a file or module
    | "refactor"    // structural change without behavior change
    | "patch"       // targeted bug fix
    | "dependency"  // add/remove/upgrade a dependency
    | "config"      // configuration change
    | "schema"      // data model evolution
    | "test"        // add or modify tests
    | "migration";  // data or infrastructure migration

export interface InterventionScope {
    filePaths: string[];        // direct targets
    estimatedRadius: string[];  // transitively affected paths
    crossesModuleBoundary: boolean;
    affectsPublicApi: boolean;
    affectsDataLayer: boolean;
}

export interface SimulationResult {
    id: string;
    interventionId: string;
    simulatedAt: string; // ISO 8601
    predictedOutcome: string;
    predictedSideEffects: string[];
    confidenceScore: number; // 0.0 – 1.0
    uncertainRegions: string[]; // file paths with low prediction confidence
    predictedTestDelta: {
        passing: number;
        failing: number;
        new: number;
    };
}

export interface Intervention {
    id: string;
    type: InterventionType;
    title: string;
    description: string;
    intent: string; // why-statement — the goal, not the mechanism
    proposedAt: string; // ISO 8601
    proposedBy: "human" | "agent";
    status: InterventionStatus;
    riskLevel: RiskLevel;
    scope: InterventionScope;
    baselineWorldStateId: string; // snapshot ID before this intervention
    simulationResult?: SimulationResult;
    artifactIds: string[]; // linked artifacts
    links: Array<{ artifactId: string; relationship: string }>; // explicit artifact links
    tags: string[];        // searchable/filterable labels
    approvedBy?: string;
    executedAt?: string; // ISO 8601
    completedAt?: string; // ISO 8601
}

// ─── Phase 2: Planning Layer Types ───────────────────────────────
// Types produced by the scope-analyzer and intervention-planner
// services. These represent candidate plans before any simulation.

/** How broadly the intervention reaches into the codebase. */
export type ScopeClass =
    | "isolated"      // 1 file, no dependency connections
    | "local"         // ≤3 files, same module/directory
    | "cross-module"  // spans multiple lib areas or components
    | "structural";   // touches app shell, shared types, or layout

/** Static analysis of what a proposed set of targets would affect. */
export interface ScopeImpact {
    directTargets: string[];       // explicitly proposed file paths
    connectedFiles: string[];      // first-order imported/importing files
    touchedSurfaces: string[];     // human-readable surface labels
    scopeClass: ScopeClass;
    estimatedFileRadius: number;   // total unique files implicated
    riskRationale: string;         // readable explanation of risk factors
}

/** The planning strategy style for a candidate branch. */
export type BranchStrategy =
    | "service-first"       // build data/service layer before UI or routes
    | "route-first"         // wire API surface before services are complete
    | "ui-first"            // build display layer, accept data stubs initially
    | "minimal-touch"       // smallest possible footprint, lowest risk
    | "structural-refactor"; // prioritise architecture before feature work

/** One candidate branch in an intervention planning comparison. */
export interface InterventionBranch {
    id: string;          // e.g. "branch-A", "branch-B", "branch-C"
    label: string;       // e.g. "A", "B", "C"
    strategy: BranchStrategy;
    title: string;
    summary: string;                   // one-sentence description
    targetFiles: string[];             // files this branch would touch
    scopeImpact: ScopeImpact;
    riskLevel: RiskLevel;
    rationale: string;                 // why this branch makes sense
    limitations: string[];            // known unknowns / observability limits
    preferred: boolean;               // planner's heuristic recommendation
}

/** What the planner is asked to plan around. */
export interface InterventionTarget {
    objective: string;           // natural-language goal statement
    type: InterventionType;
    hintFiles?: string[];        // optional file path hints from requestor
    context?: string;            // any additional context
}

/** Three-branch counterfactual comparison, the primary output of Phase 2. */
export interface CounterfactualComparison {
    id: string;
    generatedAt: string;       // ISO 8601
    objective: InterventionTarget;
    branches: [InterventionBranch, InterventionBranch, InterventionBranch];
    preferredBranchId: string;
    comparisonNotes: string;   // planner's synthesis across branches
}

/** Typed envelope for /api/interventions responses. */
export interface InterventionApiResponse {
    comparison: CounterfactualComparison;
    repoSignals: {
        totalFiles: number;
        tsFileCount: number;
        edgeCount: number;
    };
    plannerVersion: string;
    planningNote: string;
}
