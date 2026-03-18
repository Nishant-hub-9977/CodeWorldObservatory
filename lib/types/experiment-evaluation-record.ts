import type {
    ExperimentComparisonConfidence,
    ExperimentEvaluationPortfolio,
    ExperimentEvidenceCompleteness,
    ExperimentComparativeWeightLabel,
} from "./experiment-evaluation";
import type { LineageStatus, ReplayabilityClass } from "./experiment-registry";

export type EvaluationRecordSource = "live-read" | "explicit-snapshot" | "export-snapshot";

export interface ExperimentEvaluationRecord {
    evaluationRecordId: string;
    generatedAt: string;
    phaseActive: number;
    evaluatorVersion: string;
    source: EvaluationRecordSource;
    portfolio: ExperimentEvaluationPortfolio;
    doctrineCaveat: string;
}

export interface ExperimentEvaluationDriftChange {
    experimentId: string;
    experimentTitle: string;
    changeSummary: string[];
    previousWeightLabel: ExperimentComparativeWeightLabel | null;
    currentWeightLabel: ExperimentComparativeWeightLabel | null;
    previousConfidence: ExperimentComparisonConfidence | null;
    currentConfidence: ExperimentComparisonConfidence | null;
    previousEvidenceCompleteness: ExperimentEvidenceCompleteness | null;
    currentEvidenceCompleteness: ExperimentEvidenceCompleteness | null;
    previousReplayability: ReplayabilityClass | null;
    currentReplayability: ReplayabilityClass | null;
    previousLineageStatus: LineageStatus | null;
    currentLineageStatus: LineageStatus | null;
}

export interface ExperimentEvaluationDriftSummary {
    driftId: string;
    fromRecordId: string;
    toRecordId: string;
    comparedAt: string;
    strongestExperimentChanged: boolean;
    fromStrongestExperimentId: string | null;
    fromStrongestExperimentTitle: string | null;
    toStrongestExperimentId: string | null;
    toStrongestExperimentTitle: string | null;
    highConfidenceComparisonDelta: number;
    changedExperiments: ExperimentEvaluationDriftChange[];
    narrative: string;
}

export interface ExperimentEvaluationsApiResponse {
    liveRecord: ExperimentEvaluationRecord;
    latestRecord: ExperimentEvaluationRecord | null;
    driftSummaries: ExperimentEvaluationDriftSummary[];
    generatedAt: string;
    readMode: "observational";
}

export interface PersistedExperimentEvaluationApiResponse {
    record: ExperimentEvaluationRecord;
    latestDrift: ExperimentEvaluationDriftSummary | null;
    persistedAt: string;
}

export interface ExperimentComparisonsApiResponse {
    portfolio: ExperimentEvaluationPortfolio;
    latestRecord: ExperimentEvaluationRecord | null;
    driftSummaries: ExperimentEvaluationDriftSummary[];
    generatedAt: string;
    readMode: "observational";
}