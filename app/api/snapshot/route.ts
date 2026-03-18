// ─── /api/snapshot — World State Snapshot Endpoint ───────────────
// GET /api/snapshot
// Returns a typed RepoSnapshot + DependencyReport for the current workspace.
// Always returns JSON. Errors are structured, never silent.

import { NextResponse } from "next/server";
import path from "path";
import { captureRepoSnapshot } from "@/lib/services/world-state-capturer";
import { analyzeDependencies } from "@/lib/services/dependency-analyzer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
    try {
        const workspaceRoot = process.cwd();

        // Step 1: Walk repo and produce snapshot
        const snapshot = captureRepoSnapshot(workspaceRoot);

        // Step 2: Analyze TS/TSX dependencies from the snapshot nodes
        const dependencies = analyzeDependencies(snapshot.nodes, workspaceRoot);

        // Step 3: Build response
        const responseBody = {
            capturedAt: snapshot.capturedAt,
            workspaceRoot: path.basename(workspaceRoot), // basename only for privacy
            snapshot: {
                totalFiles: snapshot.totalFiles,
                totalDirectories: snapshot.totalDirectories,
                totalBytes: snapshot.totalBytes,
                extensions: snapshot.extensions,
                recentlyModified: snapshot.recentlyModified,
            },
            dependencies,
        };

        return NextResponse.json(responseBody, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const stack = err instanceof Error ? err.stack : undefined;

        console.error("[/api/snapshot] Capture failed:", message);

        return NextResponse.json(
            {
                error: "Snapshot capture failed",
                details: message,
                ...(process.env.NODE_ENV === "development" ? { stack } : {}),
            },
            { status: 500 },
        );
    }
}
