import { SkillEnforcementResult, SimulationGateDecision } from "../types/mcp";
import { FuturesGenerator } from "./futures-generator";
import { ArtifactLedgerService } from "./artifact-ledger";

export class SimulationGateEvaluator {

    /**
     * Determines the governance posture of a proposed branch.
     * This is a classification gate, NOT an execution permission.
     */
    public static evaluate(branchId: string): SkillEnforcementResult {
        const missingPrerequisites: string[] = [];
        const relatedEvidenceArtifacts: string[] = [];

        let decision: SimulationGateDecision = "blocked";
        let rationale = "Gate evaluation failed.";

        // 1. Check Artifact Ledger for planning/simulation traces
        const ledger = ArtifactLedgerService.getLedger();
        const branchArtifacts = ledger.entries.filter(e =>
            e.description?.includes(branchId) || e.summary?.includes(branchId) || e.tags.includes(branchId)
        );

        const hasPlanArtifact = branchArtifacts.some(a => a.type === "plan");
        const hasSimulationArtifact = branchArtifacts.some(a => a.type === "simulation");

        if (hasPlanArtifact) relatedEvidenceArtifacts.push("Prior Plan Artifacts Discovered");
        if (hasSimulationArtifact) relatedEvidenceArtifacts.push("Prior Simulation Artifacts Discovered");

        if (!hasPlanArtifact) missingPrerequisites.push("Missing foundational Intervention Plan artifact.");
        if (!hasSimulationArtifact) missingPrerequisites.push("Missing Futures/Simulation Projection artifact.");

        // 2. We mock checking the specific branch projection here for Phase 5 scope.
        // In a fully integrated runtime, we fetch the exact target projection from state.
        const mockProjectionReady = true;
        const mockUncertaintyCritical = false;

        // 3. Derive Decision
        if (missingPrerequisites.length > 0) {
            decision = "blocked";
            rationale = "Simulation-Before-Write Law violation: Required predictive artifacts are absent from the structural ledger. Code execution is prohibited until projection formally completes.";
        } else if (mockUncertaintyCritical) {
            decision = "advisory-only";
            rationale = "Predictive artifacts exist, but unobservable regions contain severe uncertainty blocks. Proceed manually under heavy architectural review.";
        } else if (mockProjectionReady) {
            decision = "ready-for-reviewed-execution";
            rationale = "Predictive loop complete and bounds are formally contained. Operator may initiate execution sequence. (Note: Autonomous execution remains disabled in Phase 5).";
        } else {
            decision = "blocked";
            rationale = "Safety bounds exceeded or unresolved structural complexity detected in the proposed intervention path.";
        }

        return {
            decision,
            rationale,
            missingPrerequisites,
            relatedEvidenceArtifacts,
            evaluatedAt: new Date().toISOString()
        };
    }
}
