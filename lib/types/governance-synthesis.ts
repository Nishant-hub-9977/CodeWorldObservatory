// ─── Comparative Governance Synthesis Types ──────────────────────────
// Phase 23: Unified governance synthesis model that integrates
// current priorities, drift, chronicity, snapshot comparisons,
// per-experiment stability, evidence limitations, and governance
// caveats into one coherent comparative governance surface.
//
// This type system removes the fragmentation blocker where five
// separate governance stories (prioritization, drift, history,
// comparison, recommendation governance) were presented as adjacent
// but unsynthesized truths. Consumers now share one structure.
//
// All synthesis is descriptive and non-causal. Nothing in this
// model implies truth confirmation, causal proof, or execution
// authority.

import type { ResearchPriorityClass, ResearchPriorityLevel } from "./research-prioritization";

// ─── Signal Classification ──────────────────────────────────────────
// Unified classification of how an advisory signal behaves across
// all governance dimensions.

export type SignalPosture =
    | "persistent-stable"       // appears in most snapshots, level unchanged
    | "persistent-escalating"   // appears in most snapshots, level increasing
    | "persistent-de-escalating" // appears in most snapshots, level decreasing
    | "persistent-oscillating"  // appears in most snapshots, level variable
    | "recent"                  // appeared only in recent snapshots
    | "weakening"               // present in early snapshots, absent in recent
    | "intermittent"            // appears and disappears across snapshots
    | "single-observation"      // observed once only
    | "current-only"            // present now but no history exists
    ;

export interface SynthesizedAdvisorySignal {
    priorityClass: ResearchPriorityClass;
    currentLevel: ResearchPriorityLevel;
    signalPosture: SignalPosture;

    // Drift context (from Phase 20)
    driftKind: string | null;          // appeared, disappeared, level-changed, etc.
    driftedFromLevel: ResearchPriorityLevel | null;

    // History context (from Phase 21)
    snapshotPresenceRatio: number;     // 0.0–1.0: fraction of snapshots this class appeared
    totalSnapshots: number;

    // Comparison context (from Phase 22)
    consecutiveStability: number;      // 0.0–1.0: fraction of consecutive transitions where level stayed same
    evidenceGapsPersistent: string[];  // gaps that recur across snapshots
    evidenceGapsRecent: string[];      // gaps only in current snapshot

    // Experiment context
    associatedExperimentId: string | null;
    associatedExperimentTitle: string | null;
    experimentStabilityLabel: "stable" | "variable" | "insufficient-history" | null;

    // Narrative
    synthesisNarrative: string;        // one coherent sentence describing this signal's posture
}

// ─── Evidence Limitation Summary ────────────────────────────────────
// Unified view of what evidence remains lacking, drawn from all sources.

export interface EvidenceLimitationSummary {
    chronicEvidenceGaps: string[];           // gaps recurring in ≥70% of snapshots
    currentEvidenceGaps: string[];           // gaps in the current snapshot
    comparisonLimitedAreas: string[];        // priority classes where comparison is structurally limited
    underEvidencedExperiments: string[];     // experiment titles with persistent priority signals
    limitationNarrative: string;             // coherent description of the evidence landscape
}

// ─── Governance Boundary Statement ──────────────────────────────────
// One canonical set of governance boundaries, not five scattered ones.

export interface GovernanceBoundaryStatement {
    // Core doctrine
    advisoryOnly: string;
    noExecutionAuthority: string;
    noCausalProof: string;
    noCertaintyInflation: string;
    noTruthFromRepetition: string;

    // Domain-specific
    driftBoundary: string;
    historyBoundary: string;
    comparisonBoundary: string;
    recommendationBoundary: string;
}

// ─── Comparative Governance Synthesis ────────────────────────────────
// The top-level synthesis object consumed by all major surfaces.

export interface ComparativeGovernanceSynthesis {
    generatedAt: string;
    phaseActive: number;
    systemVersion: string;

    // Synthesized signals
    signals: SynthesizedAdvisorySignal[];
    persistentSignals: SynthesizedAdvisorySignal[];
    unstableSignals: SynthesizedAdvisorySignal[];
    recentSignals: SynthesizedAdvisorySignal[];
    weakeningSignals: SynthesizedAdvisorySignal[];

    // Evidence landscape
    evidenceLimitations: EvidenceLimitationSummary;

    // Governance boundaries (canonical, not duplicated)
    governanceBoundaries: GovernanceBoundaryStatement;

    // Overall governance narrative
    synthesisNarrative: string;
    postureAssessment: string;

    // Counts
    totalAdvisorySignals: number;
    totalHistorySnapshots: number;
    totalDriftsDetected: number;
    totalPairwiseComparisons: number;

    // Single caveat — the one governance caveat for all consumers
    governanceCaveat: string;
}
