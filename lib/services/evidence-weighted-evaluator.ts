import type { ExperimentDetailResponse } from "../types/experiment-registry";
import type {
    ExperimentComparison,
    ExperimentComparisonConfidence,
    ExperimentComparisonLimitation,
    ExperimentComparativeWeightLabel,
    ExperimentCoverageClass,
    ExperimentEvidenceCompleteness,
    ExperimentEvidenceEvaluation,
    ExperimentEvaluationPortfolio,
    ExperimentCalibrationDepth,
    ExperimentEmpiricalDepth,
    ExperimentStrategyInterpretation,
} from "../types/experiment-evaluation";
import { StatisticalEvaluator } from "./statistical-evaluator";

type StrategyRate = ReturnType<typeof StatisticalEvaluator.evaluateStrategySuccessRate>[number];

interface EvaluationContext {
    predictionAccuracy: ReturnType<typeof StatisticalEvaluator.evaluatePredictionAccuracy>;
    strategyRates: StrategyRate[];
}

const EVIDENCE_COMPLETENESS_ORDER: Record<ExperimentEvidenceCompleteness, number> = {
    "intent-only": 0,
    "baseline-linked": 1,
    simulated: 2,
    benchmarked: 3,
    "execution-backed": 4,
};

const COVERAGE_ORDER: Record<ExperimentCoverageClass, number> = {
    none: 0,
    "single-run": 1,
    repeated: 2,
};

const EMPIRICAL_DEPTH_ORDER: Record<ExperimentEmpiricalDepth, number> = {
    none: 0,
    narrow: 1,
    developing: 2,
    broad: 3,
};

const CALIBRATION_DEPTH_ORDER: Record<ExperimentCalibrationDepth, number> = {
    none: 0,
    preliminary: 1,
    established: 2,
};

const STRATEGY_INTERPRETATION_ORDER: Record<ExperimentStrategyInterpretation, number> = {
    unresolved: 0,
    unsupported: 1,
    mixed: 2,
    supported: 3,
};

const CONFIDENCE_ORDER: Record<ExperimentComparisonConfidence, number> = {
    low: 0,
    medium: 1,
    high: 2,
};

export class EvidenceWeightedEvaluator {
    public static evaluateDetail(
        detail: Omit<ExperimentDetailResponse, "evaluation">,
        context: EvaluationContext = this.buildContext()
    ): ExperimentEvidenceEvaluation {
        const snapshotCount = detail.snapshots.length;
        const simulationCount = detail.simulations.length;
        const benchmarkCount = detail.benchmarks.length;
        const executionCount = detail.executions.length;
        const replayPackageCount = detail.replayPackages.length;
        const datasetPresent = Boolean(detail.dataset);
        const strategyRate = context.strategyRates.find(rate => rate.strategy === detail.experiment.strategy);

        const evidenceCompleteness = this.classifyEvidenceCompleteness(snapshotCount, simulationCount, benchmarkCount, executionCount);
        const benchmarkCoverage = this.classifyCoverage(benchmarkCount);
        const executionSupport = this.classifyCoverage(executionCount);
        const empiricalDepth = this.classifyEmpiricalDepth(benchmarkCount, executionCount);
        const calibrationDepth = this.classifyCalibrationDepth(executionCount, context.predictionAccuracy.totalComparisons);
        const strategyInterpretation = this.classifyStrategyInterpretation(strategyRate);
        const comparativeConfidence = this.classifyComparativeConfidence(detail, benchmarkCoverage, executionSupport, calibrationDepth);
        const missingEvidenceClasses = this.collectMissingEvidenceClasses({
            snapshotCount,
            simulationCount,
            benchmarkCount,
            executionCount,
            replayPackageCount,
            datasetPresent,
        });
        const caveats = this.buildCaveats(detail.evidenceCaveats, missingEvidenceClasses, strategyRate, context.predictionAccuracy.totalComparisons);
        const comparativeWeight = this.calculateComparativeWeight({
            snapshotCount,
            simulationCount,
            benchmarkCount,
            executionCount,
            replayPackageCount,
            datasetPresent,
            detail,
            strategyInterpretation,
            calibrationDepth,
        });
        const comparativeWeightLabel = this.classifyWeightLabel(comparativeWeight);

        return {
            experimentId: detail.experiment.experimentId,
            experimentTitle: detail.experiment.objective.title,
            comparativeWeight,
            comparativeWeightLabel,
            evidenceCompleteness,
            empiricalDepth,
            benchmarkCoverage,
            executionSupport,
            calibrationDepth,
            strategyInterpretation,
            replayability: detail.replay.replayability,
            lineageStatus: detail.replay.lineageStatus,
            comparativeConfidence,
            comparisonLimitation: comparativeConfidence === "low" || missingEvidenceClasses.length > 0
                ? "comparison-limited"
                : "comparison-supported",
            portfolioRank: null,
            totalComparedExperiments: 1,
            leadingComparison: null,
            missingEvidenceClasses,
            caveats,
            rationale: this.buildRationale(detail.experiment.objective.title, {
                comparativeWeightLabel,
                evidenceCompleteness,
                empiricalDepth,
                benchmarkCoverage,
                executionSupport,
                calibrationDepth,
                strategyInterpretation,
                comparativeConfidence,
                lineageStatus: detail.replay.lineageStatus,
                replayability: detail.replay.replayability,
                missingEvidenceClasses,
            }),
        };
    }

