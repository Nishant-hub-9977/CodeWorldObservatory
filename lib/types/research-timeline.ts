import type { LineageStatus, ReplayabilityClass } from "./experiment-registry";
import type { ExperimentEvaluationPortfolio } from "./experiment-evaluation";
import type { BranchStrategy } from "./intervention";
import type { SimulationOutcomeClass } from "./simulation";
import type { CalibrationResult } from "./execution";
import type { LatentRepoState, StrategyCompatibilityAssessment } from "./latent-state";
import type { ResearchPrioritizationContext, ResearchPrioritySignal } from "./research-prioritization";
import type { PriorityDriftHistory } from "./research-priority-drift";
import type { GovernanceHistorySummary, SnapshotComparisonSummary } from "./research-priority-history";
import type { ComparativeGovernanceSynthesis } from "./governance-synthesis";

export interface TimelineSessionRecord {
    sessionId: string;
    experimentId: string | null;
    simulatedAt: string;
    objective: string;
    baselineWorldStateId: string;
    branchCount: number;
    dominantOutcome: SimulationOutcomeClass | "unknown";
    preferredStrategy: BranchStrategy | "mixed" | "unknown";
    benchmarkEvidence: "strong" | "adequate" | "insufficient" | "unavailable";
    governanceBlockers: string[];
    worldStateReference: string;
    worldStateSummary: string;
    recommendedInterventionClass: BranchStrategy | "mixed" | "unknown";
    recommendationRationale: string;
}

export interface TimelineStrategyShift {
    id: string;
    sessionId: string;
    detectedAt: string;
    fromStrategy: BranchStrategy | "mixed" | "unknown";
    toStrategy: BranchStrategy | "mixed" | "unknown";
    rationale: string;
}

export interface TimelineBlockerPattern {
    blocker: string;
    occurrences: number;
    firstSeenAt: string;
    lastSeenAt: string;
    affectedSessionIds: string[];
    affectedObjectives: string[];
}

export interface TimelineCalibrationPoint {
    pointId: string;
    comparedAt: string;
    totalEvaluated: number;
    aggregateAlignmentScore: number;
    movement: "stable" | "improving" | "mixed" | "insufficient-evidence";
    latestResult: CalibrationResult;
    note: string;
}

export interface TimelineCalibrationTrajectory {
    maturity: "preliminary" | "established";
    points: TimelineCalibrationPoint[];
    summary: string;
}

export interface TimelineReplayTransition {
    id: string;
    experimentId: string;
    experimentTitle: string;
    transitionedAt: string;
    replayability: ReplayabilityClass;
    lineageStatus: LineageStatus;
    basedOnExecutionEvidence: boolean;
    note: string;
}

export interface TimelineEvaluationDriftRecord {
    driftId: string;
    comparedAt: string;
    fromRecordId: string;
    toRecordId: string;
    strongestExperimentChanged: boolean;
    highConfidenceComparisonDelta: number;
    changedExperimentCount: number;
    narrative: string;
}

export interface TimelineNarrativeEvent {
    id: string;
    timestamp: string;
    category: "session" | "strategy-shift" | "governance-blocker" | "calibration" | "replay-lineage" | "experiment-comparison" | "evaluation-drift" | "priority-drift";
    title: string;
    summary: string;
    relatedSessionId: string | null;
    prioritization?: ResearchPrioritySignal | null;
}

export interface ResearchTimeline {
    id: string;
    generatedAt: string;
    systemVersion: string;
    phaseActive: number;
    totalSessions: number;
    currentCompositePosture: LatentRepoState["compositePosture"];
    currentCompatibilitySnapshot: StrategyCompatibilityAssessment[];
    comparativeEvaluation: ExperimentEvaluationPortfolio;
    prioritizationContext: ResearchPrioritizationContext;
    prioritizationHighlights: ResearchPrioritySignal[];
    priorityDrift: PriorityDriftHistory | null;
    priorityHistorySummary: GovernanceHistorySummary | null;
    snapshotComparisons: SnapshotComparisonSummary | null;
    governanceSynthesis: ComparativeGovernanceSynthesis | null;
    sessionRecords: TimelineSessionRecord[];
    strategyShifts: TimelineStrategyShift[];
    blockerPatterns: TimelineBlockerPattern[];
    calibrationTrajectory: TimelineCalibrationTrajectory;
    replayTransitions: TimelineReplayTransition[];
    evaluationDriftHistory: TimelineEvaluationDriftRecord[];
    narrativeEvents: TimelineNarrativeEvent[];
    knownLimitations: string[];
}

export interface ResearchTimelineApiResponse {
    timeline: ResearchTimeline;
    generatedAt: string;
}

export interface ResearchTimelineExportApiResponse {
    timeline: ResearchTimeline;
    narrativeSummary: string;
    exportedAt: string;
}