"use client";

import { useEffect, useState } from "react";
import type { ResearchDossier } from "@/lib/types/research-memory";
import type { ComparativeGovernanceSynthesis } from "@/lib/types/governance-synthesis";
import { POSTURE_LABELS } from "@/lib/constants/governance";
import { FileText, RefreshCw, Shield } from "lucide-react";
import { buildObservatoryKey } from "@/lib/utils/observatory-key";

export function ResearchDossierPanel() {
    const [dossier, setDossier] = useState<ResearchDossier | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            const res = await fetch("/api/research/dossier", { method: "POST" });
            if (!res.ok) throw new Error("Failed to regenerate dossier");
            const data = await res.json();
            setDossier(data.dossier);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsRegenerating(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        const doFetch = async () => {
            try {
                const dossierRes = await fetch("/api/research/dossier", { signal: controller.signal });
                if (!dossierRes.ok) {
                    const body = await dossierRes.text().catch(() => "");
                    throw new Error(body || `HTTP ${dossierRes.status}`);
                }
                const dossierData = await dossierRes.json();
                setDossier(dossierData.dossier);
            } catch (err: any) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };
        doFetch();
        return () => controller.abort();
    }, []);

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl animate-pulse h-[600px]">
                <div className="p-4 border-b border-border-subtle bg-surface-hover">
                    <div className="h-6 w-56 bg-surface-active rounded" />
                </div>
                <div className="p-6">
                    <div className="h-full w-full bg-surface-hover rounded" />
                </div>
            </div>
        );
    }

    if (error || !dossier) {
        return (
            <div className="rounded-lg border border-danger/30 bg-surface p-6 flex items-center justify-center h-[600px]">
                <div className="text-danger font-mono text-sm max-w-md text-center">
                    GATING FAILURE: {error || "Unable to load experiment memory."}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col h-[800px]">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface shrink-0">
                <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                        Comparative Research Dossier
                    </h2>
                    <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded border font-mono text-xs text-text-muted bg-surface-hover border-border-subtle">
                        ID: {dossier.id.split("-")[1]}
                    </span>
                </div>
                <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-hover hover:bg-surface-active border border-border-subtle text-text-primary font-mono text-xs transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
                    <span>{isRegenerating ? "COMPILING" : "COMPILE DOSSIER"}</span>
                </button>
            </div>

            {/* Dossier Content */}
            <div className="flex-1 overflow-y-auto bg-surface p-6 sm:p-10">
                <div className="max-w-4xl mx-auto space-y-10 pb-10">

                    {/* Header Metadata */}
                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted border-b border-border-subtle pb-4">
                        <span>SYS_VER: {dossier.metadata.systemVersion}</span>
                        <span>•</span>
                        <span>SESSIONS_COVERED: {dossier.metadata.totalSessionsCovered}</span>
                        <span>•</span>
                        <span>GENERATED: {new Date(dossier.metadata.generatedAt).toLocaleString()}</span>
                    </div>

                    <div className="rounded-lg border border-border-subtle bg-surface-elevated p-4 text-sm text-text-muted leading-relaxed">
                        <p className="text-xs font-mono uppercase tracking-widest text-text-primary mb-2">Research Prioritization Summary</p>
                        <p>{dossier.metadata.prioritizationSummary}</p>
                    </div>

                    {/* Left/Right Column Grid for sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* System Snapshot & Recent */}
                        <div className="space-y-8">
                            <DossierBlock section={dossier.sections.systemSnapshot} />
                            <DossierBlock section={dossier.sections.recentExperiments} />
                            <DossierBlock section={dossier.sections.evidenceSufficiencySummary} />
                            <DossierBlock section={dossier.sections.replayReadinessSummary} />
                            <DossierBlock section={dossier.sections.comparativeEvaluationSummary} />
                            <DossierBlock section={dossier.sections.calibrationTrendSummary} />
                        </div>

                        {/* Analysis & Limits */}
                        <div className="space-y-8">
                            <DossierBlock section={dossier.sections.governanceConstraintPatterns} />
                            <DossierBlock section={dossier.sections.simulationGapNotes} />
                            <DossierBlock section={dossier.sections.preferredBranchTrends} />
                            <div className="p-4 border border-accent/30 bg-accent/5 rounded-lg space-y-4">
                                <DossierBlock section={dossier.sections.architecturalInterpretation} forceHighlight />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Full-width */}
                    <div className="border-t border-border-subtle pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DossierBlock section={dossier.sections.knownLimits} />
                        <DossierBlock section={dossier.sections.advisoryResearchGaps} />
                    </div>

                    {/* Governance Synthesis (Advisory) */}
                    {dossier.governanceSynthesis && (
                        <GovernanceSynthesisBlock synthesis={dossier.governanceSynthesis} />
                    )}
                </div>
            </div>
        </div>
    );
}

