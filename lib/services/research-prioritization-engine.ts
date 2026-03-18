import type { ExperimentDetailResponse } from "../types/experiment-registry";
import type { ExperimentEvaluationPortfolio } from "../types/experiment-evaluation";
import type { ReplayStatusSummary } from "../types/research-export";
import type {
    ResearchPriorityClass,
    ResearchPriorityLevel,
    ResearchPrioritySignal,
    ResearchPrioritizationContext,
} from "../types/research-prioritization";

import { GOVERNANCE_CAVEAT_PRIORITIZATION as PRIORITIZATION_CAVEAT } from "../constants/governance";

type InternalPrioritySignal = ResearchPrioritySignal & { score: number };

export class ResearchPrioritizationEngine {
    public static buildContext(
        experimentDetails: ExperimentDetailResponse[],
        comparativeEvaluation: ExperimentEvaluationPortfolio,
        replayStatusSummary: ReplayStatusSummary,
        generatedAt = new Date().toISOString()
    ): ResearchPrioritizationContext {
        const signals = this.collectSignals(experimentDetails, comparativeEvaluation, replayStatusSummary)
            .sort((left, right) => right.score - left.score)
            .map(({ score: _score, ...signal }) => signal);

        const topPriorities = signals.slice(0, 5);
        const advisorySummary = topPriorities.length > 0
            ? `Current advisory focus centers on ${topPriorities[0].summary.toLowerCase()} ${topPriorities.length > 1 ? `Secondary pressure includes ${topPriorities.slice(1, 3).map(signal => signal.priorityClass.replace(/-/g, " ")).join(" and ")}.` : ""}`.trim()
            : replayStatusSummary.totalExperiments > 0
                ? "No elevated structural research priority signal is active. Current experiment evidence appears comparatively balanced, though caveats still apply."
                : "No experiment-centered research priority signal is available until experiment evidence exists.";

        return {
            generatedAt,
            topPriorities,
            totalSignals: signals.length,
            advisorySummary,
            prioritizationCaveat: PRIORITIZATION_CAVEAT,
        };
    }

    public static getPriorityByClass(
        context: ResearchPrioritizationContext,
        priorityClass: ResearchPriorityClass
    ): ResearchPrioritySignal | null {
        return context.topPriorities.find(signal => signal.priorityClass === priorityClass) ?? null;
    }

