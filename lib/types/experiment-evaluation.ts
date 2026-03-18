import type { LineageStatus, ReplayabilityClass } from "./experiment-registry";

export type ExperimentEvidenceCompleteness =
    | "intent-only"
    | "baseline-linked"
    | "simulated"
    | "benchmarked"
    | "execution-backed";

export type ExperimentEmpiricalDepth = "none" | "narrow" | "developing" | "broad";

export type ExperimentCoverageClass = "none" | "single-run" | "repeated";

export type ExperimentCalibrationDepth = "none" | "preliminary" | "established";

export type ExperimentStrategyInterpretation = "supported" | "mixed" | "unsupported" | "unresolved";

export type ExperimentComparisonConfidence = "low" | "medium" | "high";

export type ExperimentComparativeWeightLabel = "limited" | "moderate" | "strong";

export type ExperimentComparisonRelation = "stronger-evidence" | "roughly-comparable" | "inconclusive";

export type ExperimentComparisonLimitation = "comparison-limited" | "comparison-supported";

export interface ExperimentEvaluationLeadingComparison {
    comparedExperimentId: string;
    comparedExperimentTitle: string;
    relation: ExperimentComparisonRelation;
    confidence: ExperimentComparisonConfidence;
    rationale: string;
}

export interface ExperimentEvidenceEvaluation {
    experimentId: string;
    experimentTitle: string;
    comparativeWeight: number;
    comparativeWeightLabel: ExperimentComparativeWeightLabel;
    evidenceCompleteness: ExperimentEvidenceCompleteness;
    empiricalDepth: ExperimentEmpiricalDepth;
    benchmarkCoverage: ExperimentCoverageClass;
    executionSupport: ExperimentCoverageClass;
    calibrationDepth: ExperimentCalibrationDepth;
    strategyInterpretation: ExperimentStrategyInterpretation;
    replayability: ReplayabilityClass;
    lineageStatus: LineageStatus;
    comparativeConfidence: ExperimentComparisonConfidence;
    comparisonLimitation: ExperimentComparisonLimitation;
    portfolioRank: number | null;
    totalComparedExperiments: number;
    leadingComparison: ExperimentEvaluationLeadingComparison | null;
    missingEvidenceClasses: string[];
    caveats: string[];
    rationale: string;
}

export interface ExperimentComparison {
    comparisonId: string;
    leftExperimentId: string;
    rightExperimentId: string;
    leftExperimentTitle: string;
    rightExperimentTitle: string;
    relation: ExperimentComparisonRelation;
    preferredExperimentId: string | null;
    confidence: ExperimentComparisonConfidence;
    comparativeDelta: number;
    advantageDimensions: string[];
    cautionDimensions: string[];
    rationale: string;
}

export interface ExperimentEvaluationPortfolio {
    generatedAt: string;
    totalExperiments: number;
    strongestExperimentId: string | null;
    strongestExperimentTitle: string | null;
    strongestComparativeWeight: number | null;
    strongestComparativeWeightLabel: ExperimentComparativeWeightLabel | "none";
    highConfidenceComparisonCount: number;
    comparativeCaveat: string;
    evaluations: ExperimentEvidenceEvaluation[];
    comparisonHighlights: ExperimentComparison[];
}