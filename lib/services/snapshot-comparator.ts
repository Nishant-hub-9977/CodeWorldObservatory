// ─── Snapshot Comparator ──────────────────────────────────────────────
// Phase 22: Pairwise comparison of consecutive priority-history snapshots.
// Produces descriptive transition records between snapshots — what classes
// appeared, disappeared, changed level, or remained stable — and per-experiment
// stability assessments across the full historical ledger.
//
// All outputs are descriptive. No comparison implies causality, validation,
// or optimal research direction. Snapshot transitions describe structural
// changes in the observatory's own advisory posture, not ground truth
// confirmation.

import type { ResearchPriorityClass, ResearchPriorityLevel } from "../types/research-prioritization";
import type {
    PriorityHistoryRecord,
    SnapshotClassTransition,
    SnapshotTransitionKind,
    PairwiseSnapshotComparison,
    ExperimentPriorityStability,
    SnapshotComparisonSummary,
} from "../types/research-priority-history";
import { PriorityHistoryStore } from "./priority-history-store";
import { GOVERNANCE_CAVEAT_COMPARISON as COMPARISON_CAVEAT } from "../constants/governance";

export class SnapshotComparator {
    /**
     * Build a full comparison summary from persisted priority history.
     * Read-only — never creates records.
     */
    public static compare(limit = 50): SnapshotComparisonSummary {
        const records = PriorityHistoryStore.listAll().slice(0, limit);
        const now = new Date().toISOString();

        if (records.length < 2) {
            return {
                generatedAt: now,
                totalSnapshots: records.length,
                pairwiseComparisons: [],
                experimentStability: [],
                emergingSignals: [],
                weakeningSignals: [],
                persistentSignals: [],
                comparisonCaveat: COMPARISON_CAVEAT,
            };
        }

        // Records from store are newest-first; reverse for chronological order
        const chronological = records.slice().reverse();
        const pairwiseComparisons = this.buildPairwiseComparisons(chronological);
        const experimentStability = this.buildExperimentStability(chronological);
        const { emergingSignals, weakeningSignals, persistentSignals } =
            this.classifySignalDirections(chronological);

        return {
            generatedAt: now,
            totalSnapshots: records.length,
            pairwiseComparisons,
            experimentStability,
            emergingSignals,
            weakeningSignals,
            persistentSignals,
            comparisonCaveat: COMPARISON_CAVEAT,
        };
    }

    /**
     * Compare each consecutive pair of snapshots.
     */
    private static buildPairwiseComparisons(
        chronological: PriorityHistoryRecord[]
    ): PairwiseSnapshotComparison[] {
        const comparisons: PairwiseSnapshotComparison[] = [];

        for (let i = 1; i < chronological.length; i++) {
            const prior = chronological[i - 1];
            const current = chronological[i];
            comparisons.push(this.comparePair(prior, current));
        }

        return comparisons;
    }

    private static comparePair(
        prior: PriorityHistoryRecord,
        current: PriorityHistoryRecord
    ): PairwiseSnapshotComparison {
        const priorClasses = new Map<ResearchPriorityClass, {
            level: ResearchPriorityLevel;
            gaps: string[];
        }>();
        for (const sig of prior.prioritizationContext.topPriorities) {
            priorClasses.set(sig.priorityClass, {
                level: sig.advisoryLevel,
                gaps: sig.evidenceGaps,
            });
        }

        const currentClasses = new Map<ResearchPriorityClass, {
            level: ResearchPriorityLevel;
            gaps: string[];
        }>();
        for (const sig of current.prioritizationContext.topPriorities) {
            currentClasses.set(sig.priorityClass, {
                level: sig.advisoryLevel,
                gaps: sig.evidenceGaps,
            });
        }

        const transitions: SnapshotClassTransition[] = [];
        let maintained = 0;
        let appeared = 0;
        let disappeared = 0;
        let levelChanges = 0;

        // Classes in current snapshot
        for (const [cls, curr] of currentClasses) {
            const prev = priorClasses.get(cls);
            if (!prev) {
                // Appeared
                appeared++;
                transitions.push(this.buildTransition(cls, "appeared", null, curr.level, [], curr.gaps));
            } else {
                // Present in both
                if (prev.level !== curr.level) {
                    levelChanges++;
                    transitions.push(this.buildTransition(cls, "level-changed", prev.level, curr.level, prev.gaps, curr.gaps));
                } else {
                    maintained++;
                    transitions.push(this.buildTransition(cls, "stable", prev.level, curr.level, prev.gaps, curr.gaps));
                }
            }
        }

        // Classes only in prior (disappeared)
        for (const [cls, prev] of priorClasses) {
            if (!currentClasses.has(cls)) {
                disappeared++;
                transitions.push(this.buildTransition(cls, "disappeared", prev.level, null, prev.gaps, []));
            }
        }

        const comparisonNarrative = this.buildPairNarrative(
            maintained, appeared, disappeared, levelChanges, transitions
        );

        return {
            priorRecordId: prior.recordId,
            currentRecordId: current.recordId,
            priorCreatedAt: prior.createdAt,
            currentCreatedAt: current.createdAt,
            transitions,
            classesMaintained: maintained,
            classesAppeared: appeared,
            classesDisappeared: disappeared,
            levelChanges,
            comparisonNarrative,
            comparisonCaveat: "This comparison describes structural changes between two consecutive advisory snapshots. It does not imply that changes reflect research progress or regression.",
        };
    }

