import { NextRequest, NextResponse } from "next/server";
import { ScenarioLibrary } from "@/lib/services/scenario-library";
import { ResearchDatasetStore } from "@/lib/services/research-dataset-store";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        return NextResponse.json(ScenarioLibrary.listScenarios());
    } catch (error) {
        console.error("Failed to list scenarios:", error);
        return NextResponse.json({ error: "Failed to list scenarios" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const experimentId = String(body.experimentId ?? "").trim();
        const scenarioId = String(body.scenarioId ?? "").trim();

        if (!experimentId || !scenarioId) {
            return NextResponse.json({ error: "experimentId and scenarioId are required" }, { status: 400 });
        }

        const scenario = ScenarioLibrary.linkScenarioToExperiment(experimentId, scenarioId);
        if (!scenario) {
            return NextResponse.json({ error: "Unable to link scenario to experiment" }, { status: 404 });
        }

        const dataset = ResearchDatasetStore.materializeDataset(experimentId);

        return NextResponse.json({ scenario, experimentId, dataset, linkedAt: new Date().toISOString() });
    } catch (error) {
        console.error("Failed to link scenario:", error);
        return NextResponse.json({ error: "Failed to link scenario" }, { status: 500 });
    }
}