    public static evaluatePortfolio(
        details: Array<Omit<ExperimentDetailResponse, "evaluation"> | ExperimentDetailResponse>
    ): ExperimentEvaluationPortfolio {
        const context = this.buildContext();
        const rankedEvaluations = details
            .map(detail => this.evaluateDetail(this.stripEvaluation(detail), context))
            .sort((left, right) => {
                if (right.comparativeWeight !== left.comparativeWeight) {
                    return right.comparativeWeight - left.comparativeWeight;
                }
                return left.experimentTitle.localeCompare(right.experimentTitle);
            })
            .map((evaluation, index, evaluations) => ({
                ...evaluation,
                portfolioRank: index + 1,
                totalComparedExperiments: evaluations.length,
                leadingComparison: null,
                comparisonLimitation: this.classifyComparisonLimitation(evaluation),
            }));
        const comparisonHighlights = this.buildComparisons(rankedEvaluations);
        const comparisonsByExperiment = new Map<string, ExperimentComparison>();
        for (const comparison of comparisonHighlights) {
            if (!comparisonsByExperiment.has(comparison.leftExperimentId)) {
                comparisonsByExperiment.set(comparison.leftExperimentId, comparison);
            }
            if (!comparisonsByExperiment.has(comparison.rightExperimentId)) {
                comparisonsByExperiment.set(comparison.rightExperimentId, comparison);
            }
        }
        const evaluations = rankedEvaluations.map(evaluation => {
            const leadingComparison = comparisonsByExperiment.get(evaluation.experimentId) ?? null;
            return {
                ...evaluation,
                leadingComparison: leadingComparison
                    ? {
                        comparedExperimentId: leadingComparison.leftExperimentId === evaluation.experimentId
                            ? leadingComparison.rightExperimentId
                            : leadingComparison.leftExperimentId,
                        comparedExperimentTitle: leadingComparison.leftExperimentId === evaluation.experimentId
                            ? leadingComparison.rightExperimentTitle
                            : leadingComparison.leftExperimentTitle,
                        relation: leadingComparison.relation,
                        confidence: leadingComparison.confidence,
                        rationale: leadingComparison.rationale,
                    }
                    : null,
            };
        });
        const strongest = evaluations[0] ?? null;

        return {
            generatedAt: new Date().toISOString(),
            totalExperiments: evaluations.length,
            strongestExperimentId: strongest?.experimentId ?? null,
            strongestExperimentTitle: strongest?.experimentTitle ?? null,
            strongestComparativeWeight: strongest?.comparativeWeight ?? null,
            strongestComparativeWeightLabel: strongest?.comparativeWeightLabel ?? "none",
            highConfidenceComparisonCount: comparisonHighlights.filter(comparison => comparison.confidence === "high").length,
            comparativeCaveat: evaluations.length === 0
                ? "No experiments are available for evidence-weighted comparison."
                : "Comparative weights rank persisted evidence completeness and empirical depth only. They do not imply causal proof, exact historical replay, or stronger certainty than the attached artifacts justify.",
            evaluations,
            comparisonHighlights,
        };
    }

    private static classifyComparisonLimitation(
        evaluation: ExperimentEvidenceEvaluation
    ): ExperimentComparisonLimitation {
        if (evaluation.comparativeConfidence === "low" || evaluation.missingEvidenceClasses.length > 0) {
            return "comparison-limited";
        }
        return "comparison-supported";
    }

