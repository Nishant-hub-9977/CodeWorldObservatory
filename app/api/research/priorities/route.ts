import { NextResponse } from "next/server";
import { ExperimentDetailBuilder } from "@/lib/services/experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "@/lib/services/evidence-weighted-evaluator";
import { ResearchPrioritizationEngine } from "@/lib/services/research-prioritization-engine";
import type { ResearchPrioritiesApiResponse } from "@/lib/types/research-prioritization";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const experimentDetails = ExperimentDetailBuilder.list();
        const comparativeEvaluation = EvidenceWeightedEvaluator.evaluatePortfolio(experimentDetails);
        const replayStatusSummary = {
            totalExperiments: experimentDetails.length,
            baselineOnlyCount: experimentDetails.filter(detail => detail.replay.lineageStatus === "baseline-only").length,
            partialCount: experimentDetails.filter(detail => detail.replay.lineageStatus === "stored-evidence-chain").length,
            fullCount: experimentDetails.filter(detail => detail.replay.lineageStatus === "full-replay-package").length,
            strongestExperimentId: comparativeEvaluation.strongestExperimentId,
            strongestExperimentTitle: comparativeEvaluation.strongestExperimentTitle,
            strongestReplayability: experimentDetails[0]?.replay.replayability ?? null,
            strongestLineageStatus: experimentDetails[0]?.replay.lineageStatus ?? null,
            evidenceClass: experimentDetails[0]?.replay.lineageStatus ?? "no-experiments",
            reproducibilityCaveat: "Replay posture remains bounded by persisted artifacts and does not imply exact historical reconstruction.",
        } as const;
        const priorities = ResearchPrioritizationEngine.buildContext(experimentDetails, comparativeEvaluation, replayStatusSummary);
        const response: ResearchPrioritiesApiResponse = {
            priorities,
            generatedAt: priorities.generatedAt,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to build research priorities:", error);
        return NextResponse.json(
            { error: "Failed to build research priorities" },
            { status: 500 }
        );
    }
}