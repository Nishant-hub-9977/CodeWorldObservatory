import { NextResponse } from "next/server";
import { planIntervention, SEED_INTERVENTION_TARGET } from "@/lib/services/intervention-planner";
import { FuturesGenerator } from "@/lib/services/futures-generator";
import { captureRepoSnapshot } from "@/lib/services/world-state-capturer";

export async function GET() {
    try {
        const rootPath = process.cwd();
        const snapshot = captureRepoSnapshot(rootPath);

        // In Phase 3, we generate futures from a sample planning payload (the seed objective)
        // rather than taking external input. This demonstrates the live capability.
        // A real dependency report is omitted here mapped as null as planner can handle it.
        const comparison = planIntervention(SEED_INTERVENTION_TARGET, null, snapshot.totalFiles);

        // Generate deterministic, strongly-typed futures from the comparison
        const futuresResponse = FuturesGenerator.generateProjections(comparison);

        return NextResponse.json(futuresResponse);
    } catch (error) {
        console.error("Futures GET Error:", error);
        return NextResponse.json(
            { error: "Failed to generate future projections" },
            { status: 500 }
        );
    }
}
