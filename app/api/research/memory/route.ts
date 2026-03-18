import { NextResponse } from "next/server";
import { ExperimentMemoryStore } from "@/lib/services/experiment-memory";
import type { ResearchMemoryResponse } from "@/lib/types/research-memory";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const memory = ExperimentMemoryStore.compileMemory();

        // Match the strict type contract requested
        const response: ResearchMemoryResponse = {
            memory
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to fetch research memory:", error);
        return NextResponse.json({ error: "Failed to compile research memory" }, { status: 500 });
    }
}
