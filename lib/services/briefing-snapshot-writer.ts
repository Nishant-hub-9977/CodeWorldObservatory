// ─── Briefing Snapshot Writer ─────────────────────────────────────────
// Phase 10: Persists ObservatoryBriefs as JSON artifacts under
// artifacts/research/briefings/. Provides retrieval of the most
// recent briefing for comparison and export.

import fs from "fs";
import path from "path";
import type { ObservatoryBrief } from "../types/research-export";

const BRIEFING_DIR = path.join(process.cwd(), "artifacts", "research", "briefings");

// Ensure directory exists synchronously at startup
if (!fs.existsSync(BRIEFING_DIR)) {
    fs.mkdirSync(BRIEFING_DIR, { recursive: true });
}

export class BriefingSnapshotWriter {
    /**
     * Persists an ObservatoryBrief to disk as a JSON artifact.
     * Returns the absolute path of the written file.
     */
    public static write(brief: ObservatoryBrief): string {
        const filename = `${brief.id}.json`;
        const filePath = path.join(BRIEFING_DIR, filename);
        fs.writeFileSync(filePath, JSON.stringify(brief, null, 2), "utf-8");
        return filePath;
    }

    /**
     * Retrieves the most recently persisted briefing, or null if none exist.
     */
    public static getLatest(): ObservatoryBrief | null {
        if (!fs.existsSync(BRIEFING_DIR)) return null;

        const files = fs.readdirSync(BRIEFING_DIR).filter(f => f.startsWith("brief-") && f.endsWith(".json"));
        if (files.length === 0) return null;

        // Sort by filesystem mtime descending
        files.sort((a, b) => {
            const statA = fs.statSync(path.join(BRIEFING_DIR, a));
            const statB = fs.statSync(path.join(BRIEFING_DIR, b));
            return statB.mtimeMs - statA.mtimeMs;
        });

        const data = fs.readFileSync(path.join(BRIEFING_DIR, files[0]), "utf-8");
        return JSON.parse(data) as ObservatoryBrief;
    }

    /**
     * Retrieves a persisted briefing by its ID.
     */
    public static getById(briefId: string): ObservatoryBrief | null {
        const filePath = path.join(BRIEFING_DIR, `${briefId}.json`);
        if (!fs.existsSync(filePath)) return null;

        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data) as ObservatoryBrief;
    }

    /**
     * Lists all persisted briefing IDs with their generation timestamps.
     */
    public static listAll(): Array<{ id: string; generatedAt: string; filePath: string }> {
        if (!fs.existsSync(BRIEFING_DIR)) return [];

        const files = fs.readdirSync(BRIEFING_DIR).filter(f => f.startsWith("brief-") && f.endsWith(".json"));

        return files.map(f => {
            const filePath = path.join(BRIEFING_DIR, f);
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ObservatoryBrief;
            return {
                id: data.id,
                generatedAt: data.generatedAt,
                filePath,
            };
        }).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    }
}
