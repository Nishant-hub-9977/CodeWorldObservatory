import { NextResponse } from "next/server";
import { ScenarioLibrary } from "@/lib/services/scenario-library";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        return NextResponse.json(ScenarioLibrary.listScenarios());
    } catch (error) {
        console.error("Failed to load scenario library:", error);
        return NextResponse.json({ error: "Failed to load scenario library" }, { status: 500 });
    }
}