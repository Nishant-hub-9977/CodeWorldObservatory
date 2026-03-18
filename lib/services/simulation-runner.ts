import type {
    SimulationRequest,
    SimulationSession,
    SimulationResult,
    SimulationOutcomeClass,
    SimulationBranchInput
} from "../types/simulation";

/**
 * A controlled simulation runner that bounds evaluation deterministically.
 * No actual file writes or ML model inferences occur here; this maps
 * Phase 2/3 signals into standardized SimulationResult records.
 */
export class SimulationRunner {
    public static runSession(request: SimulationRequest): SimulationSession {
        const simulatedAt = new Date().toISOString();

        const branchResults = request.branchInputs.map((input) =>
            this.evaluateBranch(input)
        );

        return {
            id: `session-${Date.now().toString(36)}`,
            requestId: request.requestId,
            experimentId: request.experimentId ?? null,
            objective: request.objective,
            baselineWorldStateId: request.baselineWorldStateId,
            simulatedAt,
            branchResults,
            status: "completed"
        };
    }

    private static evaluateBranch(input: SimulationBranchInput): SimulationResult {
        const { branch, projection } = input;

        let outcomeClass: SimulationOutcomeClass = "structurally-favorable";
        let evidenceSufficiency: "strong" | "adequate" | "insufficient" = "adequate";
        const governanceBlockers: string[] = [];
        let simulationScore = 0.8; // High baseline

        // 1. Evaluate Risk & Verification Burden
        if (branch.riskLevel === "high" || branch.riskLevel === "critical") {
            simulationScore -= 0.3;
            outcomeClass = "review-heavy";
            evidenceSufficiency = "insufficient";
            governanceBlockers.push("Requires explicit manual review. Risk unacceptably high.");
        }

        if (projection.impact.validationBurden === "heavy") {
            simulationScore -= 0.2;
            outcomeClass = "review-heavy";
        }

        // 2. Evaluate Uncertainty Signals
        const hasExtremeUncertainty = projection.uncertainty.some((u) => u.level === "extreme");
        if (hasExtremeUncertainty) {
            outcomeClass = "blocked-by-evidence";
            simulationScore -= 0.4;
            evidenceSufficiency = "insufficient";
            governanceBlockers.push("Extreme uncertainty path exists. Structural proxy limits exceeded.");
        }

        // 3. Formulate Rationale Notes
        const notesLines: string[] = [
            `Score: ${simulationScore.toFixed(2)}`,
            `Validation: ${projection.impact.validationBurden.toUpperCase()}`,
            `Risk: ${branch.riskLevel.toUpperCase()}`,
        ];

        return {
            branchId: branch.id,
            strategyClass: branch.strategy, // Preserve first-class strategy identity
            outcomeClass,
            evidenceSufficiency,
            governanceBlockers,
            structuralNotes: notesLines.join(" | "),
            simulationScore: Math.max(0.1, simulationScore) // Floor at 0.1
        };
    }
}
