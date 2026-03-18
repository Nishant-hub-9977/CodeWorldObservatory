import { NextResponse } from "next/server";
import { ResearchBriefGenerator } from "@/lib/services/research-brief-generator";
import type { ResearchBriefApiResponse } from "@/lib/types/research-export";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const brief = ResearchBriefGenerator.generateBrief();
        const response: ResearchBriefApiResponse = {
            brief,
            generatedAt: brief.generatedAt,
        };
        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to generate research brief:", error);
        return NextResponse.json(
            { error: "Failed to generate research brief" },
            { status: 500 }
        );
    }
}
