import { NextResponse } from "next/server";
import { TransitionPatternAnalyzer } from "@/lib/services/transition-pattern-analyzer";
import type { TransitionPatternsApiResponse } from "@/lib/types/latent-state";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { patterns, totalSessionsAnalyzed } = TransitionPatternAnalyzer.analyze();

        const response: TransitionPatternsApiResponse = {
            patterns,
            totalSessionsAnalyzed,
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Failed to analyze transition patterns:", error);
        return NextResponse.json(
            { error: "Failed to analyze transition patterns" },
            { status: 500 }
        );
    }
}
