import { StateTransitionRecord, CalibrationAlignmentSummary } from "../types/se-jepa";
import { ObservationEncoder } from "./observation-encoder";
import { ActionEncoder } from "./action-representation";
import { FutureStateMapper } from "./future-prototype-mapper";

import { planIntervention } from "./intervention-planner";
import { FuturesGenerator } from "./futures-generator";
import { analyzeScope } from "./scope-analyzer";
import { ExecutionStore } from "./execution-store";
import { InterventionTarget } from "../types/intervention";

export class StateTransitionChainer {
    /**
     * Stitches together the SE-JEPA observational chain for a given branch context.
     * This establishes the explicit Observation -> Action -> Prediction -> Reality link.
     */
    public static async generateChain(objective: string = "Implement Phase 6 SE-JEPA prototype"): Promise<StateTransitionRecord | null> {
        try {
            // 1. Observation State (Baseline)
            const worldState = {
                id: "ws-mock-baseline",
                capturedAt: new Date().toISOString(),
                repository: { name: "CodeWorld Observatory", rootPath: "/mock/path", primaryLanguage: "typescript" },
                branch: { name: "main", sha: "abc1234", lastCommit: new Date().toISOString(), status: "active" as const, aheadBy: 0, behindBy: 0 },
                fileTreeDigest: "mock-digest",
                totalFiles: 150,
                totalLines: 15000,
                recentMutations: [],
                dependencyGraph: [
                    { from: "app/api/route.ts", to: "lib/services/test.ts", type: "import" as const }
                ],
                openProblems: 0,
                phase: 6
            };
            const observation = ObservationEncoder.encode(worldState);

            // 2. Action Representation
            const target: InterventionTarget = {
                objective,
                type: "refactor"
            };

            // Generate a fresh plan to use as the context
            const scopeImpact = analyzeScope(["app/api"], null); // Mock target files
            const plan = planIntervention(target, null, worldState.totalFiles);

            // Choose the preferred branch
            const activeBranch = plan.branches.find((b: any) => b.id === plan.preferredBranchId) || plan.branches[0];
            const action = ActionEncoder.encode(activeBranch);

            // 3. Predicted Future State
            // Generate futures for the plan
            const futuresRes = FuturesGenerator.generateProjections(plan);
            const projection = futuresRes.futures.find((f: any) => f.branchId === activeBranch.id);

            if (!projection) {
                return null; // Missing link in chain
            }

            const predictedFuture = FutureStateMapper.map(projection, action.id, observation.id);

            // 4. Calibration (If executed)
            let calibration: CalibrationAlignmentSummary | undefined;
            const executionStore = ExecutionStore.getExecutions();
            const matchingExecution = executionStore.executions.find(e => e.interventionObjective.includes("SE-JEPA") || e.branchId === activeBranch.id);
            const matchingComparison = executionStore.comparisons.find(c => matchingExecution && c.executionRecordId === matchingExecution.id);

            if (matchingComparison) {
                let fidelityScore = 0.4; // Default baseline (matches CalibrationTracker insufficient-evidence weight)
                if (matchingComparison.calibrationResult === "aligned") fidelityScore = 1.0;
                if (matchingComparison.calibrationResult === "partially-aligned") fidelityScore = 0.65;
                if (matchingComparison.calibrationResult === "divergent") fidelityScore = 0.2;

                calibration = {
                    calibrationResult: matchingComparison.calibrationResult,
                    fidelityScore,
                    divergenceReason: matchingComparison.calibrationNote
                };
            }

            return {
                id: `chain-${Date.now().toString(36)}`,
                observation,
                action,
                predictedFuture,
                actualOutcomeId: matchingExecution?.id,
                calibration,
                chainedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error("Failed to generate transition chain:", error);
            return null;
        }
    }
}
