import fs from "fs";
import path from "path";
import type { DependencyReport, RepoSnapshot } from "../types/world-state";
import type { WorldStateSnapshotRecord, WorldStateHistoryResponse } from "../types/experiment-registry";
import { captureRepoSnapshot } from "./world-state-capturer";
import { analyzeDependencies } from "./dependency-analyzer";
import { ExperimentRegistry } from "./experiment-registry";

const SNAPSHOT_DIR = path.join(process.cwd(), "artifacts", "research", "world-state");

export class WorldStateCaptureService {
    public static captureWorldState(experimentId: string | null = null): WorldStateSnapshotRecord {
        if (experimentId && !ExperimentRegistry.getExperiment(experimentId)) {
            throw new Error(`Cannot capture linked world-state snapshot for unknown experiment: ${experimentId}`);
        }

        const workspaceRoot = process.cwd();
        const snapshot = captureRepoSnapshot(workspaceRoot);
        const dependencyMap = analyzeDependencies(snapshot.nodes, workspaceRoot);

        const record: WorldStateSnapshotRecord = {
            snapshotId: `wss-${Date.now().toString(36)}`,
            timestamp: new Date().toISOString(),
            experimentId,
            workspaceSummary: {
                workspaceRoot: snapshot.workspaceRoot,
                totalFiles: snapshot.totalFiles,
                totalDirectories: snapshot.totalDirectories,
                totalBytes: snapshot.totalBytes,
                topExtensions: snapshot.extensions.slice(0, 5),
            },
            dependencyMap: this.recordDependencyGraph(dependencyMap),
            keyFiles: snapshot.recentlyModified.map(file => ({
                path: file.path,
                lastModified: file.lastModified,
                sha256: file.sha256,
            })),
            serializedFileStructure: this.serializeFileStructure(snapshot),
        };

        const filePath = this.persistStateSnapshot(record);

        if (experimentId) {
            ExperimentRegistry.attachSnapshot(experimentId, record.snapshotId, path.relative(process.cwd(), filePath).replace(/\\/g, "/"));
        }

        return record;
    }

    public static serializeFileStructure(snapshot: RepoSnapshot): string {
        return snapshot.nodes
            .map(node => {
                if (node.kind === "directory") {
                    return `dir:${node.path}:${node.fileCount}:${node.dirCount}`;
                }
                return `file:${node.path}:${node.extension}:${node.sizeBytes}:${node.lastModified}`;
            })
            .join("\n");
    }

    public static recordDependencyGraph(report: DependencyReport): DependencyReport {
        return {
            edges: [...report.edges],
            mostConnected: [...report.mostConnected],
            orphanCandidates: [...report.orphanCandidates],
            analyzedFileCount: report.analyzedFileCount,
        };
    }

    public static persistStateSnapshot(record: WorldStateSnapshotRecord): string {
        this.ensureDir();
        const filePath = path.join(SNAPSHOT_DIR, `${record.snapshotId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
        return filePath;
    }

    public static getHistory(): WorldStateHistoryResponse {
        this.ensureDir();

        const snapshots = fs.readdirSync(SNAPSHOT_DIR)
            .filter(file => file.startsWith("wss-") && file.endsWith(".json"))
            .map(file => {
                const raw = fs.readFileSync(path.join(SNAPSHOT_DIR, file), "utf-8");
                return JSON.parse(raw) as WorldStateSnapshotRecord;
            })
            .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

        return { snapshots };
    }

    public static getByExperimentId(experimentId: string): WorldStateSnapshotRecord[] {
        return this.getHistory().snapshots.filter(snapshot => snapshot.experimentId === experimentId);
    }

    private static ensureDir(): void {
        if (!fs.existsSync(SNAPSHOT_DIR)) {
            fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
        }
    }
}