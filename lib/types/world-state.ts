// ─── World State Types ───────────────────────────────────────────
// Represents the complete observable state of a software repository
// at a given point in time. This is the foundational data structure
// of the world model — the ground truth before any intervention.

export type BranchStatus = "active" | "stale" | "merged" | "diverged";

export interface BranchContext {
    name: string;
    sha: string;
    lastCommit: string;
    status: BranchStatus;
    aheadBy: number;
    behindBy: number;
}

export interface FileNode {
    path: string;
    type: "file" | "directory";
    size?: number;       // bytes, for files
    digest?: string;     // sha256 of content, for files
    children?: FileNode[];
    lastModified?: string; // ISO 8601
    status?: "modified" | "untracked" | "staged" | "clean";
}

export interface MutationEvent {
    id: string;
    timestamp: string; // ISO 8601
    type: "write" | "delete" | "rename" | "refactor" | "merge";
    actor: "human" | "agent" | "system";
    filePaths: string[];
    description: string;
    simulationId?: string; // ID of the preceding simulation, if any
}

export interface DependencyEdge {
    from: string; // module path
    to: string;   // module path
    type: "import" | "dynamic-import" | "require" | "type";
}

export interface WorldState {
    id: string;
    capturedAt: string; // ISO 8601
    repository: {
        name: string;
        rootPath: string;
        primaryLanguage: string;
    };
    branch: BranchContext;
    fileTreeDigest: string;  // sha256 of serialized file tree
    totalFiles: number;
    totalLines: number;
    recentMutations: MutationEvent[];
    dependencyGraph: DependencyEdge[];
    openProblems: number; // lint/type errors
    testCoverage?: number; // 0–100
    phase: number; // current build phase
}

// ─── Phase 1: Live Repo-State Types ─────────────────────────────
// These types are produced by the world-state-capturer service and
// the dependency-analyzer service. They represent the live, observed
// state of the local workspace as a typed software world.

export interface FileRecord {
    kind: "file";
    path: string;          // relative to workspace root
    extension: string;     // e.g. ".ts", ".tsx", ".md"
    sizeBytes: number;
    lastModified: string;  // ISO 8601
    sha256?: string;       // content digest (files ≤ 1MB)
}

export interface DirectoryRecord {
    kind: "directory";
    path: string;          // relative to workspace root
    fileCount: number;     // direct file children
    dirCount: number;      // direct directory children
}

export type RepoNode = FileRecord | DirectoryRecord;

export interface ExtensionSummary {
    extension: string;
    fileCount: number;
    totalBytes: number;
}

export interface DependencyEdgeLive {
    from: string;  // relative path of importing file
    to: string;    // relative import specifier as written
}

export interface ConnectedFile {
    path: string;
    inbound: number;   // number of files that import this
    outbound: number;  // number of files this imports
    total: number;
}

export interface DependencyReport {
    edges: DependencyEdgeLive[];
    mostConnected: ConnectedFile[];  // top 5
    orphanCandidates: string[];      // TS/TSX files with no in or out edges
    analyzedFileCount: number;
}

export interface RepoSnapshot {
    capturedAt: string;              // ISO 8601
    workspaceRoot: string;           // absolute path (for context only)
    totalFiles: number;
    totalDirectories: number;
    totalBytes: number;
    extensions: ExtensionSummary[];  // sorted by fileCount desc
    recentlyModified: FileRecord[];  // top 10 most recently modified
    nodes: RepoNode[];               // full flat list
}

export interface WorldStateSummary {
    // Derived display-ready summary for WorldStatePanel
    capturedAt: string;
    totalFiles: number;
    totalDirectories: number;
    topExtensions: ExtensionSummary[];
    tsxFileCount: number;
    recentlyModified: FileRecord[];
    dependencies: DependencyReport;
    observabilityNote: string;
}
