import { ObservationState } from "../types/se-jepa";
import { WorldState } from "../types/world-state";

export class ObservationEncoder {
    /**
     * Transforms a physical WorldState into a normalized ObservationState.
     * This is a structural architectural proxy for a neural encoder.
     */
    public static encode(worldState: WorldState): ObservationState {

        // Proxy logic: In a real system, these would be derived from deep AST
        // and dependency graph analysis. Here we map existing signals.

        const moduleCount = new Set(worldState.dependencyGraph.map(e => e.from.split('/')[0])).size;

        const hasOpenProblems = worldState.openProblems > 0;
        const observability = hasOpenProblems ? "partial" : "clear";

        const edgeCount = worldState.dependencyGraph.length;
        const fileCount = Math.max(worldState.totalFiles, 1);
        const connectivityRatio = edgeCount / fileCount;

        let variance: "low" | "medium" | "high" = "medium";
        if (connectivityRatio > 2.0) variance = "high";
        if (connectivityRatio < 0.5) variance = "low";

        return {
            id: `obs-${worldState.id}`,
            worldStateId: worldState.id,
            capturedAt: new Date().toISOString(),
            structuralProfile: {
                totalFiles: worldState.totalFiles,
                moduleBoundaries: moduleCount || 1,
            },
            dependencyProfile: {
                maxEdgeDepth: Math.floor(connectivityRatio * 2), // Mock depth heuristic
                connectivityVariance: variance,
            },
            uncertaintyProfile: {
                globalObservability: observability,
                openProblemsCount: worldState.openProblems,
            }
        };
    }
}
