// Observatory constants — named identifiers for
// all stable values used across the system.
// Do not use raw strings in application code.

export const OBSERVATORY_VERSION = "0.24.0-rc1";
export const OBSERVATORY_CODENAME = "Primus";

// ─── Panel identifiers ──────────────────────────────────────────
export const PANEL_IDS = {
    WORLD_STATE: "world-state",
    INTERVENTIONS: "interventions",
    FUTURES: "futures",
    UNCERTAINTY: "uncertainty",
    PREDICTION_REALITY: "prediction-reality",
    ARTIFACT_LEDGER: "artifact-ledger",
    EXPERIMENT_REGISTRY: "experiment-registry",
    SCENARIO_LIBRARY: "scenario-library",
    RESEARCH_STATISTICS: "research-statistics",
} as const;

// ─── Phase names ────────────────────────────────────────────────
export const BUILD_PHASES = {
    0: "Foundation Scaffold",
    1: "State Capture Engine",
    2: "Intervention Planner",
    3: "Simulation Engine",
    4: "Evaluation Framework",
    5: "MCP Simulation Bridge",
    6: "SE-JEPA Prototype Layer",
    7: "Benchmark Harness",
    8: "Experiment Memory",
    9: "Latent State Approximation",
    10: "Research Export / Briefing Surface",
    11: "Comparative Research Timeline + Narrative Playback",
    12: "Experiment Registry + Historical State Capture",
    13: "Scenario Library + Dataset Infrastructure",
    14: "Reproducibility + Statistical Evaluation",
    15: "Experiment-to-Simulation / Benchmark Lineage Binding",
    16: "Replay-Aware Research Consumers + Experiment Detail Surface",
    17: "Research Evaluation Semantics + Evidence-Weighted Comparative Analysis",
    18: "Evaluation Persistence + Comparative Research Surfaces",
    19: "Research Prioritization Engine",
    20: "Priority Drift + Recommendation Governance",
    21: "Historical Priority Ledger + Comparative Governance History",
    22: "Priority Snapshot Automation + Historical Comparison Surfaces",
    23: "Comparative Governance Synthesis Layer",
    24: "Closure Hardening + Release-Candidate Conditioning",
} as const;

// ─── Intervention risk levels ───────────────────────────────────
export const RISK_LEVELS = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
} as const;

// ─── Intervention statuses ───────────────────────────────────────
export const INTERVENTION_STATUS = {
    PROPOSED: "proposed",
    SIMULATED: "simulated",
    APPROVED: "approved",
    EXECUTING: "executing",
    COMPLETE: "complete",
    REJECTED: "rejected",
} as const;

// ─── Artifact types ──────────────────────────────────────────────
export const ARTIFACT_TYPES = {
    PLAN: "plan",
    SIMULATION: "simulation",
    PREDICTION: "prediction",
    WORLD_SNAPSHOT: "world-snapshot",
    VERIFICATION: "verification",
    WALKTHROUGH: "walkthrough",
} as const;

// ─── Trust levels ────────────────────────────────────────────────
export const TRUST_LEVELS = {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
    UNVERIFIED: "unverified",
} as const;

// ─── UI system ───────────────────────────────────────────────────
export const NAV_ITEMS = [
    { label: "Observatory", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Evals", href: "/evals" },
    { label: "Artifacts", href: "/artifacts" },
] as const;

export const PRINCIPLES = [
    {
        id: "sim-before-write",
        title: "Simulation Before Write",
        description:
            "No agentic write operation executes without a prior simulation pass. Imagining consequences is not optional — it is the prerequisite to acting.",
        icon: "◈",
    },
    {
        id: "branch-before-intervention",
        title: "Branch Before Intervention",
        description:
            "Every proposed change is evaluated as a counterfactual branch in the world model. The main timeline is never the first casualty of exploration.",
        icon: "⟂",
    },
    {
        id: "visible-uncertainty",
        title: "Visible Uncertainty",
        description:
            "Uncertainty is first-class data. Where the model cannot predict with confidence, the system makes that ambiguity explicit and visible to the operator.",
        icon: "≈",
    },
    {
        id: "auditable-artifacts",
        title: "Auditable Artifacts",
        description:
            "Every plan, simulation, and outcome is recorded as an immutable, hashed artifact. The system can always trace the chain from intention to consequence.",
        icon: "⬡",
    },
] as const;
