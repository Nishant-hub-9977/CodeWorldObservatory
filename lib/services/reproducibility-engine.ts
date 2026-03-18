import type { BenchmarkHarnessRun, SimulationSession } from "../types/simulation";
import type { ExperimentRecord, ReplayPackageRecord, WorldStateSnapshotRecord } from "../types/experiment-registry";
import { ExperimentRegistry } from "./experiment-registry";
import { WorldStateCaptureService } from "./world-state-capture";
import { ReplayPackageBuilder } from "./replay-package-builder";
import fs from "fs";
import path from "path";

const SIM_DIR = path.join(process.cwd(), "artifacts", "simulations");

export interface ExperimentReplay {
    experimentId: string;
    worldStateSnapshot: WorldStateSnapshotRecord | null;
    strategyBranch: ExperimentRecord["strategy"];
    replayability: "full" | "partial" | "insufficient-evidence";
    lineageStatus: "baseline-only" | "stored-evidence-chain" | "full-replay-package";
    linkedSessions: SimulationSession[];
    linkedBenchmarks: BenchmarkHarnessRun[];
    replayPackage: ReplayPackageRecord | null;
    notes: string[];
}

export class ReproducibilityEngine {
    public static replayExperiment(experimentId: string): ExperimentReplay | null {
        const experiment = ExperimentRegistry.getExperiment(experimentId);
        if (!experiment) return null;

        const worldStateSnapshot = this.reconstructWorldState(experiment.linkedSnapshots[experiment.linkedSnapshots.length - 1] ?? null);
        const linkedSessions = this.loadSessions(experiment.linkedSimulations);
        const linkedBenchmarks = this.loadBenchmarks(experiment.linkedBenchmarks);
        const replayPackage = ReplayPackageBuilder.getLatestForExperiment(experimentId);
        const rerun = this.reRunSimulationChain(experiment, worldStateSnapshot, linkedSessions, linkedBenchmarks, replayPackage);

        return {
            experimentId: experiment.experimentId,
            worldStateSnapshot,
            strategyBranch: experiment.strategy,
            replayability: rerun.replayability,
            lineageStatus: rerun.lineageStatus,
            linkedSessions,
            linkedBenchmarks,
            replayPackage,
            notes: rerun.notes,
        };
    }

    public static reconstructWorldState(snapshotId: string | null): WorldStateSnapshotRecord | null {
        if (!snapshotId) return null;
        return WorldStateCaptureService.getHistory().snapshots.find(snapshot => snapshot.snapshotId === snapshotId) ?? null;
    }

    public static reRunSimulationChain(
        experiment: ExperimentRecord,
        worldStateSnapshot: WorldStateSnapshotRecord | null,
        linkedSessions: SimulationSession[],
        linkedBenchmarks: BenchmarkHarnessRun[],
        replayPackage: ReplayPackageRecord | null
    ): { replayability: ExperimentReplay["replayability"]; lineageStatus: ExperimentReplay["lineageStatus"]; notes: string[] } {
        const notes: string[] = [];
        const hasReplayPackage = Boolean(replayPackage);

        if (!worldStateSnapshot) {
            notes.push("No persisted world-state snapshot is linked to this experiment.");
        }
        if (linkedSessions.length === 0) {
            notes.push("No linked simulation sessions were registered for this experiment.");
        }
        if (linkedBenchmarks.length === 0) {
            notes.push("No linked benchmark runs were registered for this experiment.");
        }

        if (worldStateSnapshot && linkedSessions.length > 0 && linkedBenchmarks.length > 0) {
            if (hasReplayPackage) {
                notes.push("A persisted replay package is linked, so the stored evidence chain can be reconstructed without inferring missing inputs.");
                return {
                    replayability: replayPackage?.lineageStatus === "full-replay-package" ? "full" : "partial",
                    lineageStatus: replayPackage?.lineageStatus ?? "stored-evidence-chain",
                    notes,
                };
            }

            notes.push("The repository can reconstruct the stored evidence chain, but full replay remains unavailable because no dedicated replay package is currently linked or the captured branch inputs remain incomplete.");
            return { replayability: "partial", lineageStatus: "stored-evidence-chain", notes };
        }

        return {
            replayability: "insufficient-evidence",
            lineageStatus: "baseline-only",
            notes,
        };
    }

    private static loadSessions(sessionIds: string[]): SimulationSession[] {
        return sessionIds
            .map(sessionId => this.readArtifact<SimulationSession>(sessionId))
            .filter((session): session is SimulationSession => Boolean(session));
    }

    private static loadBenchmarks(benchmarkIds: string[]): BenchmarkHarnessRun[] {
        return benchmarkIds
            .map(benchmarkId => this.readArtifact<BenchmarkHarnessRun>(benchmarkId))
            .filter((benchmark): benchmark is BenchmarkHarnessRun => Boolean(benchmark));
    }

    private static readArtifact<T>(artifactId: string): T | null {
        const filePath = path.join(SIM_DIR, `${artifactId}.json`);
        if (!fs.existsSync(filePath)) return null;
        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw) as T;
    }
}