// ─── Priority Drift Analyzer ─────────────────────────────────────────
// Phase 20: Compares the current ephemeral prioritization context
// against the most recent persisted dossier's prioritization snapshot
// to detect observable changes in priority posture over time.
//
// Drift is descriptive: it records what changed and what evidence
// class drove the change. It does not imply causal proof, certainty,
// or recommendation authority.

import type { ResearchPrioritizationContext, ResearchPrioritySignal } from "../types/research-prioritization";
import type {
    PriorityDriftHistory,
    PriorityDriftRecord,
    PriorityDriftChangeDriver,
    PriorityDriftKind,
} from "../types/research-priority-drift";
import { DossierGenerator } from "./dossier-generator";
import { GOVERNANCE_CAVEAT_DRIFT as GOVERNANCE_CAVEAT } from "../constants/governance";

export class PriorityDriftAnalyzer {
    /**
     * Compares the given current prioritization context against the
     * most recent persisted dossier's prioritization summary to
     * produce a drift history.
     */
    public static analyze(
        currentContext: ResearchPrioritizationContext
    ): PriorityDriftHistory {
        const now = currentContext.generatedAt;
        const priorSnapshot = this.loadPriorSnapshot();
        const priorSignals = priorSnapshot?.signals ?? [];
        const priorSnapshotAt = priorSnapshot?.generatedAt ?? null;

        const driftRecords = this.computeDrifts(priorSignals, currentContext.topPriorities, now);

        const summary = this.synthesizeSummary(driftRecords, priorSnapshotAt);

        return {
            generatedAt: now,
            currentSnapshotAt: now,
            priorSnapshotAt,
            driftRecords,
            totalDrifts: driftRecords.length,
            summary,
            governanceCaveat: GOVERNANCE_CAVEAT,
        };
    }

    private static loadPriorSnapshot(): {
        generatedAt: string;
        signals: ResearchPrioritySignal[];
    } | null {
        const dossierResponse = DossierGenerator.getLatestDossier();
        if (!dossierResponse?.dossier) return null;

        const dossier = dossierResponse.dossier;
        const prioritizationSection = dossier.sections.advisoryResearchGaps;

        // Extract the prioritization signal embedded in the dossier section
        const priorSignal = prioritizationSection?.prioritization ?? null;

        // The dossier stores the advisory summary in metadata, but the
        // full prioritization context is not directly persisted. We
        // reconstruct what we can from the dossier's section-level
        // prioritization attachments.
        const signals: ResearchPrioritySignal[] = [];
        const sections = dossier.sections;
        const seen = new Set<string>();

        for (const sectionKey of Object.keys(sections)) {
            const section = sections[sectionKey as keyof typeof sections];
            if (section?.prioritization && !seen.has(section.prioritization.id)) {
                seen.add(section.prioritization.id);
                signals.push(section.prioritization);
            }
        }

        return {
            generatedAt: dossier.metadata.generatedAt,
            signals,
        };
    }

    private static computeDrifts(
        priorSignals: ResearchPrioritySignal[],
        currentSignals: ResearchPrioritySignal[],
        detectedAt: string
    ): PriorityDriftRecord[] {
        const drifts: PriorityDriftRecord[] = [];
        const priorByClass = new Map(priorSignals.map(s => [s.priorityClass, s]));
        const currentByClass = new Map(currentSignals.map(s => [s.priorityClass, s]));

        // Check for appeared and changed signals
        for (const current of currentSignals) {
            const prior = priorByClass.get(current.priorityClass);

            if (!prior) {
                drifts.push({
                    driftId: `drift-appeared-${current.priorityClass}`,
                    priorityClass: current.priorityClass,
                    driftKind: "appeared",
                    previousSignal: null,
                    currentSignal: current,
                    changeDrivers: [{
                        field: "summary",
                        previousValue: null,
                        currentValue: current.summary,
                        note: `Priority class '${current.priorityClass}' was not present in the prior snapshot.`,
                    }],
                    caveats: [
                        "Appearance may reflect new experiment data rather than a meaningful posture shift.",
                        GOVERNANCE_CAVEAT,
                    ],
                    detectedAt,
                });
                continue;
            }

            const drivers = this.detectChangeDrivers(prior, current);
            if (drivers.length > 0) {
                const kind = this.classifyDriftKind(prior, current, drivers);
                drifts.push({
                    driftId: `drift-${kind}-${current.priorityClass}`,
                    priorityClass: current.priorityClass,
                    driftKind: kind,
                    previousSignal: prior,
                    currentSignal: current,
                    changeDrivers: drivers,
                    caveats: [
                        "Changes may reflect updated experiment evidence, not a fundamental posture shift.",
                        GOVERNANCE_CAVEAT,
                    ],
                    detectedAt,
                });
            }
        }

        // Check for disappeared signals
        for (const prior of priorSignals) {
            if (!currentByClass.has(prior.priorityClass)) {
                drifts.push({
                    driftId: `drift-disappeared-${prior.priorityClass}`,
                    priorityClass: prior.priorityClass,
                    driftKind: "disappeared",
                    previousSignal: prior,
                    currentSignal: null,
                    changeDrivers: [{
                        field: "summary",
                        previousValue: prior.summary,
                        currentValue: null,
                        note: `Priority class '${prior.priorityClass}' is no longer active in the current snapshot.`,
                    }],
                    caveats: [
                        "Disappearance may indicate resolved gaps or changed experiment composition, not definitively closed research needs.",
                        GOVERNANCE_CAVEAT,
                    ],
                    detectedAt,
                });
            }
        }

        return drifts;
    }

