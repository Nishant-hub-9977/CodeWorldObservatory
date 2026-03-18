import { NextResponse } from "next/server";
import { BenchmarkHarness } from "@/lib/services/benchmark-harness";
import { SessionStore } from "@/lib/services/session-store";
import { SimulationRequestBuilder } from "@/lib/services/simulation-request-builder";
import { SimulationRunner } from "@/lib/services/simulation-runner";
import { captureRepoSnapshot } from "@/lib/services/world-state-capturer";
import { analyzeDependencies } from "@/lib/services/dependency-analyzer";
import { planIntervention } from "@/lib/services/intervention-planner";
import { FuturesGenerator } from "@/lib/services/futures-generator";
import { ExperimentRegistry } from "@/lib/services/experiment-registry";
import { ReplayPackageBuilder } from "@/lib/services/replay-package-builder";
import type { InterventionTarget } from "@/lib/types/intervention";

const DEFAULT_OBJECTIVE: InterventionTarget = {
    objective: "Implement Phase 7: Benchmark Harness Evaluation",
    type: "refactor",
};

export async function GET() {
    try {
        // Retrieve latest run or generate live on demand
        let benchmark = SessionStore.getLatestBenchmark();

        if (!benchmark) {
            // Generate on-the-fly if no sessions exist yet
            const workspaceRoot = process.cwd();
            const snapshot = captureRepoSnapshot(workspaceRoot);
            const depReport = analyzeDependencies(snapshot.nodes, workspaceRoot);
            const comparison = planIntervention(DEFAULT_OBJECTIVE, depReport, snapshot.totalFiles);
            const futuresResponse = FuturesGenerator.generateProjections(comparison);
            const simRequest = SimulationRequestBuilder.buildFromContext(
                comparison,
                futuresResponse,
                `ws-${Date.now()}`
            );
            const session = SimulationRunner.runSession(simRequest);
            SessionStore.saveSession(session);

            benchmark = BenchmarkHarness.evaluateSession(session);
            SessionStore.saveBenchmark(benchmark);
        }

        return NextResponse.json({
            benchmark,
            message: "Comparative benchmark harness run."
        });

    } catch (error: any) {
        console.error("Benchmark generation error:", error);
        return NextResponse.json(
            { error: "Benchmark generation failed.", details: error.message || String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const sessionId = body?.sessionId;

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
        }

        const session = SessionStore.getSession(sessionId);
        if (!session) {
            return NextResponse.json({ error: "Session not found." }, { status: 404 });
        }

        const benchmark = BenchmarkHarness.evaluateSession(session);
        SessionStore.saveBenchmark(benchmark);
        if (session.experimentId) {
            ExperimentRegistry.attachBenchmark(session.experimentId, benchmark.id, `artifacts/simulations/${benchmark.id}.json`);
            ReplayPackageBuilder.buildForExperiment(session.experimentId);
        }

        return NextResponse.json({
            benchmark,
            message: "Comparative benchmark harness run."
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: "Benchmark evaluation failed.", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