    private static stripEvaluation(
        detail: Omit<ExperimentDetailResponse, "evaluation"> | ExperimentDetailResponse
    ): Omit<ExperimentDetailResponse, "evaluation"> {
        const { evaluation: _evaluation, ...rest } = detail as ExperimentDetailResponse;
        return rest;
    }

    private static buildContext(): EvaluationContext {
        const statistics = StatisticalEvaluator.summarize();
        return {
            predictionAccuracy: statistics.predictionAccuracy,
            strategyRates: statistics.strategySuccessRates,
        };
    }

    private static classifyEvidenceCompleteness(
        snapshotCount: number,
        simulationCount: number,
        benchmarkCount: number,
        executionCount: number
    ): ExperimentEvidenceCompleteness {
        if (executionCount > 0 && benchmarkCount > 0 && simulationCount > 0 && snapshotCount > 0) {
            return "execution-backed";
        }
        if (benchmarkCount > 0 && simulationCount > 0 && snapshotCount > 0) {
            return "benchmarked";
        }
        if (simulationCount > 0 && snapshotCount > 0) {
            return "simulated";
        }
        if (snapshotCount > 0) {
            return "baseline-linked";
        }
        return "intent-only";
    }

    private static classifyCoverage(count: number): ExperimentCoverageClass {
        if (count === 0) return "none";
        if (count === 1) return "single-run";
        return "repeated";
    }

    private static classifyEmpiricalDepth(benchmarkCount: number, executionCount: number): ExperimentEmpiricalDepth {
        const totalEvidenceRuns = benchmarkCount + executionCount;
        if (totalEvidenceRuns === 0) return "none";
        if (totalEvidenceRuns < 3) return "narrow";
        if (totalEvidenceRuns < 6) return "developing";
        return "broad";
    }

    private static classifyCalibrationDepth(executionCount: number, totalComparisons: number): ExperimentCalibrationDepth {
        if (executionCount === 0 || totalComparisons === 0) return "none";
        if (executionCount < 2 || totalComparisons < 3) return "preliminary";
        return "established";
    }

    private static classifyStrategyInterpretation(strategyRate: StrategyRate | undefined): ExperimentStrategyInterpretation {
        if (!strategyRate || strategyRate.totalRuns === 0) return "unresolved";
        if (strategyRate.successRate >= 0.6 && strategyRate.maturity !== "early") return "supported";
        if (strategyRate.successRate <= 0.35 && strategyRate.maturity === "stable") return "unsupported";
        return "mixed";
    }

    private static classifyComparativeConfidence(
        detail: Omit<ExperimentDetailResponse, "evaluation">,
        benchmarkCoverage: ExperimentCoverageClass,
        executionSupport: ExperimentCoverageClass,
        calibrationDepth: ExperimentCalibrationDepth
    ): ExperimentComparisonConfidence {
        if (
            detail.replay.lineageStatus === "full-replay-package"
            && benchmarkCoverage !== "none"
            && executionSupport !== "none"
            && calibrationDepth === "established"
        ) {
            return "high";
        }
        if (
            detail.replay.lineageStatus !== "baseline-only"
            && benchmarkCoverage !== "none"
            && detail.snapshots.length > 0
            && detail.simulations.length > 0
        ) {
            return "medium";
        }
        return "low";
    }

    private static collectMissingEvidenceClasses(input: {
        snapshotCount: number;
        simulationCount: number;
        benchmarkCount: number;
        executionCount: number;
        replayPackageCount: number;
        datasetPresent: boolean;
    }): string[] {
        const missing: string[] = [];

        if (input.snapshotCount === 0) missing.push("baseline snapshot");
        if (input.simulationCount === 0) missing.push("simulation session");
        if (input.benchmarkCount === 0) missing.push("benchmark evaluation");
        if (input.executionCount === 0) missing.push("execution evidence");
        if (input.replayPackageCount === 0) missing.push("replay package");
        if (!input.datasetPresent) missing.push("research dataset");

        return missing;
    }

