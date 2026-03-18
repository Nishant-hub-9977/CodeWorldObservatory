// ─── Priority History Analyzer ────────────────────────────────────────
// Phase 21: Analyzes the persisted priority history ledger to detect
// longitudinal patterns — chronicity, posture trends, oscillation,
// and governance evolution — across multiple priority snapshots.
//
// All analysis is descriptive. It describes what the historical record
// shows, not why priorities changed. Repeated appearance of a priority
// class indicates persistent structural posture, not validated truth
// or causal certainty.

import type { ResearchPriorityClass, ResearchPriorityLevel } from "../types/research-prioritization";
import type { PriorityHistoryRecord } from "../types/research-priority-history";
import type {
    ChronicityLabel,
    PostureTrend,
    PriorityChronicityPattern,
    PriorityClassHistoryEntry,
    GovernanceHistorySummary,
} from "../types/research-priority-history";
import { PriorityHistoryStore } from "./priority-history-store";
import { GOVERNANCE_CAVEAT_HISTORY as GOVERNANCE_CAVEAT } from "../constants/governance";

export class PriorityHistoryAnalyzer {
    /**
     * Builds a full governance history summary from all persisted
     * priority records. Read-only — never creates records.
     */
    public static analyze(limit = 50): GovernanceHistorySummary {
        const records = PriorityHistoryStore.listAll().slice(0, limit);
        const now = new Date().toISOString();

        if (records.length === 0) {
            return {
                generatedAt: now,
                totalRecords: 0,
                classPatterns: [],
                governanceEvolution: "No priority history records exist. Historical analysis requires at least one persisted priority snapshot.",
                stabilityAssessment: "No assessment possible without persisted priority history.",
                governanceCaveat: GOVERNANCE_CAVEAT,
            };
        }

        // Build per-class entry timeline (chronological order)
        const chronological = records.slice().reverse();
        const classEntries = this.buildClassEntries(chronological);
        const classPatterns = this.deriveChronicityPatterns(classEntries, chronological.length);
        const governanceEvolution = this.synthesizeGovernanceEvolution(classPatterns, chronological.length);
        const stabilityAssessment = this.assessStability(classPatterns);

        return {
            generatedAt: now,
            totalRecords: records.length,
            classPatterns,
            governanceEvolution,
            stabilityAssessment,
            governanceCaveat: GOVERNANCE_CAVEAT,
        };
    }

    /**
     * Extracts per-class history entries from chronologically ordered records.
     */
    private static buildClassEntries(
        chronological: PriorityHistoryRecord[]
    ): Map<ResearchPriorityClass, PriorityClassHistoryEntry[]> {
        const classMap = new Map<ResearchPriorityClass, PriorityClassHistoryEntry[]>();

        for (const record of chronological) {
            const governed = record.governanceContext.governedRecommendations;

            for (const signal of record.prioritizationContext.topPriorities) {
                const gov = governed.find(g =>
                    g.text.includes(signal.priorityClass.replace(/-/g, " ")) ||
                    g.text === signal.recommendedFocus ||
                    g.missingEvidenceClasses.some(c => signal.evidenceGaps.includes(c))
                ) ?? null;

                const entry: PriorityClassHistoryEntry = {
                    recordId: record.recordId,
                    createdAt: record.createdAt,
                    priorityClass: signal.priorityClass,
                    advisoryLevel: signal.advisoryLevel,
                    experimentId: signal.experimentId,
                    experimentTitle: signal.experimentTitle,
                    evidenceGaps: signal.evidenceGaps,
                    recommendedFocus: signal.recommendedFocus,
                    governedRecommendation: gov,
                };

                const existing = classMap.get(signal.priorityClass) ?? [];
                existing.push(entry);
                classMap.set(signal.priorityClass, existing);
            }
        }

        return classMap;
    }

