import fs from "fs";
import path from "path";
import type { ExperimentDetailResponse } from "../types/experiment-registry";
import type { BranchStrategy } from "../types/intervention";
import type { BenchmarkHarnessRun, SimulationOutcomeClass, SimulationSession } from "../types/simulation";
import type { ResearchTimeline, TimelineNarrativeEvent, TimelineSessionRecord } from "../types/research-timeline";
import { OBSERVATORY_VERSION } from "../constants/observatory";
import { ExperimentMemoryStore } from "./experiment-memory";
import { ExperimentDetailBuilder } from "./experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "./evidence-weighted-evaluator";
import { EvaluationSnapshotStore } from "./evaluation-snapshot-store";
import { LatentStateEncoder } from "./latent-state-encoder";
import { StrategyCompatibilityAnalyzer } from "./strategy-compatibility-analyzer";
import { captureRepoSnapshot } from "./world-state-capturer";
import { analyzeDependencies } from "./dependency-analyzer";
import { StrategyShiftDetector } from "./strategy-shift-detector";
import { BlockerPatternDetector } from "./blocker-pattern-detector";
import { CalibrationTrajectoryAnalyzer } from "./calibration-trajectory-analyzer";
import { ResearchPrioritizationEngine } from "./research-prioritization-engine";
import { PriorityDriftAnalyzer } from "./priority-drift-analyzer";
import { PriorityHistoryAnalyzer } from "./priority-history-analyzer";
import { SnapshotComparator } from "./snapshot-comparator";
import { ComparativeGovernanceSynthesizer } from "./comparative-governance-synthesizer";
import { RecommendationGovernance } from "./recommendation-governance";

const SIM_DIR = path.join(process.cwd(), "artifacts", "simulations");

