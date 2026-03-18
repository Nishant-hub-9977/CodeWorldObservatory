import { NextRequest, NextResponse } from "next/server";
import { ReproducibilityEngine } from "@/lib/services/reproducibility-engine";
import { ExperimentRegistry } from "@/lib/services/experiment-registry";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const requestedId = request.nextUrl.searchParams.get("experimentId");
        const experimentId = requestedId ?? ExperimentRegistry.listExperiments().experiments[0]?.experimentId ?? null;

        if (!experimentId) {
            return NextResponse.json({ replay: null, note: "No experiments are registered yet." });
        }

        const replay = ReproducibilityEngine.replayExperiment(experimentId);
        if (!replay) {
            return NextResponse.json({ error: "Replay unavailable" }, { status: 404 });
        }

        return NextResponse.json({ replay, generatedAt: new Date().toISOString() });
    } catch (error) {
        console.error("Failed to replay experiment:", error);
        return NextResponse.json({ error: "Failed to replay experiment" }, { status: 500 });
    }
}