import { McpToolContract } from "../types/mcp";

export class McpContractsRegistry {
    private static contracts: McpToolContract[] = [
        {
            name: "capture_world_state",
            purpose: "Reads current repository state",
            description: "Scans the target directory and produces a deterministic RepoSnapshot summarizing file states and context edges.",
            requiredInputs: {
                path: "(Optional) Target sub-directory to scope the capture."
            },
            responseShape: "RepoSnapshot (JSON)",
            preconditions: ["Read access to filesystem."],
            failureModes: ["Permission denied", "Directory unreadable", "Timeout on massive directories"],
            enforcementPosture: "read-only"
        },
        {
            name: "plan_intervention",
            purpose: "Generates structural intervention branches from an objective",
            description: "Analyzes the objective against the read WorldState to generate candidate intervention branches (e.g. Service-First, Minimal-Touch).",
            requiredInputs: {
                objective: "String describing the intended code change or feature.",
                baselineWorldStateId: "ID of a prior WorldState capture."
            },
            responseShape: "InterventionPlan (JSON) containing candidate InterventionBranches",
            preconditions: ["Valid WorldState snapshot exists."],
            failureModes: ["Invalid objective", "WorldState ID not found"],
            enforcementPosture: "advisory"
        },
        {
            name: "project_futures",
            purpose: "Structurally estimates the future impact and uncertainty of an intervention",
            description: "Analyzes an intervention plan to project likely touched surfaces, validation burden, and structural uncertainty without executing code.",
            requiredInputs: {
                interventionId: "ID of the specific intervention plan."
            },
            responseShape: "FuturesApiResponse (JSON) containing BranchOutcomeProjections",
            preconditions: ["Valid InterventionPlan exists."],
            failureModes: ["Intervention ID not found"],
            enforcementPosture: "advisory"
        },
        {
            name: "evaluate_simulation_gate",
            purpose: "Determines if an intervention is safe to proceed to execution",
            description: "Evaluates the branch against required simulation artifacts and uncertainty metrics. Does NOT permit autonomous execution; returns a strict governance classification.",
            requiredInputs: {
                branchId: "ID of the branch to evaluate."
            },
            responseShape: "SkillEnforcementResult (JSON)",
            preconditions: ["Branch references valid futures and planning artifacts."],
            failureModes: ["Branch not found", "Missing dependency chain"],
            enforcementPosture: "enforcement-boundary"
        },
        {
            name: "compare_prediction_to_reality",
            purpose: "Closes the calibration loop by comparing recorded execution to prior prediction",
            description: "Accepts an actual execution outcome and analytically compares it against the prior futures projection to write a calibration artifact.",
            requiredInputs: {
                branchId: "ID of the executed branch.",
                actualOutcomeStatus: "success, partial, failure, or rolled-back",
                touchedSurfaces: "Array of modified file paths.",
                observedIssues: "Array of strings describing experienced friction.",
                validationBurden: "low, moderate, or heavy",
                executionReadinessActual: "ready, needs-review, or blocked"
            },
            responseShape: "PredictionRealityComparison (JSON)",
            preconditions: ["Branch prediction must exist in Futures prior to execution."],
            failureModes: ["Branch projection not found", "Missing outcome parameters"],
            enforcementPosture: "enforcement-boundary"
        },
        {
            name: "query_artifact_ledger",
            purpose: "Reads immutable trust instruments from the sequence record",
            description: "Retrieves verifiable Phase sequence operations (plans, simulations, calibrations) from the appended ledger.",
            requiredInputs: {
                typeFilter: "(Optional) Type of artifact to retrieve.",
                trustLevelFilter: "(Optional) Required trust level threshold.",
                limit: "(Optional) Pagination limit."
            },
            responseShape: "ArtifactLedgerResponse (JSON)",
            preconditions: [],
            failureModes: ["Ledger store unavailable"],
            enforcementPosture: "read-only"
        }
    ];

    public static getContracts(): McpToolContract[] {
        return this.contracts;
    }

    public static getContract(name: string): McpToolContract | undefined {
        return this.contracts.find(c => c.name === name);
    }
}