export class ResearchTimelineBuilder {
    public static buildTimeline(): ResearchTimeline {
        const now = new Date().toISOString();
        const timelineId = `timeline-${Date.now().toString(36)}`;
        const memory = ExperimentMemoryStore.compileMemory();
        const sessions = this.loadSessions();
        const benchmarks = this.loadBenchmarks();
        const experimentDetails = ExperimentDetailBuilder.list();
        const comparativeEvaluation = EvidenceWeightedEvaluator.evaluatePortfolio(experimentDetails);
        const latestEvaluationRecord = EvaluationSnapshotStore.getLatest();
        const evaluationDriftHistory = EvaluationSnapshotStore.deriveDriftHistory(8).map(drift => ({
            driftId: drift.driftId,
            comparedAt: drift.comparedAt,
            fromRecordId: drift.fromRecordId,
            toRecordId: drift.toRecordId,
            strongestExperimentChanged: drift.strongestExperimentChanged,
            highConfidenceComparisonDelta: drift.highConfidenceComparisonDelta,
            changedExperimentCount: drift.changedExperiments.length,
            narrative: drift.narrative,
        }));
        const benchmarkBySessionId = new Map(benchmarks.map(benchmark => [benchmark.sessionId, benchmark]));

        const workspaceRoot = process.cwd();
        const snapshot = captureRepoSnapshot(workspaceRoot);
        const dependencies = analyzeDependencies(snapshot.nodes, workspaceRoot);
        const latentState = LatentStateEncoder.encode(snapshot, dependencies);
        const compatibility = StrategyCompatibilityAnalyzer.analyze(latentState);
        const replayStatusSummary = {
            totalExperiments: experimentDetails.length,
            baselineOnlyCount: experimentDetails.filter(detail => detail.replay.lineageStatus === "baseline-only").length,
            partialCount: experimentDetails.filter(detail => detail.replay.lineageStatus === "stored-evidence-chain").length,
            fullCount: experimentDetails.filter(detail => detail.replay.lineageStatus === "full-replay-package").length,
            strongestExperimentId: comparativeEvaluation.strongestExperimentId,
            strongestExperimentTitle: comparativeEvaluation.strongestExperimentTitle,
            strongestReplayability: experimentDetails[0]?.replay.replayability ?? null,
            strongestLineageStatus: experimentDetails[0]?.replay.lineageStatus ?? null,
            evidenceClass: experimentDetails[0]?.replay.lineageStatus ?? "no-experiments",
            reproducibilityCaveat: "Replay posture remains artifact-bounded and does not imply exact historical reconstruction.",
        } as const;
        const prioritizationContext = ResearchPrioritizationEngine.buildContext(
            experimentDetails,
            comparativeEvaluation,
            replayStatusSummary,
            now
        );
        const priorityDrift = PriorityDriftAnalyzer.analyze(prioritizationContext);
        const priorityHistorySummary = PriorityHistoryAnalyzer.analyze();
        const snapshotComparisons = SnapshotComparator.compare();
        const recommendationGovernance = RecommendationGovernance.govern(prioritizationContext);
        const governanceSynthesis = ComparativeGovernanceSynthesizer.synthesize(
            prioritizationContext,
            priorityDrift,
            recommendationGovernance,
            priorityHistorySummary.totalRecords > 0 ? priorityHistorySummary : null,
            snapshotComparisons.totalSnapshots >= 2 ? snapshotComparisons : null,
        );

        const sessionRecords = sessions.map(session => {
            return this.buildSessionRecord(session, benchmarkBySessionId.get(session.id) ?? null);
        });
        const strategyShifts = StrategyShiftDetector.detect(sessionRecords);
        const blockerPatterns = BlockerPatternDetector.detect(sessions);
        const calibrationTrajectory = CalibrationTrajectoryAnalyzer.analyze();
        const replayTransitions = this.buildReplayTransitions(experimentDetails);
        const narrativeEvents = this.buildNarrativeEvents(sessionRecords, strategyShifts, blockerPatterns, calibrationTrajectory, replayTransitions, comparativeEvaluation, evaluationDriftHistory, prioritizationContext, priorityDrift);

        return {
            id: timelineId,
            generatedAt: now,
            systemVersion: OBSERVATORY_VERSION,
            phaseActive: 23,
            totalSessions: memory.totalSimulationSessions,
            currentCompositePosture: latentState.compositePosture,
            currentCompatibilitySnapshot: compatibility,
            comparativeEvaluation,
            prioritizationContext,
            prioritizationHighlights: prioritizationContext.topPriorities,
            priorityDrift,
            priorityHistorySummary: priorityHistorySummary.totalRecords > 0 ? priorityHistorySummary : null,
            snapshotComparisons: snapshotComparisons.totalSnapshots >= 2 ? snapshotComparisons : null,
            governanceSynthesis,
            sessionRecords,
            strategyShifts,
            blockerPatterns,
            calibrationTrajectory,
            replayTransitions,
            evaluationDriftHistory,
            narrativeEvents,
            knownLimitations: [
                "Historical world-state diffs are not persisted per session. Timeline world-state progression is limited to recorded baseline snapshot references.",
                "Calibration trajectory is derived from execution comparisons, not from every simulation session.",
                "Preferred strategy shifts are inferred from benchmark winners or favorable branch outcomes when explicit winners are absent.",
                "Replay transition timestamps are reconstructed from persisted artifact times, not from a dedicated transition ledger.",
                "Experiment comparison highlights rank persisted evidence classes and empirical depth; they do not imply exact replay reconstruction or causal proof.",
                latestEvaluationRecord
                    ? "Persisted evaluation snapshots capture interpretation history, but they remain derived artifacts rather than raw evidence truth."
                    : "No persisted evaluation snapshots exist yet, so comparative drift is only available after an explicit write-side snapshot is created.",
                governanceSynthesis.governanceCaveat,
            ],
        };
    }

    public static buildNarrativeSummary(timeline: ResearchTimeline): string {
        const firstSession = timeline.sessionRecords[0];
        const lastSession = timeline.sessionRecords[timeline.sessionRecords.length - 1];
        const topBlocker = timeline.blockerPatterns[0];

        const parts: string[] = [
            timeline.totalSessions > 0
                ? `The research timeline spans ${timeline.totalSessions} recorded sessions from ${this.formatTimestamp(firstSession?.simulatedAt)} to ${this.formatTimestamp(lastSession?.simulatedAt)}.`
                : "No recorded sessions are available for timeline playback.",
            `Current structural posture is ${timeline.currentCompositePosture}.`,
            timeline.strategyShifts.length > 0
                ? `${timeline.strategyShifts.length} strategy shift${timeline.strategyShifts.length === 1 ? "" : "s"} were detected across the session history.`
                : "No strategy shifts have been detected across the recorded session history.",
            topBlocker
                ? `The most persistent governance blocker is '${topBlocker.blocker}', recurring across ${topBlocker.occurrences} sessions.`
                : "No recurring governance blocker patterns were detected.",
            timeline.comparativeEvaluation.strongestExperimentTitle
                ? `Current evidence-weighted leader is ${timeline.comparativeEvaluation.strongestExperimentTitle}, with ${timeline.comparativeEvaluation.highConfidenceComparisonCount} high-confidence comparison(s).`
                : "No evidence-weighted experiment comparison is available yet.",
            timeline.prioritizationHighlights[0]
                ? `Primary advisory priority: ${timeline.prioritizationHighlights[0].summary}`
                : "No elevated advisory priority signal is active yet.",
            timeline.evaluationDriftHistory[0]
                ? `Latest persisted evaluation drift: ${timeline.evaluationDriftHistory[0].narrative}`
                : "No persisted evaluation drift history is available yet.",
            timeline.priorityDrift && timeline.priorityDrift.totalDrifts > 0
                ? `Priority drift: ${timeline.priorityDrift.summary}`
                : timeline.priorityDrift?.priorSnapshotAt
                    ? "No priority drift detected since last snapshot."
                    : "",
            timeline.calibrationTrajectory.summary,
            "Historical world-state progression remains limited to recorded baseline snapshot references because per-session diffs were not persisted.",
        ];

        return parts.join(" ");
    }

