import { NextRequest, NextResponse } from "next/server";
import { ResearchDatasetStore } from "@/lib/services/research-dataset-store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const dataset = ResearchDatasetStore.getDataset(id);
        if (!dataset) {
            return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
        }

        return NextResponse.json(dataset);
    } catch (error) {
        console.error("Failed to load dataset:", error);
        return NextResponse.json({ error: "Failed to load dataset" }, { status: 500 });
    }
}