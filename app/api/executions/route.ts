import { NextResponse } from "next/server";
import { ExecutionStore } from "@/lib/services/execution-store";
import { PredictionRealityComparator } from "@/lib/services/prediction-reality-comparator";
import { ArtifactLedgerService } from "@/lib/services/artifact-ledger";
import { ExperimentRegistry } from "@/lib/services/experiment-registry";
import { ReplayPackageBuilder } from "@/lib/services/replay-package-builder";
import { ActualOutcome, ExecutionRecord } from "@/lib/types/execution";
import { BranchOutcomeProjection } from "@/lib/types/future-state";
import { ArtifactEntry } from "@/lib/types/artifact";

function seedInitialExecution() {
    const existing = ExecutionStore.getExecutions();
    if (existing.executions.length > 0) return;

    // Seed synthetic prediction and reality for the demo
    const seedBranchId = "branch-A";
    const seedPrediction: BranchOutcomeProjection = {
        branchId: seedBranchId,
        label: "State-Capture First",
        summary: "Synthetic prediction for demo evaluation.",
        likelyTouchedSurfaces: ["lib/services/world-state-capturer.ts", "app/api/snapshot/route.ts"],
        impact: {
            estimatedTime: "~3 hours",
            validationBurden: "moderate",
            instabilityZones: ["app/api/snapshot"],
            executionReadiness: "ready"
        },
        failureSurfaces: [],
        outlook: "stable-forward path",
        uncertainty: []
    };

    const actualOutcome: ActualOutcome = {
        status: "success",
        touchedSurfaces: ["lib/services/world-state-capturer.ts", "app/api/snapshot/route.ts"],
        observedIssues: [],
        validationBurden: "moderate",
        executionReadinessActual: "ready",
        operatorNotes: "[Synthetic Seed] Smooth execution match.",
        executedAt: new Date().toISOString()
    };

    const executionRecord: ExecutionRecord = {
        id: `exec-${Date.now().toString(36)}`,
        branchId: seedBranchId,
        interventionObjective: "Implement WorldState capture service",
        interventionTitle: "State-Capture Subsystem",
        actualOutcome,
        createdAt: actualOutcome.executedAt
    };

    const comparison = PredictionRealityComparator.compare(
        seedBranchId,
        executionRecord.id,
        seedPrediction,
        actualOutcome
    );

    ExecutionStore.addExecution(executionRecord, comparison);

    // Ledger the comparison
    const artifactEntry: ArtifactEntry = {
        id: `art-${Date.now().toString(36)}`,
        type: "comparison",
        title: "Prediction-Reality Delta: State-Capture First",
        description: comparison.calibrationNote,
        summary: "Aligned delta record for initial scaffold intervention.",
        createdAt: new Date().toISOString(),
        createdBy: "system",
        hash: { algorithm: "sha256", value: "synthetic-hash-" + Date.now() },
        trustLevel: "high",
        verificationStatus: comparison.calibrationResult === "aligned" ? "verified" : "diverged",
        links: [],
        tags: ["phase-4", "calibration", "seed"]
    };

    ArtifactLedgerService.addEntry(artifactEntry);
}

export async function GET() {
    try {
        seedInitialExecution();
        const data = ExecutionStore.getExecutions();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to retrieve executions", details: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const experimentId = body.experimentId ? String(body.experimentId).trim() : null;

        // Very rough validation for POC
        if (!body.branchId || !body.actualOutcome) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (experimentId && !ExperimentRegistry.getExperiment(experimentId)) {
            return NextResponse.json({ error: "Referenced experiment not found" }, { status: 404 });
        }

        // Ideally, we fetch the real prediction from futures layer.
        // For Phase 4 MVP, we'll construct a mock predicted baseline for the comparison if not provided.
        const mockPrediction: BranchOutcomeProjection = body.predictionMock ?? {
            branchId: body.branchId,
            label: "User-Submitted Route",
            summary: "Placeholder prediction for newly posted execution.",
            likelyTouchedSurfaces: body.actualOutcome.touchedSurfaces || [],
            impact: {
                estimatedTime: "Unknown",
                validationBurden: body.actualOutcome.validationBurden || "moderate",
                instabilityZones: [],
                executionReadiness: body.actualOutcome.executionReadinessActual || "ready"
            },
            failureSurfaces: [],
            outlook: "contained-risk path",
            uncertainty: []
        };

        const executionRecord: ExecutionRecord = {
            id: `exec-${Date.now().toString(36)}`,
            experimentId,
            branchId: body.branchId,
            interventionObjective: body.interventionObjective || "Manual execution record",
            interventionTitle: body.interventionTitle || "Manual Execution",
            actualOutcome: body.actualOutcome,
            createdAt: new Date().toISOString()
        };

        const comparison = PredictionRealityComparator.compare(
            body.branchId,
            executionRecord.id,
            mockPrediction,
            body.actualOutcome
        );
        comparison.experimentId = experimentId;

        ExecutionStore.addExecution(executionRecord, comparison);

        // Emit comparison artifact
        const artifactEntry: ArtifactEntry = {
            id: `art-${Date.now().toString(36)}`,
            type: "comparison",
            title: `Prediction-Reality Delta: ${executionRecord.interventionTitle}`,
            description: comparison.calibrationNote,
            summary: `Calibration result: ${comparison.calibrationResult}`,
            createdAt: new Date().toISOString(),
            createdBy: "human",
            experimentId: experimentId ?? undefined,
            executionId: executionRecord.id,
            hash: { algorithm: "sha256", value: "post-hash-" + Date.now() },
            trustLevel: "medium",
            verificationStatus: "pending",
            links: [],
            tags: ["phase-4", "calibration", "manual-record"]
        };

        ArtifactLedgerService.addEntry(artifactEntry);
        if (experimentId) {
            ExperimentRegistry.attachExecution(experimentId, executionRecord.id);
            ReplayPackageBuilder.buildForExperiment(experimentId);
        }

        return NextResponse.json({ ...executionRecord, comparison });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create execution record", details: String(error) },
            { status: 500 }
        );
    }
}
