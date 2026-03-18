import { NextResponse } from "next/server";
import { ResearchDatasetStore } from "@/lib/services/research-dataset-store";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        return NextResponse.json(ResearchDatasetStore.listDatasets());
    } catch (error) {
        console.error("Failed to list datasets:", error);
        return NextResponse.json({ error: "Failed to list datasets" }, { status: 500 });
    }
}