    private static buildTransition(
        priorityClass: ResearchPriorityClass,
        transitionKind: SnapshotTransitionKind,
        priorLevel: ResearchPriorityLevel | null,
        currentLevel: ResearchPriorityLevel | null,
        priorGaps: string[],
        currentGaps: string[]
    ): SnapshotClassTransition {
        const priorSet = new Set(priorGaps);
        const currentSet = new Set(currentGaps);
        const added = currentGaps.filter(g => !priorSet.has(g));
        const removed = priorGaps.filter(g => !currentSet.has(g));
        const persistent = priorGaps.filter(g => currentSet.has(g));

        const className = priorityClass.replace(/-/g, " ");
        let narrative: string;

        switch (transitionKind) {
            case "appeared":
                narrative = `The '${className}' priority appeared in this snapshot at ${currentLevel} level.`;
                break;
            case "disappeared":
                narrative = `The '${className}' priority was present in the prior snapshot at ${priorLevel} level but is absent in this one.`;
                break;
            case "level-changed":
                narrative = `The '${className}' priority shifted from ${priorLevel} to ${currentLevel} advisory level.`;
                break;
            case "stable":
                narrative = `The '${className}' priority remained at ${currentLevel} level across both snapshots.`;
                break;
        }

        if (persistent.length > 0) {
            narrative += ` Evidence gaps persisting: ${persistent.join(", ")}.`;
        }
        if (added.length > 0) {
            narrative += ` New evidence gaps observed: ${added.join(", ")}.`;
        }
        if (removed.length > 0) {
            narrative += ` Evidence gaps no longer present: ${removed.join(", ")}.`;
        }

        return {
            priorityClass,
            transitionKind,
            priorLevel,
            currentLevel,
            priorEvidenceGaps: priorGaps,
            currentEvidenceGaps: currentGaps,
            evidenceGapDelta: { added, removed, persistent },
            narrative,
        };
    }

    private static buildPairNarrative(
        maintained: number,
        appeared: number,
        disappeared: number,
        levelChanges: number,
        transitions: SnapshotClassTransition[]
    ): string {
        const parts: string[] = [];

        const total = maintained + appeared + disappeared + levelChanges;
        parts.push(`Between these two snapshots, ${total} priority class transition(s) were observed.`);

        if (maintained > 0) {
            parts.push(`${maintained} class(es) remained at the same advisory level.`);
        }
        if (appeared > 0) {
            const names = transitions
                .filter(t => t.transitionKind === "appeared")
                .map(t => t.priorityClass.replace(/-/g, " "))
                .join(", ");
            parts.push(`${appeared} class(es) appeared: ${names}.`);
        }
        if (disappeared > 0) {
            const names = transitions
                .filter(t => t.transitionKind === "disappeared")
                .map(t => t.priorityClass.replace(/-/g, " "))
                .join(", ");
            parts.push(`${disappeared} class(es) disappeared: ${names}.`);
        }
        if (levelChanges > 0) {
            parts.push(`${levelChanges} class(es) changed advisory level.`);
        }

        parts.push("These transitions describe structural advisory posture changes, not research outcomes.");

        return parts.join(" ");
    }

