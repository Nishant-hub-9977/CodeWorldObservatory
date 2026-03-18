import fs from "fs";
import path from "path";
import { ArtifactEntry, ArtifactLedgerResponse } from "../types/artifact";
import { mockArtifacts } from "../data/mock-observatory-data";

const ARTIFACTS_DIR = path.join(process.cwd(), "data");
const LEDGER_PATH = path.join(ARTIFACTS_DIR, "artifact-ledger.json");

interface LedgerStore {
    entries: ArtifactEntry[];
    lastUpdated: string;
}

export class ArtifactLedgerService {

    private static ensureStore(): void {
        if (!fs.existsSync(ARTIFACTS_DIR)) {
            fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
        }

        if (!fs.existsSync(LEDGER_PATH)) {
            // Seed with mock data for initial UX
            const initialStore: LedgerStore = {
                entries: mockArtifacts as ArtifactEntry[],
                lastUpdated: new Date().toISOString(),
            };
            fs.writeFileSync(LEDGER_PATH, JSON.stringify(initialStore, null, 2), "utf8");
        }
    }

    private static readStore(): LedgerStore {
        this.ensureStore();
        const content = fs.readFileSync(LEDGER_PATH, "utf8");
        return JSON.parse(content) as LedgerStore;
    }

    private static writeStore(store: LedgerStore): void {
        this.ensureStore();
        store.lastUpdated = new Date().toISOString();
        fs.writeFileSync(LEDGER_PATH, JSON.stringify(store, null, 2), "utf8");
    }

    public static getLedger(): ArtifactLedgerResponse {
        const store = this.readStore();
        return {
            entries: store.entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), // Descending
            totalCount: store.entries.length,
            lastUpdated: store.lastUpdated,
        };
    }

    public static addEntry(entry: ArtifactEntry): void {
        const store = this.readStore();
        store.entries.push(entry);
        this.writeStore(store);
    }

    public static getEntriesForExperiment(experimentId: string): ArtifactEntry[] {
        return this.readStore().entries.filter(entry => entry.experimentId === experimentId);
    }
}
