"use client";

import { useEffect, useState } from "react";
import { LibraryBig, Link2, ShieldCheck } from "lucide-react";
import type { ScenarioRecord } from "@/lib/types/scenario";
import type { ExperimentRecord } from "@/lib/types/experiment-registry";
import type { ResearchDataset } from "@/lib/types/research-dataset";

export function ScenarioLibraryPanel() {
    const [scenarios, setScenarios] = useState<ScenarioRecord[]>([]);
    const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
    const [datasets, setDatasets] = useState<ResearchDataset[]>([]);
    const [selectedExperimentId, setSelectedExperimentId] = useState("");
    const [selectedScenarioId, setSelectedScenarioId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setError(null);
        try {
            const [scenarioResponse, experimentResponse, datasetResponse] = await Promise.all([
                fetch("/api/scenarios/library", { cache: "no-store" }),
                fetch("/api/experiments", { cache: "no-store" }),
                fetch("/api/datasets", { cache: "no-store" }),
            ]);

            if (!scenarioResponse.ok || !experimentResponse.ok || !datasetResponse.ok) {
                throw new Error("Failed to load scenario or dataset infrastructure.");
            }

            const scenarioData = await scenarioResponse.json();
            const experimentData = await experimentResponse.json();
            const datasetData = await datasetResponse.json();
            setScenarios(scenarioData.scenarios ?? []);
            setExperiments(experimentData.experiments ?? []);
            setDatasets(datasetData.datasets ?? []);
        } catch (err: any) {
            setError(err.message ?? "Failed to load scenario library.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const linkScenario = async () => {
        if (!selectedExperimentId || !selectedScenarioId) return;
        setIsLinking(true);
        setError(null);

        try {
            const response = await fetch("/api/scenarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ experimentId: selectedExperimentId, scenarioId: selectedScenarioId }),
            });

            if (!response.ok) {
                const body = await response.text().catch(() => "");
                throw new Error(body || "Failed to link scenario.");
            }

            await load();
        } catch (err: any) {
            setError(err.message ?? "Failed to link scenario.");
        } finally {
            setIsLinking(false);
        }
    };

    if (isLoading) {
        return <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl animate-pulse"><div className="p-6 h-[480px] bg-surface-hover" /></div>;
    }

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-4 border-b border-border-subtle bg-surface flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <LibraryBig className="w-5 h-5 text-accent" />
                    <div>
                        <h2 className="text-lg font-mono font-bold text-text-primary">Scenario Library</h2>
                        <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Phase 13 · Dataset-backed scenario assignments</p>
                    </div>
                </div>
                <div className="text-right text-[10px] font-mono text-text-muted">
                    <div>{scenarios.length} scenarios</div>
                    <div>{datasets.length} datasets</div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[0.75fr_1.25fr] gap-0">
                <div className="p-5 border-r border-border-subtle bg-surface-elevated space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Scenario Assignment</p>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                        Attach a canonical research scenario to a formal experiment so downstream dataset artifacts and replay surfaces operate on stable, explicit intent.
                    </p>

                    <select value={selectedExperimentId} onChange={(event) => setSelectedExperimentId(event.target.value)} className="panel-input">
                        <option value="">Select experiment</option>
                        {experiments.map(experiment => (
                            <option key={experiment.experimentId} value={experiment.experimentId}>{experiment.objective.title}</option>
                        ))}
                    </select>

                    <select value={selectedScenarioId} onChange={(event) => setSelectedScenarioId(event.target.value)} className="panel-input">
                        <option value="">Select scenario</option>
                        {scenarios.map(scenario => (
                            <option key={scenario.scenarioId} value={scenario.scenarioId}>{scenario.scenarioId}</option>
                        ))}
                    </select>

                    <button type="button" disabled={isLinking || !selectedExperimentId || !selectedScenarioId} onClick={linkScenario} className="panel-button-primary w-full inline-flex items-center justify-center gap-2">
                        <Link2 className="w-4 h-4" />
                        {isLinking ? "Linking..." : "Link Scenario To Experiment"}
                    </button>

                    {error && <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-[11px] text-danger">{error}</div>}

                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Dataset Coverage</p>
                        {datasets.length === 0 ? (
                            <p className="text-[11px] text-text-muted leading-relaxed">Datasets are persisted artifacts materialized during experiment or scenario write events. Read views do not create them implicitly.</p>
                        ) : datasets.slice(0, 3).map(dataset => (
                            <div key={dataset.datasetId} className="border-t border-border-subtle py-2 first:border-t-0 first:pt-0 text-[10px] text-text-muted">
                                <p className="font-mono text-text-primary">{dataset.datasetId}</p>
                                <p>{dataset.simulationResults.length} simulations · {dataset.benchmarkResults.length} benchmarks · {dataset.calibrationData.comparisonIds.length} comparisons</p>
                                <p className="mt-1">created {new Date(dataset.createdAt).toLocaleString()} · updated {new Date(dataset.updatedAt).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-5 space-y-3 bg-surface-elevated">
                    {scenarios.map(scenario => {
                        const linkedExperimentCount = experiments.filter(experiment => experiment.scenarioId === scenario.scenarioId).length;

                        return (
                            <div key={scenario.scenarioId} className="rounded-md border border-border-subtle bg-surface-elevated p-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <p className="text-xs font-mono font-bold text-text-primary">{scenario.scenarioId}</p>
                                        <p className="text-[11px] text-text-muted leading-relaxed mt-1">{scenario.description}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded border border-border-subtle bg-surface-hover text-[9px] font-mono uppercase text-text-muted">
                                        {scenario.riskProfile}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] text-text-muted">
                                    <ScenarioMeta icon={<ShieldCheck className="w-3 h-3" />} label="Target Repo" value={scenario.targetRepoType} />
                                    <ScenarioMeta icon={<LibraryBig className="w-3 h-3" />} label="Recommended" value={scenario.recommendedStrategies.join(", ")} />
                                    <ScenarioMeta icon={<Link2 className="w-3 h-3" />} label="Linked Experiments" value={linkedExperimentCount} />
                                </div>

                                <div className="mt-3 rounded-md border border-border-subtle bg-surface-hover p-3 text-[10px] text-text-muted">
                                    <p className="font-mono uppercase tracking-widest mb-2">Evaluation Metrics</p>
                                    <div className="flex flex-wrap gap-2">
                                        {scenario.evaluationMetrics.map(metric => (
                                            <span key={metric} className="px-2 py-1 rounded border border-accent/20 bg-accent-soft text-accent-light">
                                                {metric}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ScenarioMeta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-hover p-2">
            <div className="flex items-center gap-2 text-accent mb-1">{icon}<span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">{label}</span></div>
            <p className="text-[10px] leading-relaxed text-text-primary">{value}</p>
        </div>
    );
}


