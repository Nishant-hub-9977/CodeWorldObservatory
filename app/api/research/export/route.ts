import { NextResponse } from "next/server";
import { ResearchBriefGenerator } from "@/lib/services/research-brief-generator";
import { BriefingSnapshotWriter } from "@/lib/services/briefing-snapshot-writer";
import { EvaluationSnapshotStore } from "@/lib/services/evaluation-snapshot-store";
import { ExportManifestBuilder } from "@/lib/services/export-manifest-builder";
import { ExportSnapshotCoordinator } from "@/lib/services/export-snapshot-coordinator";
import type { ExportManifestApiResponse } from "@/lib/types/research-export";

export const dynamic = "force-dynamic";

export async function POST() {
    try {
        const evaluationRecord = EvaluationSnapshotStore.persistCurrentRecord("export-snapshot");

        // Co-create priority-history snapshot on export (explicit write path)
        ExportSnapshotCoordinator.persistPrioritySnapshot();

        // Generate a fresh brief
        const brief = ResearchBriefGenerator.generateBrief();

        // Persist the brief as an artifact
        BriefingSnapshotWriter.write(brief);

        // Build the export manifest (includes SHA-256 hashes of all artifacts)
        const manifest = ExportManifestBuilder.build(brief, {
            evaluationRecordId: evaluationRecord.evaluationRecordId,
        });

        const response: ExportManifestApiResponse = {
            manifest,
            brief,
            exportedAt: manifest.exportedAt,
        };
        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to export research briefing:", error);
        return NextResponse.json(
            { error: "Failed to export research briefing" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Return the most recent manifest + brief if available
        const manifest = ExportManifestBuilder.getLatest();
        const brief = manifest ? BriefingSnapshotWriter.getById(manifest.briefId) : null;

        if (!manifest || !brief) {
            return NextResponse.json(
                { error: "No export manifest found. POST to this endpoint to generate one." },
                { status: 404 }
            );
        }

        const response: ExportManifestApiResponse = {
            manifest,
            brief,
            exportedAt: manifest.exportedAt,
        };
        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to retrieve export manifest:", error);
        return NextResponse.json(
            { error: "Failed to retrieve export manifest" },
            { status: 500 }
        );
    }
}
