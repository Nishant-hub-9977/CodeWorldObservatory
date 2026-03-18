import { NextRequest, NextResponse } from "next/server";
import { ExperimentDetailBuilder } from "@/lib/services/experiment-detail-builder";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const detail = ExperimentDetailBuilder.build(id);
        if (!detail) {
            return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
        }

        return NextResponse.json(detail);
    } catch (error) {
        console.error("Failed to load experiment:", error);
        return NextResponse.json({ error: "Failed to load experiment" }, { status: 500 });
    }
}