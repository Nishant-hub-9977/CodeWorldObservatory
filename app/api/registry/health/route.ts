import { NextResponse } from "next/server";
import { getRegistryHealth } from "@/lib/registry/health";

export async function GET() {
    const health = await getRegistryHealth();
    const status = health.configured && !health.connected ? 503 : 200;
    return NextResponse.json(health, { status });
}