    /**
     * Per-experiment stability across all snapshots.
     */
    private static buildExperimentStability(
        chronological: PriorityHistoryRecord[]
    ): ExperimentPriorityStability[] {
        // Map: experimentId → { title, appearances[] }
        const experimentMap = new Map<string, {
            title: string;
            classes: Set<ResearchPriorityClass>;
            levels: ResearchPriorityLevel[];
            snapshotsPresent: number;
        }>();

        for (const record of chronological) {
            const seenInThisSnapshot = new Set<string>();
            for (const sig of record.prioritizationContext.topPriorities) {
                if (!sig.experimentId) continue;
                if (seenInThisSnapshot.has(sig.experimentId)) continue;
                seenInThisSnapshot.add(sig.experimentId);

                const existing = experimentMap.get(sig.experimentId);
                if (existing) {
                    existing.classes.add(sig.priorityClass);
                    existing.levels.push(sig.advisoryLevel);
                    existing.snapshotsPresent++;
                } else {
                    experimentMap.set(sig.experimentId, {
                        title: sig.experimentTitle ?? sig.experimentId,
                        classes: new Set([sig.priorityClass]),
                        levels: [sig.advisoryLevel],
                        snapshotsPresent: 1,
                    });
                }
            }
        }

        const totalSnapshots = chronological.length;
        const results: ExperimentPriorityStability[] = [];

        for (const [experimentId, data] of experimentMap) {
            const levelOrder: Record<string, number> = { "low": 0, "medium": 1, "high": 2, "critical": 3 };

            // Level consistency: fraction of consecutive pairs where level stayed the same
            let sameCount = 0;
            for (let i = 1; i < data.levels.length; i++) {
                if (data.levels[i] === data.levels[i - 1]) sameCount++;
            }
            const levelConsistency = data.levels.length > 1
                ? sameCount / (data.levels.length - 1)
                : 1.0;

            // Dominant level: most frequent
            const freq = new Map<ResearchPriorityLevel, number>();
            for (const l of data.levels) {
                freq.set(l, (freq.get(l) ?? 0) + 1);
            }
            let dominantLevel: ResearchPriorityLevel = data.levels[0];
            let maxFreq = 0;
            for (const [level, count] of freq) {
                if (count > maxFreq || (count === maxFreq && (levelOrder[level] ?? 0) > (levelOrder[dominantLevel] ?? 0))) {
                    dominantLevel = level;
                    maxFreq = count;
                }
            }

            const stabilityLabel: ExperimentPriorityStability["stabilityLabel"] =
                data.levels.length < 2 ? "insufficient-history" :
                levelConsistency >= 0.8 ? "stable" : "variable";

            const narrative = this.buildExperimentNarrative(
                data.title, data.snapshotsPresent, totalSnapshots,
                stabilityLabel, dominantLevel, Array.from(data.classes)
            );

            results.push({
                experimentId,
                experimentTitle: data.title,
                associatedClasses: Array.from(data.classes),
                snapshotsPresent: data.snapshotsPresent,
                totalSnapshots,
                levelConsistency: Math.round(levelConsistency * 100) / 100,
                dominantLevel,
                stabilityLabel,
                narrative,
            });
        }

        return results.sort((a, b) => b.snapshotsPresent - a.snapshotsPresent);
    }

    private static buildExperimentNarrative(
        title: string,
        present: number,
        total: number,
        stability: ExperimentPriorityStability["stabilityLabel"],
        dominant: ResearchPriorityLevel,
        classes: ResearchPriorityClass[]
    ): string {
        const parts: string[] = [];

        parts.push(`'${title}' appeared in priority signals across ${present} of ${total} snapshot(s).`);

        const classNames = classes.map(c => c.replace(/-/g, " ")).join(", ");
        parts.push(`Associated priority classes: ${classNames}.`);

        switch (stability) {
            case "stable":
                parts.push(`Its advisory level has been predominantly ${dominant}, showing stable posture.`);
                break;
            case "variable":
                parts.push(`Its advisory level has varied across snapshots, with ${dominant} being the most frequent.`);
                break;
            case "insufficient-history":
                parts.push(`Insufficient history to assess advisory-level stability.`);
                break;
        }

        return parts.join(" ");
    }

    /**
     * Classify which signals are emerging, weakening, or persistent
     * based on their presence in recent vs early snapshots.
     */
    private static classifySignalDirections(
        chronological: PriorityHistoryRecord[]
    ): {
        emergingSignals: string[];
        weakeningSignals: string[];
        persistentSignals: string[];
    } {
        const total = chronological.length;
        if (total < 2) {
            return { emergingSignals: [], weakeningSignals: [], persistentSignals: [] };
        }

        // Split into halves
        const midpoint = Math.floor(total / 2);
        const earlyRecords = chronological.slice(0, midpoint);
        const recentRecords = chronological.slice(midpoint);

        const earlyClasses = new Set<string>();
        const recentClasses = new Set<string>();
        const allClasses = new Set<string>();

        for (const r of earlyRecords) {
            for (const s of r.prioritizationContext.topPriorities) {
                earlyClasses.add(s.priorityClass);
                allClasses.add(s.priorityClass);
            }
        }
        for (const r of recentRecords) {
            for (const s of r.prioritizationContext.topPriorities) {
                recentClasses.add(s.priorityClass);
                allClasses.add(s.priorityClass);
            }
        }

        const emerging: string[] = [];
        const weakening: string[] = [];
        const persistent: string[] = [];

        for (const cls of allClasses) {
            const inEarly = earlyClasses.has(cls);
            const inRecent = recentClasses.has(cls);

            if (inRecent && !inEarly) {
                emerging.push(cls);
            } else if (inEarly && !inRecent) {
                weakening.push(cls);
            } else if (inEarly && inRecent) {
                persistent.push(cls);
            }
        }

        return {
            emergingSignals: emerging.sort(),
            weakeningSignals: weakening.sort(),
            persistentSignals: persistent.sort(),
        };
    }
}
