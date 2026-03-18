import type { CounterfactualComparison } from "../types/intervention";
import type { FuturesApiResponse } from "../types/future-state";
import type { SimulationRequest, SimulationBranchInput } from "../types/simulation";

/**
 * Constructs safe, bounded simulation requests from Phase 2 (Planning)
 * and Phase 3 (Futures) contexts.
 */
export class SimulationRequestBuilder {
    /**
     * Extracts and normalizes the required input context for a controlled simulation session.
     */
    public static buildFromContext(
        comparison: CounterfactualComparison,
        futuresResponse: FuturesApiResponse,
        worldStateId: string,
        experimentId: string | null = null
    ): SimulationRequest {
        const branchInputs: SimulationBranchInput[] = comparison.branches.map((branch) => {
            const projection = futuresResponse.futures.find((f) => f.branchId === branch.id);
            if (!projection) {
                throw new Error(`Futures projection not found for branch: ${branch.id}`);
            }

            return {
                branch,
                projection,
            };
        });

        return {
            experimentId,
            objective: comparison.objective,
            baselineWorldStateId: worldStateId,
            branchInputs,
            requestedBy: "human", // Default context for now
            requestId: `sim-req-${Date.now().toString(36)}`,
        };
    }
}
