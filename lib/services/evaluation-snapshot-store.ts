import fs from "fs";
import path from "path";
import type { ExperimentDetailResponse } from "../types/experiment-registry";
import type {
    EvaluationRecordSource,
    ExperimentEvaluationDriftChange,
    ExperimentEvaluationDriftSummary,
    ExperimentEvaluationRecord,
} from "../types/experiment-evaluation-record";
import { OBSERVATORY_VERSION } from "../constants/observatory";
import { ExperimentDetailBuilder } from "./experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "./evidence-weighted-evaluator";

const EVALUATION_DIR = path.join(process.cwd(), "artifacts", "research", "evaluations");

if (!fs.existsSync(EVALUATION_DIR)) {
    fs.mkdirSync(EVALUATION_DIR, { recursive: true });
}

export class EvaluationSnapshotStore {
    public static buildCurrentRecord(
        source: EvaluationRecordSource = "live-read",
        details: ExperimentDetailResponse[] = ExperimentDetailBuilder.list()
    ): ExperimentEvaluationRecord {
        const portfolio = EvidenceWeightedEvaluator.evaluatePortfolio(details);

        return {
            evaluationRecordId: `evaluation-${Date.now().toString(36)}`,
            generatedAt: new Date().toISOString(),
            phaseActive: 18,
            evaluatorVersion: OBSERVATORY_VERSION,
            source,
            portfolio,
            doctrineCaveat: "Persisted evaluation snapshots capture bounded comparative interpretation at a point in time. They are derived interpretation artifacts, not raw evidence truth, and do not strengthen replay or causal claims beyond the attached artifacts.",
        };
    }

    public static persistCurrentRecord(source: EvaluationRecordSource = "explicit-snapshot"): ExperimentEvaluationRecord {
        const record = this.buildCurrentRecord(source);
        this.write(record);
        return record;
    }

