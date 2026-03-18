import { PredictedFutureState, LatentStateDescriptor } from "../types/se-jepa";
import { BranchOutcomeProjection } from "../types/future-state";

export class FutureStateMapper {
    /**
     * Converts a heuristic Futures Projection into a SE-JEPA PredictedFutureState.
     * Maps the structural bounds into a proxy for a latent state descriptor.
     */
    public static map(projection: BranchOutcomeProjection, actionId: string, baselineObservationId: string): PredictedFutureState {

        let stability: "stable" | "degrading" | "volatile" = "stable";
        if (projection.outlook === "structurally expensive path") stability = "degrading";
        if (projection.impact.executionReadiness === "blocked") stability = "volatile";

        let observability: "clear" | "partial" | "obscured" = "clear";
        if (projection.uncertainty.length > 0) observability = "partial";
        if (projection.uncertainty.some(u => u.level === "extreme" || u.level === "high")) observability = "obscured";

        let failureSurface: "contained" | "diffuse" | "systemic" = "contained";
        if (projection.failureSurfaces.length > 2) failureSurface = "diffuse";
        if (projection.failureSurfaces.some(fs => fs.riskLevel === "critical")) failureSurface = "systemic";

        const descriptor: LatentStateDescriptor = {
            stabilityProfile: stability,
            observabilityProfile: observability,
            verificationBurdenProfile: projection.impact.validationBurden,
            failureSurfaceProfile: failureSurface,
        };

        // Synthesize a confidence score from the descriptive strings
        let confidence = 0.9;
        if (observability === "partial") confidence -= 0.2;
        if (observability === "obscured") confidence -= 0.4;
        if (stability === "volatile") confidence -= 0.3;

        confidence = Math.max(0.1, Math.min(1.0, confidence));

        return {
            id: `fut-${projection.branchId}`,
            actionId,
            baselineObservationId,
            projectedAt: new Date().toISOString(),
            structuralDescriptor: descriptor,
            confidenceScore: Number(confidence.toFixed(2)),
            readinessProfile: projection.impact.executionReadiness
        };
    }
}
