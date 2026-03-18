import { NextRequest, NextResponse } from "next/server";
import { ExperimentRegistry } from "@/lib/services/experiment-registry";
import { ResearchDatasetStore } from "@/lib/services/research-dataset-store";
import { ReplayPackageBuilder } from "@/lib/services/replay-package-builder";

const ALLOWED_STRATEGIES = new Set([
    "service-first",
    "route-first",
    "ui-first",
    "minimal-touch",
    "structural-refactor",
    "mixed",
]);

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const objectiveTitle = String(body.objectiveTitle ?? "").trim();
        const objectiveSummary = String(body.objectiveSummary ?? "").trim();
        const targetFiles = Array.isArray(body.targetFiles)
            ? body.targetFiles.map((value: unknown) => String(value).trim()).filter(Boolean)
            : String(body.targetFiles ?? "").split(",").map(value => value.trim()).filter(Boolean);
        const hypothesisStatement = String(body.hypothesisStatement ?? "").trim();
        const expectedSignal = String(body.expectedSignal ?? "").trim();
        const successCriteria = String(body.successCriteria ?? "").trim();
        const strategy = String(body.strategy ?? "minimal-touch").trim();

        if (!objectiveTitle || !objectiveSummary || !hypothesisStatement || !expectedSignal || !successCriteria) {
            return NextResponse.json(
                { error: "Missing required experiment registration fields" },
                { status: 400 }
            );
        }

        if (!ALLOWED_STRATEGIES.has(strategy)) {
            return NextResponse.json({ error: "Unsupported experiment strategy" }, { status: 400 });
        }

        const experiment = ExperimentRegistry.registerExperiment({
            objective: {
                title: objectiveTitle,
                summary: objectiveSummary,
                targetFiles,
            },
            hypothesis: {
                statement: hypothesisStatement,
                expectedSignal,
                successCriteria,
            },
            strategy: strategy as Parameters<typeof ExperimentRegistry.registerExperiment>[0]["strategy"],
            status: "draft",
        });
        const dataset = ResearchDatasetStore.materializeDataset(experiment.experimentId);
        const replayPackage = ReplayPackageBuilder.buildForExperiment(experiment.experimentId);

        return NextResponse.json({ experiment, dataset, replayPackage }, { status: 201 });
    } catch (error) {
        console.error("Failed to register experiment:", error);
        return NextResponse.json({ error: "Failed to register experiment" }, { status: 500 });
    }
}