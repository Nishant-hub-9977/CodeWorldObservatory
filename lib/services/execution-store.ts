import fs from "fs";
import path from "path";
import { ExecutionRecord, PredictionRealityComparison, ExecutionApiResponse } from "../types/execution";

const DATA_DIR = path.join(process.cwd(), "data");
const EXECUTIONS_PATH = path.join(DATA_DIR, "executions.json");

interface ExecutionStoreData {
    executions: ExecutionRecord[];
    comparisons: PredictionRealityComparison[];
    lastUpdated: string;
}

export class ExecutionStore {

    private static ensureStore(): void {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        if (!fs.existsSync(EXECUTIONS_PATH)) {
            const initialStore: ExecutionStoreData = {
                executions: [],
                comparisons: [],
                lastUpdated: new Date().toISOString(),
            };
            fs.writeFileSync(EXECUTIONS_PATH, JSON.stringify(initialStore, null, 2), "utf8");
        }
    }

    private static readStore(): ExecutionStoreData {
        this.ensureStore();
        const content = fs.readFileSync(EXECUTIONS_PATH, "utf8");
        return JSON.parse(content) as ExecutionStoreData;
    }

    private static writeStore(store: ExecutionStoreData): void {
        this.ensureStore();
        store.lastUpdated = new Date().toISOString();
        fs.writeFileSync(EXECUTIONS_PATH, JSON.stringify(store, null, 2), "utf8");
    }

    public static getExecutions(): ExecutionApiResponse {
        const store = this.readStore();
        return {
            executions: store.executions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            comparisons: store.comparisons,
            generatedAt: store.lastUpdated,
        };
    }

    public static addExecution(execution: ExecutionRecord, comparison: PredictionRealityComparison): void {
        const store = this.readStore();
        store.executions.push(execution);
        store.comparisons.push(comparison);
        this.writeStore(store);
    }

    public static getExecutionsForExperiment(experimentId: string): ExecutionRecord[] {
        return this.readStore().executions.filter(execution => execution.experimentId === experimentId);
    }
}
