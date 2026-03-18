import { NextResponse } from "next/server";
import { StatisticalEvaluator } from "@/lib/services/statistical-evaluator";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        return NextResponse.json({
            statistics: StatisticalEvaluator.summarize(),
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Failed to evaluate research statistics:", error);
        return NextResponse.json({ error: "Failed to evaluate research statistics" }, { status: 500 });
    }
}