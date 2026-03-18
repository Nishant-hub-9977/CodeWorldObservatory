import { NextResponse } from "next/server";
import { SimulationGateEvaluator } from "@/lib/services/simulation-gate";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.branchId) {
            return NextResponse.json(
                { error: "Missing required field: branchId" },
                { status: 400 }
            );
        }

        const decision = SimulationGateEvaluator.evaluate(body.branchId);

        // Emit an advisory response
        return NextResponse.json({
            ...decision,
            _meta: {
                enforcementMode: "advisory-only",
                executionPermittedAutonomous: false,
                note: "Simulation gate evaluated boundaries. Execution remains manually gated pending Phase 6 completion."
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to evaluate simulation gate", details: String(error) },
            { status: 500 }
        );
    }
}
