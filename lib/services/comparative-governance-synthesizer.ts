// ─── Comparative Governance Synthesizer ──────────────────────────────
// Phase 23: Unifies the fragmented governance story across five
// separate sources — prioritization, drift, history, snapshot
// comparison, and recommendation governance — into one coherent
// comparative governance synthesis consumed by all major surfaces.
//
// This service is read-only. It never creates, writes, or persists
// any data. It merges existing computed and persisted governance
// state into a single descriptive synthesis.
//
// All synthesis is descriptive. Nothing in this service implies
// causal proof, certainty inflation, execution authority, or
// "best experiment" ranking.

import type { ResearchPrioritizationContext, ResearchPriorityClass, ResearchPriorityLevel } from "../types/research-prioritization";
import type { PriorityDriftHistory, RecommendationGovernanceContext } from "../types/research-priority-drift";
import type {
    GovernanceHistorySummary,
    SnapshotComparisonSummary,
    PriorityChronicityPattern,
    ExperimentPriorityStability,
} from "../types/research-priority-history";
import type {
    ComparativeGovernanceSynthesis,
    SynthesizedAdvisorySignal,
    SignalPosture,
    EvidenceLimitationSummary,
} from "../types/governance-synthesis";

import { OBSERVATORY_VERSION } from "../constants/observatory";
import { OBSERVATORY_ACTIVE_PHASE } from "../constants/observatory-status";
import {
    GOVERNANCE_CAVEAT_SYNTHESIS as GOVERNANCE_CAVEAT,
    BOUNDARY_STATEMENTS,
} from "../constants/governance";

export class ComparativeGovernanceSynthesizer {
    /**
     * Produces a unified comparative governance synthesis from
     * all governance-producing subsystems. Read-only — never
     * creates, writes, or persists any data.
     */
    public static synthesize(
        prioritizationContext: ResearchPrioritizationContext,
        priorityDrift: PriorityDriftHistory | null,
        recommendationGovernance: RecommendationGovernanceContext | null,
        priorityHistorySummary: GovernanceHistorySummary | null,
        snapshotComparisons: SnapshotComparisonSummary | null,
    ): ComparativeGovernanceSynthesis {
        const now = new Date().toISOString();

        const signals = this.synthesizeSignals(
            prioritizationContext,
            priorityDrift,
            priorityHistorySummary,
            snapshotComparisons,
        );

        const persistentSignals = signals.filter(s =>
            s.signalPosture === "persistent-stable" ||
            s.signalPosture === "persistent-escalating" ||
            s.signalPosture === "persistent-de-escalating" ||
            s.signalPosture === "persistent-oscillating"
        );
        const unstableSignals = signals.filter(s =>
            s.signalPosture === "persistent-oscillating" ||
            s.signalPosture === "intermittent"
        );
        const recentSignals = signals.filter(s =>
            s.signalPosture === "recent"
        );
        const weakeningSignals = signals.filter(s =>
            s.signalPosture === "weakening"
        );

        const evidenceLimitations = this.synthesizeEvidenceLimitations(
            signals,
            priorityHistorySummary,
            snapshotComparisons,
        );

        const synthesisNarrative = this.buildSynthesisNarrative(
            signals, persistentSignals, unstableSignals, recentSignals, weakeningSignals,
            priorityDrift, priorityHistorySummary, snapshotComparisons,
        );

        const postureAssessment = this.buildPostureAssessment(
            signals, priorityDrift, priorityHistorySummary,
        );

        return {
            generatedAt: now,
            phaseActive: OBSERVATORY_ACTIVE_PHASE,
            systemVersion: OBSERVATORY_VERSION,
            signals,
            persistentSignals,
            unstableSignals,
            recentSignals,
            weakeningSignals,
            evidenceLimitations,
            governanceBoundaries: BOUNDARY_STATEMENTS,
            synthesisNarrative,
            postureAssessment,
            totalAdvisorySignals: signals.length,
            totalHistorySnapshots: priorityHistorySummary?.totalRecords ?? 0,
            totalDriftsDetected: priorityDrift?.totalDrifts ?? 0,
            totalPairwiseComparisons: snapshotComparisons?.pairwiseComparisons.length ?? 0,
            governanceCaveat: GOVERNANCE_CAVEAT,
        };
    }

