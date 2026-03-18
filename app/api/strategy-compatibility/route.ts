import { NextResponse } from "next/server";
import { LatentStateEncoder } from "@/lib/services/latent-state-encoder";
import { StrategyCompatibilityAnalyzer } from "@/lib/services/strategy-compatibility-analyzer";
import { captureRepoSnapshot } from "@/lib/services/world-state-capturer";
import { analyzeDependencies } from "@/lib/services/dependency-analyzer";
import type { StrategyCompatibilityApiResponse } from "@/lib/types/latent-state";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const snapshot = captureRepoSnapshot(process.cwd());
        const dependencies = analyzeDependencies(snapshot.nodes, snapshot.workspaceRoot);
        const latentState = LatentStateEncoder.encode(snapshot, dependencies);
        const assessments = StrategyCompatibilityAnalyzer.analyze(latentState);

        const response: StrategyCompatibilityApiResponse = {
            latentStateId: latentState.id,
            assessments,
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to assess strategy compatibility:", error);
        return NextResponse.json(
            { error: "Failed to assess strategy compatibility" },
            { status: 500 }
        );
    }
}
