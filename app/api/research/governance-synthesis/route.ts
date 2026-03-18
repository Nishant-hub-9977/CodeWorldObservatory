import { NextResponse } from "next/server";
import { ExperimentDetailBuilder } from "@/lib/services/experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "@/lib/services/evidence-weighted-evaluator";
import { ResearchPrioritizationEngine } from "@/lib/services/research-prioritization-engine";
import { PriorityDriftAnalyzer } from "@/lib/services/priority-drift-analyzer";
import { RecommendationGovernance } from "@/lib/services/recommendation-governance";
import { PriorityHistoryAnalyzer } from "@/lib/services/priority-history-analyzer";
import { SnapshotComparator } from "@/lib/services/snapshot-comparator";
import { ComparativeGovernanceSynthesizer } from "@/lib/services/comparative-governance-synthesizer";

export const dynamic = "force-dynamic";

/**
 * GET /api/research/governance-synthesis
 * Lightweight read-only endpoint returning the comparative governance
 * synthesis without generating a full brief or dossier.
 */
export async function GET() {
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

        const now = new Date().toISOString();
        const prioritizationContext = ResearchPrioritizationEngine.buildContext(
            experimentDetails,
            comparativeEvaluation,
            replayStatusSummary,
            now,
        );
        const priorityDrift = PriorityDriftAnalyzer.analyze(prioritizationContext);
        const recommendationGovernance = RecommendationGovernance.govern(prioritizationContext);
        const priorityHistorySummary = PriorityHistoryAnalyzer.analyze();
        const snapshotComparisons = SnapshotComparator.compare();
        const synthesis = ComparativeGovernanceSynthesizer.synthesize(
            prioritizationContext,
            priorityDrift,
            recommendationGovernance,
            priorityHistorySummary,
            snapshotComparisons,
        );

        return NextResponse.json({ synthesis, generatedAt: now });
    } catch (error) {
        console.error("Failed to compute governance synthesis:", error);
        return NextResponse.json(
            { error: "Failed to compute governance synthesis" },
            { status: 500 },
        );
    }
}
