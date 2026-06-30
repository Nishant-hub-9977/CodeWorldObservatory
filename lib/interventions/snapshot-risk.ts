// ─── Snapshot-informed Risk (deterministic · advisory-only) ─────────
// Simple explicit rules over static snapshot evidence. This enriches the
// existing mock prediction; it never replaces the prediction and never
// performs runtime repository analysis.

import {
    getSnapshotEvidenceForScenario,
    type ScenarioSnapshotEvidence,
} from "./snapshot-bridge";

export type SnapshotRiskTier = "LOW" | "MEDIUM" | "HIGH";
export type SnapshotEvidenceConfidence = "HIGH" | "MEDIUM" | "LIMITED";

export interface SnapshotRiskSummary {
    scenarioId: string;
    snapshotRiskTier: SnapshotRiskTier;
    routeBlastRadius: number;
    sharedInfrastructureTouched: boolean;
    governanceSurfaceTouched: boolean;
    unresolvedImportExposure: number;
    staticDependencyEvidenceAvailable: boolean;
    consequenceEdgeCount: number;
    staticEdgeCountInvolved: number;
    evidenceConfidence: SnapshotEvidenceConfidence;
    widenedMismatchSurface: boolean;
    narrowedMismatchSurface: boolean;
    rationale: string;
    staticApproximationCaveat: string;
}

const STATIC_APPROXIMATION_CAVEAT =
    "Snapshot risk is advisory-only and derived from a static approximation. It does not execute code, scan the filesystem at request time, mutate files, or claim complete runtime dependency knowledge.";

function deriveTier(evidence: ScenarioSnapshotEvidence): SnapshotRiskTier {
    const consequenceEdgeCount = evidence.relevantConsequenceBearingEdges.length;
    if (evidence.sharedInfrastructureTouched || consequenceEdgeCount >= 2 || evidence.routeBlastRadius >= 3) {
        return "HIGH";
    }
    if (
        evidence.governanceSurfaceTouched ||
        evidence.simulatorSurfaceTouched ||
        evidence.quantumAnnexSurfaceTouched ||
        evidence.routeBlastRadius > 0 ||
        evidence.unresolvedImportExposure > 0
    ) {
        return "MEDIUM";
    }
    return "LOW";
}

function deriveConfidence(evidence: ScenarioSnapshotEvidence): SnapshotEvidenceConfidence {
    if (!evidence.staticDependencyEvidenceAvailable) return "LIMITED";
    if (evidence.matchedFiles.length >= 3 && evidence.staticEdgeCountInvolved >= 3) return "HIGH";
    return "MEDIUM";
}

function deriveRationale(evidence: ScenarioSnapshotEvidence, tier: SnapshotRiskTier): string {
    const consequenceEdgeCount = evidence.relevantConsequenceBearingEdges.length;
    if (tier === "HIGH") {
        return `High because the static snapshot shows ${consequenceEdgeCount} consequence-bearing edge(s), shared infrastructure exposure=${evidence.sharedInfrastructureTouched}, and route blast radius=${evidence.routeBlastRadius}.`;
    }
    if (tier === "MEDIUM") {
        return `Medium because the matched static surface touches governance=${evidence.governanceSurfaceTouched}, simulator=${evidence.simulatorSurfaceTouched}, quantum annex=${evidence.quantumAnnexSurfaceTouched}, route blast radius=${evidence.routeBlastRadius}, unresolved imports=${evidence.unresolvedImportExposure}.`;
    }
    return "Low because the matched static surface is isolated from routes, shared infrastructure, governance, and unresolved imports.";
}

export function deriveSnapshotRisk(evidence: ScenarioSnapshotEvidence): SnapshotRiskSummary {
    const tier = deriveTier(evidence);
    const consequenceEdgeCount = evidence.relevantConsequenceBearingEdges.length;
    const widenedMismatchSurface =
        tier === "HIGH" || evidence.unresolvedImportExposure > 0 || evidence.staticEdgeCountInvolved > evidence.matchedFiles.length;
    const narrowedMismatchSurface =
        tier === "LOW" && evidence.staticDependencyEvidenceAvailable && consequenceEdgeCount === 0;

    return {
        scenarioId: evidence.scenarioId,
        snapshotRiskTier: tier,
        routeBlastRadius: evidence.routeBlastRadius,
        sharedInfrastructureTouched: evidence.sharedInfrastructureTouched,
        governanceSurfaceTouched: evidence.governanceSurfaceTouched,
        unresolvedImportExposure: evidence.unresolvedImportExposure,
        staticDependencyEvidenceAvailable: evidence.staticDependencyEvidenceAvailable,
        consequenceEdgeCount,
        staticEdgeCountInvolved: evidence.staticEdgeCountInvolved,
        evidenceConfidence: deriveConfidence(evidence),
        widenedMismatchSurface,
        narrowedMismatchSurface,
        rationale: deriveRationale(evidence, tier),
        staticApproximationCaveat: STATIC_APPROXIMATION_CAVEAT,
    };
}

export function getSnapshotRiskForScenario(scenarioId: string): SnapshotRiskSummary {
    return deriveSnapshotRisk(getSnapshotEvidenceForScenario(scenarioId));
}
