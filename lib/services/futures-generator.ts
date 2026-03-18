import { CounterfactualComparison, InterventionBranch } from "../types/intervention";
import { BranchOutcomeProjection, PredictedImpact, FailureSurface, FuturesApiResponse, FuturesSummary } from "../types/future-state";
import { UncertaintyAnalyzer } from "./uncertainty-analyzer";

/**
 * Futures Generator
 * Deterministic service that consumes intervention planning output
 * and produces structured, typed projected outcomes for each branch.
 */
export class FuturesGenerator {

    /**
     * Converts a CounterfactualComparison from Phase 2 into a complete FuturesApiResponse
     */
    public static generateProjections(comparison: CounterfactualComparison): FuturesApiResponse {
        const futures: BranchOutcomeProjection[] = comparison.branches.map(branch =>
            this.projectBranchOutcome(branch)
        );

        // Aggregate uncertainty signals for the summary
        const allSources = futures.flatMap(f => f.uncertainty.map(u => u.limitationSource));
        const uniqueSources = Array.from(new Set(allSources));

        // Derive overall execution readiness based on worst-case branch (if there's a highly structural branch)
        // or base it roughly on preferred branch. Usually, we just heuristically evaluate.
        const highestRisk = futures.some(f => f.impact.executionReadiness === "blocked")
            ? "blocked"
            : futures.some(f => f.impact.executionReadiness === "needs-review")
                ? "needs-review"
                : "ready";

        const summary: FuturesSummary = {
            totalBranches: futures.length,
            recommendedPathId: comparison.preferredBranchId,
            primaryUncertaintySources: uniqueSources,
            overallExecutionReadiness: highestRisk
        };

        return {
            futures,
            summary,
            generatedAt: new Date().toISOString()
        };
    }

    private static projectBranchOutcome(branch: InterventionBranch): BranchOutcomeProjection {
        const uncertainty = UncertaintyAnalyzer.analyzeBranch(branch);

        let validationBurden: "low" | "moderate" | "heavy" = "low";
        let readiness: "ready" | "needs-review" | "blocked" = "ready";
        let outlook: "stable-forward path" | "contained-risk path" | "structurally expensive path" = "stable-forward path";

        // Heuristic mapping based on scopeClass & riskLevel
        const scope = branch.scopeImpact.scopeClass;
        const risk = branch.riskLevel;

        if (scope === "structural" || risk === "critical") {
            validationBurden = "heavy";
            readiness = "needs-review";
            outlook = "structurally expensive path";
        } else if (scope === "cross-module" || risk === "high" || risk === "medium") {
            validationBurden = "moderate";
            readiness = "needs-review";
            outlook = "contained-risk path";
        }

        const impact: PredictedImpact = {
            estimatedTime: this.estimateTime(branch),
            validationBurden,
            instabilityZones: branch.scopeImpact.touchedSurfaces.filter(ts => ts.toLowerCase().includes("shared") || ts.toLowerCase().includes("core")),
            executionReadiness: readiness
        };

        const failureSurfaces: FailureSurface[] = branch.scopeImpact.connectedFiles.slice(0, 3).map(f => ({
            path: f,
            reason: `Cascade risk from ${branch.scopeImpact.directTargets.length > 0 ? branch.scopeImpact.directTargets[0] : 'unknown'}`,
            riskLevel: risk
        }));

        return {
            branchId: branch.id,
            label: branch.label,
            summary: `Projected consequences of adopting ${branch.strategy} approach.`,
            likelyTouchedSurfaces: branch.scopeImpact.touchedSurfaces,
            impact,
            failureSurfaces,
            outlook,
            uncertainty
        };
    }

    /**
     * Very basic deterministic estimation heuristic based on file change radius
     */
    private static estimateTime(branch: InterventionBranch): string {
        const radius = branch.scopeImpact.estimatedFileRadius;
        if (radius <= 2) return "~1 hour";
        if (radius <= 5) return "~2-3 hours";
        if (radius <= 10) return "~1 day";
        return "~Multi-day effort";
    }
}
