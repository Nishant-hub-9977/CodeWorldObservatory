import fs from "fs";
import path from "path";
import type { PredictionRealityComparison } from "../types/execution";
import type { ResearchDataset, ResearchDatasetDetailResponse, ResearchDatasetListResponse } from "../types/research-dataset";
import type { SimulationSession, BenchmarkHarnessRun } from "../types/simulation";
import { ExperimentRegistry } from "./experiment-registry";
import { CalibrationTracker } from "./calibration-tracker";

const DATASET_DIR = path.join(process.cwd(), "artifacts", "research", "datasets");
const EXECUTIONS_PATH = path.join(process.cwd(), "data", "executions.json");
const SIM_DIR = path.join(process.cwd(), "artifacts", "simulations");

interface ExecutionStoreData {
    comparisons: PredictionRealityComparison[];
}

export class ResearchDatasetStore {
    public static listDatasets(): ResearchDatasetListResponse {
        return { datasets: this.readAllDatasets() };
    }

    public static getDataset(datasetId: string): ResearchDatasetDetailResponse | null {
        const dataset = this.readDataset(datasetId);
        return dataset ? { dataset } : null;
    }

    public static materializeDataset(experimentId: string): ResearchDataset | null {
        const experiment = ExperimentRegistry.getExperiment(experimentId);
        if (!experiment) return null;
        const existing = this.readDataset(`dataset-${experiment.experimentId}`);
        const now = new Date().toISOString();

        const dataset: ResearchDataset = {
            datasetId: `dataset-${experiment.experimentId}`,
            experimentId: experiment.experimentId,
            scenarioId: experiment.scenarioId,
            simulationResults: experiment.linkedSimulations,
            benchmarkResults: experiment.linkedBenchmarks,
            calibrationData: this.buildCalibrationData(experiment.linkedSimulations),
            createdAt: existing?.createdAt ?? new Date().toISOString(),
            updatedAt: now,
        };

        this.ensureDir();
        fs.writeFileSync(path.join(DATASET_DIR, `${dataset.datasetId}.json`), JSON.stringify(dataset, null, 2), "utf-8");
        return dataset;
    }

    private static buildCalibrationData(linkedSimulations: string[]): ResearchDataset["calibrationData"] {
        const sessionBranchIds = this.loadSessions(linkedSimulations)
            .flatMap(session => session.branchResults.map(result => result.branchId));
        const comparisons = this.loadComparisons().filter(comparison => sessionBranchIds.includes(comparison.branchId));
        const summary = comparisons.length > 0
            ? CalibrationTracker.deriveTrend(comparisons.length, this.computeAlignmentScore(comparisons))
            : CalibrationTracker.deriveTrend(0, 0);

        return {
            comparisonIds: comparisons.map(comparison => comparison.id),
            summary,
        };
    }

    private static computeAlignmentScore(comparisons: PredictionRealityComparison[]): number {
        const weights: Record<PredictionRealityComparison["calibrationResult"], number> = {
            aligned: 1,
            "partially-aligned": 0.65,
            divergent: 0.2,
            "insufficient-evidence": 0.4,
        };

        const total = comparisons.reduce((sum, comparison) => sum + weights[comparison.calibrationResult], 0);
        return comparisons.length > 0 ? total / comparisons.length : 0;
    }

    private static loadComparisons(): PredictionRealityComparison[] {
        try {
            if (!fs.existsSync(EXECUTIONS_PATH)) return [];
            const raw = fs.readFileSync(EXECUTIONS_PATH, "utf-8");
            const parsed = JSON.parse(raw) as ExecutionStoreData;
            return Array.isArray(parsed.comparisons) ? parsed.comparisons : [];
        } catch {
            return [];
        }
    }

    private static loadSessions(sessionIds: string[]): SimulationSession[] {
        if (!fs.existsSync(SIM_DIR)) return [];
        return sessionIds
            .map(sessionId => {
                const filePath = path.join(SIM_DIR, `${sessionId}.json`);
                if (!fs.existsSync(filePath)) return null;
                const raw = fs.readFileSync(filePath, "utf-8");
                return JSON.parse(raw) as SimulationSession;
            })
            .filter((session): session is SimulationSession => Boolean(session));
    }

    private static ensureDir(): void {
        if (!fs.existsSync(DATASET_DIR)) {
            fs.mkdirSync(DATASET_DIR, { recursive: true });
        }
    }

    private static readAllDatasets(): ResearchDataset[] {
        this.ensureDir();
        return fs.readdirSync(DATASET_DIR)
            .filter(file => file.startsWith("dataset-") && file.endsWith(".json"))
            .map(file => {
                const raw = fs.readFileSync(path.join(DATASET_DIR, file), "utf-8");
                return JSON.parse(raw) as ResearchDataset;
            })
            .sort((left, right) => new Date(right.updatedAt ?? right.createdAt).getTime() - new Date(left.updatedAt ?? left.createdAt).getTime());
    }

    private static readDataset(datasetId: string): ResearchDataset | null {
        this.ensureDir();
        const filePath = path.join(DATASET_DIR, `${datasetId}.json`);
        if (!fs.existsSync(filePath)) return null;
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw) as Partial<ResearchDataset>;
        return {
            datasetId: String(parsed.datasetId ?? datasetId),
            experimentId: String(parsed.experimentId ?? ""),
            scenarioId: parsed.scenarioId ? String(parsed.scenarioId) : null,
            simulationResults: Array.isArray(parsed.simulationResults) ? parsed.simulationResults.map(value => String(value)) : [],
            benchmarkResults: Array.isArray(parsed.benchmarkResults) ? parsed.benchmarkResults.map(value => String(value)) : [],
            calibrationData: {
                comparisonIds: Array.isArray(parsed.calibrationData?.comparisonIds)
                    ? parsed.calibrationData.comparisonIds.map(value => String(value))
                    : [],
                summary: parsed.calibrationData?.summary ?? CalibrationTracker.deriveTrend(0, 0),
            },
            createdAt: String(parsed.createdAt ?? new Date(0).toISOString()),
            updatedAt: String(parsed.updatedAt ?? parsed.createdAt ?? new Date(0).toISOString()),
        };
    }
}