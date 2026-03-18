import { NextResponse } from "next/server";
import { ExperimentMemoryStore } from "@/lib/services/experiment-memory";
import { SessionComparator } from "@/lib/services/session-comparator";
import { ExperimentDetailBuilder } from "@/lib/services/experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "@/lib/services/evidence-weighted-evaluator";
import { EvaluationSnapshotStore } from "@/lib/services/evaluation-snapshot-store";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const memory = ExperimentMemoryStore.compileMemory();
        const experimentDetails = ExperimentDetailBuilder.list();
        const comparativeEvaluation = EvidenceWeightedEvaluator.evaluatePortfolio(experimentDetails);
        const latestEvaluationRecord = EvaluationSnapshotStore.getLatest();
        const latestEvaluationDrift = EvaluationSnapshotStore.deriveDriftHistory(1)[0] ?? null;

        // Construct the trend endpoint using full comparator analysis
        const trends = {
            preferredBranchTrends: memory.preferredStrategyTrends,
            governanceBlockerPatterns: memory.governanceConstraintPatterns,
            uncertaintyBurdenSignals: SessionComparator.generateUncertaintyBurdenAnalysis(
                memory.evidenceCoverage,
                memory.calibrationTrend
            ),
            calibrationTrendSignals: memory.calibrationTrend,
            evidenceSufficiency: SessionComparator.generateEvidenceSufficiencyAnalysis(
                memory.evidenceCoverage
            ),
            sessionConvergence: SessionComparator.detectConvergenceSignal(
                memory.comparativeSessions
            ),
            comparativeEvaluation: {
                strongestExperimentId: comparativeEvaluation.strongestExperimentId,
                strongestExperimentTitle: comparativeEvaluation.strongestExperimentTitle,
                strongestComparativeWeightLabel: comparativeEvaluation.strongestComparativeWeightLabel,
                highConfidenceComparisonCount: comparativeEvaluation.highConfidenceComparisonCount,
                comparativeCaveat: comparativeEvaluation.comparativeCaveat,
                latestEvaluationRecordId: latestEvaluationRecord?.evaluationRecordId ?? null,
                latestPersistedAt: latestEvaluationRecord?.generatedAt ?? null,
                latestDriftNarrative: latestEvaluationDrift?.narrative ?? null,
                evaluations: comparativeEvaluation.evaluations.slice(0, 5),
                comparisons: comparativeEvaluation.comparisonHighlights.slice(0, 5),
            },
        };

        return NextResponse.json({ trends });
    } catch (error) {
        console.error("Failed to fetch research trends:", error);
        return NextResponse.json({ error: "Failed to compile research trends" }, { status: 500 });
    }
}
