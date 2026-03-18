// ─── Mock Observatory Data ───────────────────────────────────────
// Realistic mock data for all six observatory panels.
// All data is properly typed against lib/types/*.
// This data is used in the Phase 0 UI shell only —
// it will be replaced by live data in Phase 1.

import type { WorldState } from "@/lib/types/world-state";
import type { Intervention } from "@/lib/types/intervention";
import type { FutureState } from "@/lib/types/future-state";
import type { Artifact } from "@/lib/types/artifact";

// ─── World State ─────────────────────────────────────────────────
export const mockWorldState: WorldState = {
    id: "ws-7f3a9c12",
    capturedAt: "2026-03-11T11:10:00Z",
    repository: {
        name: "codeworld-observatory",
        rootPath: "/workspace/codeworld-observatory",
        primaryLanguage: "TypeScript",
    },
    branch: {
        name: "main",
        sha: "4a8b3e91d7f2c508a1b4f7e32d9c6800",
        lastCommit: "Initial scaffold: Phase 0 Foundation",
        status: "active",
        aheadBy: 0,
        behindBy: 0,
    },
    fileTreeDigest: "sha256:b3e91d7f2c508a1b4f7e32d9c6800a4a",
    totalFiles: 47,
    totalLines: 3812,
    recentMutations: [
        {
            id: "mut-001",
            timestamp: "2026-03-11T11:08:12Z",
            type: "write",
            actor: "agent",
            filePaths: ["lib/types/world-state.ts", "lib/types/intervention.ts"],
            description: "Defined core world-state and intervention type contracts",
            simulationId: "sim-alpha-001",
        },
        {
            id: "mut-002",
            timestamp: "2026-03-11T11:09:45Z",
            type: "write",
            actor: "agent",
            filePaths: ["app/globals.css", "tailwind.config.ts"],
            description: "Established observatory design system tokens",
            simulationId: "sim-alpha-002",
        },
    ],
    dependencyGraph: [
        { from: "app/page.tsx", to: "components/observatory/WorldStatePanel", type: "import" },
        { from: "app/page.tsx", to: "components/observatory/InterventionsPanel", type: "import" },
        { from: "lib/data/mock-observatory-data", to: "lib/types/world-state", type: "import" },
    ],
    openProblems: 0,
    testCoverage: 0,
    phase: 0,
};

// ─── Candidate Interventions ──────────────────────────────────────
export const mockInterventions: Intervention[] = [
    {
        id: "int-001",
        type: "write",
        title: "Implement WorldState capture service",
        description:
            "Create the repo-state-capturer service that walks the file tree, hashes content, and produces a WorldState snapshot.",
        intent:
            "Enable the system to establish ground truth before any planning or intervention begins.",
        proposedAt: "2026-03-11T11:10:00Z",
        proposedBy: "agent",
        status: "simulated",
        riskLevel: "low",
        scope: {
            filePaths: ["lib/services/world-state-capturer.ts", "lib/services/file-walker.ts"],
            estimatedRadius: ["app/api/snapshot/route.ts"],
            crossesModuleBoundary: false,
            affectsPublicApi: true,
            affectsDataLayer: false,
        },
        baselineWorldStateId: "ws-7f3a9c12",
        simulationResult: {
            id: "sim-int-001",
            interventionId: "int-001",
            simulatedAt: "2026-03-11T11:10:30Z",
            predictedOutcome:
                "Two new service files created. API route added. No existing code modified.",
            predictedSideEffects: [],
            confidenceScore: 0.94,
            uncertainRegions: [],
            predictedTestDelta: { passing: 4, failing: 0, new: 4 },
        },
        artifactIds: ["art-003"],
        links: [],
        tags: ["phase-1", "state-capture"],
    },
    {
        id: "int-002",
        type: "refactor",
        title: "Extract ObservatoryPanel into headless primitive",
        description:
            "Refactor the ObservatoryPanel component to be a headless, composable primitive with zero layout opinion.",
        intent: "Reduce coupling between panel wrappers and layout decisions.",
        proposedAt: "2026-03-11T11:11:00Z",
        proposedBy: "agent",
        status: "proposed",
        riskLevel: "low",
        scope: {
            filePaths: ["components/observatory/ObservatoryPanel.tsx"],
            estimatedRadius: [
                "components/observatory/WorldStatePanel.tsx",
                "components/observatory/InterventionsPanel.tsx",
            ],
            crossesModuleBoundary: false,
            affectsPublicApi: false,
            affectsDataLayer: false,
        },
        baselineWorldStateId: "ws-7f3a9c12",
        artifactIds: [],
        links: [],
        tags: ["phase-0", "components"],
    },
    {
        id: "int-003",
        type: "schema",
        title: "Define Artifact storage schema",
        description:
            "Create the database schema and migration for the Artifact Ledger — the persistent, append-only record of all artifacts.",
        intent: "Establish the trust ledger infrastructure before agents begin producing artifacts.",
        proposedAt: "2026-03-11T11:12:00Z",
        proposedBy: "agent",
        status: "proposed",
        riskLevel: "medium",
        scope: {
            filePaths: ["data/schema/artifacts.sql", "lib/db/artifact-store.ts"],
            estimatedRadius: ["app/api/artifacts/route.ts"],
            crossesModuleBoundary: true,
            affectsPublicApi: true,
            affectsDataLayer: true,
        },
        baselineWorldStateId: "ws-7f3a9c12",
        artifactIds: [],
        links: [],
        tags: ["phase-1", "artifacts", "database"],
    },
];

