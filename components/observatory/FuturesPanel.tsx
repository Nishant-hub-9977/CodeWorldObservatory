"use client";

import { useState, useEffect } from "react";
import { ObservatoryPanel } from "./ObservatoryPanel";
import type { FuturesApiResponse } from "@/lib/types/future-state";

const READINESS_CLASSES: Record<string, string> = {
    "ready": "text-success",
    "needs-review": "text-warning",
    "blocked": "text-danger",
};

export function FuturesPanel() {
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

    if (loading) {
        return (
            <ObservatoryPanel
                title="Counterfactual Futures"
                subtitle="Generating consequence projections…"
                status="pending"
                badge="CF"
            >
                <p className="text-xs font-mono animate-pulse text-text-muted">
                    Predicting branch outcomes…
                </p>
            </ObservatoryPanel>
        );
    }

    if (error || !data) {
        return (
            <ObservatoryPanel
                title="Counterfactual Futures"
                subtitle="Prediction failed"
                status="error"
                badge="CF"
            >
                <p className="text-xs font-mono text-danger">
                    {error ?? "No data available"}
                </p>
            </ObservatoryPanel>
        );
    }

    const { summary, futures } = data;

    return (
        <ObservatoryPanel
            title="Counterfactual Futures"
            subtitle="Consequences projected before any write is executed"
            status="active"
            badge="CF"
        >
            <div className="flex flex-col gap-2 mb-1">
                <div className="data-row">
                    <span className="data-label">branches projected</span>
                    <span className="data-value">{summary.totalBranches}</span>
                </div>
                <div className="data-row">
                    <span className="data-label">recommended</span>
                    <span className="data-value text-accent">
                        {futures.find((b) => b.branchId === summary.recommendedPathId)?.label ?? "—"}
                    </span>
                </div>
                <div className="data-row">
                    <span className="data-label">overall readiness</span>
                    <span className={`data-value ${READINESS_CLASSES[summary.overallExecutionReadiness] || 'text-text-muted'}`}>
                        {summary.overallExecutionReadiness}
                    </span>
                </div>
            </div>

            {/* Branch cards */}
            <div className="flex flex-col gap-3 mt-2">
                {futures.map((branch) => {
                    const isRecommended = branch.branchId === summary.recommendedPathId;
                    return (
                        <div
                            key={branch.branchId}
                            className={`flex flex-col gap-2 p-3 rounded-md border ${
                                isRecommended
                                    ? "bg-accent-soft border-accent/18"
                                    : "bg-surface-hover border-border-subtle"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold flex items-center gap-2 text-text-primary">
                                    <span
                                        className={`font-mono flex flex-shrink-0 items-center justify-center w-5 h-5 rounded text-[10px] border ${
                                            isRecommended
                                                ? "bg-accent/18 text-accent border-accent/30"
                                                : "bg-surface-active text-text-muted border-border-muted"
                                        }`}
                                    >
                                        {branch.label}
                                    </span>
                                    {branch.outlook}
                                </p>
                                {isRecommended && (
                                    <span className="badge badge-signal">Recommended</span>
                                )}
                            </div>

                            <p className="text-xs leading-relaxed text-text-secondary">
                                {branch.summary}
                            </p>

                            <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center justify-between">
                                    <span className="data-label">est. effort</span>
                                    <span className="text-xs font-mono text-text-secondary">
                                        {branch.impact.estimatedTime}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="data-label">validation burden</span>
                                    <span className="text-xs font-mono text-text-muted">
                                        {branch.impact.validationBurden}
                                    </span>
                                </div>
                            </div>

                            {branch.likelyTouchedSurfaces.length > 0 && (
                                <div className="mt-1">
                                    <span className="data-label block mb-1">likely affected surfaces</span>
                                    <div className="flex flex-wrap gap-1">
                                        {branch.likelyTouchedSurfaces.map((s, idx) => (
                                            <span key={`${branch.branchId}-surface-${idx}`} className="hash-text px-1.5 py-0.5 rounded bg-surface-hover">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {branch.impact.instabilityZones.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1.5 p-2 rounded bg-danger-soft/30">
                                    <span className="status-dot flex-shrink-0 bg-danger" />
                                    <span className="text-xs font-mono text-danger leading-relaxed">
                                        fragile zones: {branch.impact.instabilityZones.join(", ")}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </ObservatoryPanel>
    );
}



