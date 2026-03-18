import { NextRequest, NextResponse } from "next/server";
import { WorldStateCaptureService } from "@/lib/services/world-state-capture";
import { ReplayPackageBuilder } from "@/lib/services/replay-package-builder";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const experimentId = request.nextUrl.searchParams.get("experimentId");
        const snapshot = WorldStateCaptureService.captureWorldState(experimentId);
        if (experimentId) {
            ReplayPackageBuilder.buildForExperiment(experimentId);
        }
        return NextResponse.json({ snapshot }, { status: 200 });
    } catch (error) {
        console.error("Failed to capture world state:", error);
        const message = error instanceof Error ? error.message : "Failed to capture world state";
        const status = message.includes("unknown experiment") ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}