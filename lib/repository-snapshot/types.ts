// ─── Repository Snapshot — shared types ────────────────────────────────
// Typed shape of the locally generated, read-only repository snapshot
// artifact (data/repository-snapshot.json). The artifact is produced by
// scripts/generate-repository-snapshot.mjs at development/CI time. The web
// app only imports and renders it — it never scans the filesystem.

export type FileFamily =
    | "route"
    | "layout"
    | "component"
    | "module"
    | "documentation"
    | "script"
    | "config"
    | "workflow"
    | "data"
    | "style"
    | "asset";

export type RepositoryDomain =
    | "core-observatory"
    | "quantum-annex"
    | "intervention-simulator"
    | "release-governance";

export type EdgeKind =
    | "structural"
    | "consequence"
    | "governance"
    | "research"
    | "simulator";

export interface SnapshotFile {
    path: string;
    ext: string;
    family: FileFamily;
    domain: RepositoryDomain;
    lines: number;
    bytes: number;
    /** Resolved internal import targets (repository-relative node paths). */
    imports: string[];
    /** Relative/alias specifiers that did not resolve to an existing file. */
    unresolvedImports: string[];
    /** Bare package specifiers (external dependencies). */
    externalImports: string[];
    /** For documentation files: resolved internal links to other nodes. */
    docLinks: string[];
}

export interface SnapshotEdge {
    from: string;
    to: string;
    kind: EdgeKind;
}

export interface SnapshotSummary {
    fileCount: number;
    totalLines: number;
    totalBytes: number;
    edgeCount: number;
    unresolvedImportCount: number;
    externalImportCount: number;
    families: Record<string, number>;
    domains: Record<string, number>;
    edgeKinds: Record<string, number>;
}

export interface RepositorySnapshot {
    schemaVersion: string;
    generator: string;
    repositoryName: string;
    boundary: string;
    digest: string;
    summary: SnapshotSummary;
    files: SnapshotFile[];
    edges: SnapshotEdge[];
}
