import fs from "fs";
import path from "path";
import type { ReplayPackageRecord } from "../types/experiment-registry";
import { ExperimentRegistry } from "./experiment-registry";
import { SessionStore } from "./session-store";
import { ExecutionStore } from "./execution-store";

const REPLAY_PACKAGE_DIR = path.join(process.cwd(), "artifacts", "research", "replay-packages");

export class ReplayPackageBuilder {
    public static buildForExperiment(experimentId: string): ReplayPackageRecord | null {
        const experiment = ExperimentRegistry.getExperiment(experimentId);
        if (!experiment) return null;

        const sessions = SessionStore.listSessions().filter(session => session.experimentId === experimentId);
        const benchmarks = SessionStore.listBenchmarks().filter(benchmark => benchmark.experimentId === experimentId);
        const executions = ExecutionStore.getExecutionsForExperiment(experimentId);
        const now = new Date().toISOString();
        const existing = this.getLatestForExperiment(experimentId);
        const snapshotId = experiment.linkedSnapshots[experiment.linkedSnapshots.length - 1] ?? null;
        const hasStoredEvidenceChain = Boolean(snapshotId) && sessions.length > 0 && benchmarks.length > 0;
        const hasFullReplayPackage = hasStoredEvidenceChain && executions.length > 0;

        const record: ReplayPackageRecord = {
            replayPackageId: existing?.replayPackageId ?? `replay-${Date.now().toString(36)}`,
            experimentId,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            lineageStatus: hasFullReplayPackage
                ? "full-replay-package"
                : hasStoredEvidenceChain
                    ? "stored-evidence-chain"
                    : "baseline-only",
            snapshotId,
            sessionIds: sessions.map(session => session.id),
            benchmarkIds: benchmarks.map(benchmark => benchmark.id),
            executionIds: executions.map(execution => execution.id),
            artifactPaths: experiment.linkedArtifacts,
            notes: this.buildNotes(snapshotId, sessions.length, benchmarks.length, executions.length),
        };

        this.ensureDir();
        const filePath = path.join(REPLAY_PACKAGE_DIR, `${record.replayPackageId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
        ExperimentRegistry.attachReplayPackage(experimentId, record.replayPackageId, path.relative(process.cwd(), filePath).replace(/\\/g, "/"));
        return record;
    }

    public static getLatestForExperiment(experimentId: string): ReplayPackageRecord | null {
        this.ensureDir();
        const packages = fs.readdirSync(REPLAY_PACKAGE_DIR)
            .filter(file => file.startsWith("replay-") && file.endsWith(".json"))
            .map(file => {
                const raw = fs.readFileSync(path.join(REPLAY_PACKAGE_DIR, file), "utf-8");
                return JSON.parse(raw) as ReplayPackageRecord;
            })
            .filter(record => record.experimentId === experimentId)
            .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

        return packages[0] ?? null;
    }

    public static listForExperiment(experimentId: string): ReplayPackageRecord[] {
        this.ensureDir();
        return fs.readdirSync(REPLAY_PACKAGE_DIR)
            .filter(file => file.startsWith("replay-") && file.endsWith(".json"))
            .map(file => {
                const raw = fs.readFileSync(path.join(REPLAY_PACKAGE_DIR, file), "utf-8");
                return JSON.parse(raw) as ReplayPackageRecord;
            })
            .filter(record => record.experimentId === experimentId)
            .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
    }

    private static buildNotes(snapshotId: string | null, sessions: number, benchmarks: number, executions: number): string[] {
        const notes: string[] = [];
        if (!snapshotId) notes.push("No baseline snapshot is linked to this experiment.");
        if (sessions === 0) notes.push("No experiment-linked simulation sessions are present.");
        if (benchmarks === 0) notes.push("No experiment-linked benchmark runs are present.");
        if (executions === 0) notes.push("No experiment-linked execution evidence is present.");
        if (snapshotId && sessions > 0 && benchmarks > 0 && executions > 0) {
            notes.push("The experiment has a full replay package assembled from persisted baseline, simulation, benchmark, and execution evidence.");
        } else if (snapshotId && sessions > 0 && benchmarks > 0) {
            notes.push("The experiment has a stored evidence chain but execution evidence is still incomplete for full replay-package maturity.");
        }
        return notes;
    }

    private static ensureDir(): void {
        if (!fs.existsSync(REPLAY_PACKAGE_DIR)) {
            fs.mkdirSync(REPLAY_PACKAGE_DIR, { recursive: true });
        }
    }
}