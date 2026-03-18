import type { ExperimentDetailResponse } from "../types/experiment-registry";
import { ExperimentRegistry } from "./experiment-registry";
import { WorldStateCaptureService } from "./world-state-capture";
import { SessionStore } from "./session-store";
import { ExecutionStore } from "./execution-store";
import { ReplayPackageBuilder } from "./replay-package-builder";
import { ReproducibilityEngine } from "./reproducibility-engine";
import { ResearchDatasetStore } from "./research-dataset-store";
import { EvidenceWeightedEvaluator } from "./evidence-weighted-evaluator";

type ExperimentDetailBase = Omit<ExperimentDetailResponse, "evaluation">;

export class ExperimentDetailBuilder {
    public static build(experimentId: string): ExperimentDetailResponse | null {
        const detail = this.buildBase(experimentId);
        if (!detail) return null;

        return this.attachEvaluations([detail])[0] ?? null;
    }

    public static list(): ExperimentDetailResponse[] {
        const details = ExperimentRegistry.listExperiments().experiments
            .map(experiment => this.buildBase(experiment.experimentId))
            .filter((detail): detail is ExperimentDetailBase => Boolean(detail));

        return this.attachEvaluations(details)
            .sort((left, right) => new Date(right.experiment.updatedAt).getTime() - new Date(left.experiment.updatedAt).getTime());
    }

    private static buildBase(experimentId: string): ExperimentDetailBase | null {
        const experiment = ExperimentRegistry.getExperiment(experimentId);
        if (!experiment) return null;

        const snapshots = WorldStateCaptureService.getByExperimentId(experimentId)
            .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
        const simulations = SessionStore.listSessions()
            .filter(session => session.experimentId === experimentId)
            .map(session => ({
                id: session.id,
                simulatedAt: session.simulatedAt,
                status: session.status,
                baselineWorldStateId: session.baselineWorldStateId,
                branchCount: session.branchResults.length,
            }));
        const benchmarks = SessionStore.listBenchmarks()
            .filter(benchmark => benchmark.experimentId === experimentId)
            .map(benchmark => ({
                id: benchmark.id,
                sessionId: benchmark.sessionId,
                evaluatedAt: benchmark.evaluatedAt,
                evidence: benchmark.overallEvidenceSufficiency,
            }));
        const executions = ExecutionStore.getExecutionsForExperiment(experimentId)
            .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
            .map(execution => ({
                id: execution.id,
                createdAt: execution.createdAt,
                branchId: execution.branchId,
                status: execution.actualOutcome.status,
            }));
        const replayPackages = ReplayPackageBuilder.listForExperiment(experimentId);
        const dataset = ResearchDatasetStore.getDataset(`dataset-${experimentId}`)?.dataset ?? null;
        const replay = ReproducibilityEngine.replayExperiment(experimentId);
        const evidenceCaveats = this.collectEvidenceCaveats({
            datasetPresent: Boolean(dataset),
            replayNotes: replay?.notes ?? [],
            replayPackageCount: replayPackages.length,
        });

        return {
            experiment,
            snapshots,
            simulations,
            benchmarks,
            executions,
            replayPackages,
            dataset,
            replay: {
                replayability: replay?.replayability ?? "insufficient-evidence",
                lineageStatus: replay?.lineageStatus ?? "baseline-only",
                notes: replay?.notes ?? ["No replay evidence is linked to this experiment yet."],
                replayPackage: replay?.replayPackage ?? replayPackages[0] ?? null,
            },
            evidenceCaveats,
        };
    }

    private static attachEvaluations(details: ExperimentDetailBase[]): ExperimentDetailResponse[] {
        if (details.length === 0) return [];

        const portfolio = EvidenceWeightedEvaluator.evaluatePortfolio(details);
        const evaluations = new Map(portfolio.evaluations.map(evaluation => [evaluation.experimentId, evaluation]));

        return details.map(detail => ({
            ...detail,
            evaluation: evaluations.get(detail.experiment.experimentId) ?? EvidenceWeightedEvaluator.evaluateDetail(detail),
        }));
    }

    private static collectEvidenceCaveats(input: {
        datasetPresent: boolean;
        replayNotes: string[];
        replayPackageCount: number;
    }): string[] {
        const caveats = new Set<string>(input.replayNotes);

        if (!input.datasetPresent) {
            caveats.add("No dataset artifact is materialized for this experiment yet.");
        }
        if (input.replayPackageCount === 0) {
            caveats.add("No replay package is persisted for this experiment yet.");
        }

        return Array.from(caveats);
    }
}