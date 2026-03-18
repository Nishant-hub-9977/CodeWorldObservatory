"use client";

import { useEffect, useState } from "react";
import { ObservatoryPanel } from "./ObservatoryPanel";
import type { BenchmarkHarnessRun } from "@/lib/types/simulation";
import { Loader2 } from "lucide-react";

export function BenchmarkHarnessPanel() {
    const [benchmark, setBenchmark] = useState<BenchmarkHarnessRun | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/benchmarks")
            .then(res => res.json())
            .then(data => {
                if (data.benchmark) {
                    setBenchmark(data.benchmark);
                }
            })
            .catch(err => console.error("Failed to fetch benchmark", err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <ObservatoryPanel title="Benchmark Harness [Sim-Sessions]">
                <div className="flex h-32 items-center justify-center text-text-muted">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" />
                    Initializing simulation session...
                </div>
            </ObservatoryPanel>
        );
    }

    if (!benchmark) {
        return null;
    }

    return (
        <ObservatoryPanel title="Benchmark Harness [Sim-Sessions]">
            <div className="flex flex-col space-y-4 text-xs font-mono">

                {/* Header Status */}
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <div className="text-text-muted">Context: <span className="text-text-primary ml-2">{benchmark.objectiveHeader}</span></div>
                    <span className={`badge ${benchmark.overallEvidenceSufficiency === 'strong' ? 'badge-success' :
                            benchmark.overallEvidenceSufficiency === 'adequate' ? 'badge-warning' : 'badge-destructive'
                        }`}>
                        EVIDENCE: {benchmark.overallEvidenceSufficiency.toUpperCase()}
                    </span>
                </div>

                {/* Rankings */}
                <div className="space-y-3">
                    {benchmark.rankings.map((ranking) => {
                        const isStrongest = ranking.branchId === benchmark.strongestCandidateId;
                        const isBlocked = ranking.outcomeClass === "blocked-by-evidence" || ranking.outcomeClass === "governance-constrained";

                        return (
                            <div
                                key={ranking.branchId}
                                className={`p-3 rounded border ${isStrongest ? 'border-success/30 bg-success-soft' :
                                        isBlocked ? 'border-danger/30 bg-danger-soft opacity-70' :
                                            'border-border-subtle bg-surface-elevated'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-lg font-bold ${isStrongest ? 'text-success' : 'text-text-muted'}`}>
                                            #{ranking.rank}
                                        </span>
                                        <span className="text-text-primary">Branch {ranking.branchId}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${isBlocked ? 'bg-danger/20 text-danger' :
                                            ranking.outcomeClass.includes('favorable') ? 'bg-success/20 text-success' :
                                                'bg-warning/20 text-warning'
                                        }`}>
                                        {ranking.outcomeClass.replace(/-/g, ' ')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                                    <div>
                                        <span className="text-text-muted">Sim Score:</span>
                                        <span className="ml-2 text-text-primary">{(ranking.simulationScore * 100).toFixed(0)}</span>
                                    </div>
                                </div>

                                <div className="text-text-muted italic">
                                    "{ranking.comparativeRationale}"
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Harness Notes */}
                <div className="mt-2 pt-2 border-t border-border-subtle text-text-muted">
                    Harness Data: {benchmark.harnessNotes}
                </div>

            </div>
        </ObservatoryPanel>
    );
}