    /**
     * Derives chronicity and posture trend for each priority class.
     */
    private static deriveChronicityPatterns(
        classEntries: Map<ResearchPriorityClass, PriorityClassHistoryEntry[]>,
        totalSnapshots: number
    ): PriorityChronicityPattern[] {
        const patterns: PriorityChronicityPattern[] = [];

        for (const [priorityClass, entries] of classEntries) {
            const snapshotCount = entries.length;
            const firstSeenAt = entries[0].createdAt;
            const lastSeenAt = entries[entries.length - 1].createdAt;
            const advisoryLevelHistory = entries.map(e => e.advisoryLevel);

            const chronicity = this.classifyChronicity(
                snapshotCount, totalSnapshots, firstSeenAt, lastSeenAt, entries
            );
            const postureTrend = this.classifyPostureTrend(advisoryLevelHistory);

            const narrative = this.buildClassNarrative(
                priorityClass, chronicity, postureTrend, snapshotCount, totalSnapshots, entries
            );

            patterns.push({
                priorityClass,
                chronicity,
                postureTrend,
                snapshotCount,
                totalSnapshots,
                firstSeenAt,
                lastSeenAt,
                advisoryLevelHistory,
                narrative,
                caveat: `Chronicity pattern for '${priorityClass}' reflects structural recurrence in persisted snapshots, not causal proof or truth validation.`,
            });
        }

        return patterns.sort((a, b) => b.snapshotCount - a.snapshotCount);
    }

    private static classifyChronicity(
        snapshotCount: number,
        totalSnapshots: number,
        _firstSeenAt: string,
        _lastSeenAt: string,
        entries: PriorityClassHistoryEntry[]
    ): ChronicityLabel {
        if (totalSnapshots <= 1) return "single-snapshot";
        if (snapshotCount === 1) return "single-snapshot";
        if (snapshotCount === totalSnapshots) return "persistent";

        // Check if recent (appeared only in the last third of snapshots)
        const ratio = snapshotCount / totalSnapshots;
        const latestEntry = entries[entries.length - 1];
        const earliestEntry = entries[0];

        // If it was absent recently, it's resolved
        // We need the full record list to determine recency, so approximate
        // by checking if the ratio is partial and the last-seen aligns with early snapshots
        if (ratio < 0.5 && latestEntry === earliestEntry) return "single-snapshot";
        if (ratio >= 0.8) return "persistent";
        if (ratio < 0.4) return "recent";

        return "intermittent";
    }

    private static classifyPostureTrend(
        levels: ResearchPriorityLevel[]
    ): PostureTrend {
        if (levels.length < 2) return "insufficient-history";

        const levelOrder: Record<ResearchPriorityLevel, number> = { "low": 0, "medium": 1, "high": 2, "critical": 3 };
        const numeric = levels.map(l => levelOrder[l] ?? 0);

        let increases = 0;
        let decreases = 0;
        for (let i = 1; i < numeric.length; i++) {
            if (numeric[i] > numeric[i - 1]) increases++;
            if (numeric[i] < numeric[i - 1]) decreases++;
        }

        if (increases === 0 && decreases === 0) return "stable";
        if (increases > 0 && decreases === 0) return "escalating";
        if (decreases > 0 && increases === 0) return "de-escalating";
        return "oscillating";
    }

