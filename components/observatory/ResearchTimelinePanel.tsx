"use client";

import { useEffect, useState } from "react";
import type { ResearchTimeline } from "@/lib/types/research-timeline";
import { History, GitBranch, ShieldAlert, Activity, ScrollText, Repeat2 } from "lucide-react";
import { assertUniqueKeys, buildObservatoryKey } from "@/lib/utils/observatory-key";

export function ResearchTimelinePanel() {
    const [timeline, setTimeline] = useState<ResearchTimeline | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchTimeline = async () => {
            try {
                const response = await fetch("/api/research/timeline", { signal: controller.signal });
                if (!response.ok) {
                    const body = await response.text().catch(() => "");
                    throw new Error(body || `HTTP ${response.status}`);
                }

                const data = await response.json();
                setTimeline(data.timeline);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchTimeline();
        return () => controller.abort();
    }, []);

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl animate-pulse">
                <div className="p-4 border-b border-border-subtle bg-surface-hover h-14" />
                <div className="p-6 h-[540px] bg-surface-hover" />
            </div>
        );
    }

    if (error || !timeline) {
        return (
            <div className="rounded-lg border border-danger/30 bg-surface p-6 flex items-center justify-center min-h-[300px]">
                <div className="text-danger font-mono text-sm max-w-md text-center">
                    TIMELINE FAILURE: {error || "Unable to compile the research timeline."}
                </div>
            </div>
        );
    }

    const postureStyle: Record<string, string> = {
        stable: "text-success bg-success-soft border-success/20",
        cautious: "text-warning bg-warning-soft border-warning/20",
        pressured: "text-warning bg-warning-soft border-warning/20",
        fragile: "text-danger bg-danger-soft border-danger/20",
    };

    const recentEvents = [...timeline.narrativeEvents].reverse();

    assertUniqueKeys(
        "ResearchTimelinePanel.sessionRecords",
        timeline.sessionRecords.map(record => buildObservatoryKey("timeline-session", record.sessionId))
    );

    return (
        <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-surface">
                <div className="flex items-center space-x-3">
                    <History className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-mono font-bold tracking-tight text-text-primary">
                        Comparative Research Timeline
                    </h2>
                    <span className={`px-2 py-0.5 rounded border font-mono text-xs uppercase ${postureStyle[timeline.currentCompositePosture] || "text-text-muted bg-surface-hover border-border-subtle"}`}>
                        {timeline.currentCompositePosture}
                    </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                    {timeline.totalSessions} SESSIONS
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-7 gap-0 divide-x divide-border-subtle border-b border-border-subtle bg-surface-elevated">
                <Metric label="Strategy Shifts" value={timeline.strategyShifts.length} detail="Chronological preference changes" />
                <Metric label="Recurring Blockers" value={timeline.blockerPatterns.length} detail="Persistent governance constraints" />
                <Metric label="Calibration Points" value={timeline.calibrationTrajectory.points.length} detail={timeline.calibrationTrajectory.maturity} />
                <Metric
                    label="Replay Transitions"
                    value={timeline.replayTransitions.length}
                    detail="Evidence-grounded lineage changes"
                />
                <Metric
                    label="Comparisons"
                    value={timeline.comparativeEvaluation.comparisonHighlights.length}
                    detail={`${timeline.comparativeEvaluation.highConfidenceComparisonCount} high-confidence`}
                />
                <Metric
                    label="Eval Drift"
                    value={timeline.evaluationDriftHistory.length}
                    detail="Persisted comparison changes"
                />
                <Metric
                    label="Priority Drift"
                    value={timeline.priorityDrift?.totalDrifts ?? 0}
                    detail="Advisory posture changes"
                />
                <Metric
                    label="Priority History"
                    value={timeline.priorityHistorySummary?.totalRecords ?? 0}
                    detail="Persisted priority snapshots"
                />
                <Metric
                    label="Comparisons"
                    value={timeline.snapshotComparisons?.pairwiseComparisons.length ?? 0}
                    detail="Pairwise snapshot transitions"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-0">
                <div className="border-r border-border-subtle p-5 space-y-5">
                    <section>
                        <h3 className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            Research Prioritization Highlights
                        </h3>
                        <div className="space-y-2">
                            {timeline.prioritizationHighlights.length === 0 ? (
                                <EmptyNote message="No elevated advisory-only research priority signals are active yet." />
                            ) : timeline.prioritizationHighlights.map(signal => (
                                <div key={buildObservatoryKey("timeline-priority", signal.id)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-mono text-text-primary uppercase">{signal.priorityClass}</span>
                                        <span className="text-[10px] font-mono text-text-muted">{signal.advisoryLevel}</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">{signal.rationale}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {timeline.governanceSynthesis && (
                        <section>
                            <h3 className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                                Governance Synthesis (Advisory)
                            </h3>
                            <p className="text-[10px] font-mono text-text-muted/70 mb-2">{timeline.governanceSynthesis.postureAssessment}</p>
                            {timeline.governanceSynthesis.signals.length > 0 && (
                                <div className="space-y-2 mb-2">
                                    {timeline.governanceSynthesis.signals.map(signal => (
                                        <div key={buildObservatoryKey("timeline-synth-signal", signal.priorityClass)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[11px] font-mono text-text-primary uppercase">{signal.priorityClass}</span>
                                                <span className="text-[10px] font-mono text-text-muted">{signal.signalPosture} · {signal.currentLevel}</span>
                                            </div>
                                            <p className="text-[10px] text-text-muted leading-relaxed">{signal.synthesisNarrative}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {timeline.governanceSynthesis.evidenceLimitations.limitationNarrative && (
                                <p className="text-[10px] font-mono text-text-muted/50 mb-1">{timeline.governanceSynthesis.evidenceLimitations.limitationNarrative}</p>
                            )}
                            <p className="text-[9px] font-mono text-text-muted/40 mt-1">{timeline.governanceSynthesis.governanceCaveat}</p>
                        </section>
                    )}

                    {timeline.priorityDrift && timeline.priorityDrift.totalDrifts > 0 && (
                        <section>
                            <h3 className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                                Priority Drift (Advisory)
                            </h3>
                            <p className="text-[10px] font-mono text-text-muted/70 mb-2">{timeline.priorityDrift.summary}</p>
                            <div className="space-y-2">
                                {timeline.priorityDrift.driftRecords.map(drift => (
                                    <div key={buildObservatoryKey("timeline-priority-drift", drift.driftId)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[11px] font-mono text-text-primary uppercase">{drift.priorityClass}</span>
                                            <span className="text-[10px] font-mono text-accent">{drift.driftKind}</span>
                                        </div>
                                        {drift.changeDrivers.map((driver, driverIdx) => (
                                            <p key={`${drift.driftId}-driver-${driverIdx}`} className="text-[10px] text-text-muted leading-relaxed">{driver.note}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {timeline.priorityHistorySummary && timeline.priorityHistorySummary.totalRecords > 0 && (
                        <section>
                            <h3 className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                                Priority History (Advisory — Interpretation Snapshots)
                            </h3>
                            <p className="text-[10px] font-mono text-text-muted/70 mb-1">
                                {timeline.priorityHistorySummary.totalRecords} persisted snapshot(s) · {timeline.priorityHistorySummary.stabilityAssessment}
                            </p>
                            <p className="text-[9px] font-mono text-text-muted/50 italic mb-2">
                                Chronicity patterns describe structural recurrence, not truth confirmation.
                            </p>
                            <div className="space-y-2">
                                {timeline.priorityHistorySummary.classPatterns.map(pattern => (
                                    <div key={buildObservatoryKey("timeline-priority-history", pattern.priorityClass)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[11px] font-mono text-text-primary uppercase">{pattern.priorityClass}</span>
                                            <span className="text-[10px] font-mono text-text-muted">{pattern.chronicity} · {pattern.postureTrend}</span>
                                        </div>
                                        <p className="text-[10px] text-text-muted leading-relaxed">{pattern.narrative}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {timeline.snapshotComparisons && timeline.snapshotComparisons.totalSnapshots >= 2 && (
                        <section>
                            <h3 className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                                Snapshot Comparisons (Advisory — Structural Transitions)
                            </h3>
                            <p className="text-[9px] font-mono text-text-muted/50 italic mb-2">
                                Transitions describe advisory posture changes between consecutive snapshots, not research outcomes.
                            </p>
                            {timeline.snapshotComparisons.persistentSignals.length > 0 && (
                                <p className="text-[10px] font-mono text-text-muted/70 mb-1">
                                    Persistent signals: {timeline.snapshotComparisons.persistentSignals.map(s => s.replace(/-/g, " ")).join(", ")}
                                </p>
                            )}
                            {timeline.snapshotComparisons.emergingSignals.length > 0 && (
                                <p className="text-[10px] font-mono text-text-muted/70 mb-1">
                                    Emerging signals: {timeline.snapshotComparisons.emergingSignals.map(s => s.replace(/-/g, " ")).join(", ")}
                                </p>
                            )}
                            {timeline.snapshotComparisons.weakeningSignals.length > 0 && (
                                <p className="text-[10px] font-mono text-text-muted/70 mb-1">
                                    Weakening signals: {timeline.snapshotComparisons.weakeningSignals.map(s => s.replace(/-/g, " ")).join(", ")}
                                </p>
                            )}
                            {timeline.snapshotComparisons.experimentStability.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {timeline.snapshotComparisons.experimentStability.map(exp => (
                                        <div key={buildObservatoryKey("timeline-exp-stability", exp.experimentId)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[11px] font-mono text-text-primary">{exp.experimentTitle}</span>
                                                <span className="text-[10px] font-mono text-text-muted">{exp.stabilityLabel} · {exp.dominantLevel}</span>
                                            </div>
                                            <p className="text-[10px] text-text-muted leading-relaxed">{exp.narrative}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    <section>
                        <h3 className="text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            Chronological Sessions
                        </h3>
                        <div className="space-y-3">
                            {timeline.sessionRecords.map(record => (
                                <div key={buildObservatoryKey("timeline-session", record.sessionId)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <p className="text-xs font-mono font-bold text-text-primary">{record.objective}</p>
                                            <p className="text-[10px] font-mono text-text-muted mt-1">
                                                {new Date(record.simulatedAt).toLocaleString()} · {record.worldStateReference}
                                            </p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded border text-[9px] font-mono uppercase text-accent bg-accent-soft border-accent/20">
                                            {record.preferredStrategy}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed">{record.worldStateSummary}</p>
                                    <div className="flex flex-wrap gap-2 mt-3 text-[9px] font-mono text-text-muted">
                                        <span className="px-1.5 py-0.5 rounded bg-surface-hover border border-border-subtle">branches: {record.branchCount}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-surface-hover border border-border-subtle">outcome: {record.dominantOutcome}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-surface-hover border border-border-subtle">evidence: {record.benchmarkEvidence}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-surface-hover border border-border-subtle">recommended: {record.recommendedInterventionClass}</span>
                                    </div>
                                    {record.governanceBlockers.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {record.governanceBlockers.map(blocker => (
                                                <span key={buildObservatoryKey("timeline-session-blocker", record.sessionId, blocker)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono bg-danger-soft text-danger border border-danger/20">
                                                    {blocker}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <ScrollText className="w-3 h-3" />
                            <span>Narrative Playback</span>
                        </h3>
                        <div className="space-y-2">
                            {recentEvents.map(event => (
                                <div key={buildObservatoryKey("timeline-event", event.id)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-3 mb-1">
                                        <span className="text-[10px] font-mono uppercase text-accent">{event.category}</span>
                                        <span className="text-[10px] font-mono text-text-muted">{new Date(event.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[11px] font-mono text-text-primary mb-1">{event.title}</p>
                                    <p className="text-[10px] text-text-muted leading-relaxed">{event.summary}</p>
                                    {event.prioritization && (
                                        <p className="text-[9px] font-mono text-accent mt-2 uppercase">priority: {event.prioritization.priorityClass}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-5 space-y-5 bg-surface-elevated">
                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <GitBranch className="w-3 h-3" />
                            <span>Strategy Shift Detection</span>
                        </h3>
                        <div className="space-y-2">
                            {timeline.strategyShifts.length === 0 ? (
                                <EmptyNote message="No preferred strategy shifts have been detected across the recorded session history." />
                            ) : timeline.strategyShifts.map(shift => (
                                <div key={buildObservatoryKey("timeline-shift", shift.id)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-mono text-text-primary">{`${shift.fromStrategy} -> ${shift.toStrategy}`}</span>
                                        <span className="text-[10px] font-mono text-text-muted">{new Date(shift.detectedAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">{shift.rationale}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Blocker Recurrence</span>
                        </h3>
                        <div className="space-y-2">
                            {timeline.blockerPatterns.length === 0 ? (
                                <EmptyNote message="No recurring governance blockers detected." />
                            ) : timeline.blockerPatterns.map(pattern => (
                                <div key={buildObservatoryKey("timeline-pattern", pattern.blocker)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-mono text-text-primary">{pattern.blocker}</span>
                                        <span className="text-[10px] font-mono text-text-muted">{pattern.occurrences} sessions</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">
                                        First seen {new Date(pattern.firstSeenAt).toLocaleString()} and last seen {new Date(pattern.lastSeenAt).toLocaleString()}.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <Repeat2 className="w-3 h-3" />
                            <span>Replay Lineage Transitions</span>
                        </h3>
                        <div className="space-y-2 mb-5">
                            {timeline.replayTransitions.length === 0 ? (
                                <EmptyNote message="No replay-lineage transitions are available yet." />
                            ) : timeline.replayTransitions.map(transition => (
                                <div key={buildObservatoryKey("timeline-replay-transition", transition.id)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-mono text-text-primary">{transition.experimentTitle}</span>
                                        <span className="text-[10px] font-mono text-text-muted">{new Date(transition.transitionedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2 text-[9px] font-mono text-text-muted">
                                        <span className="px-1.5 py-0.5 rounded bg-surface-hover border border-border-subtle">{transition.replayability}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-surface-hover border border-border-subtle">{transition.lineageStatus}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-surface-hover border border-border-subtle">{transition.basedOnExecutionEvidence ? "execution-backed" : "artifact-only"}</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">{transition.note}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <Repeat2 className="w-3 h-3" />
                            <span>Experiment Comparison Highlights</span>
                        </h3>
                        <div className="space-y-2 mb-5">
                            {timeline.comparativeEvaluation.comparisonHighlights.length === 0 ? (
                                <EmptyNote message="No evidence-weighted experiment comparisons are available yet." />
                            ) : timeline.comparativeEvaluation.comparisonHighlights.map(comparison => (
                                <div key={buildObservatoryKey("timeline-comparison", comparison.comparisonId)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-mono text-text-primary">{comparison.leftExperimentTitle} vs {comparison.rightExperimentTitle}</span>
                                        <span className="text-[10px] font-mono text-text-muted">{comparison.confidence}</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">{comparison.rationale}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <Repeat2 className="w-3 h-3" />
                            <span>Evaluation Drift History</span>
                        </h3>
                        <div className="space-y-2 mb-5">
                            {timeline.evaluationDriftHistory.length === 0 ? (
                                <EmptyNote message="No persisted evaluation drift history is available yet." />
                            ) : timeline.evaluationDriftHistory.map(drift => (
                                <div key={buildObservatoryKey("timeline-drift", drift.driftId)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-mono text-text-primary">{drift.changedExperimentCount} experiment change(s)</span>
                                        <span className="text-[10px] font-mono text-text-muted">{new Date(drift.comparedAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">{drift.narrative}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <Activity className="w-3 h-3" />
                            <span>Calibration Trajectory</span>
                        </h3>
                        <div className="rounded-md border border-border-subtle bg-surface-elevated p-3 mb-2">
                            <p className="text-[10px] text-text-muted leading-relaxed">{timeline.calibrationTrajectory.summary}</p>
                        </div>
                        <div className="space-y-2">
                            {timeline.calibrationTrajectory.points.length === 0 ? (
                                <EmptyNote message="No calibration points are available yet." />
                            ) : timeline.calibrationTrajectory.points.map(point => (
                                <div key={buildObservatoryKey("timeline-calibration-point", point.pointId)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-mono text-text-primary">{(point.aggregateAlignmentScore * 100).toFixed(1)}%</span>
                                        <span className="text-[10px] font-mono text-text-muted">{new Date(point.comparedAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">
                                        {point.totalEvaluated} comparison{point.totalEvaluated === 1 ? "" : "s"} · movement: {point.movement.replace(/-/g, " ")} · latest result: {point.latestResult}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-muted tracking-widest uppercase mb-3">
                            <Activity className="w-3 h-3" />
                            <span>Experiment Evaluation Ledger</span>
                        </h3>
                        <div className="space-y-2">
                            {timeline.comparativeEvaluation.evaluations.length === 0 ? (
                                <EmptyNote message="No experiment evaluations are available yet." />
                            ) : timeline.comparativeEvaluation.evaluations.map(evaluation => (
                                <div key={buildObservatoryKey("timeline-evaluation", evaluation.experimentId)} className="rounded-md border border-border-subtle bg-surface-elevated p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[11px] font-mono text-text-primary">{evaluation.experimentTitle}</span>
                                        <span className="text-[10px] font-mono text-text-muted">{evaluation.comparativeWeightLabel}</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted leading-relaxed">{evaluation.rationale}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
    return (
        <div className="p-3 bg-surface-elevated">
            <div className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-1">{label}</div>
            <div className="text-sm font-mono font-bold text-text-primary">{value}</div>
            <div className="text-[9px] font-mono text-text-muted mt-1">{detail}</div>
        </div>
    );
}

function EmptyNote({ message }: { message: string }) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-elevated p-3 text-[10px] text-text-muted leading-relaxed">
            {message}
        </div>
    );
}