function DossierBlock({ section, forceHighlight = false }: { section: ResearchDossier["sections"][keyof ResearchDossier["sections"]], forceHighlight?: boolean }) {
    if (!section) return null;

    return (
        <div className="relative group" key={buildObservatoryKey("dossier-block", section.title)}>
            <div className="flex items-center justify-between mb-3">
                <h4 className={`text-xs font-mono font-bold tracking-widest uppercase ${forceHighlight ? 'text-accent' : 'text-text-primary'}`}>
                    {section.title}
                </h4>
                {section.confidence === "structural-only" ? (
                    <span className="px-2 py-0.5 rounded border text-[10px] uppercase font-mono bg-accent-soft text-accent border-accent/20">
                        STRUCTURAL
                    </span>
                ) : section.confidence === "high" ? (
                    <span className="px-2 py-0.5 rounded border text-[10px] uppercase font-mono bg-success-soft text-success border-success/20">
                        HIGH CONF
                    </span>
                ) : (
                    <span className="px-2 py-0.5 rounded border text-[10px] uppercase font-mono bg-surface-hover text-text-muted border-border-subtle">
                        {section.confidence} conf
                    </span>
                )}
            </div>
            <div className="text-sm text-text-muted leading-relaxed font-sans">
                {section.content}
            </div>
            {section.prioritization && (
                <div className="mt-3 rounded-md border border-accent/20 bg-accent-soft p-3 text-[10px] font-mono text-accent-light">
                    <p className="uppercase">{section.prioritization.priorityClass}</p>
                    <p className="mt-1 text-text-muted leading-relaxed">{section.prioritization.recommendedFocus}</p>
                    <p className="mt-1 text-[9px] text-text-muted/50 italic">Advisory — bounded by current evidence only</p>
                </div>
            )}
        </div>
    );
}

function GovernanceSynthesisBlock({ synthesis }: { synthesis: ComparativeGovernanceSynthesis }) {
    return (
        <div className="border-t border-border-subtle pt-8 space-y-4">
            <div className="flex items-center gap-2 mb-3">
                <Shield className="w-3.5 h-3.5 text-accent" />
                <h4 className="text-[11px] font-mono font-semibold tracking-widest uppercase text-text-primary">
                    Governance Synthesis
                </h4>
                <span className="badge badge-muted text-[9px]">Advisory</span>
            </div>

            {/* Posture Assessment */}
            <p className="text-[10px] font-mono text-text-muted leading-relaxed">
                {synthesis.postureAssessment}
            </p>

            {/* Signal Classifications */}
            {synthesis.signals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {synthesis.signals.map(signal => (
                        <div
                            key={buildObservatoryKey("dossier-synthesis-signal", signal.priorityClass)}
                            className="obs-section-card-elevated text-[10px] font-mono text-text-muted"
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-text-primary uppercase tracking-wide">{signal.priorityClass.replace(/-/g, " ")}</span>
                                <span className="badge badge-muted text-[9px]">
                                    {POSTURE_LABELS[signal.signalPosture] ?? signal.signalPosture}
                                </span>
                            </div>
                            <p className="leading-relaxed">{signal.synthesisNarrative}</p>
                            {signal.experimentStabilityLabel && (
                                <p className="mt-1 text-[9px] text-text-muted/50">
                                    experiment stability: {signal.experimentStabilityLabel}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Evidence Limitations */}
            {synthesis.evidenceLimitations.limitationNarrative && (
                <div className="obs-section-card border-warning/15 bg-warning-soft/40 text-[10px] font-mono text-text-muted leading-relaxed">
                    <p className="obs-text-label text-warning mb-1">Evidence Limitations</p>
                    <p>{synthesis.evidenceLimitations.limitationNarrative}</p>
                    {synthesis.evidenceLimitations.chronicEvidenceGaps.length > 0 && (
                        <p className="mt-1 text-[9px] text-text-muted/50">
                            Chronic gaps: {synthesis.evidenceLimitations.chronicEvidenceGaps.join(", ")}
                        </p>
                    )}
                </div>
            )}

            {/* Summary counts */}
            <div className="flex flex-wrap gap-3 text-[9px] font-mono text-text-muted/50">
                <span>signals: {synthesis.totalAdvisorySignals}</span>
                <span>snapshots: {synthesis.totalHistorySnapshots}</span>
                <span>drifts: {synthesis.totalDriftsDetected}</span>
                <span>comparisons: {synthesis.totalPairwiseComparisons}</span>
            </div>

            {/* Governance Caveat */}
            <div className="flex items-start gap-2 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2.5 mt-2">
                <Shield className="mt-0.5 h-3 w-3 flex-shrink-0 text-text-muted opacity-50" />
                <p className="text-[9px] font-mono text-text-muted/60 leading-relaxed">
                    {synthesis.governanceCaveat}
                </p>
            </div>
        </div>
    );
}