    // ─── Signal Synthesis ─────────────────────────────────────────
    // Merges current priority signals with drift, history, and
    // comparison data to produce one synthesized signal per
    // priority class.

    private static synthesizeSignals(
        prioritizationContext: ResearchPrioritizationContext,
        priorityDrift: PriorityDriftHistory | null,
        priorityHistorySummary: GovernanceHistorySummary | null,
        snapshotComparisons: SnapshotComparisonSummary | null,
    ): SynthesizedAdvisorySignal[] {
        const signals: SynthesizedAdvisorySignal[] = [];

        for (const signal of prioritizationContext.topPriorities) {
            const chronicityPattern = priorityHistorySummary?.classPatterns.find(
                p => p.priorityClass === signal.priorityClass
            ) ?? null;

            const driftRecord = priorityDrift?.driftRecords.find(
                d => d.priorityClass === signal.priorityClass
            ) ?? null;

            const experimentStability = snapshotComparisons?.experimentStability.find(
                e => signal.experimentId && e.experimentId === signal.experimentId
            ) ?? null;

            const signalPosture = this.classifySignalPosture(
                chronicityPattern,
                snapshotComparisons,
                signal.priorityClass,
            );

            const consecutiveStability = this.computeConsecutiveStability(
                snapshotComparisons,
                signal.priorityClass,
            );

            const { chronic: chronicGaps, recent: recentGaps } = this.classifyEvidenceGaps(
                signal.evidenceGaps,
                chronicityPattern,
            );

            const narrative = this.buildSignalNarrative(
                signal.priorityClass,
                signal.advisoryLevel,
                signalPosture,
                driftRecord?.driftKind ?? null,
                driftRecord?.previousSignal?.advisoryLevel ?? null,
                chronicityPattern,
                experimentStability,
            );

            signals.push({
                priorityClass: signal.priorityClass,
                currentLevel: signal.advisoryLevel,
                signalPosture,
                driftKind: driftRecord?.driftKind ?? null,
                driftedFromLevel: driftRecord?.previousSignal?.advisoryLevel ?? null,
                snapshotPresenceRatio: chronicityPattern
                    ? chronicityPattern.snapshotCount / chronicityPattern.totalSnapshots
                    : 0,
                totalSnapshots: chronicityPattern?.totalSnapshots ?? 0,
                consecutiveStability,
                evidenceGapsPersistent: chronicGaps,
                evidenceGapsRecent: recentGaps,
                associatedExperimentId: signal.experimentId,
                associatedExperimentTitle: signal.experimentTitle,
                experimentStabilityLabel: experimentStability?.stabilityLabel ?? null,
                synthesisNarrative: narrative,
            });
        }

        return signals;
    }

    // ─── Signal Posture Classification ────────────────────────────

    private static classifySignalPosture(
        chronicityPattern: PriorityChronicityPattern | null,
        snapshotComparisons: SnapshotComparisonSummary | null,
        priorityClass: ResearchPriorityClass,
    ): SignalPosture {
        // No history at all
        if (!chronicityPattern) {
            return "current-only";
        }

        const { chronicity, postureTrend, snapshotCount, totalSnapshots } = chronicityPattern;

        // Single observation
        if (chronicity === "single-snapshot") {
            return "single-observation";
        }

        // Recent appearance (appeared only in recent snapshots)
        if (chronicity === "recent") {
            return "recent";
        }

        // Resolved / weakening (appeared early, absent recently)
        if (chronicity === "resolved") {
            // If it's currently in topPriorities, it re-appeared — treat as intermittent
            return "intermittent";
        }

        // Intermittent
        if (chronicity === "intermittent") {
            return "intermittent";
        }

        // Persistent — further refinement by posture trend
        if (chronicity === "persistent") {
            switch (postureTrend) {
                case "stable": return "persistent-stable";
                case "escalating": return "persistent-escalating";
                case "de-escalating": return "persistent-de-escalating";
                case "oscillating": return "persistent-oscillating";
                default: return "persistent-stable";
            }
        }

        // Check weakening direction if present in comparisons
        if (snapshotComparisons?.weakeningSignals.includes(priorityClass)) {
            return "weakening";
        }

        return "current-only";
    }

