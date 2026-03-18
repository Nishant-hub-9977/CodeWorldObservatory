import { NextResponse } from "next/server";
import { EvaluationSnapshotStore } from "@/lib/services/evaluation-snapshot-store";
import type {
    ExperimentEvaluationsApiResponse,
    PersistedExperimentEvaluationApiResponse,
} from "@/lib/types/experiment-evaluation-record";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const liveRecord = EvaluationSnapshotStore.buildCurrentRecord("live-read");
        const latestRecord = EvaluationSnapshotStore.getLatest();
        const driftSummaries = EvaluationSnapshotStore.deriveDriftHistory(8);

        const response: ExperimentEvaluationsApiResponse = {
            liveRecord,
            latestRecord,
            driftSummaries,
            generatedAt: liveRecord.generatedAt,
            readMode: "observational",
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to read research evaluations:", error);
        return NextResponse.json({ error: "Failed to read research evaluations" }, { status: 500 });
    }
}

export async function POST() {
    try {
        const record = EvaluationSnapshotStore.persistCurrentRecord("explicit-snapshot");
        const latestDrift = EvaluationSnapshotStore.deriveDriftHistory(1)[0] ?? null;

        const response: PersistedExperimentEvaluationApiResponse = {
            record,
            latestDrift,
            persistedAt: record.generatedAt,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to persist research evaluations:", error);
        return NextResponse.json({ error: "Failed to persist research evaluations" }, { status: 500 });
    }
}