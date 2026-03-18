import type { CalibrationResult } from "./execution";
import type { RiskLevel, ScopeClass, BranchStrategy } from "./intervention";

// ─── Phase 6: SE-JEPA Operational Prototype Types ───────────────────
// These types formalize the observation/action/future abstractions
// mapping the Observatory's architecture into a JEPA-style prototype.
// This is a structural representation, NOT a trained learned model.

export interface ObservationState {
    id: string;
    worldStateId: string;
    capturedAt: string; // ISO 8601
    structuralProfile: {
        totalFiles: number;
        moduleBoundaries: number;
    };
    dependencyProfile: {
        maxEdgeDepth: number;
        connectivityVariance: "low" | "medium" | "high";
    };
    uncertaintyProfile: {
        globalObservability: "clear" | "partial" | "obscured";
        openProblemsCount: number;
    };
    // Future phase: dynamic execution state, visual state, etc.
}

export interface ActionRepresentation {
    id: string;
    interventionBranchId: string;
    strategy: BranchStrategy;
    scopeClass: ScopeClass;
    riskLevel: RiskLevel;
    structuralCost: {
        targetFileCount: number;
        estimatedRadius: number;
    };
    verificationBurden: "low" | "moderate" | "heavy";
}

export interface LatentStateDescriptor {
    stabilityProfile: "stable" | "degrading" | "volatile";
    observabilityProfile: "clear" | "partial" | "obscured";
    verificationBurdenProfile: "low" | "moderate" | "heavy";
    failureSurfaceProfile: "contained" | "diffuse" | "systemic";
}

export interface PredictedFutureState {
    id: string;
    actionId: string;
    baselineObservationId: string;
    projectedAt: string; // ISO 8601
    structuralDescriptor: LatentStateDescriptor; // Proxy for the latent embedding
    confidenceScore: number;
    readinessProfile: "ready" | "needs-review" | "blocked";
}

export interface CalibrationAlignmentSummary {
    calibrationResult: CalibrationResult;
    fidelityScore: number; // 0.0 - 1.0 (heuristic score of prediction accuracy)
    divergenceReason?: string;
}

export interface StateTransitionRecord {
    id: string;
    observation: ObservationState;
    action: ActionRepresentation;
    predictedFuture: PredictedFutureState;
    actualOutcomeId?: string; // Links to ExecutionRecord if executed
    calibration?: CalibrationAlignmentSummary;
    chainedAt: string; // ISO 8601
}

export interface JepaPrototypeMapping {
    status: "active" | "standby";
    mode: "structural-prototype"; // Explicitly distinguishing from "learned-model"
    currentChain: StateTransitionRecord;
}
