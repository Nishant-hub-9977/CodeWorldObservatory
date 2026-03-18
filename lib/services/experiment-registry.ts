import fs from "fs";
import path from "path";
import type { BranchStrategy } from "../types/intervention";
import type {
    ExperimentRecord,
    ExperimentRegistryResponse,
    ExperimentObjective,
    ExperimentHypothesis,
} from "../types/experiment-registry";

const EXPERIMENT_DIR = path.join(process.cwd(), "artifacts", "research", "experiments");
const REGISTRY_PATH = path.join(EXPERIMENT_DIR, "registry.json");

interface ExperimentRegistryStore {
    experiments: ExperimentRecord[];
}

export class ExperimentRegistry {
    public static listExperiments(): ExperimentRegistryResponse {
        return { experiments: this.loadRegistry().experiments };
    }

    public static registerExperiment(input: {
        objective: ExperimentObjective;
        hypothesis: ExperimentHypothesis;
        strategy: BranchStrategy | "mixed";
        status?: ExperimentRecord["status"];
        linkedSimulations?: string[];
        linkedBenchmarks?: string[];
        linkedArtifacts?: string[];
    }): ExperimentRecord {
        const store = this.loadRegistry();
        const now = new Date().toISOString();

        const experiment: ExperimentRecord = {
            experimentId: this.createExperimentId(store),
            objective: input.objective,
            hypothesis: input.hypothesis,
            strategy: input.strategy,
            createdAt: now,
            updatedAt: now,
            status: input.status ?? "draft",
            linkedSimulations: input.linkedSimulations ?? [],
            linkedBenchmarks: input.linkedBenchmarks ?? [],
            linkedExecutions: [],
            linkedArtifacts: input.linkedArtifacts ?? [],
            linkedSnapshots: [],
            linkedReplayPackages: [],
            scenarioId: null,
        };

        store.experiments.unshift(experiment);
        this.saveRegistry(store);
        return experiment;
    }

    public static getExperiment(experimentId: string): ExperimentRecord | null {
        return this.loadRegistry().experiments.find(experiment => experiment.experimentId === experimentId) ?? null;
    }

    public static attachSnapshot(experimentId: string, snapshotId: string, artifactPath: string): ExperimentRecord | null {
        return this.updateExperiment(experimentId, experiment => {
            if (!experiment.linkedSnapshots.includes(snapshotId)) {
                experiment.linkedSnapshots.push(snapshotId);
            }
            if (!experiment.linkedArtifacts.includes(artifactPath)) {
                experiment.linkedArtifacts.push(artifactPath);
            }
        });
    }

    public static attachSimulation(experimentId: string, sessionId: string, artifactPath?: string): ExperimentRecord | null {
        return this.updateExperiment(experimentId, experiment => {
            if (!experiment.linkedSimulations.includes(sessionId)) {
                experiment.linkedSimulations.push(sessionId);
            }
            if (artifactPath && !experiment.linkedArtifacts.includes(artifactPath)) {
                experiment.linkedArtifacts.push(artifactPath);
            }
        });
    }

    public static attachBenchmark(experimentId: string, benchmarkId: string, artifactPath?: string): ExperimentRecord | null {
        return this.updateExperiment(experimentId, experiment => {
            if (!experiment.linkedBenchmarks.includes(benchmarkId)) {
                experiment.linkedBenchmarks.push(benchmarkId);
            }
            if (artifactPath && !experiment.linkedArtifacts.includes(artifactPath)) {
                experiment.linkedArtifacts.push(artifactPath);
            }
        });
    }

    public static attachExecution(experimentId: string, executionId: string, artifactPath?: string): ExperimentRecord | null {
        return this.updateExperiment(experimentId, experiment => {
            if (!experiment.linkedExecutions.includes(executionId)) {
                experiment.linkedExecutions.push(executionId);
            }
            if (artifactPath && !experiment.linkedArtifacts.includes(artifactPath)) {
                experiment.linkedArtifacts.push(artifactPath);
            }
        });
    }

