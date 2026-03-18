import { NextResponse } from "next/server";
import { LatentStateEncoder } from "@/lib/services/latent-state-encoder";
import { captureRepoSnapshot } from "@/lib/services/world-state-capturer";
import { analyzeDependencies } from "@/lib/services/dependency-analyzer";
import type { LatentStateApiResponse } from "@/lib/types/latent-state";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const snapshot = captureRepoSnapshot(process.cwd());
        const dependencies = analyzeDependencies(snapshot.nodes, snapshot.workspaceRoot);
        const latentState = LatentStateEncoder.encode(snapshot, dependencies);

        const response: LatentStateApiResponse = {
            latentState,
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to derive latent state:", error);
        return NextResponse.json(
            { error: "Failed to derive latent repo state" },
            { status: 500 }
        );
    }
}
