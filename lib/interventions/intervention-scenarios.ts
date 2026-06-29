// ─── Intervention Scenarios (deterministic · mock · advisory-only) ──
// A fixed set of predefined intervention proposals. For each, the
// simulator carries a DETERMINISTIC mock prediction and a DETERMINISTIC
// mock observed outcome.
//
// BOUNDARY: These are not AI model calls and not a trained world model.
// They are static, hand-authored illustrations of a simulation-first
// workflow. Nothing here writes to a repository, runs a shell command,
// or triggers a deployment.

export type RollbackPosture = "trivial" | "straightforward" | "involved" | "difficult";
export type BuildImpact = "none" | "rebuild-required" | "may-break";
export type LintImpact = "none" | "new-warnings-possible" | "may-error";
export type RuntimeRisk = "negligible" | "low" | "moderate" | "elevated";

export type ActualBuildResult = "pass" | "fail";
export type ActualLintResult = "pass" | "pass-with-warnings" | "fail";
export type ActualRuntimeResult = "clean" | "degraded" | "crash";

export type HumanDecisionState =
    | "pending-review"
    | "reviewed-approved-not-executed"
    | "reviewed-held-for-revision";

export interface InterventionPrediction {
    predictedFilesTouched: number;
    predictedFilePaths: string[];
    predictedDependencyZones: string[];
    testsLikelyToFail: number;
    expectedBuildImpact: BuildImpact;
    expectedLintImpact: LintImpact;
    expectedRuntimeRisk: RuntimeRisk;
    /** 0–1 deterministic confidence. */
    confidence: number;
    uncertainty: string;
    recommendedVerification: string[];
    humanApprovalRequired: boolean;
}

export interface ObservedOutcome {
    actualFilesTouched: number;
    actualFilePaths: string[];
    actualFailingTests: number;
    actualBuildResult: ActualBuildResult;
    actualLintResult: ActualLintResult;
    actualRuntimeResult: ActualRuntimeResult;
    consoleStatus: string;
    deploymentStatus: string;
    notes: string;
}

export interface InterventionScenario {
    id: string;
    title: string;
    intent: string;
    interventionType: string;
    affectedFiles: string[];
    affectedDependencyZones: string[];
    expectedBenefit: string;
    possibleFailureModes: string[];
    rollbackPosture: RollbackPosture;
    humanApprovalRequired: boolean;
    humanDecisionState: HumanDecisionState;
    /** Mock provenance reference — not a cryptographic hash. */
    evidenceRef: string;
    prediction: InterventionPrediction;
    observed: ObservedOutcome;
}

