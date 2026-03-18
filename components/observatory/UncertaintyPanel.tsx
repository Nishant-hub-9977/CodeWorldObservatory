"use client";

import { useState, useEffect } from "react";
import { ObservatoryPanel } from "./ObservatoryPanel";
import type { FuturesApiResponse } from "@/lib/types/future-state";
import { assertUniqueKeys, buildDerivedItemKey } from "@/lib/utils/observatory-key";

const SEVERITY_CONFIG = {
    low: { badge: "badge-verified", color: "rgb(var(--success))" },
    medium: { badge: "badge-caution", color: "rgb(var(--warning))" },
    high: { badge: "badge-risk", color: "rgb(var(--danger))" },
    extreme: { badge: "badge-risk", color: "rgb(var(--danger))" },
};

function LoadingState() {
    return (
        <ObservatoryPanel
            title="Uncertainty Surface"
            subtitle="Checking structural limits…"
            status="pending"
            badge="USF"
        >
            <p className="text-xs font-mono animate-pulse text-text-muted">
                Analyzing prediction confidence…
            </p>
        </ObservatoryPanel>
    );
}

function ErrorState({ msg }: { msg: string }) {
    return (
        <ObservatoryPanel
            title="Uncertainty Surface"
            subtitle="Uncertainty analysis failed"
            status="error"
            badge="USF"
        >
            <p className="text-xs font-mono text-danger">
                {msg}
            </p>
        </ObservatoryPanel>
    );
}

export function UncertaintyPanel() {
    const [data, setData] = useState<FuturesApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/futures", { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((body) => {
                        throw new Error(body?.error ?? `HTTP ${res.status}`);
                    });
                }
                return res.json();
            })
            .then((json: FuturesApiResponse) => {
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
    if (error || !data) return <ErrorState msg={error ?? "No data available"} />;

    // Extract all uncertainty signals from futures
    const allSignals = data.futures.flatMap(f => f.uncertainty.map(u => ({
        ...u,
        branchId: f.branchId,
        branchLabel: f.label,
    })));

    const renderKeys = allSignals.map(signal => buildDerivedItemKey(
        "uncertainty-panel-row",
        signal.branchId,
        signal.signalId,
        signal.level
    ));

    assertUniqueKeys("UncertaintyPanel.rows", renderKeys);

    // De-duplicate signals that are essentially identical across branches if any, but
    // since they have a branchLabel, let's just group them or render them linearly.
    const highCount = allSignals.filter((r) => r.level === "high" || r.level === "extreme").length;
    const mediumCount = allSignals.filter((r) => r.level === "medium").length;

    return (
        <ObservatoryPanel
            title="Uncertainty Surface"
            subtitle="Structural limits constraining prediction confidence"
            status={highCount > 0 ? "caution" : "active"}
            badge="USF"
        >
            {/* Summary */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex flex-col gap-0.5">
                    <span className="data-label">high risk</span>
                    <span className={`text-sm font-mono font-semibold ${highCount > 0 ? 'text-danger' : 'text-text-muted'}`}>
                        {highCount}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="data-label">medium risk</span>
                    <span className={`text-sm font-mono font-semibold ${mediumCount > 0 ? 'text-warning' : 'text-text-muted'}`}>
                        {mediumCount}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="data-label">low risk</span>
                    <span className="text-sm font-mono font-semibold text-text-muted">
                        {allSignals.filter((r) => r.level === "low").length}
                    </span>
                </div>
            </div>

            {/* Regions */}
            <div className="flex flex-col gap-2">
                {allSignals.map((signal) => {
                    const sc = SEVERITY_CONFIG[signal.level];
                    return (
                        <div
                            key={buildDerivedItemKey("uncertainty-panel-row", signal.branchId, signal.signalId, signal.level)}
                            className="flex flex-col gap-1.5 p-2.5 rounded bg-surface-hover border border-border-subtle"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="hash-text text-xs text-text-secondary">
                                    {signal.limitationSource}
                                </span>
                                <span className={`badge ${sc.badge}`}>{signal.level}</span>
                            </div>
                            <p className="text-xs leading-relaxed text-text-muted">
                                {signal.rationale}
                            </p>
                            <span className="hash-text mt-1 text-xs opacity-70">
                                Source: Branch {signal.branchLabel}
                            </span>
                            {signal.affectedSurfaces.length > 0 && (
                                <span className="hash-text text-xs opacity-70">
                                    Surfaces: {signal.affectedSurfaces.length > 2 ? `${signal.affectedSurfaces[0]}, ...+${signal.affectedSurfaces.length - 1}` : signal.affectedSurfaces.join(", ")}
                                </span>
                            )}
                        </div>
                    );
                })}
                {allSignals.length === 0 && (
                    <div className="p-3 text-center text-xs text-text-muted border border-dashed border-border-subtle rounded">
                        No significant uncertainty regions detected.
                    </div>
                )}
            </div>
        </ObservatoryPanel>
    );
}