    public static attachReplayPackage(experimentId: string, replayPackageId: string, artifactPath?: string): ExperimentRecord | null {
        return this.updateExperiment(experimentId, experiment => {
            if (!experiment.linkedReplayPackages.includes(replayPackageId)) {
                experiment.linkedReplayPackages.push(replayPackageId);
            }
            if (artifactPath && !experiment.linkedArtifacts.includes(artifactPath)) {
                experiment.linkedArtifacts.push(artifactPath);
            }
        });
    }

    public static linkScenario(experimentId: string, scenarioId: string): ExperimentRecord | null {
        return this.updateExperiment(experimentId, experiment => {
            experiment.scenarioId = scenarioId;
        });
    }

    private static updateExperiment(
        experimentId: string,
        update: (experiment: ExperimentRecord) => void
    ): ExperimentRecord | null {
        const store = this.loadRegistry();
        const experiment = store.experiments.find(item => item.experimentId === experimentId);
        if (!experiment) return null;

        update(experiment);
        experiment.updatedAt = new Date().toISOString();
        this.saveRegistry(store);
        return experiment;
    }

    private static loadRegistry(): ExperimentRegistryStore {
        this.ensureStore();
        const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
        const parsed = JSON.parse(raw) as Partial<ExperimentRegistryStore>;
        return {
            experiments: Array.isArray(parsed.experiments)
                ? parsed.experiments.map(experiment => this.normalizeExperimentRecord(experiment))
                : [],
        };
    }

    private static saveRegistry(store: ExperimentRegistryStore): void {
        this.ensureStore();
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(store, null, 2), "utf-8");
    }

    private static ensureStore(): void {
        if (!fs.existsSync(EXPERIMENT_DIR)) {
            fs.mkdirSync(EXPERIMENT_DIR, { recursive: true });
        }
        if (!fs.existsSync(REGISTRY_PATH)) {
            const initial: ExperimentRegistryStore = { experiments: [] };
            fs.writeFileSync(REGISTRY_PATH, JSON.stringify(initial, null, 2), "utf-8");
        }
    }

    private static createExperimentId(store: ExperimentRegistryStore): string {
        let candidate = "";
        do {
            candidate = `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        } while (store.experiments.some(experiment => experiment.experimentId === candidate));

        return candidate;
    }

    private static normalizeExperimentRecord(record: unknown): ExperimentRecord {
        const input = (record ?? {}) as Partial<ExperimentRecord> & {
            objective?: Partial<ExperimentObjective>;
            hypothesis?: Partial<ExperimentHypothesis>;
        };

        return {
            experimentId: String(input.experimentId ?? `exp-legacy-${Date.now().toString(36)}`),
            objective: {
                title: String(input.objective?.title ?? "Untitled experiment"),
                summary: String(input.objective?.summary ?? ""),
                targetFiles: Array.isArray(input.objective?.targetFiles)
                    ? input.objective.targetFiles.map(value => String(value))
                    : [],
            },
            hypothesis: {
                statement: String(input.hypothesis?.statement ?? ""),
                expectedSignal: String(input.hypothesis?.expectedSignal ?? ""),
                successCriteria: String(input.hypothesis?.successCriteria ?? ""),
            },
            strategy: (input.strategy ?? "mixed") as ExperimentRecord["strategy"],
            createdAt: String(input.createdAt ?? new Date(0).toISOString()),
            updatedAt: String(input.updatedAt ?? input.createdAt ?? new Date(0).toISOString()),
            status: (input.status ?? "draft") as ExperimentRecord["status"],
            linkedSimulations: this.normalizeStringArray(input.linkedSimulations),
            linkedBenchmarks: this.normalizeStringArray(input.linkedBenchmarks),
            linkedExecutions: this.normalizeStringArray(input.linkedExecutions),
            linkedArtifacts: this.normalizeStringArray(input.linkedArtifacts).map(value => value.replace(/\\/g, "/")),
            linkedSnapshots: this.normalizeStringArray(input.linkedSnapshots),
            linkedReplayPackages: this.normalizeStringArray(input.linkedReplayPackages),
            scenarioId: input.scenarioId ? String(input.scenarioId) : null,
        };
    }

    private static normalizeStringArray(value: unknown): string[] {
        return Array.isArray(value) ? value.map(entry => String(entry)) : [];
    }
}