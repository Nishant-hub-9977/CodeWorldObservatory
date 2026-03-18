"use client";

import { useEffect, useState } from "react";
import type { ExperimentSessionRecord } from "@/lib/types/research-memory";
import { Database, Activity, Lock, TrendingUp, Filter, ShieldCheck } from "lucide-react";
import { buildObservatoryKey } from "@/lib/utils/observatory-key";

export function ResearchMemoryPanel() {
    const [memory, setMemory] = useState<ExperimentSessionRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchMemory = async () => {
            try {
                const res = await fetch("/api/research/memory", { signal: controller.signal });
                if (!res.ok) {
                    const body = await res.text().catch(() => "");
                    throw new Error(body || `HTTP ${res.status}`);
                }
                const data = await res.json();
                setMemory(data.memory);
            } catch (err: any) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };
        fetchMemory();
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

    if (error || !memory) {
        return (
            <div className="rounded-lg border border-danger/30 bg-surface p-6 flex items-center justify-center h-full min-h-[300px]">
                <div className="text-danger font-mono text-sm max-w-md text-center">
                    GATING FAILURE: {error || "Unable to load experiment memory."}
                </div>
            </div>
        );
    }

    const {
        totalSimulationSessions,
        recentSessions,
        evidenceCoverage,
        governanceConstraintPatterns,
        preferredStrategyTrends,
        calibrationTrend
    } = memory;

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface">
                <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                        Experiment Memory Layer
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded border font-mono text-xs text-accent bg-accent-soft border-accent/20">
                        {totalSimulationSessions} INDEXED RUNS
                    </span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left side: Timeline and Recent */}
                <div className="w-1/2 border-r border-border-subtle p-5 flex flex-col space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-4">
                            Recent Simulation Timeline
                        </h3>
                        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                            {recentSessions.map((session) => (
                                <div key={buildObservatoryKey("memory-session", session.sessionId)} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-4 h-4 rounded-full border border-border-subtle/80 bg-surface shrink-0 relative z-10 text-accent"></div>
                                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-md bg-surface-hover border border-border-subtle shadow">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-mono text-text-primary truncate max-w-[150px]">
                                                {session.objective}
                                            </span>
                                            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${session.outcome === "Executable" ? "bg-success-soft text-success border-success/20 text-xs" : "bg-danger-soft text-danger border border-danger/20"}`}>
                                                {session.outcome}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-text-muted font-mono">
                                            {new Date(session.timestamp).toLocaleTimeString()} - {session.simulatedBranches} branches simulated
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {recentSessions.length === 0 && (
                                <div className="text-sm font-mono text-text-muted italic">No prior sessions recorded.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Trends and Signals */}
                <div className="w-1/2 p-5 flex flex-col space-y-6 bg-surface-elevated overflow-y-auto">
                    {/* Calibration Signal */}
                    <div>
                        <h3 className="flex items-center space-x-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <Activity className="w-3 h-3" />
                            <span>Longitudinal Calibration</span>
                        </h3>
                        <div className="bg-surface-hover border border-border-subtle rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-text-primary font-mono">Structural Alignment Score</span>
                                <span className={`text-xs font-mono font-bold ${calibrationTrend.movement === "stable" ? "text-success" : calibrationTrend.movement === "improving" ? "text-accent" : "text-warning"}`}>
                                    {(calibrationTrend.alignmentScore * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full h-1 bg-surface-active rounded-full mb-2">
                                <div className="h-full bg-success rounded-full" style={{ width: `${calibrationTrend.alignmentScore * 100}%` }}></div>
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                {calibrationTrend.notes}
                            </p>
                        </div>
                    </div>

                    {/* Constraint Gating */}
                    <div>
                        <h3 className="flex items-center space-x-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <Filter className="w-3 h-3" />
                            <span>Recurring Governance Blockers</span>
                        </h3>
                        <div className="space-y-2">
                            {governanceConstraintPatterns.map((pattern) => (
                                <div key={buildObservatoryKey("memory-governance-pattern", pattern.category)} className="flex flex-col bg-surface-hover border border-border-subtle rounded p-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center space-x-2">
                                            <Lock className="w-3 h-3 text-danger" />
                                            <span className="text-[11px] font-mono text-text-primary">{pattern.category}</span>
                                        </div>
                                        <span className="text-[10px] text-text-muted bg-surface-hover px-2 py-0.5 rounded">
                                            {pattern.occurrences} instances
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Evidence Sufficiency */}
                    <div>
                        <h3 className="flex items-center space-x-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Evidence Sufficiency Distribution</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-surface-hover border border-success/20 rounded p-2 text-center">
                                <div className="text-success font-mono text-sm">{evidenceCoverage.strongEvidenceCount}</div>
                                <div className="text-[9px] text-text-muted uppercase font-bold mt-1">Strong</div>
                            </div>
                            <div className="bg-surface-hover border border-warning/20 rounded p-2 text-center">
                                <div className="text-warning font-mono text-sm">{evidenceCoverage.adequateEvidenceCount}</div>
                                <div className="text-[9px] text-text-muted uppercase font-bold mt-1">Adequate</div>
                            </div>
                            <div className="bg-surface-hover border border-danger/20 rounded p-2 text-center">
                                <div className="text-danger font-mono text-sm">{evidenceCoverage.insufficientEvidenceCount}</div>
                                <div className="text-[9px] text-text-muted uppercase font-bold mt-1">Insufficient</div>
                            </div>
                        </div>
                    </div>

                    {/* Preferred Strategy Trends */}
                    {preferredStrategyTrends.length > 0 && (
                        <div>
                            <h3 className="flex items-center space-x-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                                <TrendingUp className="w-3 h-3" />
                                <span>Strategy Selection Trends</span>
                            </h3>
                            <div className="space-y-2">
                                {preferredStrategyTrends.map((trend) => (
                                    <div key={buildObservatoryKey("memory-strategy-trend", trend.strategyClass)} className="bg-surface-hover border border-border-subtle rounded p-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[11px] font-mono text-text-primary">{trend.strategyClass}</span>
                                            <span className="text-[10px] font-mono text-accent">
                                                {(trend.selectionRate * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1 bg-surface-active rounded-full">
                                            <div className="h-full bg-accent rounded-full" style={{ width: `${trend.selectionRate * 100}%` }} />
                                        </div>
                                        <div className="text-[9px] text-text-muted mt-1">{trend.context}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