    private static detectChangeDrivers(
        prior: ResearchPrioritySignal,
        current: ResearchPrioritySignal
    ): PriorityDriftChangeDriver[] {
        const drivers: PriorityDriftChangeDriver[] = [];

        if (prior.advisoryLevel !== current.advisoryLevel) {
            drivers.push({
                field: "advisoryLevel",
                previousValue: prior.advisoryLevel,
                currentValue: current.advisoryLevel,
                note: `Advisory level changed from '${prior.advisoryLevel}' to '${current.advisoryLevel}'.`,
            });
        }

        if (prior.experimentId !== current.experimentId) {
            drivers.push({
                field: "experimentId",
                previousValue: prior.experimentId,
                currentValue: current.experimentId,
                note: `Associated experiment changed from '${prior.experimentTitle ?? "none"}' to '${current.experimentTitle ?? "none"}'.`,
            });
        }

        const priorGaps = prior.evidenceGaps.slice().sort().join("|");
        const currentGaps = current.evidenceGaps.slice().sort().join("|");
        if (priorGaps !== currentGaps) {
            drivers.push({
                field: "evidenceGaps",
                previousValue: prior.evidenceGaps,
                currentValue: current.evidenceGaps,
                note: `Evidence gaps changed: prior had ${prior.evidenceGaps.length} gap(s), current has ${current.evidenceGaps.length}.`,
            });
        }

        if (prior.recommendedFocus !== current.recommendedFocus) {
            drivers.push({
                field: "recommendedFocus",
                previousValue: prior.recommendedFocus,
                currentValue: current.recommendedFocus,
                note: "Advisory focus text changed between snapshots.",
            });
        }

        if (prior.summary !== current.summary) {
            drivers.push({
                field: "summary",
                previousValue: prior.summary,
                currentValue: current.summary,
                note: "Signal summary changed between snapshots.",
            });
        }

        return drivers;
    }

    private static classifyDriftKind(
        prior: ResearchPrioritySignal,
        current: ResearchPrioritySignal,
        drivers: PriorityDriftChangeDriver[]
    ): PriorityDriftKind {
        if (drivers.some(d => d.field === "advisoryLevel")) {
            return "level-changed";
        }
        if (drivers.some(d => d.field === "recommendedFocus")) {
            return "focus-shifted";
        }
        return "class-stable";
    }

    private static synthesizeSummary(
        drifts: PriorityDriftRecord[],
        priorSnapshotAt: string | null
    ): string {
        if (!priorSnapshotAt) {
            return "No prior prioritization snapshot is available for drift comparison. This is the first observed priority posture.";
        }

        if (drifts.length === 0) {
            return `Priority posture is unchanged since the prior snapshot (${priorSnapshotAt}). No drift detected across any active priority class.`;
        }

        const appeared = drifts.filter(d => d.driftKind === "appeared").length;
        const disappeared = drifts.filter(d => d.driftKind === "disappeared").length;
        const changed = drifts.filter(d => d.driftKind !== "appeared" && d.driftKind !== "disappeared").length;

        const parts: string[] = [];
        parts.push(`${drifts.length} priority drift(s) detected since prior snapshot (${priorSnapshotAt}).`);
        if (appeared > 0) parts.push(`${appeared} priority class(es) appeared.`);
        if (disappeared > 0) parts.push(`${disappeared} priority class(es) disappeared.`);
        if (changed > 0) parts.push(`${changed} priority class(es) changed in level or focus.`);
        parts.push("Drift reflects observable changes in evidence posture, not causal proof of research trajectory.");

        return parts.join(" ");
    }
}
