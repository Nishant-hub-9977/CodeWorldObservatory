"use client";

import { useEffect, useState } from "react";
import type { TransitionPatternRecord } from "@/lib/types/latent-state";
import { Repeat, TrendingUp, AlertCircle } from "lucide-react";

export function TransitionPatternsPanel() {
    const [patterns, setPatterns] = useState<TransitionPatternRecord[]>([]);
    const [totalSessions, setTotalSessions] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const res = await fetch("/api/transition-patterns", { signal: controller.signal });
                if (!res.ok) {
                    const body = await res.text().catch(() => "");
                    throw new Error(body || `HTTP ${res.status}`);
                }
                const data = await res.json();
                setPatterns(data.patterns);
                setTotalSessions(data.totalSessionsAnalyzed);
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

    const confidenceStyle: Record<string, string> = {
        high: "text-success bg-success-soft border-success/20",
        medium: "text-warning bg-warning-soft border-warning/20",
        low: "text-text-muted bg-surface-hover border-border-subtle",
    };

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface">
                <div className="flex items-center space-x-3">
                    <Repeat className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                        Transition Pattern Memory
                    </h2>
                </div>
                <span className="px-2 py-0.5 rounded border font-mono text-xs text-accent bg-accent-soft border-accent/20">
                    {totalSessions} SESSIONS ANALYZED
                </span>
            </div>

            {patterns.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
                    <AlertCircle className="w-6 h-6 text-text-muted mb-3" />
                    <p className="text-sm font-mono text-text-muted">
                        No transition patterns detected.
                    </p>
                    <p className="text-[10px] text-text-muted/60 mt-1">
                        Patterns emerge after multiple simulation sessions are recorded.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-border-subtle">
                    {patterns.map((pattern) => (
                        <div key={pattern.patternId} className="p-4 bg-surface-elevated hover:bg-surface-hover transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                                    <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
                                        {pattern.patternId}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-mono text-text-muted">
                                        {pattern.occurrences}x
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase font-mono ${confidenceStyle[pattern.confidence]}`}>
                                        {pattern.confidence}
                                    </span>
                                </div>
                            </div>

                            <p className="text-[11px] text-text-muted leading-relaxed mb-3">
                                {pattern.description}
                            </p>

                            {/* Latent condition tags */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text-primary/60 bg-surface-hover border border-border-subtle">
                                    complexity: {pattern.latentConditions.complexityPosture}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text-primary/60 bg-surface-hover border border-border-subtle">
                                    pressure: {pattern.latentConditions.pressureLevel}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text-primary/60 bg-surface-hover border border-border-subtle">
                                    friction: {pattern.latentConditions.frictionLevel}
                                </span>
                            </div>

                            <div className="flex items-center space-x-4 text-[9px] font-mono text-text-muted">
                                <span>
                                    <span className="text-text-primary/50">Strategy:</span>{" "}
                                    <span className="text-accent">{pattern.dominantStrategy}</span>
                                </span>
                                <span>
                                    <span className="text-text-primary/50">Outcome:</span>{" "}
                                    {pattern.dominantOutcome}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}



