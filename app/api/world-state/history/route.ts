import { NextResponse } from "next/server";
import { WorldStateCaptureService } from "@/lib/services/world-state-capture";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        return NextResponse.json(WorldStateCaptureService.getHistory());
    } catch (error) {
        console.error("Failed to read world-state history:", error);
        return NextResponse.json({ error: "Failed to read world-state history" }, { status: 500 });
    }
}