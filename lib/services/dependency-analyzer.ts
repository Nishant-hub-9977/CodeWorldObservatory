// ─── Dependency Analyzer ─────────────────────────────────────────
// Server-only. No external parser — pragmatic regex-based approach.
// Phase 1 scope: local relative imports in .ts and .tsx files only.
// Captures from/to edges, derives connectivity, surfaces orphans.

import fs from "fs";
import path from "path";
import type {
    RepoNode,
    FileRecord,
    DependencyEdgeLive,
    ConnectedFile,
    DependencyReport,
} from "@/lib/types/world-state";

// ─── Configuration ────────────────────────────────────────────────

const TS_EXTENSIONS = new Set([".ts", ".tsx"]);

// Matches local relative imports:
//   import ... from './foo'
//   import ... from '../bar/baz'
//   export ... from './items'
//   Also handles dynamic: import('./module')
const IMPORT_REGEX =
    /(?:from\s+|import\s*\()['"](\.[./][^'"]+)['"]/g;

// ─── File filtering ───────────────────────────────────────────────

function getTsFiles(nodes: RepoNode[]): FileRecord[] {
    return nodes.filter(
        (n): n is FileRecord =>
            n.kind === "file" && TS_EXTENSIONS.has(n.extension),
    );
}

// ─── Import extraction ────────────────────────────────────────────

function extractImports(filePath: string): string[] {
    let content: string;
    try {
        content = fs.readFileSync(filePath, "utf-8");
    } catch {
        return [];
    }

    const imports: string[] = [];
    let match: RegExpExecArray | null;

    IMPORT_REGEX.lastIndex = 0;
    while ((match = IMPORT_REGEX.exec(content)) !== null) {
        imports.push(match[1]);
    }

    return imports;
}

// ─── Graph construction ───────────────────────────────────────────

function buildEdges(
    tsFiles: FileRecord[],
    workspaceRoot: string,
): DependencyEdgeLive[] {
    const edges: DependencyEdgeLive[] = [];

    for (const file of tsFiles) {
        const absolutePath = path.join(workspaceRoot, file.path);
        const imports = extractImports(absolutePath);

        for (const importSpecifier of imports) {
            edges.push({
                from: file.path,
                to: importSpecifier,
            });
        }
    }

    return edges;
}

// ─── Connectivity analysis ────────────────────────────────────────

function computeConnectivity(
    edges: DependencyEdgeLive[],
    tsFilePaths: Set<string>,
): ConnectedFile[] {
    const inbound = new Map<string, number>();
    const outbound = new Map<string, number>();

    // Initialise all TS files
    for (const p of tsFilePaths) {
        inbound.set(p, 0);
        outbound.set(p, 0);
    }

    for (const edge of edges) {
        outbound.set(edge.from, (outbound.get(edge.from) ?? 0) + 1);

        // Try to resolve the import specifier back to a known file path
        // We do a simple path-based match against the flat file set
        // Normalise by stripping extensions if present
        const resolvedPath = resolveImportToPath(edge.from, edge.to, tsFilePaths);
        if (resolvedPath) {
            inbound.set(resolvedPath, (inbound.get(resolvedPath) ?? 0) + 1);
        }
    }

    const connected: ConnectedFile[] = [];
    for (const p of tsFilePaths) {
        const ib = inbound.get(p) ?? 0;
        const ob = outbound.get(p) ?? 0;
        connected.push({ path: p, inbound: ib, outbound: ob, total: ib + ob });
    }

    return connected.sort((a, b) => b.total - a.total);
}

function resolveImportToPath(
    fromPath: string,
    importSpec: string,
    knownPaths: Set<string>,
): string | null {
    const dir = path.dirname(fromPath);
    const resolved = path.join(dir, importSpec).replace(/\\/g, "/");

    // Try exact match, then with common extensions
    const candidates = [
        resolved,
        resolved + ".ts",
        resolved + ".tsx",
        resolved + "/index.ts",
        resolved + "/index.tsx",
    ];

    for (const candidate of candidates) {
        if (knownPaths.has(candidate)) return candidate;
    }

    return null;
}

// ─── Orphan candidates ────────────────────────────────────────────

function findOrphans(
    connected: ConnectedFile[],
    tsFilePaths: Set<string>,
): string[] {
    return connected
        .filter((f) => f.total === 0 && tsFilePaths.has(f.path))
        .map((f) => f.path);
}

// ─── Main export ──────────────────────────────────────────────────

export function analyzeDependencies(
    nodes: RepoNode[],
    workspaceRoot: string,
): DependencyReport {
    const tsFiles = getTsFiles(nodes);
    const tsFilePaths = new Set(tsFiles.map((f) => f.path));

    const edges = buildEdges(tsFiles, workspaceRoot);
    const connected = computeConnectivity(edges, tsFilePaths);
    const orphans = findOrphans(connected, tsFilePaths);

    return {
        edges,
        mostConnected: connected.slice(0, 5),
        orphanCandidates: orphans,
        analyzedFileCount: tsFiles.length,
    };
}