    private static buildCaveats(
        existingCaveats: string[],
        missingEvidenceClasses: string[],
        strategyRate: StrategyRate | undefined,
        totalComparisons: number
    ): string[] {
        const caveats = new Set(existingCaveats);

        if (missingEvidenceClasses.length > 0) {
            caveats.add(`Missing evidence classes: ${missingEvidenceClasses.join(", ")}.`);
        }
        if (!strategyRate || strategyRate.totalRuns < 3) {
            caveats.add("Strategy interpretation remains sample-limited and should not be treated as stable empirical guidance.");
        }
        if (totalComparisons < 3) {
            caveats.add("Calibration support remains preliminary because executed prediction-reality comparisons are still sparse.");
        }

        return Array.from(caveats);
    }

    private static calculateComparativeWeight(input: {
        snapshotCount: number;
        simulationCount: number;
        benchmarkCount: number;
        executionCount: number;
        replayPackageCount: number;
        datasetPresent: boolean;
        detail: Omit<ExperimentDetailResponse, "evaluation">;
        strategyInterpretation: ExperimentStrategyInterpretation;
        calibrationDepth: ExperimentCalibrationDepth;
    }): number {
        let weight = 0;

        if (input.snapshotCount > 0) weight += 0.14;
        if (input.simulationCount > 0) weight += 0.18;
        if (input.benchmarkCount > 0) weight += 0.22;
        if (input.benchmarkCount > 1) weight += 0.06;
        if (input.executionCount > 0) weight += 0.16;
        if (input.executionCount > 1) weight += 0.04;
        if (input.datasetPresent) weight += 0.05;
        if (input.replayPackageCount > 0) weight += 0.05;
        if (input.detail.replay.lineageStatus === "stored-evidence-chain") weight += 0.04;
        if (input.detail.replay.lineageStatus === "full-replay-package") weight += 0.08;
        if (input.calibrationDepth === "preliminary") weight += 0.03;
        if (input.calibrationDepth === "established") weight += 0.06;
        if (input.strategyInterpretation === "mixed") weight += 0.02;
        if (input.strategyInterpretation === "supported") weight += 0.05;

        return Number(Math.min(1, weight).toFixed(3));
    }

    private static classifyWeightLabel(weight: number): ExperimentComparativeWeightLabel {
        if (weight >= 0.75) return "strong";
        if (weight >= 0.45) return "moderate";
        return "limited";
    }

    private static buildRationale(
        experimentTitle: string,
        input: {
            comparativeWeightLabel: ExperimentComparativeWeightLabel;
            evidenceCompleteness: ExperimentEvidenceCompleteness;
            empiricalDepth: ExperimentEmpiricalDepth;
            benchmarkCoverage: ExperimentCoverageClass;
            executionSupport: ExperimentCoverageClass;
            calibrationDepth: ExperimentCalibrationDepth;
            strategyInterpretation: ExperimentStrategyInterpretation;
            comparativeConfidence: ExperimentComparisonConfidence;
            lineageStatus: Omit<ExperimentDetailResponse, "evaluation">["replay"]["lineageStatus"];
            replayability: Omit<ExperimentDetailResponse, "evaluation">["replay"]["replayability"];
            missingEvidenceClasses: string[];
        }
    ): string {
        const missingEvidenceNote = input.missingEvidenceClasses.length > 0
            ? ` Missing evidence: ${input.missingEvidenceClasses.join(", ")}.`
            : "";

        return `${experimentTitle} currently carries ${input.comparativeWeightLabel} comparative weight with ${input.comparativeConfidence} comparison confidence. Evidence completeness is ${input.evidenceCompleteness}, empirical depth is ${input.empiricalDepth}, benchmark coverage is ${input.benchmarkCoverage}, execution support is ${input.executionSupport}, calibration depth is ${input.calibrationDepth}, and strategy interpretation is ${input.strategyInterpretation}. Replay maturity remains ${input.lineageStatus} / ${input.replayability}.${missingEvidenceNote}`;
    }

    private static buildComparisons(evaluations: ExperimentEvidenceEvaluation[]): ExperimentComparison[] {
        const comparisons: ExperimentComparison[] = [];

        for (let leftIndex = 0; leftIndex < evaluations.length; leftIndex++) {
            for (let rightIndex = leftIndex + 1; rightIndex < evaluations.length; rightIndex++) {
                comparisons.push(this.comparePair(evaluations[leftIndex], evaluations[rightIndex]));
            }
        }

        return comparisons
            .sort((left, right) => {
                if (CONFIDENCE_ORDER[right.confidence] !== CONFIDENCE_ORDER[left.confidence]) {
                    return CONFIDENCE_ORDER[right.confidence] - CONFIDENCE_ORDER[left.confidence];
                }
                return right.comparativeDelta - left.comparativeDelta;
            })
            .slice(0, 8);
    }

