import { NextResponse } from "next/server";
import { ExperimentDetailBuilder } from "@/lib/services/experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "@/lib/services/evidence-weighted-evaluator";
import { ResearchPrioritizationEngine } from "@/lib/services/research-prioritization-engine";
import { RecommendationGovernance } from "@/lib/services/recommendation-governance";
import { PriorityHistoryStore } from "@/lib/services/priority-history-store";
import { PriorityHistoryAnalyzer } from "@/lib/services/priority-history-analyzer";
import { SnapshotComparator } from "@/lib/services/snapshot-comparator";
import type { PriorityHistoryApiResponse } from "@/lib/types/research-priority-history";

export const dynamic = "force-dynamic";

/**
 * GET: Observational read of persisted priority history + bounded summaries.
 * Never creates records.
 */
export async function GET() {
    try {
        const records = PriorityHistoryStore.listAll();
        const historySummary = PriorityHistoryAnalyzer.analyze();
        const snapshotComparisons = records.length >= 2
            ? SnapshotComparator.compare()
            : null;

        const response: PriorityHistoryApiResponse = {
            records,
            historySummary,
            snapshotComparisons,
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to read priority history:", error);
        return NextResponse.json(
            { error: "Failed to read priority history" },
            { status: 500 }
        );
    }
}

/**
 * POST: Explicit snapshot creation. Persists the current prioritization
 * context and governance state as a historical record. This is the only
 * write path for priority history.
 */
export async function POST() {
    try {
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
            evidenceClass: experimentDetails[0]?.replay.lineageStatus ?? "no-experiments",
            reproducibilityCaveat: "Replay posture remains bounded by persisted artifacts and does not imply exact historical reconstruction.",
        } as const;

        const priorities = ResearchPrioritizationEngine.buildContext(
            experimentDetails, comparativeEvaluation, replayStatusSummary
        );
        const governance = RecommendationGovernance.govern(priorities);

        const record = PriorityHistoryStore.persistCurrentSnapshot(priorities, governance);

        return NextResponse.json({
            persisted: true,
            record,
            generatedAt: new Date().toISOString(),
        }, { status: 201 });
    } catch (error) {
        console.error("Failed to persist priority snapshot:", error);
        return NextResponse.json(
            { error: "Failed to persist priority snapshot" },
            { status: 500 }
        );
    }
}