    public static write(record: ExperimentEvaluationRecord): string {
        const filePath = path.join(EVALUATION_DIR, `${record.evaluationRecordId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
        return filePath;
    }

    public static getLatest(): ExperimentEvaluationRecord | null {
        const records = this.listAll();
        return records[0] ?? null;
    }

    public static getById(evaluationRecordId: string): ExperimentEvaluationRecord | null {
        const filePath = path.join(EVALUATION_DIR, `${evaluationRecordId}.json`);
        if (!fs.existsSync(filePath)) return null;

        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data) as ExperimentEvaluationRecord;
    }

    public static listAll(): ExperimentEvaluationRecord[] {
        if (!fs.existsSync(EVALUATION_DIR)) return [];

        return fs.readdirSync(EVALUATION_DIR)
            .filter(file => file.startsWith("evaluation-") && file.endsWith(".json"))
            .map(file => {
                const data = fs.readFileSync(path.join(EVALUATION_DIR, file), "utf-8");
                return JSON.parse(data) as ExperimentEvaluationRecord;
            })
            .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime());
    }

    public static deriveDriftHistory(limit = 10): ExperimentEvaluationDriftSummary[] {
        const chronological = this.listAll()
            .slice()
            .sort((left, right) => new Date(left.generatedAt).getTime() - new Date(right.generatedAt).getTime());

        const drift: ExperimentEvaluationDriftSummary[] = [];
        for (let index = 1; index < chronological.length; index++) {
            drift.push(this.compareRecords(chronological[index - 1], chronological[index]));
        }

        return drift
            .sort((left, right) => new Date(right.comparedAt).getTime() - new Date(left.comparedAt).getTime())
            .slice(0, limit);
    }

    private static compareRecords(
        previous: ExperimentEvaluationRecord,
        current: ExperimentEvaluationRecord
    ): ExperimentEvaluationDriftSummary {
        const previousEvaluations = new Map(previous.portfolio.evaluations.map(evaluation => [evaluation.experimentId, evaluation]));
        const currentEvaluations = new Map(current.portfolio.evaluations.map(evaluation => [evaluation.experimentId, evaluation]));
        const experimentIds = new Set<string>([
            ...previousEvaluations.keys(),
            ...currentEvaluations.keys(),
        ]);

        const changedExperiments: ExperimentEvaluationDriftChange[] = [];
        for (const experimentId of experimentIds) {
            const previousEvaluation = previousEvaluations.get(experimentId) ?? null;
            const currentEvaluation = currentEvaluations.get(experimentId) ?? null;
            const changeSummary: string[] = [];
            const experimentTitle = currentEvaluation?.experimentTitle ?? previousEvaluation?.experimentTitle ?? experimentId;

            if (!previousEvaluation && currentEvaluation) {
                changeSummary.push("entered persisted evaluation history");
            }
            if (previousEvaluation && !currentEvaluation) {
                changeSummary.push("absent from latest evaluation snapshot");
            }
            if (previousEvaluation?.comparativeWeightLabel !== currentEvaluation?.comparativeWeightLabel) {
                changeSummary.push(`weight ${previousEvaluation?.comparativeWeightLabel ?? "none"} -> ${currentEvaluation?.comparativeWeightLabel ?? "none"}`);
            }
            if (previousEvaluation?.comparativeConfidence !== currentEvaluation?.comparativeConfidence) {
                changeSummary.push(`confidence ${previousEvaluation?.comparativeConfidence ?? "none"} -> ${currentEvaluation?.comparativeConfidence ?? "none"}`);
            }
            if (previousEvaluation?.evidenceCompleteness !== currentEvaluation?.evidenceCompleteness) {
                changeSummary.push(`evidence ${previousEvaluation?.evidenceCompleteness ?? "none"} -> ${currentEvaluation?.evidenceCompleteness ?? "none"}`);
            }
            if (previousEvaluation?.replayability !== currentEvaluation?.replayability) {
                changeSummary.push(`replay ${previousEvaluation?.replayability ?? "none"} -> ${currentEvaluation?.replayability ?? "none"}`);
            }
            if (previousEvaluation?.lineageStatus !== currentEvaluation?.lineageStatus) {
                changeSummary.push(`lineage ${previousEvaluation?.lineageStatus ?? "none"} -> ${currentEvaluation?.lineageStatus ?? "none"}`);
            }
            if (previousEvaluation?.portfolioRank !== currentEvaluation?.portfolioRank) {
                changeSummary.push(`rank ${previousEvaluation?.portfolioRank ?? "none"} -> ${currentEvaluation?.portfolioRank ?? "none"}`);
            }

            if (changeSummary.length > 0) {
                changedExperiments.push({
                    experimentId,
                    experimentTitle,
                    changeSummary,
                    previousWeightLabel: previousEvaluation?.comparativeWeightLabel ?? null,
                    currentWeightLabel: currentEvaluation?.comparativeWeightLabel ?? null,
                    previousConfidence: previousEvaluation?.comparativeConfidence ?? null,
                    currentConfidence: currentEvaluation?.comparativeConfidence ?? null,
                    previousEvidenceCompleteness: previousEvaluation?.evidenceCompleteness ?? null,
                    currentEvidenceCompleteness: currentEvaluation?.evidenceCompleteness ?? null,
                    previousReplayability: previousEvaluation?.replayability ?? null,
                    currentReplayability: currentEvaluation?.replayability ?? null,
                    previousLineageStatus: previousEvaluation?.lineageStatus ?? null,
                    currentLineageStatus: currentEvaluation?.lineageStatus ?? null,
                });
            }
        }

        const strongestExperimentChanged = previous.portfolio.strongestExperimentId !== current.portfolio.strongestExperimentId;
        const highConfidenceComparisonDelta = current.portfolio.highConfidenceComparisonCount - previous.portfolio.highConfidenceComparisonCount;
        const leaderNarrative = strongestExperimentChanged
            ? `Comparative leader moved from ${previous.portfolio.strongestExperimentTitle ?? "none"} to ${current.portfolio.strongestExperimentTitle ?? "none"}.`
            : `Comparative leader remained ${current.portfolio.strongestExperimentTitle ?? "unchanged"}.`;
        const comparisonNarrative = highConfidenceComparisonDelta === 0
            ? "High-confidence comparison count did not change."
            : `High-confidence comparison count changed by ${highConfidenceComparisonDelta > 0 ? "+" : ""}${highConfidenceComparisonDelta}.`;

        return {
            driftId: `drift-${previous.evaluationRecordId}-${current.evaluationRecordId}`,
            fromRecordId: previous.evaluationRecordId,
            toRecordId: current.evaluationRecordId,
            comparedAt: current.generatedAt,
            strongestExperimentChanged,
            fromStrongestExperimentId: previous.portfolio.strongestExperimentId,
            fromStrongestExperimentTitle: previous.portfolio.strongestExperimentTitle,
            toStrongestExperimentId: current.portfolio.strongestExperimentId,
            toStrongestExperimentTitle: current.portfolio.strongestExperimentTitle,
            highConfidenceComparisonDelta,
            changedExperiments: changedExperiments.slice(0, 8),
            narrative: `${leaderNarrative} ${comparisonNarrative} ${changedExperiments.length} experiment(s) changed persisted comparative posture.`,
        };
    }
}