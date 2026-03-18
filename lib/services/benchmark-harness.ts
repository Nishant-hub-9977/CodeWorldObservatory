import type {
    SimulationSession,
    BenchmarkHarnessRun,
    BranchBenchmarkRecord,
    SimulationResult,
} from "../types/simulation";

/**
 * The Benchmark Harness compares multiple branch simulation results
 * contextually against one another. It issues structural rankings
 * based on gathered proxy evidence.
 */
export class BenchmarkHarness {
    public static evaluateSession(session: SimulationSession): BenchmarkHarnessRun {
        const { branchResults, objective } = session;

        if (!branchResults || branchResults.length === 0) {
            throw new Error("Cannot benchmark an empty simulation session.");
        }

        // 1. Sort by score descending
        const sortedResults = [...branchResults].sort((a, b) => b.simulationScore - a.simulationScore);

        // 2. Identify strongest
        // A branch is only eligible if it isn't blocked by explicit governance or evidence failure
        const eligibleResults = sortedResults.filter(
            (r) => r.outcomeClass !== "blocked-by-evidence" && r.outcomeClass !== "governance-constrained"
        );

        const strongestResult: SimulationResult | undefined = eligibleResults[0];

        // 3. Construct comparative rankings
        const rankings: BranchBenchmarkRecord[] = sortedResults.map((result, index) => {
            const rank = index + 1;
            const isStrongest = strongestResult?.branchId === result.branchId;

            return {
                branchId: result.branchId,
                strategyClass: result.strategyClass, // Propagate strategy identity
                rank,
                simulationScore: result.simulationScore,
                outcomeClass: result.outcomeClass,
                comparativeRationale: this.buildRationale(result, isStrongest)
            };
        });

        // 4. Determine overall sufficiency
        let overallEvidenceSufficiency: "strong" | "adequate" | "insufficient" = "adequate";
        if (eligibleResults.length === 0) {
            overallEvidenceSufficiency = "insufficient";
        } else if (strongestResult && strongestResult.simulationScore > 0.85) {
            overallEvidenceSufficiency = "strong";
        }

        // 5. Harness synthesis notes
        const harnessNotes = eligibleResults.length === 0
            ? "WARNING: All simulated branches are blocked by structural evidence constraints."
            : `Evaluated ${branchResults.length} branches. Clear structural preference identified.`;

        return {
            id: `benchmark-${Date.now().toString(36)}`,
            sessionId: session.id,
            experimentId: session.experimentId ?? null,
            objectiveHeader: objective.objective,
            evaluatedAt: new Date().toISOString(),
            strongestCandidateId: strongestResult?.branchId || null,
            rankings,
            overallEvidenceSufficiency,
            harnessNotes
        };
    }

    private static buildRationale(result: SimulationResult, isStrongest: boolean): string {
        if (result.outcomeClass === "blocked-by-evidence") {
            return "Discarded: Evidence indicates critical uncertainty horizons. Structural risk too high.";
        }
        if (result.outcomeClass === "review-heavy") {
            return "Secondary: Burden of validation outweighs structural benefit in this pass.";
        }

        if (isStrongest) {
            return "Primary Candidate: Highest intersection of known stability and constrained validation burden.";
        }

        return "Viable Alternate: Functionally safe but structurally sub-optimal compared to primary.";
    }
}
