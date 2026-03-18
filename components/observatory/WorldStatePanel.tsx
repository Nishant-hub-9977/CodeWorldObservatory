"use client";

// ─── WorldStatePanel — Phase 1: Live Repo-State ───────────────────
// Fetches real snapshot data from /api/snapshot.
// Displays actual workspace file structure and dependency signals.

import { useState, useEffect } from "react";
import { ObservatoryPanel } from "./ObservatoryPanel";
import type {
    ExtensionSummary,
    ConnectedFile,
    DependencyReport,
} from "@/lib/types/world-state";

// ─── API Response Shape ────────────────────────────────────────────

interface SnapshotResponse {
    capturedAt: string;
    workspaceRoot: string;
    snapshot: {
        totalFiles: number;
        totalDirectories: number;
        totalBytes: number;
        extensions: ExtensionSummary[];
        recentlyModified: Array<{
            path: string;
            extension: string;
            sizeBytes: number;
            lastModified: string;
        }>;
    };
    dependencies: DependencyReport;
}

// ─── Utility ──────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    } catch {
        return "—";
    }
}

function basename(p: string): string {
    return p.split("/").pop() ?? p;
}

// ─── Sub-components ───────────────────────────────────────────────

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="data-row">
            <span className="data-label">{label}</span>
            <span className="data-value">{value}</span>
        </div>
    );
}

function SectionLabel({ children }: { children: string }) {
    return (
        <p className="obs-text-label mt-4 mb-2">
            {children}
        </p>
    );
}

// ─── Loading state ────────────────────────────────────────────────

function LoadingState() {
    return (
        <ObservatoryPanel
            title="Current World State"
            subtitle="Capturing repo snapshot…"
            status="pending"
            badge="WS"
        >
            <div className="flex flex-col gap-2 text-text-muted text-xs">
                {["Scanning workspace…", "Reading file metadata…", "Analyzing imports…"].map(
                    (line) => (
                        <p key={line} className="font-mono animate-pulse">
                            {line}
                        </p>
                    ),
                )}
            </div>
        </ObservatoryPanel>
    );
}

// ─── Error state ──────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
    return (
        <ObservatoryPanel
            title="Current World State"
            subtitle="Snapshot capture failed"
            status="error"
            badge="WS"
        >
            <p className="text-xs font-mono mt-1 text-danger">
                {message}
            </p>
            <p className="text-xs mt-2 text-text-muted">
                Check the server logs or verify the workspace path is accessible.
            </p>
        </ObservatoryPanel>
    );
}

// ─── Main panel ───────────────────────────────────────────────────