    private static buildSessionRecord(
        session: SimulationSession,
        benchmark: BenchmarkHarnessRun | null
    ): TimelineSessionRecord {
        const preferredStrategy = this.resolvePreferredStrategy(session, benchmark);
        const dominantOutcome = this.resolveDominantOutcome(session);
        const governanceBlockers = Array.from(new Set(session.branchResults.flatMap(result => result.governanceBlockers)));

        return {
            sessionId: session.id,
            experimentId: session.experimentId ?? null,
            simulatedAt: session.simulatedAt,
            objective: session.objective.objective,
            baselineWorldStateId: session.baselineWorldStateId,
            branchCount: session.branchResults.length,
            dominantOutcome,
            preferredStrategy,
            benchmarkEvidence: benchmark?.overallEvidenceSufficiency ?? "unavailable",
            governanceBlockers,
            worldStateReference: session.baselineWorldStateId,
            worldStateSummary: `Session evaluated against baseline world-state reference ${session.baselineWorldStateId}. Historical world-state diffs were not persisted for this run.`,
            recommendedInterventionClass: preferredStrategy,
            recommendationRationale: preferredStrategy === "unknown"
                ? "No stable preferred strategy was recorded for this session."
                : `Session evidence favors a ${preferredStrategy} follow-up if this objective is revisited.`,
        };
    }

