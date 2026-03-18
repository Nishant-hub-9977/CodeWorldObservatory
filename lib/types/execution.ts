// ─── Execution Types ──────────────────────────────────────────────
// Represents the actual execution outcomes of interventions and their
// comparison against previously projected Future States.

import type { BranchOutcomeProjection, PredictedImpact } from "./future-state";

export interface ActualOutcome {
    status: "success" | "partial" | "failure" | "rolled-back";
    touchedSurfaces: string[];
    observedIssues: string[];
    validationBurden: "low" | "moderate" | "heavy";
    executionReadinessActual: "ready" | "needs-review" | "blocked";
    operatorNotes?: string;
    executedAt: string; // ISO 8601
}

export interface ExecutionRecord {
    id: string;
    experimentId?: string | null;
    branchId: string;
    interventionObjective: string;
    interventionTitle: string;
    actualOutcome: ActualOutcome;
    createdAt: string; // ISO 8601
}

export type CalibrationResult =
    | "aligned"
    | "partially-aligned"
    | "divergent"
    | "insufficient-evidence";

export interface PredictionRealityComparison {
    id: string;
    experimentId?: string | null;
    executionRecordId: string;
    branchId: string;

    // Predicted vs Actual paired fields
    expectedReadiness: PredictedImpact["executionReadiness"];
    actualReadiness: ActualOutcome["executionReadinessActual"];

    expectedFragileZones: string[];
    observedIssues: string[];

    expectedValidationBurden: PredictedImpact["validationBurden"];
    actualValidationBurden: ActualOutcome["validationBurden"];

    expectedSurfaces: string[];
    actualSurfaces: string[];

    calibrationResult: CalibrationResult;
    calibrationNote: string;
    evidenceSufficiencyNote: string;

    comparedAt: string; // ISO 8601
}

export interface ExecutionApiResponse {
    executions: ExecutionRecord[];
    comparisons: PredictionRealityComparison[];
    generatedAt: string; // ISO 8601
}
