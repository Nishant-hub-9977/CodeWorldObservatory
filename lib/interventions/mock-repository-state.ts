// ─── Mock Repository State (local · typed · advisory-only) ─────────
// A static, typed snapshot of a repository-like "world", used by the
// Repository Intervention Simulator to demonstrate simulation-first
// reasoning.
//
// BOUNDARY: This is mock data. It is NOT read from a real repository,
// no Git API is contacted, no shell command is run, and nothing here
// mutates any system. All values are illustrative.

export type BuildStatus = "passing" | "failing" | "unknown";
export type CouplingLevel = "loose" | "moderate" | "tight";
export type RepoRiskLevel = "low" | "moderate" | "elevated" | "high";

export interface DependencyZoneSummary {
    zone: string;
    modules: number;
    coupling: CouplingLevel;
    note: string;
}

export interface ChangeHistoryEntry {
    ref: string;
    summary: string;
    surface: string;
}

export interface RiskZone {
    zone: string;
    level: RepoRiskLevel;
    note: string;
}

export interface RepositoryState {
    repositoryName: string;
    branch: string;
    buildStatus: BuildStatus;
    /** Representative count of verification surfaces in the mock world. */
    testSurfaceCount: number;
    fragileZones: string[];
    dependencyGraph: DependencyZoneSummary[];
    recentChangeHistory: ChangeHistoryEntry[];
    riskZones: RiskZone[];
    openAssumptions: string[];
    capturedAt: string;
}

// A snapshot themed on this codebase's own structure so the simulation
// reads as evidence-first — without claiming to be a live capture.
export const MOCK_REPOSITORY_STATE: RepositoryState = {
    repositoryName: "codeworld-observatory",
    branch: "main",
    buildStatus: "passing",
    testSurfaceCount: 48,
    fragileZones: [
        "research-export manifest schema (legacy artifacts can drift)",
        "observatory panels reading persisted JSON",
        "shared UI primitives consumed across many surfaces",
        "client/server component boundary in the App Router",
    ],
    dependencyGraph: [
        {
            zone: "ui-primitives",
            modules: 6,
            coupling: "tight",
            note: "ObsCommon + SectionHeader consumed by nearly every panel.",
        },
        {
            zone: "research-export",
            modules: 9,
            coupling: "moderate",
            note: "Manifest builder, types, and API route move together.",
        },
        {
            zone: "observatory-panels",
            modules: 21,
            coupling: "moderate",
            note: "Render persisted research artifacts; sensitive to schema drift.",
        },
        {
            zone: "routing · ui-shell",
            modules: 4,
            coupling: "loose",
            note: "Routes and navigation; additive changes are low-risk.",
        },
        {
            zone: "ci · docs",
            modules: 5,
            coupling: "loose",
            note: "Verification workflow and governance documentation.",
        },
    ],
    recentChangeHistory: [
        {
            ref: "f45dfc4",
            summary: "Add release governance, CI, verification docs, and favicon.",
            surface: "ci · docs · app/icon.svg",
        },
        {
            ref: "4f4210d",
            summary: "Harden evidence status rendering against undefined replay summary.",
            surface: "observatory-panels · research-export",
        },
        {
            ref: "977d536",
            summary: "Publish live deployment link.",
            surface: "docs",
        },
        {
            ref: "517df6e",
            summary: "Introduce the Quantum Research Annex.",
            surface: "routing · research-annex",
        },
    ],
    riskZones: [
        {
            zone: "research-export",
            level: "elevated",
            note: "Persisted manifests predate the current schema; renderers must defend.",
        },
        {
            zone: "ui-primitives",
            level: "moderate",
            note: "A change here has a wide blast radius across panels.",
        },
        {
            zone: "routing · ui-shell",
            level: "low",
            note: "New routes are additive and easily reverted.",
        },
    ],
    openAssumptions: [
        "Verification is type-check, lint, and build — there is no live unit-test runner in the web app.",
        "Persisted JSON artifacts may lag the current TypeScript types.",
        "Vercel deploys are immutable; file ordering by mtime is unreliable there.",
        "Human review is the authority layer above every proposed intervention.",
    ],
    capturedAt: "2026-06-30T00:00:00Z",
};
