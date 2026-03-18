"use client";

import { useEffect, useState } from "react";
import type { ExportManifest, ObservatoryBrief } from "@/lib/types/research-export";
import { Package, Download, RefreshCw, Hash, FileText, Clock } from "lucide-react";
import { assertUniqueKeys, buildObservatoryKey } from "@/lib/utils/observatory-key";

export function ExportManifestPanel() {
    const [manifest, setManifest] = useState<ExportManifest | null>(null);
    const [brief, setBrief] = useState<ObservatoryBrief | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNoExport, setHasNoExport] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const doFetch = async () => {
            try {
                const res = await fetch("/api/research/export", { signal: controller.signal });
                if (res.status === 404) {
                    setHasNoExport(true);
                    return;
                }
                if (!res.ok) {
                    const body = await res.text().catch(() => "");
                    throw new Error(body || `HTTP ${res.status}`);
                }
                const data = await res.json();
                setManifest(data.manifest);
                setBrief(data.brief);
            } catch (err: any) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };
        doFetch();
        return () => controller.abort();
    }, []);

    const handleExport = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const res = await fetch("/api/research/export", { method: "POST" });
            if (!res.ok) throw new Error("Failed to export briefing");
            const data = await res.json();
            setManifest(data.manifest);
            setBrief(data.brief);
            setHasNoExport(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl animate-pulse">
                <div className="p-4 border-b border-border-subtle bg-surface-hover h-14" />
                <div className="p-6 h-[300px] bg-surface-hover" />
            </div>
        );
    }

    if (error && !manifest) {
        return (
            <div className="rounded-lg border border-danger/30 bg-surface p-6 flex items-center justify-center min-h-[200px]">
                <div className="text-danger font-mono text-sm max-w-md text-center">
                    EXPORT FAILURE: {error}
                </div>
            </div>
        );
    }

    // No export yet — show CTA
    if (hasNoExport && !manifest) {
        return (
            <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface">
                    <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-accent" />
                        <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                            Export Manifest
                        </h2>
                    </div>
                </div>
                <div className="p-10 flex flex-col items-center justify-center gap-4">
                    <p className="text-sm text-text-muted font-mono text-center">
                        No export manifest exists. Generate a briefing export to create an auditable, hashed artifact package.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center space-x-2 px-4 py-2 rounded-md bg-accent-soft hover:bg-accent-soft border border-accent/40 text-text-primary font-mono text-sm transition-colors disabled:opacity-50"
                    >
                        <Download className={`w-4 h-4 ${isExporting ? "animate-spin" : ""}`} />
                        <span>{isExporting ? "EXPORTING…" : "EXPORT BRIEFING"}</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!manifest) return null;

    assertUniqueKeys(
        "ExportManifestPanel.artifacts",
        manifest.artifacts.map(artifact => artifact.canonicalKey)
    );

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface shrink-0">
                <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                        Export Manifest
                    </h2>
                    <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded border font-mono text-xs text-text-muted bg-surface-hover border-border-subtle">
                        {manifest.id}
                    </span>
                </div>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-hover hover:bg-surface-active border border-border-subtle text-text-primary font-mono text-xs transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-3 h-3 ${isExporting ? "animate-spin" : ""}`} />
                    <span>{isExporting ? "EXPORTING" : "RE-EXPORT"}</span>
                </button>
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-border-subtle bg-surface-elevated text-[10px] font-mono text-text-muted">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(manifest.exportedAt).toLocaleString()}
                </span>
                <span>SYS: {manifest.systemVersion}</span>
                <span>BRIEF: {manifest.briefId}</span>
                <span>ARTIFACTS: {manifest.totalArtifacts}</span>
                <span>EVIDENCE: {manifest.evidenceArtifactCount}</span>
                <span>CONTEXT: {manifest.contextualArtifactCount}</span>
                <span>SIZE: {(manifest.totalSizeBytes / 1024).toFixed(1)} KB</span>
            </div>

            {/* Integrity Note */}
            <div className="px-5 py-2 border-b border-border-subtle bg-surface-elevated">
                <p className="text-[10px] font-mono text-text-muted leading-relaxed">
                    {manifest.integrityNote}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 text-[10px] font-mono text-text-muted">
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">evidence class</p>
                        <p className="text-text-primary mt-1">{manifest.replayStatusSummary.evidenceClass}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">baseline-only</p>
                        <p className="text-text-primary mt-1">{manifest.replayStatusSummary.baselineOnlyCount}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">partial</p>
                        <p className="text-text-primary mt-1">{manifest.replayStatusSummary.partialCount}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">full</p>
                        <p className="text-text-primary mt-1">{manifest.replayStatusSummary.fullCount}</p>
                    </div>
                </div>
                <p className="text-[10px] font-mono text-text-muted mt-3 leading-relaxed">{manifest.replayStatusSummary.reproducibilityCaveat}</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 text-[10px] font-mono text-text-muted">
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">eval snapshot</p>
                        <p className="text-text-primary mt-1">{manifest.comparisonPosture.evaluationSnapshotId ?? "none"}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">leader</p>
                        <p className="text-text-primary mt-1">{manifest.comparisonPosture.strongestExperimentTitle ?? "none"}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">weight</p>
                        <p className="text-text-primary mt-1">{manifest.comparisonPosture.strongestComparativeWeightLabel}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">high-confidence</p>
                        <p className="text-text-primary mt-1">{manifest.comparisonPosture.highConfidenceComparisonCount}</p>
                    </div>
                </div>
                <p className="text-[10px] font-mono text-text-muted mt-3 leading-relaxed">{manifest.comparisonPosture.comparativeCaveat}</p>
                {manifest.prioritizationSummary.topPriorities.length > 0 && (
                    <div className="mt-3 rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">research priorities</p>
                        <p className="text-[10px] font-mono text-text-muted leading-relaxed mb-2">{manifest.prioritizationSummary.advisorySummary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono text-text-muted">
                            {manifest.prioritizationSummary.topPriorities.slice(0, 3).map(signal => (
                                <div key={buildObservatoryKey("manifest-priority", manifest.id, signal.id)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <p className="text-text-primary uppercase">{signal.priorityClass}</p>
                                    <p className="mt-1">{signal.experimentTitle ?? "portfolio-wide"}</p>
                                    <p className="mt-1 text-text-muted leading-relaxed">{signal.recommendedFocus}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {manifest.integrityGuarantees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {manifest.integrityGuarantees.map((guarantee, index) => (
                            <span key={buildObservatoryKey("manifest-guarantee", manifest.id, guarantee, index)} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono bg-surface-hover text-text-muted border border-border-subtle">
                                {guarantee}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Governance Synthesis */}
            {manifest.governanceSynthesis && (
                <div className="px-5 py-3 border-b border-border-subtle bg-surface-elevated">
                    <p className="obs-text-label mb-2">Governance Synthesis · Advisory</p>
                    <p className="text-[10px] font-mono text-text-muted leading-relaxed mb-2">{manifest.governanceSynthesis.postureAssessment}</p>
                    <div className="flex flex-wrap gap-2 text-[9px] font-mono">
                        {manifest.governanceSynthesis.persistentSignals.length > 0 && (
                            <span className="badge badge-signal text-[9px]">
                                persistent: {manifest.governanceSynthesis.persistentSignals.map(s => s.priorityClass.replace(/-/g, " ")).join(", ")}
                            </span>
                        )}
                        {manifest.governanceSynthesis.recentSignals.length > 0 && (
                            <span className="badge badge-muted text-[9px]">
                                recent: {manifest.governanceSynthesis.recentSignals.map(s => s.priorityClass.replace(/-/g, " ")).join(", ")}
                            </span>
                        )}
                        {manifest.governanceSynthesis.unstableSignals.length > 0 && (
                            <span className="badge badge-caution text-[9px]">
                                unstable: {manifest.governanceSynthesis.unstableSignals.map(s => s.priorityClass.replace(/-/g, " ")).join(", ")}
                            </span>
                        )}
                        {manifest.governanceSynthesis.weakeningSignals.length > 0 && (
                            <span className="badge badge-muted text-[9px]">
                                weakening: {manifest.governanceSynthesis.weakeningSignals.map(s => s.priorityClass.replace(/-/g, " ")).join(", ")}
                            </span>
                        )}
                    </div>
                    {manifest.governanceSynthesis.evidenceLimitations.limitationNarrative && (
                        <p className="text-[10px] font-mono text-text-muted/60 leading-relaxed mt-2">{manifest.governanceSynthesis.evidenceLimitations.limitationNarrative}</p>
                    )}
                    <p className="text-[9px] font-mono text-text-muted/40 leading-relaxed mt-2">{manifest.governanceSynthesis.governanceCaveat}</p>
                </div>
            )}

            {/* Artifact Table */}
            {manifest.artifacts.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border-subtle bg-surface-elevated">
                                <th className="px-4 py-2 text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">Type</th>
                                <th className="px-4 py-2 text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">Artifact ID</th>
                                <th className="px-4 py-2 text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">Path</th>
                                <th className="px-4 py-2 text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">Role</th>
                                <th className="px-4 py-2 text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">SHA-256</th>
                                <th className="px-4 py-2 text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">Size</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {manifest.artifacts.map(artifact => (
                                <tr key={artifact.canonicalKey} className="hover:bg-surface-hover transition-colors">
                                    <td className="px-4 py-2">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent uppercase">
                                            <FileText className="w-3 h-3" />
                                            {artifact.artifactType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-[10px] font-mono text-text-primary/80">{artifact.artifactId}</td>
                                    <td className="px-4 py-2 text-[10px] font-mono text-text-muted max-w-[200px] truncate">{artifact.filePath}</td>
                                    <td className="px-4 py-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-mono uppercase ${
                                            artifact.inclusionRole === "cited-by-brief"
                                                ? "text-accent bg-accent-soft border-accent/20"
                                                : "text-text-muted bg-surface-hover border-border-subtle"
                                        }`}>
                                            {artifact.inclusionRole === "cited-by-brief" ? "evidence" : "context"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-text-muted/70">
                                            <Hash className="w-2.5 h-2.5" />
                                            {artifact.sha256.slice(0, 12)}…
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-[10px] font-mono text-text-muted">
                                        {artifact.sizeBytes > 1024 ? `${(artifact.sizeBytes / 1024).toFixed(1)} KB` : `${artifact.sizeBytes} B`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Evidence Lineage */}
            {manifest.evidenceLineage.length > 0 && (
                <div className="border-t border-border-subtle p-5">
                    <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">Evidence Lineage</p>
                    <div className="flex flex-wrap gap-2">
                        {manifest.evidenceLineage.map((ref, index) => (
                            <span key={buildObservatoryKey("manifest-evidence-ref", manifest.id, ref.sourceType, ref.sourceId, index)} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono bg-surface-hover text-text-muted border border-border-subtle">
                                <span className="text-accent">{ref.sourceType}</span>
                                <span className="text-text-primary/60">·</span>
                                <span>{ref.label}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}



