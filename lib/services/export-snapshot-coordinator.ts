// ─── Export Snapshot Coordinator ──────────────────────────────────────
// Phase 22: Coordinates priority-history snapshot creation alongside
// export writes. This is an explicit write path — snapshot creation
// occurs only within the export POST handler, which is already an
// explicit user-triggered research snapshot event.
//
// No snapshots are created on GET. No background persistence.
// The coordinator reuses the same computation logic as the
// priority-history POST route.

import { ExperimentDetailBuilder } from "./experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "./evidence-weighted-evaluator";
import { ResearchPrioritizationEngine } from "./research-prioritization-engine";
import { RecommendationGovernance } from "./recommendation-governance";
import { PriorityHistoryStore } from "./priority-history-store";
import type { PriorityHistoryRecord } from "../types/research-priority-history";

export class ExportSnapshotCoordinator {
    /**
     * Persist a priority-history snapshot as part of an export operation.
     * This is an explicit write path, invoked only from the export POST handler.
     * Returns the persisted record.
     */
    public static persistPrioritySnapshot(): PriorityHistoryRecord {
        const experimentDetails = ExperimentDetailBuilder.list();
        const comparativeEvaluation = EvidenceWeightedEvaluator.evaluatePortfolio(experimentDetails);
        const replayStatusSummary = {
            totalExperiments: experimentDetails.length,
            baselineOnlyCount: experimentDetails.filter(d => d.replay.lineageStatus === "baseline-only").length,
            partialCount: experimentDetails.filter(d => d.replay.lineageStatus === "stored-evidence-chain").length,
            fullCount: experimentDetails.filter(d => d.replay.lineageStatus === "full-replay-package").length,
            strongestExperimentId: comparativeEvaluation.strongestExperimentId,
            strongestExperimentTitle: comparativeEvaluation.strongestExperimentTitle,
            strongestReplayability: experimentDetails[0]?.replay.replayability ?? null,
            strongestLineageStatus: experimentDetails[0]?.replay.lineageStatus ?? null,
            evidenceClass: experimentDetails[0]?.replay.lineageStatus ?? "no-experiments" as const,
            reproducibilityCaveat: "Replay posture remains bounded by persisted artifacts and does not imply exact historical reconstruction.",
        } as const;

        const priorities = ResearchPrioritizationEngine.buildContext(
            experimentDetails, comparativeEvaluation, replayStatusSummary
        );
        const governance = RecommendationGovernance.govern(priorities);

        return PriorityHistoryStore.persistCurrentSnapshot(priorities, governance);
    }
}
