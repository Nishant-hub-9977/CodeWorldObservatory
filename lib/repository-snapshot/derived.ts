// ─── Repository Snapshot — derived views ───────────────────────────────
// Pure, deterministic derivations over the snapshot artifact. These run at
// build/render time on the already-imported JSON — no filesystem access, no
// network, no mutation. Every accessor is defensive: a malformed or partial
// artifact degrades to empty/zero values rather than throwing.

import type {
    RepositorySnapshot,
    SnapshotEdge,
    SnapshotFile,
    EdgeKind,
    FileFamily,
    RepositoryDomain,
} from "./types";

const safeFiles = (s: RepositorySnapshot): SnapshotFile[] =>
    Array.isArray(s?.files) ? s.files : [];

const safeEdges = (s: RepositorySnapshot): SnapshotEdge[] =>
    Array.isArray(s?.edges) ? s.edges : [];

export interface DegreeRow {
    path: string;
    family: FileFamily;
    domain: RepositoryDomain;
    inDegree: number;
    outDegree: number;
    total: number;
}

/** Per-node in/out degree, sorted by total connectivity (desc, stable). */
export function computeDegrees(snapshot: RepositorySnapshot): DegreeRow[] {
    const files = safeFiles(snapshot);
    const edges = safeEdges(snapshot);

    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();
    for (const edge of edges) {
        if (!edge?.from || !edge?.to) continue;
        outDegree.set(edge.from, (outDegree.get(edge.from) ?? 0) + 1);
        inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    }

    return files
        .map((file) => {
            const inD = inDegree.get(file.path) ?? 0;
            const outD = outDegree.get(file.path) ?? 0;
            return {
                path: file.path,
                family: file.family,
                domain: file.domain,
                inDegree: inD,
                outDegree: outD,
                total: inD + outD,
            };
        })
        .sort((a, b) => (b.total === a.total ? a.path.localeCompare(b.path) : b.total - a.total));
}

/** Most-connected files (highest total degree). */
export function mostConnectedFiles(snapshot: RepositorySnapshot, limit = 8): DegreeRow[] {
    return computeDegrees(snapshot)
        .filter((row) => row.total > 0)
        .slice(0, Math.max(0, limit));
}

export interface FamilyRow {
    family: FileFamily;
    count: number;
    lines: number;
    bytes: number;
}

/** File-family breakdown with aggregate size, sorted by file count (desc). */
export function familyBreakdown(snapshot: RepositorySnapshot): FamilyRow[] {
    const byFamily = new Map<FileFamily, FamilyRow>();
    for (const file of safeFiles(snapshot)) {
        const existing = byFamily.get(file.family) ?? {
            family: file.family,
            count: 0,
            lines: 0,
            bytes: 0,
        };
        existing.count += 1;
        existing.lines += file.lines ?? 0;
        existing.bytes += file.bytes ?? 0;
        byFamily.set(file.family, existing);
    }
    return Array.from(byFamily.values()).sort((a, b) =>
        b.count === a.count ? a.family.localeCompare(b.family) : b.count - a.count,
    );
}

export interface DomainRow {
    domain: RepositoryDomain;
    count: number;
}

/** Domain breakdown sorted by file count (desc). */
export function domainBreakdown(snapshot: RepositorySnapshot): DomainRow[] {
    const byDomain = new Map<RepositoryDomain, number>();
    for (const file of safeFiles(snapshot)) {
        byDomain.set(file.domain, (byDomain.get(file.domain) ?? 0) + 1);
    }
    return Array.from(byDomain.entries())
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => (b.count === a.count ? a.domain.localeCompare(b.domain) : b.count - a.count));
}

/** All edges of a given kind, in artifact order. */
export function edgesOfKind(snapshot: RepositorySnapshot, kind: EdgeKind): SnapshotEdge[] {
    return safeEdges(snapshot).filter((edge) => edge?.kind === kind);
}

/** Consequence-bearing edges — shared infrastructure reachable across routes. */
export function consequenceBearingEdges(snapshot: RepositorySnapshot): SnapshotEdge[] {
    return edgesOfKind(snapshot, "consequence");
}

export interface GraphEvidence {
    nodeCount: number;
    edgeCount: number;
    routeCount: number;
    componentCount: number;
    moduleCount: number;
    docCount: number;
    configWorkflowCount: number;
    unresolvedImportCount: number;
    externalImportCount: number;
    edgeKinds: Record<EdgeKind, number>;
}

const ZERO_EDGE_KINDS: Record<EdgeKind, number> = {
    structural: 0,
    consequence: 0,
    governance: 0,
    research: 0,
    simulator: 0,
};

/** Headline graph-evidence counts, derived defensively from the artifact. */
export function graphEvidence(snapshot: RepositorySnapshot): GraphEvidence {
    const files = safeFiles(snapshot);
    const edges = safeEdges(snapshot);

    const familyCount = (family: FileFamily) =>
        files.filter((file) => file.family === family).length;

    const edgeKinds: Record<EdgeKind, number> = { ...ZERO_EDGE_KINDS };
    for (const edge of edges) {
        if (edge?.kind && edge.kind in edgeKinds) {
            edgeKinds[edge.kind] += 1;
        }
    }

    const summary = snapshot?.summary;

    return {
        nodeCount: files.length,
        edgeCount: edges.length,
        routeCount: familyCount("route"),
        componentCount: familyCount("component"),
        moduleCount: familyCount("module"),
        docCount: familyCount("documentation"),
        configWorkflowCount: familyCount("config") + familyCount("workflow"),
        unresolvedImportCount: summary?.unresolvedImportCount ?? 0,
        externalImportCount: summary?.externalImportCount ?? 0,
        edgeKinds,
    };
}

export const EDGE_KIND_LABEL: Record<EdgeKind, string> = {
    structural: "Structural",
    consequence: "Consequence-bearing",
    governance: "Governance",
    research: "Research",
    simulator: "Simulator",
};

export const DOMAIN_LABEL: Record<RepositoryDomain, string> = {
    "core-observatory": "Core Observatory",
    "quantum-annex": "Quantum Annex",
    "intervention-simulator": "Intervention Simulator",
    "release-governance": "Release Governance",
};

export const FAMILY_LABEL: Record<FileFamily, string> = {
    route: "Route",
    layout: "Layout",
    component: "Component",
    module: "Module",
    documentation: "Documentation",
    script: "Script",
    config: "Config",
    workflow: "Workflow",
    data: "Data",
    style: "Style",
    asset: "Asset",
};

/** Format a byte count as a compact human-readable string. */
export function formatBytes(bytes: number): string {
    const value = Number.isFinite(bytes) ? bytes : 0;
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}
