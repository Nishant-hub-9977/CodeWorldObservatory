import { NextResponse } from "next/server";
import { ResearchTimelineBuilder } from "@/lib/services/research-timeline-builder";
import type { ResearchTimelineExportApiResponse } from "@/lib/types/research-timeline";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const timeline = ResearchTimelineBuilder.buildTimeline();
        const response: ResearchTimelineExportApiResponse = {
            timeline,
            narrativeSummary: ResearchTimelineBuilder.buildNarrativeSummary(timeline),
            exportedAt: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to export research timeline:", error);
        return NextResponse.json(
            { error: "Failed to export research timeline" },
            { status: 500 }
        );
    }
}