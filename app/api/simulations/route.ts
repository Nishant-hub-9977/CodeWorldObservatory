import { NextResponse } from "next/server";
import { SimulationRequestBuilder } from "@/lib/services/simulation-request-builder";
import { SimulationRunner } from "@/lib/services/simulation-runner";
import { SessionStore } from "@/lib/services/session-store";
import { captureRepoSnapshot } from "@/lib/services/world-state-capturer";
import { analyzeDependencies } from "@/lib/services/dependency-analyzer";
import { planIntervention } from "@/lib/services/intervention-planner";
import { FuturesGenerator } from "@/lib/services/futures-generator";
import { ExperimentRegistry } from "@/lib/services/experiment-registry";
import { ReplayPackageBuilder } from "@/lib/services/replay-package-builder";
import type { InterventionTarget, InterventionType } from "@/lib/types/intervention";

const VALID_TYPES: InterventionType[] = [
    "write", "delete", "refactor", "patch", "dependency",
    "config", "schema", "test", "migration",
];

/**
 * Ensures standard test parameters for Phase 7 implementation without UI input yet.
 */
const DEFAULT_OBJECTIVE: InterventionTarget = {
    objective: "Implement Phase 7: Controlled Simulation and Benchmarking",
    type: "refactor",
    hintFiles: ["app/api/simulations"]
};

export async function GET() {
    return NextResponse.json(
        { error: "GET /api/simulations requires a session ID, or use POST to generate one." },
        { status: 400 }
    );
}

export async function POST(request: Request) {
    try {
        let payloadObjective = DEFAULT_OBJECTIVE;
        let experimentId: string | null = null;

        try {
            const body = await request.json();
            if (body && body.objective !== undefined) {
                // Validate objective
                if (typeof body.objective !== "string" || body.objective.trim().length === 0) {
                    return NextResponse.json(
                        { error: "Validation failed", details: "`objective` must be a non-empty string." },
                        { status: 400 }
                    );
                }
                // Validate type
                if (body.type !== undefined && !VALID_TYPES.includes(body.type)) {
                    return NextResponse.json(
                        { error: "Validation failed", details: `\`type\` must be one of: ${VALID_TYPES.join(", ")}.` },
                        { status: 400 }
                    );
                }
                // Validate hintFiles
                if (body.hintFiles !== undefined) {
                    if (!Array.isArray(body.hintFiles) || !body.hintFiles.every((f: unknown) => typeof f === "string")) {
                        return NextResponse.json(
                            { error: "Validation failed", details: "`hintFiles` must be an array of strings." },
                            { status: 400 }
                        );
                    }
                }
                // Validate context
                if (body.context !== undefined && typeof body.context !== "string") {
                    return NextResponse.json(
                        { error: "Validation failed", details: "`context` must be a string." },
                        { status: 400 }
                    );
                }

                payloadObjective = {
                    objective: body.objective.trim(),
                    type: body.type ?? "refactor",
                    hintFiles: body.hintFiles,
                    context: body.context,
                };
            }

            if (body?.experimentId !== undefined) {
                if (typeof body.experimentId !== "string" || body.experimentId.trim().length === 0) {
                    return NextResponse.json(
                        { error: "Validation failed", details: "`experimentId` must be a non-empty string when provided." },
                        { status: 400 }
                    );
                }
                const normalizedExperimentId = body.experimentId.trim();
                if (!ExperimentRegistry.getExperiment(normalizedExperimentId)) {
                    return NextResponse.json(
                        { error: "Validation failed", details: "Referenced experiment does not exist." },
                        { status: 404 }
                    );
                }
                experimentId = normalizedExperimentId;
            }
        } catch {
            // Use default if no body provided or parse fails
        }

        // 1. Gather live baseline
        const workspaceRoot = process.cwd();
        const snapshot = captureRepoSnapshot(workspaceRoot);
        const depReport = analyzeDependencies(snapshot.nodes, "package.json");

        // 2. Generate Plan
        const comparison = planIntervention(payloadObjective, depReport, snapshot.totalFiles);
        const worldStateId = `ws-${Date.now()}`;

        // 3. Generate Proxied Futures
        const futuresResponse = FuturesGenerator.generateProjections(comparison);

        // 4. Build Simulation Request
        const simRequest = SimulationRequestBuilder.buildFromContext(
            comparison,
            futuresResponse,
            worldStateId,
            experimentId
        );

        // 5. Run Controlled Simulation Session
        const session = SimulationRunner.runSession(simRequest);

        // 6. Persist Session
        SessionStore.saveSession(session);
        if (experimentId) {
            ExperimentRegistry.attachSimulation(experimentId, session.id, `artifacts/simulations/${session.id}.json`);
            ReplayPackageBuilder.buildForExperiment(experimentId);
        }

        // Return structured output
        return NextResponse.json({
            session,
            message: "Simulation session explicitly created. No autonomous execution occurred."
        });

    } catch (error: any) {
        console.error("Simulation generation error:", error);
        return NextResponse.json(
            { error: "Simulation session generation failed.", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
