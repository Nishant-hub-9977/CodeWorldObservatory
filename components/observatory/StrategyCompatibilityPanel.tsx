"use client";

import { useEffect, useState } from "react";
import type { StrategyCompatibilityAssessment } from "@/lib/types/latent-state";
import { Compass, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { buildObservatoryKey } from "@/lib/utils/observatory-key";

export function StrategyCompatibilityPanel() {
    const [assessments, setAssessments] = useState<StrategyCompatibilityAssessment[]>([]);
    const [latentStateId, setLatentStateId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const res = await fetch("/api/strategy-compatibility", { signal: controller.signal });
                if (!res.ok) {
                    const body = await res.text().catch(() => "");
                    throw new Error(body || `HTTP ${res.status}`);
                }
                const data = await res.json();
                setAssessments(data.assessments);
                setLatentStateId(data.latentStateId);
            } catch (err: any) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };
        fetchData();
        return () => controller.abort();
    }, []);

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl animate-pulse">
                <div className="p-4 border-b border-border-subtle bg-surface-hover h-14" />
                <div className="p-6 h-64 bg-surface-hover" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-danger/30 bg-surface p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-danger font-mono text-sm max-w-md text-center">
                    GATING FAILURE: {error}
                </div>
            </div>
        );
    }

    const compatibilityStyles: Record<string, { icon: React.ReactNode; badge: string }> = {
        favorable: {
            icon: <CheckCircle className="w-4 h-4 text-success" />,
            badge: "text-success bg-success-soft border-success/20",
        },
        "viable-with-review": {
            icon: <AlertTriangle className="w-4 h-4 text-warning" />,
            badge: "text-warning bg-warning-soft border-warning/20",
        },
        "structurally-misaligned": {
            icon: <XCircle className="w-4 h-4 text-danger" />,
            badge: "text-danger bg-danger-soft border-danger/20",
        },
    };

    // Sort: favorable first, then viable-with-review, then misaligned
    const sorted = [...assessments].sort(
        (a, b) => b.suitabilityScore - a.suitabilityScore
    );

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface">
                <div className="flex items-center space-x-3">
                    <Compass className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                        Strategy Compatibility Matrix
                    </h2>
                </div>
                <span className="px-2 py-0.5 rounded border font-mono text-xs text-text-muted bg-surface-hover border-border-subtle">
                    {sorted.length} strategies assessed
                </span>
            </div>

            {/* Strategy cards */}
            <div className="divide-y divide-border-subtle">
                {sorted.map((assessment) => {
                    const style = compatibilityStyles[assessment.compatibility] || compatibilityStyles["viable-with-review"];
                    return (
                        <div key={assessment.strategy} className="p-4 bg-surface-elevated hover:bg-surface-hover transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    {style.icon}
                                    <span className="text-sm font-mono font-bold text-text-primary">
                                        {assessment.strategy}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-mono text-accent">
                                        {(assessment.suitabilityScore * 100).toFixed(0)}%
                                    </span>
                                    <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono ${style.badge}`}>
                                        {assessment.compatibility}
                                    </span>
                                </div>
                            </div>

                            {/* Suitability bar */}
                            <div className="w-full h-1 bg-surface-active rounded-full mb-3">
                                <div
                                    className={`h-full rounded-full ${
                                        assessment.compatibility === "favorable"
                                            ? "bg-success"
                                            : assessment.compatibility === "viable-with-review"
                                            ? "bg-warning"
                                            : "bg-danger"
                                    }`}
                                    style={{ width: `${assessment.suitabilityScore * 100}%` }}
                                />
                            </div>

                            <p className="text-[11px] text-text-muted leading-relaxed mb-2">
                                {assessment.reasoning}
                            </p>

                            {assessment.keyFactors.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {assessment.keyFactors.map((factor) => (
                                        <span
                                            key={buildObservatoryKey("strategy-factor", assessment.strategy, factor)}
                                            className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text-muted bg-surface-hover border border-border-subtle"
                                        >
                                            {factor}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {assessments.length === 0 && (
                <div className="p-8 text-center text-sm font-mono text-text-muted italic">
                    No strategy assessments available. Latent state derivation may have failed.
                </div>
            )}
        </div>
    );
}



