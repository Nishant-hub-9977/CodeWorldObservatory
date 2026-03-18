"use client";

import { useEffect, useState } from "react";
import { Activity, Gauge, Repeat2 } from "lucide-react";
import type { ExperimentRecord } from "@/lib/types/experiment-registry";

interface StatisticsPayload {
    statistics: {
        predictionAccuracy: {
            totalComparisons: number;
            weightedAccuracy: number;
            confidenceInterval: { lower: number; upper: number } | null;
            maturity: "none" | "early" | "developing" | "stable";
            note: string;
        };
        strategySuccessRates: Array<{
            strategy: string;
            totalRuns: number;
            successRate: number;
            confidenceInterval: { lower: number; upper: number } | null;
            maturity: "early" | "developing" | "stable";
            note: string;
        }>;
        caveat: string;
    };
}

interface ReplayPayload {
    replay: {
        experimentId: string;
        strategyBranch: string;
        replayability: "full" | "partial" | "insufficient-evidence";
        lineageStatus: "baseline-only" | "stored-evidence-chain" | "full-replay-package";
        linkedSessions: Array<{ id: string }>;
        linkedBenchmarks: Array<{ id: string }>;
        replayPackage: {
            lineageStatus: "baseline-only" | "stored-evidence-chain" | "full-replay-package";
            executionIds: string[];
        } | null;
        notes: string[];
    } | null;
    note?: string;
}

