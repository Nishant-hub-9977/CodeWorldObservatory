"use client";

import { useEffect, useState } from "react";
import type { LatentRepoState } from "@/lib/types/latent-state";
import { Layers, Activity, GitBranch, Shield, FileCheck, Gauge } from "lucide-react";
import { buildObservatoryKey } from "@/lib/utils/observatory-key";

export function LatentStatePanel() {
    const [state, setState] = useState<LatentRepoState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchState = async () => {
            try {
                const res = await fetch("/api/latent-state", { signal: controller.signal });
                if (!res.ok) {
                    const body = await res.text().catch(() => "");
                    throw new Error(body || `HTTP ${res.status}`);
                }
                const data = await res.json();
                setState(data.latentState);
            } catch (err: any) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };
        fetchState();
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

    if (error || !state) {
        return (
            <div className="rounded-lg border border-danger/30 bg-surface p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-danger font-mono text-sm max-w-md text-center">
                    GATING FAILURE: {error || "Unable to derive latent repo state."}
                </div>
            </div>
        );
    }

    const postureColor: Record<string, string> = {
        stable: "text-success bg-success-soft border-success/20",
        cautious: "text-warning bg-warning-soft border-warning/20",
        pressured: "text-warning bg-warning-soft border-warning/20",
        fragile: "text-danger bg-danger-soft border-danger/20",
    };

    const descriptors = [
        {
            icon: <Layers className="w-3.5 h-3.5" />,
            label: "Structural Complexity",
            value: state.complexity.posture,
            detail: state.complexity.rationale,
            metrics: [
                { k: "Files", v: state.complexity.totalFiles },
                { k: "Modules", v: state.complexity.moduleBoundaryCount },
                { k: "Avg Edges", v: state.complexity.averageEdgesPerFile },
                { k: "Deep Paths", v: state.complexity.deepNestingPaths },
            ],
        },
        {
            icon: <GitBranch className="w-3.5 h-3.5" />,
            label: "Dependency Pressure",
            value: state.dependencyPressure.level,
            detail: state.dependencyPressure.rationale,
            metrics: [
                { k: "Max Inbound", v: state.dependencyPressure.maxInboundEdges },
                { k: "Orphans", v: state.dependencyPressure.orphanFileCount },
                { k: "Concentration", v: `${(state.dependencyPressure.concentrationRatio * 100).toFixed(0)}%` },
            ],
        },
        {
            icon: <Activity className="w-3.5 h-3.5" />,
            label: "Validation Burden",
            value: state.validationBurden.level,
            detail: state.validationBurden.rationale,
            metrics: [
                { k: "Open Problems", v: state.validationBurden.openProblemsCount },
                { k: "Mutation Rate", v: state.validationBurden.recentMutationRate },
                { k: "Test Coverage", v: state.validationBurden.testCoverage ?? "N/A" },
            ],
        },
        {
            icon: <Shield className="w-3.5 h-3.5" />,
            label: "Governance Friction",
            value: state.governanceFriction.level,
            detail: state.governanceFriction.rationale,
            metrics: [
                { k: "Blockers", v: state.governanceFriction.activeBlockerCount },
                { k: "Constrained Rate", v: `${(state.governanceFriction.governanceConstrainedSessionRate * 100).toFixed(0)}%` },
            ],
        },
        {
            icon: <FileCheck className="w-3.5 h-3.5" />,
            label: "Evidence Sufficiency",
            value: state.evidenceSufficiency.posture,
            detail: state.evidenceSufficiency.rationale,
            metrics: [
                { k: "Benchmarks", v: state.evidenceSufficiency.totalBenchmarkRuns },
                { k: "Strong", v: `${(state.evidenceSufficiency.strongEvidenceRate * 100).toFixed(0)}%` },
                { k: "Insufficient", v: `${(state.evidenceSufficiency.insufficientEvidenceRate * 100).toFixed(0)}%` },
            ],
        },
    ];

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface">
                <div className="flex items-center space-x-3">
                    <Gauge className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                        Latent Structural State
                    </h2>
                </div>
                <span className={`px-2.5 py-1 rounded border font-mono text-xs uppercase ${postureColor[state.compositePosture] || "text-text-muted bg-surface-hover border-border-subtle"}`}>
                    {state.compositePosture}
                </span>
            </div>

            {/* Composite summary */}
            <div className="px-5 py-3 border-b border-border-subtle bg-surface-elevated">
                <p className="text-xs text-text-muted font-mono leading-relaxed">
                    {state.compositeRationale}
                </p>
            </div>

            {/* Descriptor grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-border-subtle">
                {descriptors.map((d) => (
                    <div key={buildObservatoryKey("latent-descriptor", d.label, d.value)} className="p-4 bg-surface-elevated hover:bg-surface-hover transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase">
                                {d.icon}
                                <span>{d.label}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-accent uppercase">
                                {d.value}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {d.metrics.map((m) => (
                                <div key={buildObservatoryKey("latent-descriptor-metric", d.label, m.k, m.v)} className="text-[9px] font-mono text-text-muted">
                                    <span className="text-text-primary/60">{m.k}:</span> {m.v}
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-text-muted/80 leading-relaxed">
                            {d.detail}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}