    // ─── Consecutive Stability ────────────────────────────────────

    private static computeConsecutiveStability(
        snapshotComparisons: SnapshotComparisonSummary | null,
        priorityClass: ResearchPriorityClass,
    ): number {
        if (!snapshotComparisons || snapshotComparisons.pairwiseComparisons.length === 0) {
            return 0;
        }

        let stableCount = 0;
        let totalPresent = 0;

        for (const comparison of snapshotComparisons.pairwiseComparisons) {
            const transition = comparison.transitions.find(
                t => t.priorityClass === priorityClass
            );
            if (transition) {
                totalPresent++;
                if (transition.transitionKind === "stable") {
                    stableCount++;
                }
            }
        }

        return totalPresent > 0 ? stableCount / totalPresent : 0;
    }

    // ─── Evidence Gap Classification ──────────────────────────────

    private static classifyEvidenceGaps(
        currentGaps: string[],
        chronicityPattern: PriorityChronicityPattern | null,
    ): { chronic: string[]; recent: string[] } {
        if (!chronicityPattern || !currentGaps.length) {
            return { chronic: [], recent: currentGaps };
        }

        // A gap is chronic if the signal has appeared in ≥70% of snapshots —
        // meaning the gap has persisted structurally. Otherwise it's recent.
        const presenceRatio = chronicityPattern.snapshotCount / chronicityPattern.totalSnapshots;
        if (presenceRatio >= 0.7) {
            return { chronic: currentGaps, recent: [] };
        }

        return { chronic: [], recent: currentGaps };
    }

    // ─── Evidence Limitation Synthesis ────────────────────────────

    private static synthesizeEvidenceLimitations(
        signals: SynthesizedAdvisorySignal[],
        priorityHistorySummary: GovernanceHistorySummary | null,
        snapshotComparisons: SnapshotComparisonSummary | null,
    ): EvidenceLimitationSummary {
        const chronicGaps = new Set<string>();
        const currentGaps = new Set<string>();
        const comparisonLimited = new Set<string>();
        const underEvidenced = new Set<string>();

        for (const signal of signals) {
            for (const gap of signal.evidenceGapsPersistent) chronicGaps.add(gap);
            for (const gap of signal.evidenceGapsRecent) currentGaps.add(gap);

            if (signal.priorityClass === "comparison-limited") {
                comparisonLimited.add(signal.associatedExperimentTitle ?? signal.priorityClass);
            }

            if (signal.signalPosture.startsWith("persistent") && signal.associatedExperimentTitle) {
                underEvidenced.add(signal.associatedExperimentTitle);
            }
        }

        // Check for structurally limited comparison areas
        if (snapshotComparisons && snapshotComparisons.totalSnapshots < 3) {
            comparisonLimited.add("Overall comparison surface remains limited: fewer than 3 snapshots exist");
        }

        const limitationNarrative = this.buildLimitationNarrative(
            chronicGaps.size, currentGaps.size, comparisonLimited.size, underEvidenced.size,
            priorityHistorySummary?.totalRecords ?? 0,
        );

        return {
            chronicEvidenceGaps: Array.from(chronicGaps),
            currentEvidenceGaps: Array.from(currentGaps),
            comparisonLimitedAreas: Array.from(comparisonLimited),
            underEvidencedExperiments: Array.from(underEvidenced),
            limitationNarrative,
        };
    }