// ─── Counterfactual Futures ───────────────────────────────────────
export const mockFutureState: FutureState = {
    id: "fs-a4c7e902",
    generatedAt: "2026-03-11T11:13:00Z",
    horizon: "Phase 1 completion",
    baselineWorldStateId: "ws-7f3a9c12",
    recommendedBranchId: "branch-A",
    planningAgentId: "antigravity-0.1",
    branches: [
        {
            id: "branch-A",
            label: "State-Capture First",
            description:
                "Implement the repo state capturer and world-state API before any UI changes. Data layer is solid before display layer consumes it.",
            baselineWorldStateId: "ws-7f3a9c12",
            interventionId: "int-001",
            createdAt: "2026-03-11T11:13:10Z",
            selected: true,
            divergenceScore: {
                overall: 0.18,
                category: "safe",
                filesDelta: 6,
                linesDelta: 420,
                breakingChanges: 0,
                testRegressions: 0,
            },
            predictedOutcome: {
                summary:
                    "World-state capture service operational. Snapshot API returns typed WorldState JSON. No UI changes.",
                sideEffects: ["Adds 2 new API routes", "Adds 3 new lib modules"],
                timeToImplement: "~3 hours",
                confidenceScore: 0.91,
                uncertainRegions: [],
                testDelta: { passing: 8, failing: 0, new: 8 },
            },
        },
        {
            id: "branch-B",
            label: "UI-Expansion First",
            description:
                "Expand the observatory UI with real-time live panels first, then wire to state capture service. Risk of display layer assuming data contracts prematurely.",
            baselineWorldStateId: "ws-7f3a9c12",
            interventionId: "int-002",
            createdAt: "2026-03-11T11:13:15Z",
            selected: false,
            divergenceScore: {
                overall: 0.31,
                category: "moderate",
                filesDelta: 9,
                linesDelta: 680,
                breakingChanges: 1,
                testRegressions: 0,
            },
            predictedOutcome: {
                summary:
                    "More components created. Display layer complete but decoupled from real data — significant rework risk when state capturer is implemented.",
                sideEffects: ["Interface contracts not yet enforced", "Mock data lock-in risk"],
                timeToImplement: "~5 hours",
                confidenceScore: 0.72,
                uncertainRegions: ["components/observatory/WorldStatePanel.tsx"],
                testDelta: { passing: 4, failing: 1, new: 5 },
            },
        },
    ],
};

// ─── Artifacts ────────────────────────────────────────────────────
export const mockArtifacts: Artifact[] = [
    {
        id: "art-001",
        type: "plan",
        title: "Phase 0 Implementation Plan",
        description: "Full scaffold plan for CodeWorld Observatory. Covers all directories, docs, components, lib modules, and skills.",
        createdAt: "2026-03-11T11:00:00Z",
        createdBy: "agent",
        agentId: "antigravity-0.1",
        conversationId: "090aa311-41e1-4e92-92b9-c7e2435f18da",
        worldStateId: "ws-7f3a9c12",
        hash: { algorithm: "sha256", value: "d4e8a1b3f9c720e5d1a4b7c38f29e601" },
        trustLevel: "medium",
        path: "C:/Users/admin/.gemini/antigravity/brain/090aa311-41e1-4e92-92b9-c7e2435f18da/implementation_plan.md",
        links: [],
        tags: ["phase-0", "plan", "scaffold"],
    },
    {
        id: "art-002",
        type: "constitution",
        title: "Observatory Constitution",
        description: "Foundational operating principles and immutable constraints for CodeWorld Observatory.",
        createdAt: "2026-03-11T11:05:00Z",
        createdBy: "agent",
        agentId: "antigravity-0.1",
        hash: { algorithm: "sha256", value: "f2b7c3a9e1d0f48c3b7a29d5e084c217" },
        trustLevel: "high",
        verifiedAt: "2026-03-11T11:05:01Z",
        verifiedBy: "antigravity-0.1",
        path: "docs/constitution.md",
        links: [],
        tags: ["constitution", "governance"],
    },
    {
        id: "art-003",
        type: "simulation",
        title: "Simulation: WorldState Capturer Intervention",
        description: "Predicted outcomes for intervention int-001: implement repo-state-capturer service.",
        createdAt: "2026-03-11T11:10:30Z",
        createdBy: "agent",
        agentId: "antigravity-0.1",
        worldStateId: "ws-7f3a9c12",
        interventionId: "int-001",
        hash: { algorithm: "sha256", value: "c8a4e9f1b7d30f5e9c2a4b8d73e1f09a" },
        trustLevel: "medium",
        links: [{ artifactId: "art-001", relationship: "derives-from" }],
        tags: ["simulation", "phase-1", "int-001"],
    },
];

// ─── Prediction vs Reality Records ───────────────────────────────
export interface PredictionRecord {
    id: string;
    interventionId: string;
    interventionTitle: string;
    predicted: {
        outcome: string;
        confidenceScore: number;
        testDelta: { passing: number; failing: number; new: number };
    };
    actual?: {
        outcome: string;
        testDelta: { passing: number; failing: number; new: number };
        executedAt: string;
    };
    status: "pending" | "verified" | "diverged";
    deltaSummary?: string;
}

export const mockPredictions: PredictionRecord[] = [
    {
        id: "pred-001",
        interventionId: "int-001",
        interventionTitle: "Implement WorldState capture service",
        predicted: {
            outcome: "Two new service files. API route added. No existing code modified.",
            confidenceScore: 0.94,
            testDelta: { passing: 4, failing: 0, new: 4 },
        },
        status: "pending",
    },
];
