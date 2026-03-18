import type { BranchStrategy } from "./intervention";
import type { ExperimentEvidenceEvaluation } from "./experiment-evaluation";
import type { ResearchDataset } from "./research-dataset";
import type { DependencyReport, RepoSnapshot } from "./world-state";

export type ExperimentStatus = "draft" | "active" | "completed" | "archived";
export type ReplayabilityClass = "full" | "partial" | "insufficient-evidence";
export type LineageStatus = "baseline-only" | "stored-evidence-chain" | "full-replay-package";

export interface ExperimentObjective {
    title: string;
    summary: string;
    targetFiles: string[];
}

export interface ExperimentHypothesis {
    statement: string;
    expectedSignal: string;
    successCriteria: string;
}

export interface ExperimentRecord {
    experimentId: string;
    objective: ExperimentObjective;
    hypothesis: ExperimentHypothesis;
    strategy: BranchStrategy | "mixed";
    createdAt: string;
    updatedAt: string;
    status: ExperimentStatus;
    linkedSimulations: string[];
    linkedBenchmarks: string[];
    linkedExecutions: string[];
    linkedArtifacts: string[];
    linkedSnapshots: string[];
    linkedReplayPackages: string[];
    scenarioId: string | null;
}

export interface ReplayPackageRecord {
    replayPackageId: string;
    experimentId: string;
    createdAt: string;
    updatedAt: string;
    lineageStatus: LineageStatus;
    snapshotId: string | null;
    sessionIds: string[];
    benchmarkIds: string[];
    executionIds: string[];
    artifactPaths: string[];
    notes: string[];
}

export interface WorldStateSnapshotRecord {
    snapshotId: string;
    timestamp: string;
    experimentId: string | null;
    workspaceSummary: {
        workspaceRoot: string;
        totalFiles: number;
        totalDirectories: number;
        totalBytes: number;
        topExtensions: RepoSnapshot["extensions"];
    };
    dependencyMap: DependencyReport;
    keyFiles: Array<{
        path: string;
        lastModified: string;
        sha256?: string;
    }>;
    serializedFileStructure: string;
}

export interface ExperimentRegistryResponse {
    experiments: ExperimentRecord[];
}

export interface ExperimentLinkedSimulationSummary {
    id: string;
    simulatedAt: string;
    status: string;
    baselineWorldStateId: string;
    branchCount: number;
}

export interface ExperimentLinkedBenchmarkSummary {
    id: string;
    sessionId: string;
    evaluatedAt: string;
    evidence: string;
}

export interface ExperimentLinkedExecutionSummary {
    id: string;
    createdAt: string;
    branchId: string;
    status: string;
}

export interface ExperimentReplaySummary {
    replayability: ReplayabilityClass;
    lineageStatus: LineageStatus;
    notes: string[];
    replayPackage: ReplayPackageRecord | null;
}

export interface ExperimentDetailResponse {
    experiment: ExperimentRecord;
    snapshots: WorldStateSnapshotRecord[];
    simulations: ExperimentLinkedSimulationSummary[];
    benchmarks: ExperimentLinkedBenchmarkSummary[];
    executions: ExperimentLinkedExecutionSummary[];
    replayPackages: ReplayPackageRecord[];
    dataset: ResearchDataset | null;
    replay: ExperimentReplaySummary;
    evaluation: ExperimentEvidenceEvaluation;
    evidenceCaveats: string[];
}

export interface WorldStateSnapshotResponse {
    snapshot: WorldStateSnapshotRecord;
}

export interface WorldStateHistoryResponse {
    snapshots: WorldStateSnapshotRecord[];
}