    private static buildLimitationNarrative(
        chronicCount: number,
        currentCount: number,
        comparisonLimitedCount: number,
        underEvidencedCount: number,
        totalHistoryRecords: number,
    ): string {
        const parts: string[] = [];

        if (chronicCount > 0) {
            parts.push(`${chronicCount} evidence gap(s) have persisted across the majority of advisory snapshots, suggesting structural evidence deficiency rather than transient gaps.`);
        }
        if (currentCount > 0 && chronicCount === 0) {
            parts.push(`${currentCount} evidence gap(s) are present in the current snapshot but have not yet shown historical persistence.`);
        }
        if (comparisonLimitedCount > 0) {
            parts.push(`${comparisonLimitedCount} area(s) remain structurally comparison-limited.`);
        }
        if (underEvidencedCount > 0) {
            parts.push(`${underEvidencedCount} experiment(s) carry persistent priority signals, indicating sustained advisory pressure.`);
        }
        if (totalHistoryRecords < 2) {
            parts.push("Historical comparison is structurally limited because fewer than 2 priority snapshots have been persisted.");
        }

        if (parts.length === 0) {
            return "No significant evidence limitations detected in the current governance synthesis. This assessment remains bounded by available snapshot evidence.";
        }

        return parts.join(" ");
    }

    // ─── Narrative Builders ───────────────────────────────────────

    private static buildSignalNarrative(
        priorityClass: ResearchPriorityClass,
        currentLevel: ResearchPriorityLevel,
        posture: SignalPosture,
        driftKind: string | null,
        driftedFromLevel: ResearchPriorityLevel | null,
        chronicityPattern: PriorityChronicityPattern | null,
        experimentStability: ExperimentPriorityStability | null,
    ): string {
        const className = priorityClass.replace(/-/g, " ");
        const parts: string[] = [];

        // Current state
        parts.push(`The '${className}' signal is currently at ${currentLevel} advisory level.`);

        // Posture
        switch (posture) {
            case "persistent-stable":
                parts.push(`It has persisted stably across ${chronicityPattern?.snapshotCount ?? "multiple"} of ${chronicityPattern?.totalSnapshots ?? "available"} snapshots.`);
                break;
            case "persistent-escalating":
                parts.push(`It has persisted across snapshots with an escalating posture trend.`);
                break;
            case "persistent-de-escalating":
                parts.push(`It has persisted across snapshots but its advisory level has been de-escalating.`);
                break;
            case "persistent-oscillating":
                parts.push(`It has persisted across snapshots but its advisory level has oscillated.`);
                break;
            case "recent":
                parts.push(`It appeared only in recent snapshots and does not yet have a historical pattern.`);
                break;
            case "weakening":
                parts.push(`It was present in earlier snapshots but is showing signs of weakening presence.`);
                break;
            case "intermittent":
                parts.push(`It has appeared and disappeared across snapshots intermittently.`);
                break;
            case "single-observation":
                parts.push(`It has been observed in only one snapshot.`);
                break;
            case "current-only":
                parts.push(`No historical record exists for this signal yet.`);
                break;
        }

        // Drift
        if (driftKind && driftKind !== "stable") {
            if (driftKind === "appeared") {
                parts.push(`It was newly detected in the latest drift comparison.`);
            } else if (driftKind === "level-changed" && driftedFromLevel) {
                parts.push(`It changed from ${driftedFromLevel} to ${currentLevel} in the latest drift comparison.`);
            }
        }

        // Experiment stability
        if (experimentStability) {
            parts.push(`Its associated experiment ('${experimentStability.experimentTitle}') shows ${experimentStability.stabilityLabel} priority stability.`);
        }

        return parts.join(" ");
    }

