import { NextResponse } from "next/server";
import { EvaluationSnapshotStore } from "@/lib/services/evaluation-snapshot-store";
import type { ExperimentComparisonsApiResponse } from "@/lib/types/experiment-evaluation-record";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const liveRecord = EvaluationSnapshotStore.buildCurrentRecord("live-read");
        const latestRecord = EvaluationSnapshotStore.getLatest();
        const driftSummaries = EvaluationSnapshotStore.deriveDriftHistory(8);

        const response: ExperimentComparisonsApiResponse = {
            portfolio: liveRecord.portfolio,
            latestRecord,
            driftSummaries,
            generatedAt: liveRecord.generatedAt,
            readMode: "observational",
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to read experiment comparisons:", error);
        return NextResponse.json({ error: "Failed to read experiment comparisons" }, { status: 500 });
    }
}