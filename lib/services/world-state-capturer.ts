// ─── World State Capturer ─────────────────────────────────────────
// Server-only. Uses Node.js fs + crypto — no external dependencies.
// Recursively walks the workspace directory and produces a typed
// RepoSnapshot representing the observed software world surface.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
    FileRecord,
    DirectoryRecord,
    RepoNode,
    ExtensionSummary,
    RepoSnapshot,
} from "@/lib/types/world-state";

// ─── Configuration ────────────────────────────────────────────────

const IGNORED_DIRS = new Set([
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "coverage",
    ".turbo",
    ".vercel",
    "out",
    ".cache",
]);

const MAX_DEPTH = 20;
const MAX_DIGEST_BYTES = 1024 * 1024; // 1MB — skip hashing larger files
const MAX_RECENT_FILES = 10;

// ─── Core walker ──────────────────────────────────────────────────

interface WalkResult {
    nodes: RepoNode[];
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
}

function walkDirectory(
    dirPath: string,
    rootPath: string,
    depth: number,
    result: WalkResult,
): void {
    if (depth > MAX_DEPTH) return;

    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
        // Permission denied or other read error — skip silently
        return;
    }

    let fileCount = 0;
    let dirCount = 0;

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.relative(rootPath, fullPath).replace(/\\/g, "/");

        if (entry.isDirectory()) {
            if (IGNORED_DIRS.has(entry.name)) continue;

            dirCount++;
            result.totalDirectories++;

            // Recurse first, then add directory record with counts
            const beforeFiles = result.totalFiles;
            const beforeDirs = result.totalDirectories;

            walkDirectory(fullPath, rootPath, depth + 1, result);

            const childFiles = result.totalFiles - beforeFiles;
            const childDirs = result.totalDirectories - beforeDirs;

            const dirRecord: DirectoryRecord = {
                kind: "directory",
                path: relPath,
                fileCount: childFiles,
                dirCount: childDirs,
            };
            result.nodes.push(dirRecord);
        } else if (entry.isFile()) {
            fileCount++;
            result.totalFiles++;

            let stat: fs.Stats;
            try {
                stat = fs.statSync(fullPath);
            } catch {
                continue;
            }

            const ext = path.extname(entry.name).toLowerCase() || "(none)";
            const sizeBytes = stat.size;
            result.totalBytes += sizeBytes;

            const fileRecord: FileRecord = {
                kind: "file",
                path: relPath,
                extension: ext,
                sizeBytes,
                lastModified: stat.mtime.toISOString(),
                sha256: computeDigest(fullPath, sizeBytes),
            };

            result.nodes.push(fileRecord);
        }
    }

    void fileCount;
    void dirCount;
}

function computeDigest(filePath: string, sizeBytes: number): string | undefined {
    if (sizeBytes > MAX_DIGEST_BYTES) return undefined;
    try {
        const content = fs.readFileSync(filePath);
        return crypto.createHash("sha256").update(content).digest("hex");
    } catch {
        return undefined;
    }
}

// ─── Extension aggregation ────────────────────────────────────────

function buildExtensionSummary(nodes: RepoNode[]): ExtensionSummary[] {
    const map = new Map<string, { fileCount: number; totalBytes: number }>();

    for (const node of nodes) {
        if (node.kind !== "file") continue;
        const existing = map.get(node.extension);
        if (existing) {
            existing.fileCount++;
            existing.totalBytes += node.sizeBytes;
        } else {
            map.set(node.extension, { fileCount: 1, totalBytes: node.sizeBytes });
        }
    }

    return Array.from(map.entries())
        .map(([extension, data]) => ({ extension, ...data }))
        .sort((a, b) => b.fileCount - a.fileCount);
}

// ─── Recently modified ────────────────────────────────────────────

function getRecentlyModified(nodes: RepoNode[]): FileRecord[] {
    const files = nodes.filter((n): n is FileRecord => n.kind === "file");
    return files
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, MAX_RECENT_FILES);
}

// ─── Main export ──────────────────────────────────────────────────

export function captureRepoSnapshot(rootPath: string): RepoSnapshot {
    const result: WalkResult = {
        nodes: [],
        totalFiles: 0,
        totalDirectories: 0,
        totalBytes: 0,
    };

    walkDirectory(rootPath, rootPath, 0, result);

    return {
        capturedAt: new Date().toISOString(),
        workspaceRoot: rootPath,
        totalFiles: result.totalFiles,
        totalDirectories: result.totalDirectories,
        totalBytes: result.totalBytes,
        extensions: buildExtensionSummary(result.nodes),
        recentlyModified: getRecentlyModified(result.nodes),
        nodes: result.nodes,
    };
}
