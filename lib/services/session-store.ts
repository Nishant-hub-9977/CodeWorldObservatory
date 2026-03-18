import fs from "fs";
import path from "path";
import type { SimulationSession, BenchmarkHarnessRun } from "../types/simulation";

const STORE_DIR = path.join(process.cwd(), "artifacts", "simulations");

// Ensure directory exists synchronously at startup
if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
}

export class SessionStore {
    /**
     * Persists a simulation session to the artifacts ledger.
     */
    public static saveSession(session: SimulationSession): void {
        const filePath = path.join(STORE_DIR, `${session.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(session, null, 2), "utf-8");
    }

    /**
     * Retrieves a simulation session by ID.
     */
    public static getSession(sessionId: string): SimulationSession | null {
        const filePath = path.join(STORE_DIR, `${sessionId}.json`);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data) as SimulationSession;
    }

    /**
     * Persists a benchmark harness run to the artifacts ledger.
     */
    public static saveBenchmark(benchmark: BenchmarkHarnessRun): void {
        const filePath = path.join(STORE_DIR, `${benchmark.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(benchmark, null, 2), "utf-8");
    }

    public static listSessions(): SimulationSession[] {
        return this.readByPrefix<SimulationSession>("session-")
            .sort((left, right) => new Date(right.simulatedAt).getTime() - new Date(left.simulatedAt).getTime());
    }

    public static listBenchmarks(): BenchmarkHarnessRun[] {
        return this.readByPrefix<BenchmarkHarnessRun>("benchmark-")
            .sort((left, right) => new Date(right.evaluatedAt).getTime() - new Date(left.evaluatedAt).getTime());
    }

    /**
    * Retrieves a benchmark run by ID.
    */
    public static getBenchmark(benchmarkId: string): BenchmarkHarnessRun | null {
        const filePath = path.join(STORE_DIR, `${benchmarkId}.json`);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data) as BenchmarkHarnessRun;
    }

    /**
     * Retrieves the most recently created benchmark harness run.
     * Returns null if no runs exist.
     */
    public static getLatestBenchmark(): BenchmarkHarnessRun | null {
        return this.listBenchmarks()[0] ?? null;
    }

    private static readByPrefix<T>(prefix: string): T[] {
        if (!fs.existsSync(STORE_DIR)) return [];
        return fs.readdirSync(STORE_DIR)
            .filter(file => file.startsWith(prefix) && file.endsWith(".json"))
            .map(file => {
                const data = fs.readFileSync(path.join(STORE_DIR, file), "utf-8");
                return JSON.parse(data) as T;
            });
    }
}