    private static buildNarrativeEvents(
        sessionRecords: TimelineSessionRecord[],
        strategyShifts: ResearchTimeline["strategyShifts"],
        blockerPatterns: ResearchTimeline["blockerPatterns"],
        calibrationTrajectory: ResearchTimeline["calibrationTrajectory"],
        replayTransitions: ResearchTimeline["replayTransitions"],
        comparativeEvaluation: ResearchTimeline["comparativeEvaluation"],
        evaluationDriftHistory: ResearchTimeline["evaluationDriftHistory"],
        prioritizationContext: ResearchTimeline["prioritizationContext"],
        priorityDrift: ResearchTimeline["priorityDrift"]
    ): TimelineNarrativeEvent[] {
        const comparisonPriority = ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "comparison-limited");
        const calibrationPriority = ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "empirically-strong-but-calibration-limited");
        const events: TimelineNarrativeEvent[] = sessionRecords.map(record => ({
            id: `event-session-${record.sessionId}`,
            timestamp: record.simulatedAt,
            category: "session",
            title: `Session recorded: ${record.objective}`,
            summary: `${record.branchCount} branches were simulated against ${record.worldStateReference}. Preferred strategy: ${record.preferredStrategy}. Dominant outcome: ${record.dominantOutcome}.`,
            relatedSessionId: record.sessionId,
            prioritization: prioritizationContext.topPriorities.find(signal => signal.experimentId === record.experimentId) ?? null,
        }));

        for (const shift of strategyShifts) {
            events.push({
                id: `event-${shift.id}`,
                timestamp: shift.detectedAt,
                category: "strategy-shift",
                title: `Strategy shift to ${shift.toStrategy}`,
                summary: shift.rationale,
                relatedSessionId: shift.sessionId,
                prioritization: null,
            });
        }

        for (const pattern of blockerPatterns.slice(0, 3)) {
            events.push({
                id: `event-blocker-${pattern.blocker}`,
                timestamp: pattern.lastSeenAt,
                category: "governance-blocker",
                title: `Recurring blocker: ${pattern.blocker}`,
                summary: `This blocker recurred across ${pattern.occurrences} sessions and affected objectives including ${pattern.affectedObjectives.slice(0, 2).join(" and ")}.`,
                relatedSessionId: pattern.affectedSessionIds[pattern.affectedSessionIds.length - 1] ?? null,
                prioritization: null,
            });
        }

        const latestCalibrationPoint = calibrationTrajectory.points[calibrationTrajectory.points.length - 1];
        if (latestCalibrationPoint) {
            events.push({
                id: "event-calibration-latest",
                timestamp: latestCalibrationPoint.comparedAt,
                category: "calibration",
                title: "Calibration trajectory update",
                summary: calibrationTrajectory.summary,
                relatedSessionId: null,
                prioritization: calibrationPriority,
            });
        }

        for (const transition of replayTransitions) {
            events.push({
                id: `event-${transition.id}`,
                timestamp: transition.transitionedAt,
                category: "replay-lineage",
                title: `Replay transition: ${transition.experimentTitle}`,
                summary: transition.note,
                relatedSessionId: null,
                prioritization: prioritizationContext.topPriorities.find(signal => signal.experimentId === transition.experimentId) ?? null,
            });
        }

        for (const comparison of this.buildComparativeEvents(comparativeEvaluation)) {
            events.push(comparison);
        }

        for (const drift of evaluationDriftHistory.slice(0, 3)) {
            events.push({
                id: `event-${drift.driftId}`,
                timestamp: drift.comparedAt,
                category: "evaluation-drift",
                title: "Persisted evaluation drift update",
                summary: drift.narrative,
                relatedSessionId: null,
                prioritization: comparisonPriority,
            });
        }

        if (priorityDrift && priorityDrift.totalDrifts > 0) {
            for (const driftRecord of priorityDrift.driftRecords.slice(0, 5)) {
                events.push({
                    id: `event-${driftRecord.driftId}`,
                    timestamp: driftRecord.detectedAt,
                    category: "priority-drift",
                    title: `Priority drift: ${driftRecord.priorityClass} (${driftRecord.driftKind})`,
                    summary: driftRecord.changeDrivers.map(d => d.note).join(" "),
                    relatedSessionId: null,
                    prioritization: driftRecord.currentSignal ?? driftRecord.previousSignal ?? null,
                });
            }
        }

        return events.sort((left, right) => {
            return new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
        });
    }

    private static buildComparativeEvents(portfolio: ResearchTimeline["comparativeEvaluation"]): TimelineNarrativeEvent[] {
        return portfolio.comparisonHighlights.slice(0, 3).map(comparison => ({
            id: `event-${comparison.comparisonId}`,
            timestamp: portfolio.generatedAt,
            category: "experiment-comparison",
            title: `Experiment comparison: ${comparison.leftExperimentTitle} vs ${comparison.rightExperimentTitle}`,
            summary: comparison.rationale,
            relatedSessionId: null,
            prioritization: null,
        }));
    }

    private static buildReplayTransitions(experimentDetails: ExperimentDetailResponse[]): ResearchTimeline["replayTransitions"] {
        const transitions: ResearchTimeline["replayTransitions"] = [];

        for (const detail of experimentDetails) {
            const snapshotAt = this.firstTimestamp(detail.snapshots.map(snapshot => snapshot.timestamp));
            const sessionAt = this.firstTimestamp(detail.simulations.map(session => session.simulatedAt));
            const benchmarkAt = this.firstTimestamp(detail.benchmarks.map(benchmark => benchmark.evaluatedAt));
            const executionAt = this.firstTimestamp(detail.executions.map(execution => execution.createdAt));
            const replayPackageCreatedAt = detail.replay.replayPackage?.createdAt ?? null;

            if (replayPackageCreatedAt) {
                transitions.push({
                    id: `replay-package-${detail.experiment.experimentId}`,
                    experimentId: detail.experiment.experimentId,
                    experimentTitle: detail.experiment.objective.title,
                    transitionedAt: replayPackageCreatedAt,
                    replayability: "insufficient-evidence",
                    lineageStatus: "baseline-only",
                    basedOnExecutionEvidence: false,
                    note: `A replay package first appeared for '${detail.experiment.objective.title}', but the experiment remained baseline-only until persisted baseline, simulation, and benchmark evidence were attached.`,
                });
            }

            const storedEvidenceChainAt = this.maxTimestamp([snapshotAt, sessionAt, benchmarkAt]);
            if (storedEvidenceChainAt && (detail.replay.lineageStatus === "stored-evidence-chain" || detail.replay.lineageStatus === "full-replay-package")) {
                transitions.push({
                    id: `replay-partial-${detail.experiment.experimentId}`,
                    experimentId: detail.experiment.experimentId,
                    experimentTitle: detail.experiment.objective.title,
                    transitionedAt: storedEvidenceChainAt,
                    replayability: "partial",
                    lineageStatus: "stored-evidence-chain",
                    basedOnExecutionEvidence: false,
                    note: "The experiment crossed into stored-evidence-chain replay once baseline snapshot, simulation, and benchmark artifacts were all persisted.",
                });
            }

            const fullReplayAt = this.maxTimestamp([storedEvidenceChainAt, executionAt]);
            if (fullReplayAt && detail.replay.lineageStatus === "full-replay-package") {
                transitions.push({
                    id: `replay-full-${detail.experiment.experimentId}`,
                    experimentId: detail.experiment.experimentId,
                    experimentTitle: detail.experiment.objective.title,
                    transitionedAt: fullReplayAt,
                    replayability: "full",
                    lineageStatus: "full-replay-package",
                    basedOnExecutionEvidence: true,
                    note: "The experiment reached full-replay-package lineage only after execution evidence joined the stored evidence chain. This remains artifact-complete lineage, not guaranteed historical reconstruction.",
                });
            }
        }

        return transitions.sort((left, right) => new Date(left.transitionedAt).getTime() - new Date(right.transitionedAt).getTime());
    }

    private static resolvePreferredStrategy(
        session: SimulationSession,
        benchmark: BenchmarkHarnessRun | null
    ): BranchStrategy | "mixed" | "unknown" {
        if (benchmark?.strongestCandidateId) {
            const ranking = benchmark.rankings.find(item => item.branchId === benchmark.strongestCandidateId);
            if (ranking?.strategyClass) {
                return ranking.strategyClass as BranchStrategy;
            }
        }

        const favorableStrategies = session.branchResults
            .filter(result => result.outcomeClass === "structurally-favorable" || result.outcomeClass === "review-heavy")
            .map(result => result.strategyClass)
            .filter((strategy): strategy is BranchStrategy => Boolean(strategy));

        if (favorableStrategies.length === 0) return "unknown";

        const counts = new Map<string, number>();
        for (const strategy of favorableStrategies) {
            counts.set(strategy, (counts.get(strategy) ?? 0) + 1);
        }

        const sorted = Array.from(counts.entries()).sort((left, right) => right[1] - left[1]);
        if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
            return "mixed";
        }

        return (sorted[0]?.[0] as BranchStrategy | undefined) ?? "unknown";
    }

    private static resolveDominantOutcome(session: SimulationSession): SimulationOutcomeClass | "unknown" {
        const counts = new Map<SimulationOutcomeClass, number>();
        for (const result of session.branchResults) {
            counts.set(result.outcomeClass, (counts.get(result.outcomeClass) ?? 0) + 1);
        }

        const sorted = Array.from(counts.entries()).sort((left, right) => right[1] - left[1]);
        return sorted[0]?.[0] ?? "unknown";
    }

    private static loadSessions(): SimulationSession[] {
        return this.readArtifacts<SimulationSession>("session-")
            .sort((left, right) => new Date(left.simulatedAt).getTime() - new Date(right.simulatedAt).getTime());
    }

    private static loadBenchmarks(): BenchmarkHarnessRun[] {
        return this.readArtifacts<BenchmarkHarnessRun>("benchmark-")
            .sort((left, right) => new Date(left.evaluatedAt).getTime() - new Date(right.evaluatedAt).getTime());
    }

    private static readArtifacts<T>(prefix: string): T[] {
        if (!fs.existsSync(SIM_DIR)) return [];

        return fs.readdirSync(SIM_DIR)
            .filter(file => file.startsWith(prefix) && file.endsWith(".json"))
            .map(file => {
                const raw = fs.readFileSync(path.join(SIM_DIR, file), "utf-8");
                return JSON.parse(raw) as T;
            });
    }

    private static formatTimestamp(value: string | undefined): string {
        if (!value) return "unknown time";
        return new Date(value).toLocaleString();
    }

    private static firstTimestamp(values: string[]): string | null {
        const sorted = values.filter(Boolean).sort((left, right) => new Date(left).getTime() - new Date(right).getTime());
        return sorted[0] ?? null;
    }

    private static maxTimestamp(values: Array<string | null>): string | null {
        if (values.some(value => !value)) return null;
        return values
            .filter((value): value is string => Boolean(value))
            .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null;
    }
}