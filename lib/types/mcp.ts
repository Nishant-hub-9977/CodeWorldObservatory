export type McpToolName =
    | "capture_world_state"
    | "plan_intervention"
    | "project_futures"
    | "analyze_uncertainty"
    | "compare_prediction_to_reality"
    | "query_artifact_ledger"
    | "evaluate_simulation_gate";

export type McpEnforcementPosture =
    | "read-only"
    | "advisory"
    | "enforcement-boundary";

export interface McpToolContract {
    name: McpToolName;
    purpose: string;
    description: string;
    requiredInputs: Record<string, string>; // Input key -> description
    responseShape: string;
    preconditions: string[];
    failureModes: string[];
    enforcementPosture: McpEnforcementPosture;
}

// ─── Specific Request Payloads ─────────────────────────────────────

export interface WorldStateCaptureRequest {
    path?: string;
}

export interface InterventionPlanningRequest {
    objective: string;
    baselineWorldStateId: string;
}

export interface FuturesProjectionRequest {
    interventionId: string;
}

export interface PredictionRealityRequest {
    branchId: string;
    actualOutcomeStatus: "success" | "partial" | "failure" | "rolled-back";
    touchedSurfaces: string[];
    observedIssues: string[];
    validationBurden: "low" | "moderate" | "heavy";
    executionReadinessActual: "ready" | "needs-review" | "blocked";
    operatorNotes?: string;
}

export interface ArtifactLedgerQuery {
    typeFilter?: string;
    trustLevelFilter?: string;
    limit?: number;
}

// ─── Gate / Enforcement Types ─────────────────────────────────────

export type SimulationGateDecision =
    | "blocked"
    | "advisory-only"
    | "ready-for-reviewed-execution";

export interface SimulationGateContext {
    branchId: string;
    hasPlanningArtifacts: boolean;
    hasProjectedFutures: boolean;
}

export interface SkillEnforcementResult {
    decision: SimulationGateDecision;
    rationale: string;
    missingPrerequisites: string[];
    relatedEvidenceArtifacts: string[];
    evaluatedAt: string; // ISO 8601
}
