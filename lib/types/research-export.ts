// ─── Phase 10: Research Export / Briefing Surface Types ───────────────
// Typed structures for synthesized observatory briefings, export manifests,
// and evidence lineage records. These enable a frontier-lab-grade briefing
// surface that can be audited, exported, and shared.
//
// HONESTY CONSTRAINT: Briefings synthesize from deterministic structural
// signals — not learned representations. All confidence labels reflect
// signal coverage, not probabilistic certainty.

import type { LineageStatus, ReplayabilityClass } from "./experiment-registry";
import type { ExperimentEvaluationPortfolio } from "./experiment-evaluation";
import type { ResearchPrioritizationContext, ResearchPrioritySignal } from "./research-prioritization";
import type { PriorityDriftHistory, RecommendationGovernanceContext } from "./research-priority-drift";
import type { GovernanceHistorySummary, SnapshotComparisonSummary } from "./research-priority-history";
import type { ComparativeGovernanceSynthesis } from "./governance-synthesis";

// ─── Evidence Lineage ────────────────────────────────────────────────

export type EvidenceSourceType =
    | "experiment"
    | "world-state"
    | "snapshot"
    | "simulation"
    | "benchmark"
    | "execution"
    | "dataset"
    | "replay-package"
    | "memory"
    | "dossier"
    | "evaluation-snapshot"
    | "latent-state"
    | "compatibility"
    | "transition-pattern";

export interface ReplayStatusSummary {
    totalExperiments: number;
    baselineOnlyCount: number;
    partialCount: number;
    fullCount: number;
    strongestExperimentId: string | null;
    strongestExperimentTitle: string | null;
    strongestReplayability: ReplayabilityClass | null;
    strongestLineageStatus: LineageStatus | null;
    evidenceClass: LineageStatus | "no-experiments";
    reproducibilityCaveat: string;
}

export interface BriefEvidenceReference {
    sourceType: EvidenceSourceType;
    sourceId: string;
    label: string;
    derivedAt: string; // ISO 8601
}

// ─── Brief Sections ──────────────────────────────────────────────────

export interface BriefSection {
    id: string;
    title: string;
    content: string;
    confidence: "high" | "medium" | "low" | "structural-only";
    evidenceRefs: BriefEvidenceReference[];
    prioritization?: ResearchPrioritySignal | null;
}

// ─── Executive Findings ──────────────────────────────────────────────

export interface ExecutiveFinding {
    id: string;
    severity: "critical" | "important" | "informational";
    title: string;
    summary: string;
    supportingEvidence: BriefEvidenceReference[];
    prioritization?: ResearchPrioritySignal | null;
}

// ─── Constraint Register ─────────────────────────────────────────────

export interface ConstraintRegister {
    id: string;
    domain: string; // e.g. "prediction", "calibration", "governance"
    constraint: string;
    implication: string;
    evidenceRefs: BriefEvidenceReference[];
    prioritization?: ResearchPrioritySignal | null;
}

// ─── Recommended Next Steps ──────────────────────────────────────────

export interface RecommendedNextStep {
    id: string;
    priority: "high" | "medium" | "low";
    action: string;
    suggestedInterventionClass: string;
    rationale: string;
    blockedBy: string | null;
    evidenceRefs: BriefEvidenceReference[];
    prioritization?: ResearchPrioritySignal | null;
}

// ─── Summary Cards ───────────────────────────────────────────────────

export interface ResearchSummaryCard {
    label: string;
    value: string | number;
    trend: "up" | "down" | "stable" | "unknown";
    detail: string;
}

// ─── Observatory Brief ───────────────────────────────────────────────
// The top-level briefing structure synthesized from all data sources.

export interface ObservatoryBrief {
    id: string;
    generatedAt: string; // ISO 8601
    systemVersion: string;
    phaseActive: number;

    executiveSummary: string;
    compositePosture: "stable" | "cautious" | "pressured" | "fragile";
    replayStatusSummary: ReplayStatusSummary;
    comparativeEvaluation: ExperimentEvaluationPortfolio;
    summaryCards: ResearchSummaryCard[];
    prioritizationContext: ResearchPrioritizationContext;
    priorityDrift: PriorityDriftHistory | null;
    recommendationGovernance: RecommendationGovernanceContext | null;
    priorityHistorySummary: GovernanceHistorySummary | null;
    snapshotComparisons: SnapshotComparisonSummary | null;
    governanceSynthesis: ComparativeGovernanceSynthesis | null;

    sections: BriefSection[];
    findings: ExecutiveFinding[];
    constraints: ConstraintRegister[];
    recommendedNextSteps: RecommendedNextStep[];

    knownLimitations: string[];
}

// ─── Export Artifacts ────────────────────────────────────────────────

export type ExportArtifactType =
    | "brief"
    | "dossier"
    | "evaluation-snapshot"
    | "snapshot"
    | "benchmark"
    | "session"
    | "dataset"
    | "replay-package"
    | "latent-state";

export interface ExportComparisonPostureSummary {
    evaluationSnapshotId: string | null;
    strongestExperimentTitle: string | null;
    strongestComparativeWeightLabel: ExperimentEvaluationPortfolio["strongestComparativeWeightLabel"];
    highConfidenceComparisonCount: number;
    comparativeCaveat: string;
}

export interface ExportArtifactRecord {
    canonicalKey: string;
    artifactId: string;
    artifactType: ExportArtifactType;
    filePath: string;
    sha256: string;
    generatedAt: string; // ISO 8601
    sizeBytes: number;
    inclusionRole: "cited-by-brief" | "context";
}

// ─── Export Manifest ─────────────────────────────────────────────────
// Deterministic, auditable manifest of everything exported.

export interface ExportManifest {
    id: string;
    exportedAt: string; // ISO 8601
    exportedBy: "agent" | "human";
    systemVersion: string;
    briefId: string;
    replayStatusSummary: ReplayStatusSummary;
    comparisonPosture: ExportComparisonPostureSummary;
    prioritizationSummary: ResearchPrioritizationContext;
    priorityDriftSummary: PriorityDriftHistory | null;
    governanceSummary: RecommendationGovernanceContext | null;
    priorityHistorySummary: GovernanceHistorySummary | null;
    snapshotComparisons: SnapshotComparisonSummary | null;
    governanceSynthesis: ComparativeGovernanceSynthesis | null;
    artifacts: ExportArtifactRecord[];
    evidenceLineage: BriefEvidenceReference[];
    totalArtifacts: number;
    evidenceArtifactCount: number;
    contextualArtifactCount: number;
    totalSizeBytes: number;
    integrityNote: string;
    integrityGuarantees: string[];
}

// ─── API Response Envelopes ──────────────────────────────────────────

export interface ResearchBriefApiResponse {
    brief: ObservatoryBrief;
    generatedAt: string;
}

export interface ExportManifestApiResponse {
    manifest: ExportManifest;
    brief: ObservatoryBrief;
    exportedAt: string;
}