    private static comparePair(
        left: ExperimentEvidenceEvaluation,
        right: ExperimentEvidenceEvaluation
    ): ExperimentComparison {
        const delta = Number(Math.abs(left.comparativeWeight - right.comparativeWeight).toFixed(3));
        const stronger = left.comparativeWeight >= right.comparativeWeight ? left : right;
        const weaker = stronger.experimentId === left.experimentId ? right : left;
        const sharedConfidence = this.minConfidence(left.comparativeConfidence, right.comparativeConfidence);
        const relation = this.classifyComparisonRelation(delta, sharedConfidence);
        const advantageDimensions = this.collectAdvantageDimensions(stronger, weaker);
        const cautionDimensions = weaker.missingEvidenceClasses.slice(0, 4);
        const preferredExperimentId = relation === "stronger-evidence" ? stronger.experimentId : null;

        return {
            comparisonId: `cmp-${left.experimentId}-${right.experimentId}`,
            leftExperimentId: left.experimentId,
            rightExperimentId: right.experimentId,
            leftExperimentTitle: left.experimentTitle,
            rightExperimentTitle: right.experimentTitle,
            relation,
            preferredExperimentId,
            confidence: sharedConfidence,
            comparativeDelta: delta,
            advantageDimensions,
            cautionDimensions,
            rationale: relation === "stronger-evidence"
                ? `${stronger.experimentTitle} has the stronger current evidence position because it leads on ${advantageDimensions.join(", ") || "overall evidence coverage"}. ${weaker.experimentTitle} still lacks ${cautionDimensions.join(", ") || "enough differentiating evidence"}.`
                : relation === "roughly-comparable"
                    ? `${left.experimentTitle} and ${right.experimentTitle} remain roughly comparable on persisted evidence. Differences are not large enough to justify a stronger ranking.`
                    : `${left.experimentTitle} and ${right.experimentTitle} cannot yet be cleanly separated because the evidence base remains too thin or too uneven for a stronger comparative claim.`,
        };
    }

    private static classifyComparisonRelation(
        delta: number,
        confidence: ExperimentComparisonConfidence
    ): ExperimentComparison["relation"] {
        if (delta < 0.08) return "roughly-comparable";
        if (confidence === "low" && delta < 0.18) return "inconclusive";
        return "stronger-evidence";
    }

    private static collectAdvantageDimensions(
        stronger: ExperimentEvidenceEvaluation,
        weaker: ExperimentEvidenceEvaluation
    ): string[] {
        const dimensions: string[] = [];

        if (EVIDENCE_COMPLETENESS_ORDER[stronger.evidenceCompleteness] > EVIDENCE_COMPLETENESS_ORDER[weaker.evidenceCompleteness]) {
            dimensions.push("evidence completeness");
        }
        if (EMPIRICAL_DEPTH_ORDER[stronger.empiricalDepth] > EMPIRICAL_DEPTH_ORDER[weaker.empiricalDepth]) {
            dimensions.push("empirical depth");
        }
        if (COVERAGE_ORDER[stronger.benchmarkCoverage] > COVERAGE_ORDER[weaker.benchmarkCoverage]) {
            dimensions.push("benchmark coverage");
        }
        if (COVERAGE_ORDER[stronger.executionSupport] > COVERAGE_ORDER[weaker.executionSupport]) {
            dimensions.push("execution support");
        }
        if (CALIBRATION_DEPTH_ORDER[stronger.calibrationDepth] > CALIBRATION_DEPTH_ORDER[weaker.calibrationDepth]) {
            dimensions.push("calibration depth");
        }
        if (STRATEGY_INTERPRETATION_ORDER[stronger.strategyInterpretation] > STRATEGY_INTERPRETATION_ORDER[weaker.strategyInterpretation]) {
            dimensions.push("strategy interpretation");
        }

        return dimensions;
    }

    private static minConfidence(
        left: ExperimentComparisonConfidence,
        right: ExperimentComparisonConfidence
    ): ExperimentComparisonConfidence {
        return CONFIDENCE_ORDER[left] <= CONFIDENCE_ORDER[right] ? left : right;
    }
}