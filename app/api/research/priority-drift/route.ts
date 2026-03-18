import { NextResponse } from "next/server";
import { ExperimentDetailBuilder } from "@/lib/services/experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "@/lib/services/evidence-weighted-evaluator";
import { ResearchPrioritizationEngine } from "@/lib/services/research-prioritization-engine";
import { PriorityDriftAnalyzer } from "@/lib/services/priority-drift-analyzer";
import { RecommendationGovernance } from "@/lib/services/recommendation-governance";
import type { PriorityDriftApiResponse } from "@/lib/types/research-priority-drift";

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
        const drift = PriorityDriftAnalyzer.analyze(priorities);
        const governance = RecommendationGovernance.govern(priorities);

        const response: PriorityDriftApiResponse = {
            drift,
            governance,
            generatedAt: priorities.generatedAt,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to build priority drift analysis:", error);
        return NextResponse.json(
            { error: "Failed to build priority drift analysis" },
            { status: 500 }
        );
    }
}