export function ResearchStatisticsPanel() {
    const [statistics, setStatistics] = useState<StatisticsPayload["statistics"] | null>(null);
    const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
    const [selectedExperimentId, setSelectedExperimentId] = useState("");
    const [replay, setReplay] = useState<ReplayPayload["replay"] | null>(null);
    const [note, setNote] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReplayLoading, setIsReplayLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBase = async () => {
        setError(null);
        try {
            const [statisticsResponse, experimentResponse] = await Promise.all([
                fetch("/api/research/statistics", { cache: "no-store" }),
                fetch("/api/experiments", { cache: "no-store" }),
            ]);

            if (!statisticsResponse.ok || !experimentResponse.ok) {
                throw new Error("Failed to load research statistics.");
            }

            const statisticsData = await statisticsResponse.json() as StatisticsPayload;
            const experimentData = await experimentResponse.json() as { experiments: ExperimentRecord[] };
            setStatistics(statisticsData.statistics);
            setExperiments(experimentData.experiments ?? []);
            setSelectedExperimentId(current => current || experimentData.experiments?.[0]?.experimentId || "");
        } catch (err: any) {
            setError(err.message ?? "Failed to load research statistics.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadBase();
    }, []);

    useEffect(() => {
        const loadReplay = async () => {
            if (!selectedExperimentId) {
                setReplay(null);
                setNote("Register an experiment to generate reproducibility summaries.");
                return;
            }

            setIsReplayLoading(true);
            try {
                const response = await fetch(`/api/research/replay?experimentId=${encodeURIComponent(selectedExperimentId)}`, { cache: "no-store" });
                if (!response.ok) {
                    const body = await response.text().catch(() => "");
                    throw new Error(body || "Failed to load replay summary.");
                }

                const payload = await response.json() as ReplayPayload;
                setReplay(payload.replay ?? null);
                setNote(payload.note ?? null);
            } catch (err: any) {
                setError(err.message ?? "Failed to load replay summary.");
            } finally {
                setIsReplayLoading(false);
            }
        };

        void loadReplay();
    }, [selectedExperimentId]);

    if (isLoading || !statistics) {
        return <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl animate-pulse"><div className="p-6 h-[420px] bg-surface-hover" /></div>;
    }

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-4 border-b border-border-subtle bg-surface flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-accent" />
                    <div>
                        <h2 className="text-lg font-mono font-bold text-text-primary">Research Statistics</h2>
                        <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Phase 14 · Reproducibility and deterministic evaluation</p>
                    </div>
                </div>
                <select value={selectedExperimentId} onChange={(event) => setSelectedExperimentId(event.target.value)} className="panel-input max-w-64">
                    <option value="">Select experiment</option>
                    {experiments.map(experiment => (
                        <option key={experiment.experimentId} value={experiment.experimentId}>{experiment.objective.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-0">
                <div className="p-5 border-r border-border-subtle bg-surface-elevated space-y-3">
                    <MetricCard
                        icon={<Gauge className="w-4 h-4" />}
                        label="Prediction Accuracy"
                        primary={`${(statistics.predictionAccuracy.weightedAccuracy * 100).toFixed(1)}% weighted alignment`}
                        detail={`${statistics.predictionAccuracy.totalComparisons} recorded comparisons · ${statistics.predictionAccuracy.maturity} sample`}
                        interval={statistics.predictionAccuracy.confidenceInterval}
                        note={statistics.predictionAccuracy.note}
                    />

                    <div className="rounded-md border border-warning/20 bg-warning-soft p-3 text-[11px] text-warning leading-relaxed">
                        {statistics.caveat}
                    </div>

                    <div className="rounded-md border border-border-subtle bg-surface-hover p-4">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Strategy Success Rates</p>
                        <div className="space-y-2">
                            {statistics.strategySuccessRates.length === 0 ? (
                                <p className="text-[11px] text-text-muted leading-relaxed">No simulation runs are available yet, so strategy rates remain undefined.</p>
                            ) : statistics.strategySuccessRates.map(rate => (
                                <div key={rate.strategy} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[11px] font-mono text-text-primary">{rate.strategy}</span>
                                        <span className="text-[10px] font-mono text-accent">{(rate.successRate * 100).toFixed(1)}%</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-1">{rate.totalRuns} runs</p>
                                    <p className="text-[10px] text-text-muted mt-1">maturity: {rate.maturity}</p>
                                    {rate.confidenceInterval && (
                                        <p className="text-[10px] text-text-muted mt-1">
                                            CI: {(rate.confidenceInterval.lower * 100).toFixed(1)}% - {(rate.confidenceInterval.upper * 100).toFixed(1)}%
                                        </p>
                                    )}
                                    <p className="text-[10px] text-text-muted mt-1">{rate.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-3 bg-surface-elevated">
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Repeat2 className="w-4 h-4 text-accent" />
                            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Evidence-Chain Replay Summary</p>
                        </div>

                        {isReplayLoading ? (
                            <p className="text-[11px] text-text-muted leading-relaxed">Reconstructing stored evidence chain...</p>
                        ) : replay ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono text-text-muted">
                                    <ReplayChip label="replayability" value={replay.replayability} />
                                    <ReplayChip label="lineage" value={replay.lineageStatus} />
                                    <ReplayChip label="package" value={replay.replayPackage?.lineageStatus ?? "absent"} />
                                </div>
                                <p className="text-[11px] text-text-muted">Strategy branch: <span className="text-text-primary">{replay.strategyBranch}</span></p>
                                <p className="text-[11px] text-text-muted">Linked sessions: <span className="text-text-primary">{replay.linkedSessions.length}</span></p>
                                <p className="text-[11px] text-text-muted">Linked benchmarks: <span className="text-text-primary">{replay.linkedBenchmarks.length}</span></p>
                                <p className="text-[11px] text-text-muted">Linked executions: <span className="text-text-primary">{replay.replayPackage?.executionIds.length ?? 0}</span></p>
                                <div className="space-y-2">
                                    {replay.notes.map((entry, idx) => (
                                        <div key={`replay-note-${selectedExperimentId}-${idx}`} className="rounded-md border border-border-subtle bg-surface-elevated p-3 text-[11px] text-text-muted leading-relaxed">
                                            {entry}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-[11px] text-text-muted leading-relaxed">{note ?? "Replay data is unavailable."}</p>
                        )}
                    </div>

                    {error && <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-[11px] text-danger">{error}</div>}
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    primary,
    detail,
    interval,
    note,
}: {
    icon: React.ReactNode;
    label: string;
    primary: string;
    detail: string;
    interval: { lower: number; upper: number } | null;
    note: string;
}) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-hover p-4">
            <div className="flex items-center gap-2 mb-2 text-accent">{icon}<span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{label}</span></div>
            <p className="text-sm font-mono text-text-primary">{primary}</p>
            <p className="text-[10px] text-text-muted mt-1">{detail}</p>
            {interval && <p className="text-[10px] text-text-muted mt-1">Wilson CI: {(interval.lower * 100).toFixed(1)}% - {(interval.upper * 100).toFixed(1)}%</p>}
            <p className="text-[10px] text-text-muted mt-1">{note}</p>
        </div>
    );
}

function ReplayChip({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-elevated p-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-text-muted">{label}</p>
            <p className="text-[11px] font-mono text-text-primary mt-1">{value}</p>
        </div>
    );
}


