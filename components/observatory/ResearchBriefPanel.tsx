"use client";

import { useEffect, useState } from "react";
import type { ObservatoryBrief } from "@/lib/types/research-export";
import { BookOpen, AlertTriangle, Info, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { assertUniqueKeys, buildObservatoryKey } from "@/lib/utils/observatory-key";

export function ResearchBriefPanel() {
    const [brief, setBrief] = useState<ObservatoryBrief | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["system-state"]));

    useEffect(() => {
        const controller = new AbortController();
        const doFetch = async () => {
            try {
                const res = await fetch("/api/research/brief", { signal: controller.signal });
                if (!res.ok) {
                    const body = await res.text().catch(() => "");
                    throw new Error(body || `HTTP ${res.status}`);
                }
                const data = await res.json();
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

    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl animate-pulse">
                <div className="p-4 border-b border-border-subtle bg-surface-hover h-14" />
                <div className="p-6 h-[500px] bg-surface-hover" />
            </div>
        );
    }

    if (error || !brief) {
        return (
            <div className="rounded-lg border border-danger/30 bg-surface p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-danger font-mono text-sm max-w-md text-center">
                    GATING FAILURE: {error || "Unable to generate research brief."}
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

    const severityStyle: Record<string, string> = {
        critical: "text-danger bg-danger-soft border-danger/20",
        important: "text-warning bg-warning-soft border-warning/20",
        informational: "text-text-muted bg-surface-hover border-border-subtle",
    };

    const trendIcon = (trend: string) => {
        if (trend === "up") return "↑";
        if (trend === "down") return "↓";
        if (trend === "stable") return "→";
        return "?";
    };

    assertUniqueKeys(
        "ResearchBriefPanel.sections",
        brief.sections.map(section => buildObservatoryKey("brief-section", brief.id, section.id))
    );

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface shrink-0">
                <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                        Observatory Briefing
                    </h2>
                    <span className={`px-2 py-0.5 rounded border font-mono text-xs uppercase ${postureColor[brief.compositePosture] || "text-text-muted bg-surface-hover border-border-subtle"}`}>
                        {brief.compositePosture}
                    </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                    {new Date(brief.generatedAt).toLocaleString()}
                </span>
            </div>

            {/* Executive Summary */}
            <div className="px-5 py-4 border-b border-border-subtle bg-surface-elevated">
                <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Executive Summary</p>
                <p className="text-sm text-text-primary/90 leading-relaxed">{brief.executiveSummary}</p>
            </div>

            <div className="px-5 py-3 border-b border-border-subtle bg-surface-elevated">
                <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Replay Status</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px] font-mono text-text-muted">
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">evidence class</p>
                        <p className="text-text-primary mt-1">{brief.replayStatusSummary?.evidenceClass ?? "\u2014"}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">baseline-only</p>
                        <p className="text-text-primary mt-1">{brief.replayStatusSummary?.baselineOnlyCount ?? "\u2014"}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">partial</p>
                        <p className="text-text-primary mt-1">{brief.replayStatusSummary?.partialCount ?? "\u2014"}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">full</p>
                        <p className="text-text-primary mt-1">{brief.replayStatusSummary?.fullCount ?? "\u2014"}</p>
                    </div>
                </div>
                <p className="text-[10px] font-mono text-text-muted mt-3 leading-relaxed">{brief.replayStatusSummary?.reproducibilityCaveat ?? "Replay status summary unavailable for this brief."}</p>
            </div>

            <div className="px-5 py-3 border-b border-border-subtle bg-surface-hover">
                <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Comparative Evaluation</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px] font-mono text-text-muted">
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">leader</p>
                        <p className="text-text-primary mt-1">{brief.comparativeEvaluation.strongestExperimentTitle ?? "none"}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">weight</p>
                        <p className="text-text-primary mt-1">{brief.comparativeEvaluation.strongestComparativeWeightLabel}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">high-confidence</p>
                        <p className="text-text-primary mt-1">{brief.comparativeEvaluation.highConfidenceComparisonCount}</p>
                    </div>
                    <div className="rounded-md border border-border-subtle bg-surface-hover p-3">
                        <p className="uppercase tracking-widest">experiments</p>
                        <p className="text-text-primary mt-1">{brief.comparativeEvaluation.totalExperiments}</p>
                    </div>
                </div>
                <p className="text-[10px] font-mono text-text-muted mt-3 leading-relaxed">{brief.comparativeEvaluation.comparativeCaveat}</p>
            </div>

            <div className="px-5 py-3 border-b border-border-subtle bg-surface-elevated">
                <p className="obs-text-label mb-2">Research Prioritization · Advisory Only</p>
                <p className="text-[10px] font-mono text-text-muted leading-relaxed">{brief.prioritizationContext.advisorySummary}</p>
                {brief.governanceSynthesis && (
                    <div className="mt-3 space-y-2">
                        <p className="text-[10px] font-mono text-text-muted leading-relaxed">{brief.governanceSynthesis.postureAssessment}</p>
                        {brief.governanceSynthesis.persistentSignals.length > 0 && (
                            <p className="text-[10px] font-mono text-text-muted/60 leading-relaxed">
                                Persistent: {brief.governanceSynthesis.persistentSignals.map(s => s.priorityClass.replace(/-/g, " ")).join(", ")}.
                            </p>
                        )}
                        {brief.governanceSynthesis.unstableSignals.length > 0 && (
                            <p className="text-[10px] font-mono text-warning/60 leading-relaxed">
                                Unstable: {brief.governanceSynthesis.unstableSignals.map(s => s.priorityClass.replace(/-/g, " ")).join(", ")}.
                            </p>
                        )}
                        {brief.governanceSynthesis.recentSignals.length > 0 && (
                            <p className="text-[10px] font-mono text-accent/60 leading-relaxed">
                                Recent: {brief.governanceSynthesis.recentSignals.map(s => s.priorityClass.replace(/-/g, " ")).join(", ")}.
                            </p>
                        )}
                        {brief.governanceSynthesis.weakeningSignals.length > 0 && (
                            <p className="text-[10px] font-mono text-text-muted/50 leading-relaxed">
                                Weakening: {brief.governanceSynthesis.weakeningSignals.map(s => s.priorityClass.replace(/-/g, " ")).join(", ")}.
                            </p>
                        )}
                        {brief.governanceSynthesis.evidenceLimitations.chronicEvidenceGaps.length > 0 && (
                            <p className="text-[10px] font-mono text-text-muted/50 leading-relaxed">
                                Chronic evidence gaps: {brief.governanceSynthesis.evidenceLimitations.chronicEvidenceGaps.join(", ")}.
                            </p>
                        )}
                        <p className="text-[9px] font-mono text-text-muted/40 leading-relaxed mt-1">{brief.governanceSynthesis.governanceCaveat}</p>
                    </div>
                )}
                {!brief.governanceSynthesis && brief.priorityDrift && brief.priorityDrift.totalDrifts > 0 && (
                    <p className="text-[10px] font-mono text-accent/70 leading-relaxed mt-1">{brief.priorityDrift.summary}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-[10px] font-mono text-text-muted">
                    {brief.prioritizationContext.topPriorities.slice(0, 3).map(signal => (
                        <div key={buildObservatoryKey("brief-priority", brief.id, signal.id)} className="rounded-md border border-border-subtle bg-surface-hover p-3">
                            <p className="uppercase text-text-primary">{signal.priorityClass}</p>
                            <p className="mt-1">{signal.experimentTitle ?? "portfolio-wide"}</p>
                            <p className="mt-1 text-text-muted leading-relaxed">{signal.recommendedFocus}</p>
                            <p className="mt-1 text-[9px] text-text-muted/50 italic">Advisory — not execution authority</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 divide-x divide-border-subtle border-b border-border-subtle">
                {brief.summaryCards.map((card) => (
                    <div key={buildObservatoryKey("brief-summary-card", brief.id, card.label)} className="p-3 bg-surface-elevated">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">{card.label}</span>
                            <span className="text-[10px] font-mono text-accent">{trendIcon(card.trend)}</span>
                        </div>
                        <div className="text-sm font-mono font-bold text-text-primary">{card.value}</div>
                        <div className="text-[9px] font-mono text-text-muted/70 mt-1">{card.detail}</div>
                    </div>
                ))}
            </div>

            {/* Sections (collapsible) */}
            <div className="divide-y divide-border-subtle">
                {brief.sections.map(section => {
                    const isExpanded = expandedSections.has(section.id);
                    return (
                        <div key={buildObservatoryKey("brief-section", brief.id, section.id)} className="bg-surface-hover">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors text-left"
                            >
                                <div className="flex items-center space-x-2">
                                    {isExpanded
                                        ? <ChevronDown className="w-3 h-3 text-text-muted" />
                                        : <ChevronRight className="w-3 h-3 text-text-muted" />
                                    }
                                    <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-widest">
                                        {section.title}
                                    </span>
                                </div>
                                <ConfidenceBadge confidence={section.confidence} />
                            </button>
                            {isExpanded && (
                                <div className="px-5 pb-4">
                                    <p className="text-sm text-text-muted leading-relaxed mb-3">{section.content}</p>
                                    {section.prioritization && (
                                        <p className="text-[10px] font-mono text-accent uppercase mb-3">priority: {section.prioritization.priorityClass}</p>
                                    )}
                                    {section.evidenceRefs.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {section.evidenceRefs.map((ref, index) => (
                                                <span key={buildObservatoryKey("brief-section-ref", section.id, ref.sourceType, ref.sourceId, index)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono bg-surface-hover text-text-muted border border-border-subtle">
                                                    <span className="text-accent">{ref.sourceType}</span>
                                                    <span>·</span>
                                                    <span>{ref.label}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Findings */}
            {brief.findings.length > 0 && (
                <div className="border-t border-border-subtle p-5">
                    <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">Findings</p>
                    <div className="space-y-2">
                        {brief.findings.map(finding => (
                            <div key={buildObservatoryKey("brief-finding", brief.id, finding.id)} className="flex items-start gap-3 p-3 rounded bg-surface-elevated">
                                <div className="shrink-0 mt-0.5">
                                    {finding.severity === "critical"
                                        ? <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                                        : finding.severity === "important"
                                        ? <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                                        : <Info className="w-3.5 h-3.5 text-text-muted" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono font-bold text-text-primary">{finding.title}</span>
                                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase ${severityStyle[finding.severity]}`}>
                                            {finding.severity}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed">{finding.summary}</p>
                                    {finding.prioritization && (
                                        <p className="text-[9px] font-mono text-accent uppercase mt-2">priority: {finding.prioritization.priorityClass}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommended Next Steps */}
            {brief.recommendedNextSteps.length > 0 && (
                <div className="border-t border-border-subtle p-5">
                    <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">Recommended Next Steps</p>
                    <div className="space-y-2">
                        {brief.recommendedNextSteps.map(step => (
                            <div key={buildObservatoryKey("brief-step", brief.id, step.id)} className="flex items-start gap-3 p-3 rounded bg-surface-elevated">
                                <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono font-bold text-text-primary">{step.action}</span>
                                        <span className="px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase text-accent bg-accent-soft border-accent/20">
                                            {step.suggestedInterventionClass}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase ${
                                            step.priority === "high" ? "text-danger bg-danger-soft border-danger/20"
                                            : step.priority === "medium" ? "text-warning bg-warning-soft border-warning/20"
                                            : "text-text-muted bg-surface-hover border-border-subtle"
                                        }`}>
                                            {step.priority}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed">{step.rationale}</p>
                                    {step.prioritization && (
                                        <p className="text-[9px] font-mono text-accent uppercase mt-2">priority: {step.prioritization.priorityClass}</p>
                                    )}
                                    {step.evidenceRefs.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {step.evidenceRefs.map((ref, index) => (
                                                <span key={buildObservatoryKey("brief-step-ref", step.id, ref.sourceType, ref.sourceId, index)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono bg-surface-hover text-text-muted border border-border-subtle">
                                                    <span className="text-accent">{ref.sourceType}</span>
                                                    <span className="text-text-primary/60">-</span>
                                                    <span>{ref.label}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {step.blockedBy && (
                                        <p className="text-[10px] text-danger/70 font-mono mt-1">BLOCKED BY: {step.blockedBy}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Constraints & Limitations */}
            <div className="border-t border-border-subtle p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Constraints */}
                <div>
                    <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Constraint Register</p>
                    <div className="space-y-1.5">
                        {brief.constraints.map(c => (
                            <div key={buildObservatoryKey("brief-constraint", brief.id, c.id)} className="text-[10px] font-mono p-2 rounded bg-surface-elevated border border-border-subtle">
                                <span className="text-accent uppercase">[{c.domain}]</span>{" "}
                                <span className="text-text-primary/80">{c.constraint}</span>
                                <p className="mt-1 text-text-muted leading-relaxed">{c.implication}</p>
                                {c.prioritization && (
                                    <p className="mt-2 text-accent uppercase">priority: {c.prioritization.priorityClass}</p>
                                )}
                                {c.evidenceRefs.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {c.evidenceRefs.map((ref, index) => (
                                            <span key={buildObservatoryKey("brief-constraint-ref", c.id, ref.sourceType, ref.sourceId, index)} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-surface-hover text-text-muted border border-border-subtle">
                                                <span className="text-accent">{ref.sourceType}</span>
                                                <span>{ref.label}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Limitations */}
                <div>
                    <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Known Limitations</p>
                    <div className="space-y-1.5">
                        {brief.knownLimitations.map((lim, index) => (
                            <div key={buildObservatoryKey("brief-limitation", brief.id, index, lim)} className="text-[10px] font-mono p-2 rounded bg-surface-elevated border border-border-subtle text-text-muted">
                                {lim}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
    const style =
        confidence === "high" ? "bg-success-soft text-success border-success/20"
        : confidence === "structural-only" ? "bg-accent-soft text-accent border-accent/20"
        : "bg-surface-hover text-text-muted border-border-subtle";

    return (
        <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-mono ${style}`}>
            {confidence}
        </span>
    );
}



