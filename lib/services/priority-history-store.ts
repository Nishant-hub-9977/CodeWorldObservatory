// ─── Priority History Store ──────────────────────────────────────────
// Phase 21: Write-side-only persistence for historical priority records.
// Each record captures the full prioritization context and governance
// state at a specific point in time. Records are created only on
// explicit POST requests — never on GET reads.
//
// Historical records are interpretation snapshots. They capture how the
// observatory prioritized structural gaps at a given moment. They do
// not become stronger than the underlying experiment, replay, or
// calibration artifacts they reference.

import fs from "fs";
import path from "path";
import { OBSERVATORY_VERSION } from "../constants/observatory";
import { OBSERVATORY_ACTIVE_PHASE } from "../constants/observatory-status";
import type { ResearchPrioritizationContext } from "../types/research-prioritization";
import type { RecommendationGovernanceContext } from "../types/research-priority-drift";
import type { PriorityHistoryRecord } from "../types/research-priority-history";

const PRIORITY_HISTORY_DIR = path.join(process.cwd(), "artifacts", "research", "priorities");

const DOCTRINE_CAVEAT = "This priority history record is a persisted interpretation snapshot. It captures the observatory's advisory prioritization posture at a specific point in time. It does not constitute causal proof, execution authority, or evidence stronger than the underlying experiment and evaluation artifacts it references. Repeated appearance of a priority class across snapshots indicates persistent structural posture, not validated truth.";

if (!fs.existsSync(PRIORITY_HISTORY_DIR)) {
    fs.mkdirSync(PRIORITY_HISTORY_DIR, { recursive: true });
}

export class PriorityHistoryStore {
    /**
     * Builds a historical priority record from the current prioritization
     * and governance context. Does NOT persist — call persist() separately.
     */
    public static buildRecord(
        prioritizationContext: ResearchPrioritizationContext,
        governanceContext: RecommendationGovernanceContext
    ): PriorityHistoryRecord {
        return {
            recordId: `priority-${Date.now().toString(36)}`,
            createdAt: new Date().toISOString(),
            phaseActive: OBSERVATORY_ACTIVE_PHASE,
            systemVersion: OBSERVATORY_VERSION,
            prioritizationContext,
            governanceContext,
            doctrineCaveat: DOCTRINE_CAVEAT,
        };
    }

    /**
     * Persists a priority record to disk. Write-side only.
     */
    public static persist(record: PriorityHistoryRecord): string {
        const filePath = path.join(PRIORITY_HISTORY_DIR, `${record.recordId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
        return filePath;
    }

    /**
     * Builds and persists in one call. Explicit write path.
     */
    public static persistCurrentSnapshot(
        prioritizationContext: ResearchPrioritizationContext,
        governanceContext: RecommendationGovernanceContext
    ): PriorityHistoryRecord {
        const record = this.buildRecord(prioritizationContext, governanceContext);
        this.persist(record);
        return record;
    }

    /**
     * Returns all persisted records, newest first.
     */
    public static listAll(): PriorityHistoryRecord[] {
        if (!fs.existsSync(PRIORITY_HISTORY_DIR)) return [];

        return fs.readdirSync(PRIORITY_HISTORY_DIR)
            .filter(file => file.startsWith("priority-") && file.endsWith(".json"))
            .map(file => {
                const data = fs.readFileSync(path.join(PRIORITY_HISTORY_DIR, file), "utf-8");
                return JSON.parse(data) as PriorityHistoryRecord;
            })
            .sort((left, right) =>
                new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
            );
    }

    /**
     * Returns the most recent persisted record, or null.
     */
    public static getLatest(): PriorityHistoryRecord | null {
        return this.listAll()[0] ?? null;
    }

    /**
     * Returns a specific record by ID, or null.
     */
    public static getById(recordId: string): PriorityHistoryRecord | null {
        const filePath = path.join(PRIORITY_HISTORY_DIR, `${recordId}.json`);
        if (!fs.existsSync(filePath)) return null;
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data) as PriorityHistoryRecord;
    }

    /**
     * Returns the total number of persisted records.
     */
    public static count(): number {
        if (!fs.existsSync(PRIORITY_HISTORY_DIR)) return 0;
        return fs.readdirSync(PRIORITY_HISTORY_DIR)
            .filter(file => file.startsWith("priority-") && file.endsWith(".json"))
            .length;
    }
}