    private static collectSignals(
        experimentDetails: ExperimentDetailResponse[],
        comparativeEvaluation: ExperimentEvaluationPortfolio,
        replayStatusSummary: ReplayStatusSummary
    ): InternalPrioritySignal[] {
        const signals: InternalPrioritySignal[] = [];

        for (const detail of experimentDetails) {
            const evaluation = detail.evaluation;

            if (
                evaluation.missingEvidenceClasses.length > 0
                && (
                    evaluation.comparativeWeightLabel === "strong"
                    || evaluation.comparativeWeightLabel === "moderate"
                    || detail.replay.lineageStatus !== "baseline-only"
                )
            ) {
                signals.push(this.buildSignal(
                    "evidence-deficient-but-promising",
                    evaluation.comparativeWeightLabel === "strong" ? "high" : "medium",
                    detail.experiment.experimentId,
                    detail.experiment.objective.title,
                    `${detail.experiment.objective.title} is promising but still evidence-deficient.`,
                    `${detail.experiment.objective.title} already carries ${evaluation.comparativeWeightLabel} comparative weight, yet it still lacks ${evaluation.missingEvidenceClasses.join(", ")}. That combination makes further evidence capture more valuable than broader narrative interpretation.`,
                    evaluation.missingEvidenceClasses,
                    "Consider capturing the missing evidence classes before strengthening comparative claims.",
                    evaluation.comparativeWeightLabel === "strong" ? 92 : 78
                ));
            }

            if (
                detail.replay.replayability !== "insufficient-evidence"
                && (
                    evaluation.empiricalDepth === "none"
                    || evaluation.empiricalDepth === "narrow"
                    || evaluation.benchmarkCoverage === "none"
                    || evaluation.benchmarkCoverage === "single-run"
                )
            ) {
                const evidenceGaps = [
                    evaluation.empiricalDepth === "none" || evaluation.empiricalDepth === "narrow" ? `empirical-depth:${evaluation.empiricalDepth}` : null,
                    evaluation.benchmarkCoverage === "none" || evaluation.benchmarkCoverage === "single-run" ? `benchmark-coverage:${evaluation.benchmarkCoverage}` : null,
                ].filter((value): value is string => Boolean(value));

                signals.push(this.buildSignal(
                    "replay-mature-but-empirically-shallow",
                    detail.replay.replayability === "full" ? "high" : "medium",
                    detail.experiment.experimentId,
                    detail.experiment.objective.title,
                    `${detail.experiment.objective.title} has replay maturity that outpaces its empirical depth.`,
                    `${detail.experiment.objective.title} has ${detail.replay.replayability} replay semantics and ${detail.replay.lineageStatus} lineage, but its empirical depth remains ${evaluation.empiricalDepth} with ${evaluation.benchmarkCoverage} benchmark coverage. Replay maturity should not be mistaken for broad empirical support.`,
                    evidenceGaps,
                    "Consider adding repeated benchmark or execution-backed evidence before treating replay maturity as broadly supported.",
                    detail.replay.replayability === "full" ? 88 : 74
                ));
            }

            if (
                (evaluation.empiricalDepth === "broad" || evaluation.empiricalDepth === "developing")
                && (evaluation.calibrationDepth === "none" || evaluation.calibrationDepth === "preliminary")
            ) {
                signals.push(this.buildSignal(
                    "empirically-strong-but-calibration-limited",
                    evaluation.empiricalDepth === "broad" ? "high" : "medium",
                    detail.experiment.experimentId,
                    detail.experiment.objective.title,
                    `${detail.experiment.objective.title} is empirically active but calibration-limited.`,
                    `${detail.experiment.objective.title} shows ${evaluation.empiricalDepth} empirical depth, yet calibration remains ${evaluation.calibrationDepth}. Without stronger prediction-reality closure, empirical activity should stay descriptively bounded.`,
                    [`calibration-depth:${evaluation.calibrationDepth}`],
                    "Consider increasing executed comparison coverage so prediction-reality calibration can mature.",
                    evaluation.empiricalDepth === "broad" ? 84 : 68
                ));
            }

            if (
                detail.replay.replayability === "full"
                && evaluation.empiricalDepth === "broad"
                && evaluation.calibrationDepth === "established"
                && evaluation.comparativeWeightLabel === "strong"
            ) {
                signals.push(this.buildSignal(
                    "saturation-emerging",
                    "low",
                    detail.experiment.experimentId,
                    detail.experiment.objective.title,
                    `${detail.experiment.objective.title} is approaching saturation under the current evidence shape.`,
                    `${detail.experiment.objective.title} already has full replay lineage, broad empirical depth, established calibration, and strong comparative weight. Further work of the same type may produce diminishing informational returns compared with weaker areas of the portfolio.`,
                    [],
                    "It may be more informative to explore targeted contrastive evidence or new failure-mode probes rather than repeating the same evidence class.",
                    28
                ));
            }
        }

        if (comparativeEvaluation.totalExperiments > 1 && comparativeEvaluation.highConfidenceComparisonCount === 0) {
            signals.push(this.buildSignal(
                "comparison-limited",
                replayStatusSummary.fullCount > 0 ? "high" : "medium",
                comparativeEvaluation.strongestExperimentId,
                comparativeEvaluation.strongestExperimentTitle,
                "The portfolio remains comparison-limited despite multiple persisted experiments.",
                `There are ${comparativeEvaluation.totalExperiments} persisted experiment records, but none of the current comparisons qualify as high-confidence. The portfolio still needs repeated benchmarks, execution-backed evidence, or richer calibration closure before stronger comparative narratives are justified.`,
                comparativeEvaluation.evaluations
                    .filter(evaluation => evaluation.comparisonLimitation === "comparison-limited")
                    .slice(0, 3)
                    .map(evaluation => evaluation.experimentTitle),
                "Consider strengthening repeated empirical support on the leading experiments before treating the ordering as decisive.",
                replayStatusSummary.fullCount > 0 ? 82 : 64
            ));
        }

        return this.deduplicateByClass(signals);
    }

    private static buildSignal(
        priorityClass: ResearchPriorityClass,
        advisoryLevel: ResearchPriorityLevel,
        experimentId: string | null,
        experimentTitle: string | null,
        summary: string,
        rationale: string,
        evidenceGaps: string[],
        recommendedFocus: string,
        score: number
    ): InternalPrioritySignal {
        return {
            id: `${priorityClass}-${experimentId ?? "portfolio"}`,
            priorityClass,
            advisoryLevel,
            experimentId,
            experimentTitle,
            summary,
            rationale,
            evidenceGaps,
            recommendedFocus,
            caveat: PRIORITIZATION_CAVEAT,
            score,
        };
    }

    private static deduplicateByClass(signals: InternalPrioritySignal[]): InternalPrioritySignal[] {
        const byClass = new Map<ResearchPriorityClass, InternalPrioritySignal>();

        for (const signal of signals) {
            const current = byClass.get(signal.priorityClass);
            if (!current || signal.score > current.score) {
                byClass.set(signal.priorityClass, signal);
            }
        }

        return Array.from(byClass.values());
    }
}