export const INTERVENTION_SCENARIOS: InterventionScenario[] = [
    {
        id: "typed-evidence-export",
        title: "Add a typed evidence ledger export",
        intent:
            "Introduce a typed JSON export manifest (builder + API route + types) so research evidence can be reproduced and reviewed externally.",
        interventionType: "additive · schema",
        affectedFiles: [
            "lib/services/export-manifest-builder.ts",
            "app/api/research/export/route.ts",
            "lib/types/research-export.ts",
        ],
        affectedDependencyZones: ["research-export", "api-routes", "type-system"],
        expectedBenefit:
            "Reproducible, typed evidence artifacts that external reviewers can inspect without running the app.",
        possibleFailureModes: [
            "Schema drift between persisted manifests and current types.",
            "Serialization gaps for optional fields.",
        ],
        rollbackPosture: "straightforward",
        humanApprovalRequired: true,
        humanDecisionState: "reviewed-approved-not-executed",
        evidenceRef: "sim-ev-typed-evidence-export",
        prediction: {
            predictedFilesTouched: 3,
            predictedFilePaths: [
                "lib/services/export-manifest-builder.ts",
                "app/api/research/export/route.ts",
                "lib/types/research-export.ts",
            ],
            predictedDependencyZones: ["research-export", "api-routes"],
            testsLikelyToFail: 0,
            expectedBuildImpact: "rebuild-required",
            expectedLintImpact: "none",
            expectedRuntimeRisk: "negligible",
            confidence: 0.82,
            uncertainty:
                "Low–medium — additive surface with a well-understood type boundary.",
            recommendedVerification: ["npm run type-check", "npm run build"],
            humanApprovalRequired: true,
        },
        observed: {
            actualFilesTouched: 3,
            actualFilePaths: [
                "lib/services/export-manifest-builder.ts",
                "app/api/research/export/route.ts",
                "lib/types/research-export.ts",
            ],
            actualFailingTests: 0,
            actualBuildResult: "pass",
            actualLintResult: "pass",
            actualRuntimeResult: "clean",
            consoleStatus: "no console errors",
            deploymentStatus: "not deployed (simulation only)",
            notes: "Prediction matched observation. Additive change, no surprises.",
        },
    },
    {
        id: "defensive-schema-guards",
        title: "Refactor a panel to use defensive schema guards",
        intent:
            "Harden the manifest and brief panels with optional chaining and neutral fallbacks so legacy artifacts cannot crash the render path.",
        interventionType: "refactor · hardening",
        affectedFiles: [
            "components/observatory/ExportManifestPanel.tsx",
            "components/observatory/ResearchBriefPanel.tsx",
            "lib/services/export-manifest-builder.ts",
        ],
        affectedDependencyZones: ["observatory-panels", "research-export"],
        expectedBenefit:
            "Eliminates an undefined-property runtime crash when a persisted artifact predates the current schema.",
        possibleFailureModes: [
            "An access path is missed and remains unguarded.",
            "A fallback masks a genuine data problem instead of surfacing it.",
        ],
        rollbackPosture: "straightforward",
        humanApprovalRequired: true,
        humanDecisionState: "reviewed-approved-not-executed",
        evidenceRef: "sim-ev-defensive-schema-guards",
        prediction: {
            predictedFilesTouched: 3,
            predictedFilePaths: [
                "components/observatory/ExportManifestPanel.tsx",
                "components/observatory/ResearchBriefPanel.tsx",
                "lib/services/export-manifest-builder.ts",
            ],
            predictedDependencyZones: ["observatory-panels", "research-export"],
            testsLikelyToFail: 0,
            expectedBuildImpact: "rebuild-required",
            expectedLintImpact: "none",
            expectedRuntimeRisk: "low",
            confidence: 0.74,
            uncertainty:
                "Medium — depends on whether guard coverage reaches every unguarded access path.",
            recommendedVerification: [
                "npm run type-check",
                "npm run build",
                "npm run start (exercise / and the affected panels)",
            ],
            humanApprovalRequired: true,
        },
        observed: {
            actualFilesTouched: 4,
            actualFilePaths: [
                "components/observatory/ExportManifestPanel.tsx",
                "components/observatory/ResearchBriefPanel.tsx",
                "lib/services/export-manifest-builder.ts",
                "components/quantum/ResourceConsequenceEvidenceCard.tsx",
            ],
            actualFailingTests: 0,
            actualBuildResult: "pass",
            actualLintResult: "pass",
            actualRuntimeResult: "clean",
            consoleStatus: "no console errors after fix",
            deploymentStatus: "not deployed (simulation only)",
            notes:
                "Mismatch surface: one extra file was hardened (the evidence card) once the same access pattern was found there. Conservative defense, no regressions.",
        },
    },
    {
        id: "new-static-route",
        title: "Introduce a new route with static typed data",
        intent:
            "Add an advisory route backed entirely by local typed mock data, demonstrating the prediction-versus-reality workflow with no runtime risk.",
        interventionType: "additive · routing",
        affectedFiles: [
            "app/intervention-simulator/page.tsx",
            "lib/interventions/*.ts",
            "components/interventions/*.tsx",
            "components/shell/PageShell.tsx",
        ],
        affectedDependencyZones: ["routing", "ui-shell", "type-system"],
        expectedBenefit:
            "Demonstrates the simulate-before-write discipline as a concrete workflow rather than a thesis page.",
        possibleFailureModes: [
            "Navigation regression in the shared shell.",
            "Client/server component boundary error in the App Router.",
            "Type errors across the new data modules.",
        ],
        rollbackPosture: "trivial",
        humanApprovalRequired: true,
        humanDecisionState: "pending-review",
        evidenceRef: "sim-ev-new-static-route",
        prediction: {
            predictedFilesTouched: 8,
            predictedFilePaths: [
                "app/intervention-simulator/page.tsx",
                "lib/interventions/mock-repository-state.ts",
                "lib/interventions/intervention-scenarios.ts",
                "lib/interventions/prediction-reality-ledger.ts",
                "components/interventions/* (4 files)",
                "components/shell/PageShell.tsx",
            ],
            predictedDependencyZones: ["routing", "ui-shell", "type-system"],
            testsLikelyToFail: 0,
            expectedBuildImpact: "rebuild-required",
            expectedLintImpact: "new-warnings-possible",
            expectedRuntimeRisk: "low",
            confidence: 0.7,
            uncertainty:
                "Medium — new client/server boundary and several new modules increase surface area.",
            recommendedVerification: [
                "npm run type-check",
                "npm run lint",
                "npm run build",
                "npm run start (verify /intervention-simulator)",
            ],
            humanApprovalRequired: true,
        },
        observed: {
            actualFilesTouched: 9,
            actualFilePaths: [
                "app/intervention-simulator/page.tsx",
                "lib/interventions/mock-repository-state.ts",
                "lib/interventions/intervention-scenarios.ts",
                "lib/interventions/prediction-reality-ledger.ts",
                "components/interventions/RepositoryStateCard.tsx",
                "components/interventions/InterventionScenarioCard.tsx",
                "components/interventions/PredictionRealityLedger.tsx",
                "components/interventions/HumanAuthorityPanel.tsx",
                "components/shell/PageShell.tsx",
            ],
            actualFailingTests: 0,
            actualBuildResult: "pass",
            actualLintResult: "pass",
            actualRuntimeResult: "clean",
            consoleStatus: "no console errors",
            deploymentStatus: "not deployed (simulation only)",
            notes:
                "Mismatch surface: one more file than predicted (an extra component split). Lint stayed clean — better than the predicted 'new warnings possible'.",
        },
    },
    {
        id: "shared-ui-change",
        title: "Modify a shared UI component",
        intent:
            "Adjust a shared primitive (a status badge) used across nearly every panel, to unify status rendering.",
        interventionType: "refactor · shared-primitive",
        affectedFiles: ["components/ui/ObsCommon.tsx"],
        affectedDependencyZones: ["ui-primitives", "observatory-panels", "quantum-card"],
        expectedBenefit: "Consistent, single-source status rendering across all surfaces.",
        possibleFailureModes: [
            "Visual regression propagates to many panels at once.",
            "A prop-shape change breaks distant call sites.",
            "Wide blast radius makes review harder.",
        ],
        rollbackPosture: "involved",
        humanApprovalRequired: true,
        humanDecisionState: "reviewed-held-for-revision",
        evidenceRef: "sim-ev-shared-ui-change",
        prediction: {
            predictedFilesTouched: 1,
            predictedFilePaths: ["components/ui/ObsCommon.tsx"],
            predictedDependencyZones: ["ui-primitives", "observatory-panels", "quantum-card"],
            testsLikelyToFail: 2,
            expectedBuildImpact: "rebuild-required",
            expectedLintImpact: "none",
            expectedRuntimeRisk: "moderate",
            confidence: 0.58,
            uncertainty:
                "High — one file changed, but a shared primitive's blast radius spans the whole UI.",
            recommendedVerification: [
                "npm run type-check",
                "npm run build",
                "npm run start (spot-check several panels and /quantum-annex)",
            ],
            humanApprovalRequired: true,
        },
        observed: {
            actualFilesTouched: 1,
            actualFilePaths: ["components/ui/ObsCommon.tsx"],
            actualFailingTests: 1,
            actualBuildResult: "pass",
            actualLintResult: "pass",
            actualRuntimeResult: "clean",
            consoleStatus: "no console errors",
            deploymentStatus: "not deployed (simulation only)",
            notes:
                "Mismatch surface: predicted 2 affected surfaces, observed 1 — a conservative overestimate. A minor spacing regression was caught in human review and held for revision.",
        },
    },
    {
        id: "ci-verification",
        title: "Add CI verification to the release workflow",
        intent:
            "Add a verification-only GitHub Actions workflow that runs type-check, lint, build, and the local evidence script on every pull request and push to main.",
        interventionType: "additive · ci",
        affectedFiles: [
            ".github/workflows/ci.yml",
            "README.md",
            "docs/release-governance.md",
            "docs/production-verification.md",
        ],
        affectedDependencyZones: ["ci-pipeline", "docs"],
        expectedBenefit:
            "Automated, secret-free verification on every change — without granting deploy rights to CI.",
        possibleFailureModes: [
            "CI environment mismatch (Node or Python version).",
            "Lockfile resolution differs from local.",
            "A flaky dependency install.",
        ],
        rollbackPosture: "trivial",
        humanApprovalRequired: true,
        humanDecisionState: "reviewed-approved-not-executed",
        evidenceRef: "sim-ev-ci-verification",
        prediction: {
            predictedFilesTouched: 5,
            predictedFilePaths: [
                ".github/workflows/ci.yml",
                "app/icon.svg",
                "README.md",
                "docs/release-governance.md",
                "docs/production-verification.md",
            ],
            predictedDependencyZones: ["ci-pipeline", "docs"],
            testsLikelyToFail: 0,
            expectedBuildImpact: "rebuild-required",
            expectedLintImpact: "none",
            expectedRuntimeRisk: "negligible",
            confidence: 0.8,
            uncertainty:
                "Low — verification-only and additive, with no production deploy path from CI.",
            recommendedVerification: [
                "npm run type-check",
                "npm run lint",
                "npm run build",
                "python quantum-lab/experiments/resource_consequence_placeholder.py",
            ],
            humanApprovalRequired: true,
        },
        observed: {
            actualFilesTouched: 5,
            actualFilePaths: [
                ".github/workflows/ci.yml",
                "app/icon.svg",
                "README.md",
                "docs/release-governance.md",
                "docs/production-verification.md",
            ],
            actualFailingTests: 0,
            actualBuildResult: "pass",
            actualLintResult: "pass-with-warnings",
            actualRuntimeResult: "clean",
            consoleStatus: "no console errors",
            deploymentStatus: "CI does not deploy (verification only); Vercel deploys on push to main",
            notes:
                "Prediction matched. Lint passed with the 4 known pre-existing warnings — exit code 0.",
        },
    },
];

export function getScenarioById(id: string): InterventionScenario | undefined {
    return INTERVENTION_SCENARIOS.find((scenario) => scenario.id === id);
}

export function formatConfidence(confidence: number): string {
    const clamped = Math.max(0, Math.min(1, confidence));
    return `${Math.round(clamped * 100)}%`;
}