export function WorldStatePanel() {
    const [data, setData] = useState<SnapshotResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/snapshot", { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((body) => {
                        throw new Error(body?.error ?? `HTTP ${res.status}`);
                    });
                }
                return res.json();
            })
            .then((json: SnapshotResponse) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                if ((err as Error).name === "AbortError") return;
                setError((err as Error).message ?? "Unknown error");
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    if (loading) return <LoadingState />;
    if (error || !data) return <ErrorState message={error ?? "No data returned"} />;

    const { snapshot, dependencies, capturedAt } = data;
    const tsxCount =
        (snapshot.extensions.find((e) => e.extension === ".tsx")?.fileCount ?? 0) +
        (snapshot.extensions.find((e) => e.extension === ".ts")?.fileCount ?? 0);

    const topExt = snapshot.extensions.slice(0, 6);

    return (
        <ObservatoryPanel
            title="Current World State"
            subtitle="Live repo snapshot — ground truth before any intervention"
            status="active"
            badge="WS"
        >
            {/* ─── Repository Surface ─────────────────────────── */}
            <SectionLabel>Repository Surface</SectionLabel>

            <DataRow label="workspace" value={data.workspaceRoot} />
            <DataRow label="total files" value={snapshot.totalFiles.toLocaleString()} />
            <DataRow label="total directories" value={snapshot.totalDirectories.toLocaleString()} />
            <DataRow label="total size" value={formatBytes(snapshot.totalBytes)} />

            <div className="data-row">
                <span className="data-label">captured at</span>
                <span className="hash-text">{formatTime(capturedAt)} UTC</span>
            </div>

            {/* ─── Structural Composition ─────────────────────── */}
            <SectionLabel>Structural Composition</SectionLabel>

            <div className="flex flex-col gap-0">
                {topExt.map((ext) => (
                    <div
                        key={ext.extension}
                        className="flex items-center justify-between py-1 border-b border-surface-hover text-[0.72rem]"
                    >
                        <span className="font-mono text-accent min-w-[60px]">
                            {ext.extension}
                        </span>
                        <span className="text-text-secondary">
                            {ext.fileCount} file{ext.fileCount !== 1 ? "s" : ""}
                        </span>
                        <span className="font-mono text-text-muted text-[0.65rem]">
                            {formatBytes(ext.totalBytes)}
                        </span>
                    </div>
                ))}
            </div>

            {tsxCount > 0 && (
                <div className="data-row mt-1">
                    <span className="data-label">typescript presence</span>
                    <span className="badge badge-signal">{tsxCount} TS/TSX</span>
                </div>
            )}

            {/* ─── Dependency Signals ──────────────────────────── */}
            {dependencies.analyzedFileCount > 0 && (
                <>
                    <SectionLabel>Dependency Signals</SectionLabel>

                    <div className="data-row">
                        <span className="data-label">analyzed files</span>
                        <span className="data-value">{dependencies.analyzedFileCount}</span>
                    </div>
                    <div className="data-row">
                        <span className="data-label">import edges</span>
                        <span className="data-value">{dependencies.edges.length}</span>
                    </div>

                    {dependencies.mostConnected.filter((f) => f.total > 0).length > 0 && (
                        <>
                            <p className="data-label mt-3 mb-1 text-text-muted">
                                most connected
                            </p>
                            <div className="flex flex-col gap-0">
                                {dependencies.mostConnected
                                    .filter((f: ConnectedFile) => f.total > 0)
                                    .slice(0, 4)
                                    .map((f: ConnectedFile) => (
                                        <div
                                            key={f.path}
                                            className="flex items-center justify-between py-1 border-b border-surface-hover text-[0.7rem]"
                                        >
                                            <span
                                                className="font-mono truncate text-text-secondary max-w-[160px]"
                                                title={f.path}
                                            >
                                                {basename(f.path)}
                                            </span>
                                            <span className="text-text-muted text-[0.65rem]">
                                                ↓{f.inbound} ↑{f.outbound}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}

                    {dependencies.orphanCandidates.length > 0 && (
                        <div className="data-row mt-1">
                            <span className="data-label">orphan candidates</span>
                            <span className="data-value text-danger">
                                {dependencies.orphanCandidates.length} file
                                {dependencies.orphanCandidates.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </>
            )}

            {/* ─── Recent Change Activity ──────────────────────── */}
            {snapshot.recentlyModified.length > 0 && (
                <>
                    <SectionLabel>Recent Change Activity</SectionLabel>
                    <div className="flex flex-col gap-0">
                        {snapshot.recentlyModified.slice(0, 5).map((f) => (
                            <div
                                key={f.path}
                                className="flex items-center justify-between py-1 border-b border-surface-hover text-[0.7rem]"
                            >
                                <span
                                    className="font-mono truncate text-text-secondary max-w-[160px]"
                                    title={f.path}
                                >
                                    {basename(f.path)}
                                </span>
                                <span className="font-mono text-text-muted text-[0.6rem]">
                                    {formatTime(f.lastModified)}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ─── Observability Notes ─────────────────────────── */}
            <SectionLabel>Observability Notes</SectionLabel>
            <p className="text-xs leading-relaxed text-text-muted">
                Live workspace sensing active. Local import edges tracked for TS/TSX only.
                SHA-256 digests computed for files ≤ 1 MB. All observatory panels consume
                live data from their respective API routes.
            </p>
        </ObservatoryPanel>
    );
}



