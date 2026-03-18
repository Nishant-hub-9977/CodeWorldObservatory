import { NextResponse } from "next/server";
import { ExperimentRegistry } from "@/lib/services/experiment-registry";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        return NextResponse.json(ExperimentRegistry.listExperiments());
    } catch (error) {
        console.error("Failed to list experiments:", error);
        return NextResponse.json({ error: "Failed to list experiments" }, { status: 500 });
    }
}