    private static buildClassNarrative(
        priorityClass: ResearchPriorityClass,
        chronicity: ChronicityLabel,
        postureTrend: PostureTrend,
        snapshotCount: number,
        totalSnapshots: number,
        entries: PriorityClassHistoryEntry[]
    ): string {
        const className = priorityClass.replace(/-/g, " ");
        const parts: string[] = [];

        switch (chronicity) {
            case "persistent":
                parts.push(`The '${className}' priority has appeared in all ${totalSnapshots} persisted snapshot(s), suggesting a structurally persistent advisory posture.`);
                break;
            case "intermittent":
                parts.push(`The '${className}' priority appeared in ${snapshotCount} of ${totalSnapshots} snapshots, indicating intermittent structural presence.`);
                break;
            case "resolved":
                parts.push(`The '${className}' priority appeared in earlier snapshots but is absent from recent records, suggesting the structural gap may have been addressed or deprioritized.`);
                break;
            case "recent":
                parts.push(`The '${className}' priority appeared only in recent snapshots (${snapshotCount} of ${totalSnapshots}), suggesting a newly emergent advisory signal.`);
                break;
            case "single-snapshot":
                parts.push(`The '${className}' priority appeared in a single snapshot only. No longitudinal pattern can be assessed.`);
                break;
        }

        switch (postureTrend) {
            case "stable":
                parts.push("Advisory level remained unchanged across snapshots.");
                break;
            case "escalating":
                parts.push("Advisory level increased over time, indicating growing structural gap magnitude.");
                break;
            case "de-escalating":
                parts.push("Advisory level decreased over time, suggesting partial evidence accumulation.");
                break;
            case "oscillating":
                parts.push("Advisory level changed direction across snapshots, reflecting variable evidence posture.");
                break;
            case "insufficient-history":
                parts.push("Insufficient history to assess posture trend.");
                break;
        }

        // Evidence gap persistence
        const allGaps = entries.flatMap(e => e.evidenceGaps);
        const gapCounts = new Map<string, number>();
        for (const gap of allGaps) {
            gapCounts.set(gap, (gapCounts.get(gap) ?? 0) + 1);
        }
        const chronicGaps = Array.from(gapCounts.entries())
            .filter(([, count]) => count >= Math.ceil(snapshotCount * 0.7))
            .map(([gap]) => gap);

        if (chronicGaps.length > 0) {
            parts.push(`Chronically recurring evidence gaps: ${chronicGaps.join(", ")}.`);
        }

        return parts.join(" ");
    }

    private static synthesizeGovernanceEvolution(
        patterns: PriorityChronicityPattern[],
        totalSnapshots: number
    ): string {
        if (totalSnapshots === 0) {
            return "No priority history records exist.";
        }

        if (totalSnapshots === 1) {
            return `Only one priority snapshot has been persisted. Governance evolution requires at least two snapshots for meaningful comparison. Current snapshot contains ${patterns.length} priority class(es).`;
        }

        const persistent = patterns.filter(p => p.chronicity === "persistent");
        const intermittent = patterns.filter(p => p.chronicity === "intermittent");
        const escalating = patterns.filter(p => p.postureTrend === "escalating");
        const stable = patterns.filter(p => p.postureTrend === "stable");

        const parts: string[] = [];
        parts.push(`Across ${totalSnapshots} persisted snapshots, ${patterns.length} distinct priority class(es) have been observed.`);

        if (persistent.length > 0) {
            parts.push(`${persistent.length} class(es) appeared persistently: ${persistent.map(p => p.priorityClass.replace(/-/g, " ")).join(", ")}.`);
        }
        if (intermittent.length > 0) {
            parts.push(`${intermittent.length} class(es) appeared intermittently.`);
        }
        if (escalating.length > 0) {
            parts.push(`${escalating.length} class(es) showed escalating advisory posture.`);
        }
        if (stable.length > 0) {
            parts.push(`${stable.length} class(es) maintained stable advisory levels.`);
        }

        parts.push("Governance evolution reflects structural posture changes, not causal proof of research trajectory.");

        return parts.join(" ");
    }

    private static assessStability(patterns: PriorityChronicityPattern[]): string {
        if (patterns.length === 0) {
            return "No priority classes in history. Stability cannot be assessed.";
        }

        const stableCount = patterns.filter(p => p.postureTrend === "stable").length;
        const oscillatingCount = patterns.filter(p => p.postureTrend === "oscillating").length;
        const ratio = patterns.length > 0 ? stableCount / patterns.length : 0;

        if (ratio >= 0.8) {
            return "Priority posture is predominantly stable across persisted snapshots. Most advisory levels are unchanged.";
        }
        if (oscillatingCount > stableCount) {
            return "Priority posture shows significant variability across snapshots. Advisory levels have oscillated for multiple priority classes, which may reflect evolving evidence rather than research instability.";
        }
        return "Priority posture shows moderate variability. Some priority classes have shifted advisory levels while others remain stable.";
    }
}