    private static buildSynthesisNarrative(
        allSignals: SynthesizedAdvisorySignal[],
        persistent: SynthesizedAdvisorySignal[],
        unstable: SynthesizedAdvisorySignal[],
        recent: SynthesizedAdvisorySignal[],
        weakening: SynthesizedAdvisorySignal[],
        priorityDrift: PriorityDriftHistory | null,
        priorityHistorySummary: GovernanceHistorySummary | null,
        snapshotComparisons: SnapshotComparisonSummary | null,
    ): string {
        const parts: string[] = [];

        // Overall signal count
        parts.push(`The governance synthesis integrates ${allSignals.length} advisory signal(s) across prioritization, drift, historical, and comparison dimensions.`);

        // History depth
        const historyRecords = priorityHistorySummary?.totalRecords ?? 0;
        if (historyRecords > 0) {
            parts.push(`${historyRecords} persisted priority snapshot(s) form the historical baseline.`);
        } else {
            parts.push("No persisted priority snapshots exist yet; historical analysis awaits the first explicit write.");
        }

        // Persistent
        if (persistent.length > 0) {
            const classNames = persistent.map(s => s.priorityClass.replace(/-/g, " ")).join(", ");
            parts.push(`${persistent.length} signal(s) show persistent posture: ${classNames}.`);
        }

        // Unstable
        if (unstable.length > 0) {
            parts.push(`${unstable.length} signal(s) show unstable or oscillating posture.`);
        }

        // Recent
        if (recent.length > 0) {
            parts.push(`${recent.length} signal(s) appeared only recently and lack historical depth.`);
        }

        // Weakening
        if (weakening.length > 0) {
            parts.push(`${weakening.length} signal(s) show weakening presence.`);
        }

        // Drift
        if (priorityDrift && priorityDrift.totalDrifts > 0) {
            parts.push(`${priorityDrift.totalDrifts} drift(s) were detected since the prior snapshot.`);
        }

        // Comparisons
        const comparisonCount = snapshotComparisons?.pairwiseComparisons.length ?? 0;
        if (comparisonCount > 0) {
            parts.push(`${comparisonCount} pairwise snapshot comparison(s) inform the stability assessment.`);
        }

        return parts.join(" ");
    }

    private static buildPostureAssessment(
        signals: SynthesizedAdvisorySignal[],
        priorityDrift: PriorityDriftHistory | null,
        priorityHistorySummary: GovernanceHistorySummary | null,
    ): string {
        if (signals.length === 0) {
            return "No advisory signals are active. The governance posture is structurally quiescent.";
        }

        const hasHistory = (priorityHistorySummary?.totalRecords ?? 0) > 0;
        const hasDrifts = (priorityDrift?.totalDrifts ?? 0) > 0;

        const highOrCritical = signals.filter(
            s => s.currentLevel === "high" || s.currentLevel === "critical"
        );

        const persistentCount = signals.filter(s => s.signalPosture.startsWith("persistent")).length;
        const unstableCount = signals.filter(
            s => s.signalPosture === "persistent-oscillating" || s.signalPosture === "intermittent"
        ).length;

        const parts: string[] = [];

        if (highOrCritical.length > 0) {
            parts.push(`${highOrCritical.length} signal(s) are at high or critical advisory level.`);
        }

        if (persistentCount > 0 && hasHistory) {
            parts.push(`${persistentCount} signal(s) show persistent historical presence, indicating structural rather than transient advisory pressure.`);
        }

        if (unstableCount > 0) {
            parts.push(`${unstableCount} signal(s) show unstable posture, suggesting the advisory landscape is not yet settled.`);
        }

        if (hasDrifts) {
            parts.push("Recent drift activity indicates the advisory posture is actively evolving.");
        } else if (hasHistory) {
            parts.push("No recent drift detected; the advisory posture appears comparatively stable relative to the prior snapshot.");
        }

        if (!hasHistory) {
            parts.push("Historical governance assessment is not yet possible. At least one priority snapshot must be persisted through an explicit write before longitudinal synthesis is available.");
        }

        if (priorityHistorySummary?.stabilityAssessment) {
            parts.push(priorityHistorySummary.stabilityAssessment);
        }

        return parts.join(" ");
    }
}
