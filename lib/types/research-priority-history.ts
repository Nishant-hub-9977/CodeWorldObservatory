// ─── Priority History Types ──────────────────────────────────────────
// Phase 21→22: Typed model for durable historical priority records
// and snapshot-to-snapshot comparison surfaces.
// Priority history captures how the observatory's prioritization
// posture evolved over time as interpretation snapshots, not raw truth.
//
// Each record is a snapshot of the ephemeral prioritization context
// persisted at a specific point in time on an explicit write path.
// Historical analysis and comparison are descriptive and non-causal.

import type {
    ResearchPriorityClass,
    ResearchPriorityLevel,
    ResearchPrioritizationContext,
} from "./research-prioritization";
import type {
    GovernedRecommendation,
    RecommendationGovernanceContext,
} from "./research-priority-drift";

// ─── Historical Priority Record ─────────────────────────────────────

export interface PriorityHistoryRecord {
    recordId: string;
    createdAt: string; // ISO 8601
    phaseActive: number;
    systemVersion: string;
    prioritizationContext: ResearchPrioritizationContext;
    governanceContext: RecommendationGovernanceContext;
    doctrineCaveat: string;
}

// ─── Per-Class Historical Entry ──────────────────────────────────────
// Flattened view of one priority class at one snapshot point.

export interface PriorityClassHistoryEntry {
    recordId: string;
    createdAt: string;
    priorityClass: ResearchPriorityClass;
    advisoryLevel: ResearchPriorityLevel;
    experimentId: string | null;
    experimentTitle: string | null;
    evidenceGaps: string[];
    recommendedFocus: string;
    governedRecommendation: GovernedRecommendation | null;
}

// ─── Chronicity Pattern ──────────────────────────────────────────────
// Describes how a single priority class behaved across snapshots.

export type ChronicityLabel =
    | "persistent"      // appeared in every snapshot
    | "intermittent"    // appeared and disappeared
    | "resolved"        // appeared early, absent in recent snapshots
    | "recent"          // appeared only in recent snapshots
    | "single-snapshot" // appeared exactly once
    ;

export type PostureTrend =
    | "stable"          // advisory level unchanged
    | "escalating"      // advisory level increased over time
    | "de-escalating"   // advisory level decreased over time
    | "oscillating"     // advisory level changed direction multiple times
    | "insufficient-history" // not enough snapshots to determine trend
    ;

export interface PriorityChronicityPattern {
    priorityClass: ResearchPriorityClass;
    chronicity: ChronicityLabel;
    postureTrend: PostureTrend;
    snapshotCount: number;            // how many snapshots included this class
    totalSnapshots: number;           // total snapshots in the ledger
    firstSeenAt: string;
    lastSeenAt: string;
    advisoryLevelHistory: ResearchPriorityLevel[];
    narrative: string;
    caveat: string;
}

// ─── Comparative Governance History Summary ──────────────────────────

export interface GovernanceHistorySummary {
    generatedAt: string;
    totalRecords: number;
    classPatterns: PriorityChronicityPattern[];
    governanceEvolution: string;       // descriptive narrative
    stabilityAssessment: string;       // how stable overall priority posture is
    governanceCaveat: string;
}

// ─── API Response ────────────────────────────────────────────────────

export interface PriorityHistoryApiResponse {
    records: PriorityHistoryRecord[];
    historySummary: GovernanceHistorySummary;
    snapshotComparisons: SnapshotComparisonSummary | null;
    generatedAt: string;
}

// ─── Snapshot Comparison Types (Phase 22) ────────────────────────────
// Describes pairwise differences between consecutive priority snapshots.
// All comparisons are descriptive observations, not causal claims.

export type SnapshotTransitionKind =
    | "appeared"       // class was absent in prior, present in current
    | "disappeared"    // class was present in prior, absent in current
    | "level-changed"  // advisory level shifted
    | "stable"         // present in both, no level change
    ;

export interface SnapshotClassTransition {
    priorityClass: ResearchPriorityClass;
    transitionKind: SnapshotTransitionKind;
    priorLevel: ResearchPriorityLevel | null;
    currentLevel: ResearchPriorityLevel | null;
    priorEvidenceGaps: string[];
    currentEvidenceGaps: string[];
    evidenceGapDelta: {
        added: string[];
        removed: string[];
        persistent: string[];
    };
    narrative: string;
}

export interface PairwiseSnapshotComparison {
    priorRecordId: string;
    currentRecordId: string;
    priorCreatedAt: string;
    currentCreatedAt: string;
    transitions: SnapshotClassTransition[];
    classesMaintained: number;
    classesAppeared: number;
    classesDisappeared: number;
    levelChanges: number;
    comparisonNarrative: string;
    comparisonCaveat: string;
}

export interface ExperimentPriorityStability {
    experimentId: string;
    experimentTitle: string;
    associatedClasses: ResearchPriorityClass[];
    snapshotsPresent: number;
    totalSnapshots: number;
    levelConsistency: number;  // 0.0–1.0: fraction of transitions where level stayed same
    dominantLevel: ResearchPriorityLevel;
    stabilityLabel: "stable" | "variable" | "insufficient-history";
    narrative: string;
}

export interface SnapshotComparisonSummary {
    generatedAt: string;
    totalSnapshots: number;
    pairwiseComparisons: PairwiseSnapshotComparison[];
    experimentStability: ExperimentPriorityStability[];
    emergingSignals: string[];       // classes recently appearing
    weakeningSignals: string[];      // classes recently disappearing
    persistentSignals: string[];     // classes present in most snapshots
    comparisonCaveat: string;
}
