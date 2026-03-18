// ─── /api/interventions — Intervention Planning Endpoint ──────────
// GET  /api/interventions — returns default seed planning response
// POST /api/interventions — accepts custom objective, returns 3-branch plan
// Always returns JSON. Safe error handling throughout.

import { NextRequest, NextResponse } from "next/server";
import { captureRepoSnapshot } from "@/lib/services/world-state-capturer";
import { analyzeDependencies } from "@/lib/services/dependency-analyzer";
import {
    planIntervention,
    SEED_INTERVENTION_TARGET,
} from "@/lib/services/intervention-planner";
import type { InterventionApiResponse, InterventionTarget, InterventionType } from "@/lib/types/intervention";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Shared planning logic ────────────────────────────────────────

async function runPlan(target: InterventionTarget): Promise<InterventionApiResponse> {
    const workspaceRoot = process.cwd();

    // Reuse Phase 1 live signals
    const snapshot = captureRepoSnapshot(workspaceRoot);
    const depReport = analyzeDependencies(snapshot.nodes, workspaceRoot);

    const tsFileCount =
        (snapshot.extensions.find((e) => e.extension === ".ts")?.fileCount ?? 0) +
        (snapshot.extensions.find((e) => e.extension === ".tsx")?.fileCount ?? 0);

    const comparison = planIntervention(target, depReport, snapshot.totalFiles);

    return {
        comparison,
        repoSignals: {
            totalFiles: snapshot.totalFiles,
            tsFileCount,
            edgeCount: depReport.edges.length,
        },
        plannerVersion: "phase-2.0",
        planningNote:
            "Branch plans are derived from static repo signals. " +
            "No simulation result is available at this stage. " +
            "Phase 3 will introduce confidence scoring and uncertainty surfaces before any write is permitted.",
    };
}

// ─── GET ──────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
    try {
        const result = await runPlan(SEED_INTERVENTION_TARGET);
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[GET /api/interventions] Planning failed:", message);
        return NextResponse.json(
            { error: "Intervention planning failed", details: message },
            { status: 500 },
        );
    }
}

// ─── POST ─────────────────────────────────────────────────────────

interface PlanRequest {
    objective?: unknown;
    targetFiles?: unknown;
    type?: unknown;
    context?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    let body: PlanRequest;

    try {
        body = (await req.json()) as PlanRequest;
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const { objective, targetFiles, type, context } = body;

    if (typeof objective !== "string" || objective.trim().length === 0) {
        return NextResponse.json(
            { error: "Validation error", details: "`objective` must be a non-empty string" },
            { status: 422 },
        );
    }

    const VALID_TYPES: InterventionType[] = [
        "write", "delete", "refactor", "patch",
        "dependency", "config", "schema", "test", "migration",
    ];
    const resolvedType: InterventionType =
        VALID_TYPES.includes(type as InterventionType)
            ? (type as InterventionType)
            : "write";

    const hintFiles =
        Array.isArray(targetFiles) &&
            targetFiles.every((f) => typeof f === "string")
            ? (targetFiles as string[])
            : undefined;

    const target: InterventionTarget = {
        objective: objective.trim(),
        type: resolvedType,
        hintFiles,
        context: typeof context === "string" ? context : undefined,
    };

    try {
        const result = await runPlan(target);
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[POST /api/interventions] Planning failed:", message);
        return NextResponse.json(
            { error: "Intervention planning failed", details: message },
            { status: 500 },
        );
    }
}
