import { NextResponse } from "next/server";
import { ResearchTimelineBuilder } from "@/lib/services/research-timeline-builder";
import type { ResearchTimelineApiResponse } from "@/lib/types/research-timeline";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const timeline = ResearchTimelineBuilder.buildTimeline();
        const response: ResearchTimelineApiResponse = {
            timeline,
            generatedAt: timeline.generatedAt,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to build research timeline:", error);
        return NextResponse.json(
            { error: "Failed to build research timeline" },
            { status: 500 }
        );
    }
}