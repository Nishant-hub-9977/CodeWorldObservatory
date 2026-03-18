// ─── Latent Transition Chain ──────────────────────────────────────────
// Phase 9: Extends the SE-JEPA-style state transition chain with
// explicit latent structural descriptors.
//
// Produces the coherent chain:
//   Observation State
//   → Latent Structural Descriptor
//   → Strategy Representation
//   → Predicted Future State
//   → Actual Outcome
//   → Calibration Delta
//   → State Transition Memory
//
// This replaces the Phase 6 StateTransitionChainer with a richer
// chain that includes latent-state reasoning.

import type { LatentStateTransitionSummary } from "../types/latent-state";
import type { BranchStrategy } from "../types/intervention";
import { LatentStateEncoder } from "./latent-state-encoder";
import { StrategyCompatibilityAnalyzer } from "./strategy-compatibility-analyzer";
import { TransitionPatternAnalyzer } from "./transition-pattern-analyzer";
import { captureRepoSnapshot } from "./world-state-capturer";
import { analyzeDependencies } from "./dependency-analyzer";
import { ObservationEncoder } from "./observation-encoder";
import { ActionEncoder } from "./action-representation";
import { FutureStateMapper } from "./future-prototype-mapper";
import { planIntervention } from "./intervention-planner";
import { FuturesGenerator } from "./futures-generator";
import { ExecutionStore } from "./execution-store";

export class LatentTransitionChain {
    /**
     * Generates a full Phase 9 latent transition chain:
     * observation → latent state → strategy → predicted future → calibration
     */
    public static async generate(
        objective: string = "Derive latent structural state for intervention planning"
    ): Promise<LatentStateTransitionSummary | null> {
        try {
            // 1. Capture current world state
            const snapshot = captureRepoSnapshot(process.cwd());
            const dependencies = analyzeDependencies(snapshot.nodes, snapshot.workspaceRoot);

            // 2. Encode latent structural state
            const latentState = LatentStateEncoder.encode(snapshot, dependencies);

            // 3. Assess strategy compatibility against current conditions
            const strategyCompatibility = StrategyCompatibilityAnalyzer.analyze(latentState);

            // 4. Analyze historical transition patterns
            const { patterns: transitionPatterns } = TransitionPatternAnalyzer.analyze();

            // 5. Build chain link through the SE-JEPA proxy
            const chainLink = await this.buildChainLink(
                snapshot, latentState.id, strategyCompatibility, objective
            );

            return {
                id: `ltc-${Date.now().toString(36)}`,
                generatedAt: new Date().toISOString(),
                latentState,
                strategyCompatibility,
                transitionPatterns,
                chainLink,
            };
        } catch (error) {
            console.error("Failed to generate latent transition chain:", error);
            return null;
        }
    }

    /**
     * Builds the observation → action → prediction → calibration chain link.
     */
    private static async buildChainLink(
        snapshot: ReturnType<typeof captureRepoSnapshot>,
        latentStateId: string,
        assessments: ReturnType<typeof StrategyCompatibilityAnalyzer.analyze>,
        objective: string
    ): Promise<LatentStateTransitionSummary["chainLink"]> {
        try {
            // Build a mock WorldState from snapshot for the observation encoder
            const worldState = {
                id: `ws-${Date.now().toString(36)}`,
                capturedAt: snapshot.capturedAt,
                repository: {
                    name: "CodeWorld Observatory",
                    rootPath: snapshot.workspaceRoot,
                    primaryLanguage: "typescript",
                },
                branch: {
                    name: "main",
                    sha: "live",
                    lastCommit: snapshot.capturedAt,
                    status: "active" as const,
                    aheadBy: 0,
                    behindBy: 0,
                },
                fileTreeDigest: "live",
                totalFiles: snapshot.totalFiles,
                totalLines: 0,
                recentMutations: [],
                dependencyGraph: [],
                openProblems: 0,
                phase: 9,
            };

            const observation = ObservationEncoder.encode(worldState);

            // Select the most favorable strategy from analysis
            const favorableAssessment = assessments
                .filter(a => a.compatibility === "favorable")
                .sort((a, b) => b.suitabilityScore - a.suitabilityScore)[0];

            const selectedStrategy: BranchStrategy | null =
                favorableAssessment?.strategy || null;

            // Generate intervention plan to produce action + future
            const plan = planIntervention(
                { objective, type: "refactor" },
                null,
                snapshot.totalFiles
            );

            const activeBranch = plan.branches.find(
                (b: any) => b.id === plan.preferredBranchId
            ) || plan.branches[0];

            const futuresRes = FuturesGenerator.generateProjections(plan);
            const projection = futuresRes.futures.find(
                (f: any) => f.branchId === activeBranch.id
            );

            // Check for calibration delta from execution store
            let calibrationDelta: number | null = null;
            const execStore = ExecutionStore.getExecutions();
            const latestComparison = execStore.comparisons[execStore.comparisons.length - 1];
            if (latestComparison) {
                const weights: Record<string, number> = {
                    aligned: 1.0,
                    "partially-aligned": 0.65,
                    divergent: 0.2,
                    "insufficient-evidence": 0.4,
                };
                calibrationDelta = weights[latestComparison.calibrationResult] ?? 0.4;
            }

            return {
                observationStateId: observation.id,
                latentStateId,
                selectedStrategyClass: selectedStrategy,
                predictedFutureStateId: projection
                    ? `future-${activeBranch.id}`
                    : null,
                calibrationDelta,
            };
        } catch {
            return {
                observationStateId: "unavailable",
                latentStateId,
                selectedStrategyClass: null,
                predictedFutureStateId: null,
                calibrationDelta: null,
            };
        }
    }
}
