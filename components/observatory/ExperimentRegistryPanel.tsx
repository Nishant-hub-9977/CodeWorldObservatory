"use client";

import { useEffect, useState } from "react";
import { FlaskConical, DatabaseZap, Orbit, Repeat2, Shield } from "lucide-react";
import type { ExperimentDetailResponse, ExperimentRecord, WorldStateSnapshotRecord } from "@/lib/types/experiment-registry";
import type { ComparativeGovernanceSynthesis } from "@/lib/types/governance-synthesis";
import { POSTURE_LABELS } from "@/lib/constants/governance";
import { OBSERVATORY_REGISTRY_SUBTITLE, OBSERVATORY_STATUS_BADGE } from "@/lib/constants/observatory-status";
import { assertUniqueKeys, buildObservatoryKey } from "@/lib/utils/observatory-key";

interface ExperimentResponse {
    experiments: ExperimentRecord[];
}

interface SnapshotResponse {
    snapshots: WorldStateSnapshotRecord[];
}

const INITIAL_FORM = {
    objectiveTitle: "",
    objectiveSummary: "",
    targetFiles: "",
    hypothesisStatement: "",
    expectedSignal: "",
    successCriteria: "",
    strategy: "minimal-touch",
};

export function ExperimentRegistryPanel() {
    const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
    const [snapshots, setSnapshots] = useState<WorldStateSnapshotRecord[]>([]);
    const [selectedExperimentId, setSelectedExperimentId] = useState("");
    const [experimentDetail, setExperimentDetail] = useState<ExperimentDetailResponse | null>(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [captureExperimentId, setCaptureExperimentId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [governanceSynthesis, setGovernanceSynthesis] = useState<ComparativeGovernanceSynthesis | null>(null);

    const load = async () => {
        setError(null);
        try {
            const [experimentResponse, snapshotResponse, synthesisResponse] = await Promise.all([
                fetch("/api/experiments", { cache: "no-store" }),
                fetch("/api/world-state/history", { cache: "no-store" }),
                fetch("/api/research/governance-synthesis", { cache: "no-store" }),
            ]);

            if (!experimentResponse.ok || !snapshotResponse.ok) {
                throw new Error("Failed to load experiment registry surfaces.");
            }

            const experimentData = await experimentResponse.json() as ExperimentResponse;
            const snapshotData = await snapshotResponse.json() as SnapshotResponse;
            setExperiments(experimentData.experiments ?? []);
            setSnapshots(snapshotData.snapshots ?? []);
            if (synthesisResponse.ok) {
                const synthesisData = await synthesisResponse.json();
                setGovernanceSynthesis(synthesisData.synthesis ?? null);
            }
            setSelectedExperimentId(current => {
                const nextExperiments = experimentData.experiments ?? [];
                return nextExperiments.some(experiment => experiment.experimentId === current)
                    ? current
                    : nextExperiments[0]?.experimentId ?? "";
            });
        } catch (err: any) {
            setError(err.message ?? "Failed to load experiment registry.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        const loadDetail = async () => {
            if (!selectedExperimentId) {
                setExperimentDetail(null);
                return;
            }

            setIsDetailLoading(true);
            try {
                const response = await fetch(`/api/experiments/${encodeURIComponent(selectedExperimentId)}`, { cache: "no-store" });
                if (!response.ok) {
                    const body = await response.text().catch(() => "");
                    throw new Error(body || "Failed to load experiment detail.");
                }

                const detail = await response.json() as ExperimentDetailResponse;
                setExperimentDetail(detail);
            } catch (err: any) {
                setError(err.message ?? "Failed to load experiment detail.");
            } finally {
                setIsDetailLoading(false);
            }
        };

        void loadDetail();
    }, [selectedExperimentId]);

    const submitExperiment = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/experiments/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                const body = await response.text().catch(() => "");
                throw new Error(body || "Failed to register experiment.");
            }

            setForm(INITIAL_FORM);
            await load();
        } catch (err: any) {
            setError(err.message ?? "Failed to register experiment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const captureSnapshot = async () => {
        setIsCapturing(true);
        setError(null);
        try {
            const query = captureExperimentId ? `?experimentId=${encodeURIComponent(captureExperimentId)}` : "";
            const response = await fetch(`/api/world-state/snapshot${query}`, { cache: "no-store" });
            if (!response.ok) {
                const body = await response.text().catch(() => "");
                throw new Error(body || "Failed to capture world state.");
            }
            await load();
        } catch (err: any) {
            setError(err.message ?? "Failed to capture world state.");
        } finally {
            setIsCapturing(false);
        }
    };

    if (isLoading) {
        return <SkeletonPanel />;
    }

    assertUniqueKeys(
        "ExperimentRegistryPanel.experiments",
        experiments.map(experiment => buildObservatoryKey("registry-experiment", experiment.experimentId))
    );

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-4 border-b border-border-subtle bg-surface flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <FlaskConical className="w-5 h-5 text-accent" />
                    <div>
                        <h2 className="text-lg font-mono font-bold text-text-primary">Experiment Registry</h2>
                        <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                            {OBSERVATORY_STATUS_BADGE} · {OBSERVATORY_REGISTRY_SUBTITLE}
                        </p>
                    </div>
                </div>
                <div className="text-right text-[10px] font-mono text-text-muted">
                    <div>{experiments.length} experiments</div>
                    <div>{snapshots.length} snapshots</div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-0">
                <div className="p-5 border-r border-border-subtle bg-surface-elevated">
                    <form onSubmit={submitExperiment} className="space-y-3">
                        <PanelLabel title="Register New Experiment" detail="Objective, hypothesis, and success conditions are explicit artifacts." />
                        <input value={form.objectiveTitle} onChange={(event) => setForm(current => ({ ...current, objectiveTitle: event.target.value }))} placeholder="Objective title" className="panel-input" />
                        <textarea value={form.objectiveSummary} onChange={(event) => setForm(current => ({ ...current, objectiveSummary: event.target.value }))} placeholder="Objective summary" className="panel-input min-h-20" />
                        <input value={form.targetFiles} onChange={(event) => setForm(current => ({ ...current, targetFiles: event.target.value }))} placeholder="Target files, comma separated" className="panel-input" />
                        <textarea value={form.hypothesisStatement} onChange={(event) => setForm(current => ({ ...current, hypothesisStatement: event.target.value }))} placeholder="Hypothesis statement" className="panel-input min-h-20" />
                        <input value={form.expectedSignal} onChange={(event) => setForm(current => ({ ...current, expectedSignal: event.target.value }))} placeholder="Expected signal" className="panel-input" />
                        <input value={form.successCriteria} onChange={(event) => setForm(current => ({ ...current, successCriteria: event.target.value }))} placeholder="Success criteria" className="panel-input" />
                        <select value={form.strategy} onChange={(event) => setForm(current => ({ ...current, strategy: event.target.value }))} className="panel-input">
                            <option value="minimal-touch">minimal-touch</option>
                            <option value="service-first">service-first</option>
                            <option value="route-first">route-first</option>
                            <option value="ui-first">ui-first</option>
                            <option value="structural-refactor">structural-refactor</option>
                        </select>

                        <div className="rounded-md border border-border-subtle bg-surface-elevated p-3 space-y-3">
                            <PanelLabel title="Historical State Capture" detail="Persist a structural baseline snapshot, optionally linked to an experiment. This records repo state; it does not infer historical diffs or replay later changes." />
                            <select value={captureExperimentId} onChange={(event) => setCaptureExperimentId(event.target.value)} className="panel-input">
                                <option value="">Capture global snapshot</option>
                                {experiments.map(experiment => (
                                    <option key={buildObservatoryKey("registry-capture-option", experiment.experimentId)} value={experiment.experimentId}>{experiment.objective.title}</option>
                                ))}
                            </select>
                            <button type="button" onClick={captureSnapshot} disabled={isCapturing} className="panel-button-secondary w-full">
                                {isCapturing ? "Capturing..." : "Capture World-State Snapshot"}
                            </button>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="panel-button-primary w-full">
                            {isSubmitting ? "Registering..." : "Register Experiment"}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-3 rounded-md border border-danger/30 bg-danger-soft p-3 text-[11px] text-danger">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-5 space-y-3 bg-surface-elevated">
                    <PanelLabel title="Experiment Detail Surface" detail="Evidence-first detail reflects persisted lineage, replay maturity, and caveats without mutating state." />
                    {experiments.length === 0 ? (
                        <EmptyNote message="No experiments have been registered yet. Register one before building datasets, replay packages, or scenario assignments." />
                    ) : (
                        <div className="space-y-3">
                            <select value={selectedExperimentId} onChange={(event) => setSelectedExperimentId(event.target.value)} className="panel-input">
                                {experiments.map(experiment => (
                                    <option key={buildObservatoryKey("registry-detail-option", experiment.experimentId)} value={experiment.experimentId}>{experiment.objective.title}</option>
                                ))}
                            </select>

                            {isDetailLoading ? (
                                <EmptyNote message="Loading persisted experiment detail..." />
                            ) : experimentDetail ? (
                                <div className="space-y-3">
                                    <div className="rounded-md border border-border-subtle bg-surface-elevated p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-mono font-bold text-text-primary">{experimentDetail.experiment.objective.title}</p>
                                                <p className="text-[10px] text-text-muted leading-relaxed mt-1">{experimentDetail.experiment.objective.summary}</p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded border border-accent/20 bg-accent-soft text-[9px] font-mono uppercase text-accent">
                                                {experimentDetail.experiment.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px] font-mono text-text-muted">
                                            <StatChip icon={<Orbit className="w-3 h-3" />} label="strategy" value={experimentDetail.experiment.strategy} />
                                            <StatChip icon={<Repeat2 className="w-3 h-3" />} label="replay" value={experimentDetail.replay.replayability} />
                                            <StatChip icon={<DatabaseZap className="w-3 h-3" />} label="lineage" value={experimentDetail.replay.lineageStatus} />
                                            <StatChip icon={<FlaskConical className="w-3 h-3" />} label="dataset" value={experimentDetail.dataset?.datasetId ?? "absent"} />
                                        </div>

                                        <p className="text-[10px] text-text-muted">
                                            Created {new Date(experimentDetail.experiment.createdAt).toLocaleString()} · updated {new Date(experimentDetail.experiment.updatedAt).toLocaleString()}
                                        </p>

                                        <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Hypothesis</p>
                                            <p className="text-[11px] text-text-primary leading-relaxed">{experimentDetail.experiment.hypothesis.statement}</p>
                                            <p className="text-[10px] text-text-muted mt-2">Expected signal: {experimentDetail.experiment.hypothesis.expectedSignal}</p>
                                            <p className="text-[10px] text-text-muted">Success criteria: {experimentDetail.experiment.hypothesis.successCriteria}</p>
                                        </div>

                                        <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Evidence Chain</p>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] font-mono text-text-muted">
                                                <DetailChip label="snapshots" value={experimentDetail.snapshots.length} />
                                                <DetailChip label="simulations" value={experimentDetail.simulations.length} />
                                                <DetailChip label="benchmarks" value={experimentDetail.benchmarks.length} />
                                                <DetailChip label="executions" value={experimentDetail.executions.length} />
                                                <DetailChip label="packages" value={experimentDetail.replayPackages.length} />
                                            </div>
                                        </div>

                                        <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Comparative Evaluation</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-text-muted mb-3">
                                                <DetailChip label="weight" value={experimentDetail.evaluation.comparativeWeightLabel} />
                                                <DetailChip label="confidence" value={experimentDetail.evaluation.comparativeConfidence} />
                                                <DetailChip label="evidence" value={experimentDetail.evaluation.evidenceCompleteness} />
                                                <DetailChip label="empirical depth" value={experimentDetail.evaluation.empiricalDepth} />
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-text-muted mb-3">
                                                <DetailChip label="rank" value={experimentDetail.evaluation.portfolioRank ?? "-"} />
                                                <DetailChip label="portfolio" value={experimentDetail.evaluation.totalComparedExperiments} />
                                                <DetailChip label="limit" value={experimentDetail.evaluation.comparisonLimitation} />
                                                <DetailChip label="support" value={experimentDetail.evaluation.executionSupport} />
                                            </div>
                                            <p className="text-[11px] text-text-muted leading-relaxed">{experimentDetail.evaluation.rationale}</p>
                                            {experimentDetail.evaluation.leadingComparison && (
                                                <div className="rounded-md border border-border-subtle bg-surface-elevated p-3 mt-3 text-[10px] text-text-muted">
                                                    <p className="font-mono text-text-primary mb-1">Closest comparison: {experimentDetail.evaluation.leadingComparison.comparedExperimentTitle}</p>
                                                    <p>{experimentDetail.evaluation.leadingComparison.rationale}</p>
                                                </div>
                                            )}
                                            {experimentDetail.evaluation.missingEvidenceClasses.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {experimentDetail.evaluation.missingEvidenceClasses.map(missingEvidence => (
                                                        <span key={buildObservatoryKey("registry-missing-evidence", experimentDetail.experiment.experimentId, missingEvidence)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono bg-warning-soft text-warning border border-warning/20">
                                                            missing: {missingEvidence}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <EvidenceSection
                                        title="Snapshots"
                                        emptyMessage="No baseline snapshot is linked to this experiment."
                                        entries={experimentDetail.snapshots.slice(0, 3).map(snapshot => ({
                                            id: snapshot.snapshotId,
                                            summary: `${new Date(snapshot.timestamp).toLocaleString()} · ${snapshot.workspaceSummary.totalFiles} files · ${snapshot.dependencyMap.edges.length} dependency edges`,
                                            note: "Structural baseline only. This snapshot does not imply a replayable historical diff.",
                                        }))}
                                    />

                                    <EvidenceSection
                                        title="Simulations"
                                        emptyMessage="No experiment-linked simulation sessions are present."
                                        entries={experimentDetail.simulations.slice(0, 3).map(simulation => ({
                                            id: simulation.id,
                                            summary: `${new Date(simulation.simulatedAt).toLocaleString()} · ${simulation.status} · ${simulation.branchCount} branches`,
                                            note: `Baseline reference: ${simulation.baselineWorldStateId}`,
                                        }))}
                                    />

                                    <EvidenceSection
                                        title="Benchmarks"
                                        emptyMessage="No experiment-linked benchmark runs are present."
                                        entries={experimentDetail.benchmarks.slice(0, 3).map(benchmark => ({
                                            id: benchmark.id,
                                            summary: `${new Date(benchmark.evaluatedAt).toLocaleString()} · evidence: ${benchmark.evidence}`,
                                            note: `Session reference: ${benchmark.sessionId}`,
                                        }))}
                                    />

                                    <EvidenceSection
                                        title="Executions"
                                        emptyMessage="No experiment-linked execution evidence is present."
                                        entries={experimentDetail.executions.slice(0, 3).map(execution => ({
                                            id: execution.id,
                                            summary: `${new Date(execution.createdAt).toLocaleString()} · ${execution.status}`,
                                            note: `Branch: ${execution.branchId}`,
                                        }))}
                                    />

                                    <EvidenceSection
                                        title="Replay Packages"
                                        emptyMessage="No replay package is persisted for this experiment yet."
                                        entries={experimentDetail.replayPackages.slice(0, 3).map(replayPackage => ({
                                            id: replayPackage.replayPackageId,
                                            summary: `${new Date(replayPackage.updatedAt).toLocaleString()} · ${replayPackage.lineageStatus}`,
                                            note: `${replayPackage.sessionIds.length} sessions · ${replayPackage.benchmarkIds.length} benchmarks · ${replayPackage.executionIds.length} executions`,
                                        }))}
                                    />

                                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Evidence Caveats</p>
                                        <div className="space-y-2">
                                            {experimentDetail.evidenceCaveats.map(caveat => (
                                                <div key={buildObservatoryKey("registry-evidence-caveat", experimentDetail.experiment.experimentId, caveat)} className="rounded-md border border-border-subtle bg-surface-elevated p-3 text-[11px] text-text-muted leading-relaxed">
                                                    {caveat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <ExperimentGovernanceAdvisory
                                        experimentId={experimentDetail.experiment.experimentId}
                                        synthesis={governanceSynthesis}
                                    />
                                </div>
                            ) : (
                                <EmptyNote message="Select an experiment to view its persisted lineage chain." />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkeletonPanel() {
    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl animate-pulse">
            <div className="p-4 border-b border-border-subtle bg-surface-hover h-14" />
            <div className="p-6 h-[620px] bg-surface-hover" />
        </div>
    );
}

function PanelLabel({ title, detail }: { title: string; detail: string }) {
    return (
        <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{title}</p>
            <p className="text-[11px] text-text-muted leading-relaxed mt-1">{detail}</p>
        </div>
    );
}

function EmptyNote({ message }: { message: string }) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-elevated p-4 text-[11px] text-text-muted leading-relaxed">
            {message}
        </div>
    );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-hover p-2 flex items-center gap-2">
            <span className="text-accent">{icon}</span>
            <div>
                <p className="uppercase tracking-widest">{label}</p>
                <p className="text-text-primary mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function DetailChip({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-elevated p-2">
            <p className="uppercase tracking-widest">{label}</p>
            <p className="text-text-primary mt-0.5">{value}</p>
        </div>
    );
}

function EvidenceSection({
    title,
    entries,
    emptyMessage,
}: {
    title: string;
    entries: Array<{ id: string; summary: string; note: string }>;
    emptyMessage: string;
}) {
    assertUniqueKeys(
        `EvidenceSection.${title}`,
        entries.map(entry => buildObservatoryKey("registry-evidence-entry", title, entry.id))
    );

    return (
        <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">{title}</p>
            {entries.length === 0 ? (
                <p className="text-[11px] text-text-muted leading-relaxed">{emptyMessage}</p>
            ) : (
                <div className="space-y-2">
                    {entries.map(entry => (
                        <div key={buildObservatoryKey("registry-evidence-entry", title, entry.id)} className="rounded-md border border-border-subtle bg-surface-elevated p-3 text-[10px] text-text-muted">
                            <div className="flex items-center justify-between gap-3 mb-1">
                                <span className="font-mono text-text-primary">{entry.id}</span>
                            </div>
                            <p>{entry.summary}</p>
                            <p className="mt-1">{entry.note}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ExperimentGovernanceAdvisory({
    experimentId,
    synthesis,
}: {
    experimentId: string;
    synthesis: ComparativeGovernanceSynthesis | null;
}) {
    if (!synthesis) return null;

    const signal = synthesis.signals.find(s => s.associatedExperimentId === experimentId) ?? null;
    if (!signal) return null;

    return (
        <div className="obs-section-card border-accent/15 bg-accent-soft/30">
            <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3 h-3 text-accent" />
                <p className="obs-text-label text-accent">Governance Advisory</p>
            </div>
            <div className="flex items-center justify-between gap-2 mb-1 text-[10px] font-mono text-text-muted">
                <span className="text-text-primary uppercase tracking-wide">{signal.priorityClass.replace(/-/g, " ")}</span>
                <span className="badge badge-muted text-[9px]">
                    {POSTURE_LABELS[signal.signalPosture] ?? signal.signalPosture}
                </span>
            </div>
            <p className="text-[10px] font-mono text-text-muted leading-relaxed">{signal.synthesisNarrative}</p>
            {signal.experimentStabilityLabel && (
                <p className="mt-1 text-[9px] font-mono text-text-muted/50">
                    stability: {signal.experimentStabilityLabel} · level: {signal.currentLevel}
                </p>
            )}
            <p className="mt-2 text-[9px] font-mono text-text-muted/40 leading-relaxed">
                Advisory — this governance signal is observational and does not imply execution authority or causal proof.
            </p>
        </div>
    );
}

