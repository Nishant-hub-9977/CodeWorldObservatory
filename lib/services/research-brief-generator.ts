// ─── Research Brief Generator ─────────────────────────────────────────
// Phase 10: Synthesizes a structured ObservatoryBrief from all data
// sources — world state, benchmarks, experiment memory, dossier,
// latent state, strategy compatibility, and transition patterns.
//
// Every section is data-driven from persisted artifacts and live
// computations. No hardcoded narrative content.

import type {
    ObservatoryBrief,
    BriefSection,
    BriefEvidenceReference,
    ExecutiveFinding,
    ConstraintRegister,
    RecommendedNextStep,
    ResearchSummaryCard,
    ReplayStatusSummary,
} from "../types/research-export";
import type { ExperimentEvaluationPortfolio } from "../types/experiment-evaluation";
import type { LatentRepoState, StrategyCompatibilityAssessment, TransitionPatternRecord } from "../types/latent-state";
import type { ExperimentSessionRecord } from "../types/research-memory";
import type { ExperimentDetailResponse } from "../types/experiment-registry";
import type { RepoSnapshot } from "../types/world-state";
import type { BranchStrategy } from "../types/intervention";
import type { ResearchPrioritizationContext } from "../types/research-prioritization";

import { OBSERVATORY_VERSION } from "../constants/observatory";
import { ExperimentMemoryStore } from "./experiment-memory";
import { DossierGenerator } from "./dossier-generator";
import { ExperimentDetailBuilder } from "./experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "./evidence-weighted-evaluator";
import { EvaluationSnapshotStore } from "./evaluation-snapshot-store";
import { LatentStateEncoder } from "./latent-state-encoder";
import { StrategyCompatibilityAnalyzer } from "./strategy-compatibility-analyzer";
import { TransitionPatternAnalyzer } from "./transition-pattern-analyzer";
import { captureRepoSnapshot } from "./world-state-capturer";
import { analyzeDependencies } from "./dependency-analyzer";
import { ResearchPrioritizationEngine } from "./research-prioritization-engine";
import { PriorityDriftAnalyzer } from "./priority-drift-analyzer";
import { RecommendationGovernance } from "./recommendation-governance";
import { PriorityHistoryAnalyzer } from "./priority-history-analyzer";
import { SnapshotComparator } from "./snapshot-comparator";
import { ComparativeGovernanceSynthesizer } from "./comparative-governance-synthesizer";

const CALIBRATION_MATURITY_THRESHOLD = 3;

export class ResearchBriefGenerator {
    /**
     * Generates a complete ObservatoryBrief by synthesizing data from
     * all available system sources.
     */
    public static generateBrief(): ObservatoryBrief {
        const now = new Date().toISOString();
        const briefId = `brief-${Date.now().toString(36)}`;

        // ─── Gather data from all sources ─────────────────────────
        const workspaceRoot = process.cwd();
        const snapshot = captureRepoSnapshot(workspaceRoot);
        const dependencies = analyzeDependencies(snapshot.nodes, workspaceRoot);
        const memory = ExperimentMemoryStore.compileMemory();
        const dossierResponse = DossierGenerator.getLatestDossier();
        const dossier = dossierResponse?.dossier ?? null;
        const experimentDetails = ExperimentDetailBuilder.list();
        const comparativeEvaluation = EvidenceWeightedEvaluator.evaluatePortfolio(experimentDetails);
        const latestEvaluationRecord = EvaluationSnapshotStore.getLatest();
        const latestEvaluationDrift = EvaluationSnapshotStore.deriveDriftHistory(1)[0] ?? null;
        const latentState = LatentStateEncoder.encode(snapshot, dependencies);
        const compatibility = StrategyCompatibilityAnalyzer.analyze(latentState);
        const patterns = TransitionPatternAnalyzer.analyze();
        const replayStatusSummary = this.buildReplayStatusSummary(experimentDetails);
        const prioritizationContext = ResearchPrioritizationEngine.buildContext(
            experimentDetails,
            comparativeEvaluation,
            replayStatusSummary,
            now
        );
        const priorityDrift = PriorityDriftAnalyzer.analyze(prioritizationContext);
        const recommendationGovernance = RecommendationGovernance.govern(prioritizationContext);
        const priorityHistorySummary = PriorityHistoryAnalyzer.analyze();
        const snapshotComparisons = SnapshotComparator.compare();
        const governanceSynthesis = ComparativeGovernanceSynthesizer.synthesize(
            prioritizationContext,
            priorityDrift,
            recommendationGovernance,
            priorityHistorySummary.totalRecords > 0 ? priorityHistorySummary : null,
            snapshotComparisons.totalSnapshots >= 2 ? snapshotComparisons : null,
        );

        // ─── Build sections ───────────────────────────────────────
        const sections = this.buildSections(memory, latentState, compatibility, patterns, dossier, experimentDetails, replayStatusSummary, comparativeEvaluation, latestEvaluationRecord, latestEvaluationDrift, prioritizationContext, now);
        const summaryCards = this.buildSummaryCards(memory, latentState, snapshot, replayStatusSummary, comparativeEvaluation);
        const findings = this.buildFindings(memory, latentState, compatibility, experimentDetails, replayStatusSummary, comparativeEvaluation, latestEvaluationRecord, latestEvaluationDrift, prioritizationContext);
        const constraints = this.buildConstraints(memory, latentState, replayStatusSummary, comparativeEvaluation, latestEvaluationRecord, prioritizationContext, now);
        const nextSteps = this.buildNextSteps(memory, latentState, replayStatusSummary, comparativeEvaluation, latestEvaluationRecord, prioritizationContext, now);
        const limitations = this.buildLimitations();

        const executiveSummary = this.synthesizeExecutiveSummary(
            memory, latentState, compatibility, dossier, replayStatusSummary, comparativeEvaluation, prioritizationContext, priorityDrift
        );

        return this.applyEditorialNormalization({
            id: briefId,
            generatedAt: now,
            systemVersion: OBSERVATORY_VERSION,
            phaseActive: 23,
            executiveSummary,
            compositePosture: latentState.compositePosture,
            replayStatusSummary,
            comparativeEvaluation,
            summaryCards,
            prioritizationContext,
            priorityDrift,
            recommendationGovernance,
            priorityHistorySummary: priorityHistorySummary.totalRecords > 0 ? priorityHistorySummary : null,
            snapshotComparisons: snapshotComparisons.totalSnapshots >= 2 ? snapshotComparisons : null,
            governanceSynthesis,
            sections,
            findings,
            constraints,
            recommendedNextSteps: nextSteps,
            knownLimitations: limitations,
        });
    }

    // ─── Executive Summary ────────────────────────────────────────

    private static synthesizeExecutiveSummary(
        memory: ExperimentSessionRecord,
        latent: LatentRepoState,
        compatibility: StrategyCompatibilityAssessment[],
        dossier: { metadata: { totalSessionsCovered: number } } | null,
        replayStatusSummary: ReplayStatusSummary,
        comparativeEvaluation: ExperimentEvaluationPortfolio,
        prioritizationContext: ResearchPrioritizationContext,
        priorityDrift: import("../types/research-priority-drift").PriorityDriftHistory
    ): string {
        const sessionCount = memory.totalSimulationSessions;
        const benchmarkCount = memory.totalBenchmarkRuns;
        const posture = latent.compositePosture;

        const favorableStrategies = compatibility.filter(
            c => c.compatibility === "favorable"
        ).length;
        const calibrationDescriptor = memory.calibrationTrend.totalEvaluated >= CALIBRATION_MATURITY_THRESHOLD
            ? `Calibration trend is ${memory.calibrationTrend.movement}.`
            : "Calibration evidence remains preliminary.";

        const parts: string[] = [
            "The CodeWorld Observatory is operating at Phase 23 (Comparative Governance Synthesis Layer).",
            `Current structural posture is ${posture}.`,
            sessionCount > 0
                ? `${this.formatCount(sessionCount, "simulation session")} recorded alongside ${this.formatCount(benchmarkCount, "benchmark evaluation")}.`
                : "No simulation sessions have been recorded.",
            `${this.formatCount(favorableStrategies, "strategy class", "strategy classes")} currently rate as structurally favorable out of ${compatibility.length}.`,
            calibrationDescriptor,
            replayStatusSummary.totalExperiments > 0
                ? `${replayStatusSummary.partialCount + replayStatusSummary.fullCount} of ${replayStatusSummary.totalExperiments} experiment(s) now expose persisted replay lineage above baseline-only, and ${replayStatusSummary.fullCount} have artifact-complete replay-package lineage.`
                : "No experiment-centered replay lineage is currently available.",
            comparativeEvaluation.strongestExperimentTitle
                ? `Current evidence-weighted leader is ${comparativeEvaluation.strongestExperimentTitle} at ${comparativeEvaluation.strongestComparativeWeightLabel} comparative weight, with ${comparativeEvaluation.highConfidenceComparisonCount} high-confidence comparison(s).`
                : "No evidence-weighted experiment comparison is available yet.",
            prioritizationContext.topPriorities[0]
                ? `Primary advisory priority: ${prioritizationContext.topPriorities[0].summary}`
                : "No elevated research priority signal is active yet.",
            priorityDrift.totalDrifts > 0
                ? `Priority drift: ${priorityDrift.summary}`
                : priorityDrift.priorSnapshotAt
                    ? "No priority drift detected since last snapshot."
                    : "",
        ].filter(Boolean);

        if (dossier && dossier.metadata.totalSessionsCovered > 0) {
            parts.push(`The latest research dossier covers ${this.formatCount(dossier.metadata.totalSessionsCovered, "session")}.`);
        }

        return parts.join(" ");
    }

    // ─── Sections ─────────────────────────────────────────────────

    private static buildSections(
        memory: ExperimentSessionRecord,
        latent: LatentRepoState,
        compatibility: StrategyCompatibilityAssessment[],
        patterns: { patterns: TransitionPatternRecord[]; totalSessionsAnalyzed: number },
        dossier: { id: string; metadata: { totalSessionsCovered: number } } | null,
        experimentDetails: ExperimentDetailResponse[],
        replayStatusSummary: ReplayStatusSummary,
        comparativeEvaluation: ExperimentEvaluationPortfolio,
        latestEvaluationRecord: ReturnType<typeof EvaluationSnapshotStore.getLatest>,
        latestEvaluationDrift: ReturnType<typeof EvaluationSnapshotStore.deriveDriftHistory>[number] | null,
        prioritizationContext: ResearchPrioritizationContext,
        now: string
    ): BriefSection[] {
        const sectionPriorities = new Map([
            ["experiment-coverage", ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "evidence-deficient-but-promising")],
            ["replay-lineage", ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "replay-mature-but-empirically-shallow")],
            ["comparative-evaluation", ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "comparison-limited")],
            ["calibration-state", ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "empirically-strong-but-calibration-limited")],
        ]);
        const sections: Array<Omit<BriefSection, "prioritization">> = [];

        // System State Overview
        sections.push({
            id: "system-state",
            title: "System State Overview",
            content: `Structural complexity is ${latent.complexity.posture} with ${latent.complexity.totalFiles} files across ${latent.complexity.moduleBoundaryCount} module boundaries. Dependency pressure is ${latent.dependencyPressure.level}. Validation burden is ${latent.validationBurden.level}. Governance friction is ${latent.governanceFriction.level}.`,
            confidence: "high",
            evidenceRefs: [
                { sourceType: "latent-state", sourceId: latent.id, label: "Latent state derivation", derivedAt: now },
                { sourceType: "world-state", sourceId: latent.sourceWorldStateId, label: "World state snapshot", derivedAt: now },
            ],
        });

        // Experiment Coverage
        sections.push({
            id: "experiment-coverage",
            title: "Experiment Coverage",
            content: memory.totalSimulationSessions > 0
                ? `${this.formatCount(memory.totalSimulationSessions, "simulation session")} and ${this.formatCount(memory.totalBenchmarkRuns, "benchmark run")} are on record. ${this.formatCount(experimentDetails.length, "experiment")} now expose experiment-centered lineage. Evidence coverage currently stands at ${memory.evidenceCoverage.strongEvidenceCount} strong, ${memory.evidenceCoverage.adequateEvidenceCount} adequate, and ${memory.evidenceCoverage.insufficientEvidenceCount} insufficient benchmark assessments.`
                : "No simulation sessions have been recorded. The experiment surface remains unmapped, so evidence coverage cannot yet be assessed.",
            confidence: memory.totalSimulationSessions >= 3 ? "medium" : "low",
            evidenceRefs: [
                { sourceType: "memory", sourceId: "experiment-memory", label: "Experiment memory compilation", derivedAt: now },
                ...experimentDetails.slice(0, 3).map(detail => ({
                    sourceType: "experiment" as const,
                    sourceId: detail.experiment.experimentId,
                    label: detail.experiment.objective.title,
                    derivedAt: now,
                })),
                ...(dossier
                    ? [{ sourceType: "dossier" as const, sourceId: dossier.id, label: "Latest research dossier", derivedAt: now }]
                    : []),
            ],
        });

        const strongestExperiment = experimentDetails.find(detail => detail.replay.lineageStatus === "full-replay-package")
            ?? experimentDetails.find(detail => detail.replay.lineageStatus === "stored-evidence-chain")
            ?? experimentDetails[0];
        sections.push({
            id: "replay-lineage",
            title: "Replay and Lineage Status",
            content: replayStatusSummary.totalExperiments > 0
                ? `${replayStatusSummary.baselineOnlyCount} experiment(s) remain baseline-only, ${replayStatusSummary.partialCount} have stored-evidence-chain replay, and ${replayStatusSummary.fullCount} have full-replay-package lineage. Strongest current experiment: ${strongestExperiment?.experiment.objective.title ?? "none"}. Current strongest evidence class is ${replayStatusSummary.evidenceClass}. ${replayStatusSummary.reproducibilityCaveat}`
                : "No registered experiments are available for replay-lineage assessment.",
            confidence: replayStatusSummary.fullCount > 0 ? "medium" : "low",
            evidenceRefs: strongestExperiment
                ? [
                    { sourceType: "experiment", sourceId: strongestExperiment.experiment.experimentId, label: strongestExperiment.experiment.objective.title, derivedAt: now },
                    ...(strongestExperiment.replay.replayPackage
                        ? [{ sourceType: "replay-package" as const, sourceId: strongestExperiment.replay.replayPackage.replayPackageId, label: strongestExperiment.replay.replayPackage.lineageStatus, derivedAt: now }]
                        : []),
                ]
                : [],
        });

        const strongestEvaluation = comparativeEvaluation.evaluations[0];
        const strongestComparison = comparativeEvaluation.comparisonHighlights[0];
        sections.push({
            id: "comparative-evaluation",
            title: "Comparative Experiment Evaluation",
            content: comparativeEvaluation.totalExperiments === 0
                ? "No registered experiments are available for evidence-weighted comparison."
                : strongestComparison
                    ? `${strongestEvaluation?.experimentTitle ?? "No experiment"} currently leads the experiment set at ${strongestEvaluation?.comparativeWeightLabel ?? "limited"} comparative weight with ${strongestEvaluation?.comparativeConfidence ?? "low"} confidence. ${strongestComparison.rationale} ${latestEvaluationRecord ? `Latest persisted evaluation snapshot: ${new Date(latestEvaluationRecord.generatedAt).toLocaleString()}.` : "No persisted evaluation snapshot exists yet."} ${latestEvaluationDrift ? latestEvaluationDrift.narrative : "No evaluation drift history is available yet."} ${comparativeEvaluation.comparativeCaveat}`
                    : `${strongestEvaluation?.experimentTitle ?? "No experiment"} is the only current experiment with ${strongestEvaluation?.comparativeWeightLabel ?? "limited"} comparative weight and ${strongestEvaluation?.comparativeConfidence ?? "low"} confidence. ${latestEvaluationRecord ? `Latest persisted evaluation snapshot: ${new Date(latestEvaluationRecord.generatedAt).toLocaleString()}.` : "No persisted evaluation snapshot exists yet."} ${comparativeEvaluation.comparativeCaveat}`,
            confidence: comparativeEvaluation.highConfidenceComparisonCount > 0 ? "medium" : "low",
            evidenceRefs: [
                ...comparativeEvaluation.evaluations.slice(0, 3).map(evaluation => ({
                    sourceType: "experiment" as const,
                    sourceId: evaluation.experimentId,
                    label: `${evaluation.experimentTitle} (${evaluation.comparativeWeightLabel})`,
                    derivedAt: now,
                })),
                ...(latestEvaluationRecord
                    ? [{ sourceType: "evaluation-snapshot" as const, sourceId: latestEvaluationRecord.evaluationRecordId, label: latestEvaluationRecord.evaluationRecordId, derivedAt: now }]
                    : []),
            ],
        });

        // Strategy Landscape
        const favorableStrategies = compatibility.filter(c => c.compatibility === "favorable");
        const misalignedStrategies = compatibility.filter(c => c.compatibility === "structurally-misaligned");
        const reviewStrategies = compatibility.filter(c => c.compatibility === "viable-with-review");
        sections.push({
            id: "strategy-landscape",
            title: "Strategy Landscape",
            content: [
                favorableStrategies.length > 0
                    ? `${this.formatCount(favorableStrategies.length, "strategy class", "strategy classes")} are currently favorable: ${this.formatList(favorableStrategies.map(s => s.strategy))}.`
                    : "No strategy classes are currently rated favorable.",
                reviewStrategies.length > 0
                    ? `${this.formatCount(reviewStrategies.length, "strategy class", "strategy classes")} remain viable with review: ${this.formatList(reviewStrategies.map(s => s.strategy))}.`
                    : "No strategy classes currently require review-only handling.",
                misalignedStrategies.length > 0
                    ? `${this.formatCount(misalignedStrategies.length, "strategy class", "strategy classes")} are structurally misaligned: ${this.formatList(misalignedStrategies.map(s => s.strategy))}.`
                    : "No strategy classes are currently marked structurally misaligned.",
            ].join(" "),
            confidence: "high",
            evidenceRefs: compatibility.map(c => ({
                sourceType: "compatibility" as const,
                sourceId: `compat-${c.strategy}`,
                label: `${c.strategy} compatibility assessment`,
                derivedAt: now,
            })),
        });

        // Transition Patterns
        const patternList = patterns.patterns;
        sections.push({
            id: "transition-patterns",
            title: "Transition Pattern Memory",
            content: patternList.length > 0
                ? `${this.formatCount(patternList.length, "recurring transition pattern")} identified across ${this.formatCount(patterns.totalSessionsAnalyzed, "session")}. Dominant patterns include ${patternList.slice(0, 3).map(p => `${this.formatPatternDescription(p.description)} (${this.formatCount(p.occurrences, "occurrence")}, ${p.confidence} confidence)`).join("; ")}.`
                : "No transition patterns have been identified. Session history is still too limited for stable pattern extraction.",
            confidence: patternList.length >= 3 ? "medium" : "low",
            evidenceRefs: patternList.slice(0, 5).map(p => ({
                sourceType: "transition-pattern" as const,
                sourceId: p.patternId,
                label: this.formatPatternDescription(p.description),
                derivedAt: now,
            })),
        });

        // Calibration State
        const cal = memory.calibrationTrend;
        sections.push({
            id: "calibration-state",
            title: "Calibration State",
            content: cal.totalEvaluated >= CALIBRATION_MATURITY_THRESHOLD
                ? `Prediction-reality calibration covers ${this.formatCount(cal.totalEvaluated, "evaluation")}. Alignment score is ${(cal.alignmentScore * 100).toFixed(1)}%, and the trend is ${this.formatMovement(cal.movement)}. ${cal.notes}`
                : cal.totalEvaluated > 0
                    ? `Preliminary calibration state based on ${this.formatCount(cal.totalEvaluated, "recorded evaluation")}. Observed alignment is ${(cal.alignmentScore * 100).toFixed(1)}%, but the evidence base is not yet mature enough for a trend judgment. ${cal.notes}`
                    : `No prediction-reality comparisons are recorded yet. Calibration evidence is currently unavailable. ${cal.notes}`,
            confidence: cal.totalEvaluated >= 3 ? "medium" : "low",
            evidenceRefs: [
                { sourceType: "memory", sourceId: "calibration-trend", label: "Calibration trend derivation", derivedAt: now },
            ],
        });

        return sections.map(section => ({
            ...section,
            prioritization: sectionPriorities.get(section.id) ?? null,
        }));
    }

    // ─── Summary Cards ────────────────────────────────────────────

    private static buildSummaryCards(
        memory: ExperimentSessionRecord,
        latent: LatentRepoState,
        snapshot: RepoSnapshot,
        replayStatusSummary: ReplayStatusSummary,
        comparativeEvaluation: ExperimentEvaluationPortfolio
    ): ResearchSummaryCard[] {
        const evidenceValue = memory.evidenceCoverage.strongEvidenceCount > 0
            ? "Strong"
            : memory.evidenceCoverage.adequateEvidenceCount > 0
                ? "Adequate"
                : memory.evidenceCoverage.insufficientEvidenceCount > 0
                    ? "Insufficient"
                    : "Unavailable";

        const calibrationValue = memory.calibrationTrend.totalEvaluated >= CALIBRATION_MATURITY_THRESHOLD
            ? `${(memory.calibrationTrend.alignmentScore * 100).toFixed(0)}%`
            : memory.calibrationTrend.totalEvaluated > 0
                ? "Preliminary"
                : "Unavailable";

        return [
            {
                label: "Composite Posture",
                value: latent.compositePosture,
                trend: latent.compositePosture === "stable" ? "stable"
                    : latent.compositePosture === "cautious" ? "stable"
                    : "down",
                detail: latent.compositeRationale,
            },
            {
                label: "Simulation Sessions",
                value: memory.totalSimulationSessions,
                trend: memory.totalSimulationSessions > 0 ? "up" : "unknown",
                detail: `${this.formatCount(memory.totalBenchmarkRuns, "benchmark evaluation")} performed`,
            },
            {
                label: "Replay Lineage",
                value: replayStatusSummary.strongestLineageStatus ?? "none",
                trend: replayStatusSummary.fullCount > 0 ? "up" : replayStatusSummary.partialCount > 0 ? "stable" : "unknown",
                detail: `${replayStatusSummary.fullCount} full, ${replayStatusSummary.partialCount} partial, ${replayStatusSummary.baselineOnlyCount} baseline-only`,
            },
            {
                label: "Comparative Leader",
                value: comparativeEvaluation.strongestExperimentTitle ?? "none",
                trend: comparativeEvaluation.highConfidenceComparisonCount > 0 ? "up" : comparativeEvaluation.totalExperiments > 0 ? "stable" : "unknown",
                detail: comparativeEvaluation.strongestExperimentTitle
                    ? `${comparativeEvaluation.strongestComparativeWeightLabel} weight; ${comparativeEvaluation.highConfidenceComparisonCount} high-confidence comparison(s)`
                    : "No experiment comparisons available",
            },
            {
                label: "Total Files",
                value: snapshot.totalFiles,
                trend: "stable",
                detail: `Across ${snapshot.totalDirectories} directories`,
            },
            {
                label: "Evidence Strength",
                value: evidenceValue,
                trend: memory.evidenceCoverage.strongEvidenceCount > memory.evidenceCoverage.insufficientEvidenceCount
                    ? "up"
                    : memory.evidenceCoverage.insufficientEvidenceCount > 0 ? "down" : "stable",
                detail: `${memory.evidenceCoverage.adequateEvidenceCount} adequate, ${memory.evidenceCoverage.insufficientEvidenceCount} insufficient`,
            },
            {
                label: "Calibration Alignment",
                value: calibrationValue,
                trend: memory.calibrationTrend.totalEvaluated < CALIBRATION_MATURITY_THRESHOLD
                    ? "unknown"
                    : memory.calibrationTrend.movement === "improving" ? "up"
                    : memory.calibrationTrend.movement === "stable" ? "stable"
                    : memory.calibrationTrend.movement === "mixed" ? "down" : "unknown",
                detail: memory.calibrationTrend.totalEvaluated >= CALIBRATION_MATURITY_THRESHOLD
                    ? `${this.formatCount(memory.calibrationTrend.totalEvaluated, "evaluation")}; movement: ${this.formatMovement(memory.calibrationTrend.movement)}`
                    : `${this.formatCount(memory.calibrationTrend.totalEvaluated, "evaluation")} recorded; trend classification pending`,
            },
        ];
    }

    // ─── Findings ─────────────────────────────────────────────────

    private static buildFindings(
        memory: ExperimentSessionRecord,
        latent: LatentRepoState,
        compatibility: StrategyCompatibilityAssessment[],
        experimentDetails: ExperimentDetailResponse[],
        replayStatusSummary: ReplayStatusSummary,
        comparativeEvaluation: ExperimentEvaluationPortfolio,
        latestEvaluationRecord: ReturnType<typeof EvaluationSnapshotStore.getLatest>,
        latestEvaluationDrift: ReturnType<typeof EvaluationSnapshotStore.deriveDriftHistory>[number] | null,
        prioritizationContext: ResearchPrioritizationContext
    ): ExecutiveFinding[] {
        const now = new Date().toISOString();
        const findings: Array<Omit<ExecutiveFinding, "prioritization">> = [];

        // Critical: no simulation data
        if (memory.totalSimulationSessions === 0) {
            findings.push({
                id: "finding-no-sessions",
                severity: "critical",
                title: "No Simulation Sessions Recorded",
                summary: "The entire simulation surface is unmapped. No empirical strategy data is available for decision-making.",
                supportingEvidence: [
                    { sourceType: "memory", sourceId: "experiment-memory", label: "Empty session store", derivedAt: now },
                ],
            });
        }

        // Important: fragile posture
        if (latent.compositePosture === "fragile") {
            findings.push({
                id: "finding-fragile-posture",
                severity: "critical",
                title: "Fragile Composite Posture",
                summary: `Structural posture remains fragile. ${this.capitalizeSentence(this.stripCompositeLead(latent.compositeRationale))}`,
                supportingEvidence: [
                    { sourceType: "latent-state", sourceId: latent.id, label: "Composite posture derivation", derivedAt: now },
                ],
            });
        } else if (latent.compositePosture === "pressured") {
            findings.push({
                id: "finding-pressured-posture",
                severity: "important",
                title: "Pressured Composite Posture",
                summary: `Structural posture remains pressured. ${this.capitalizeSentence(this.stripCompositeLead(latent.compositeRationale))}`,
                supportingEvidence: [
                    { sourceType: "latent-state", sourceId: latent.id, label: "Composite posture derivation", derivedAt: now },
                ],
            });
        }

        // Important: misaligned strategies
        const misaligned = compatibility.filter(c => c.compatibility === "structurally-misaligned");
        if (misaligned.length > 0) {
            findings.push({
                id: "finding-misaligned-strategies",
                severity: "important",
                title: `${this.formatCount(misaligned.length, "Strategy Class", "Strategy Classes")} Misaligned`,
                summary: `The following strategies are structurally misaligned with current repo conditions: ${misaligned.map(m => m.strategy).join(", ")}. ${misaligned[0].reasoning}`,
                supportingEvidence: misaligned.map(m => ({
                    sourceType: "compatibility" as const,
                    sourceId: `compat-${m.strategy}`,
                    label: `${m.strategy}: ${m.compatibility}`,
                    derivedAt: now,
                })),
            });
        }

        // Informational: calibration status
        if (memory.calibrationTrend.totalEvaluated > 0) {
            findings.push({
                id: memory.calibrationTrend.totalEvaluated >= CALIBRATION_MATURITY_THRESHOLD
                    ? "finding-calibration-established"
                    : "finding-calibration-limited",
                severity: "informational",
                title: memory.calibrationTrend.totalEvaluated >= CALIBRATION_MATURITY_THRESHOLD
                    ? "Calibration Trend Established"
                    : "Calibration Evidence Currently Limited",
                summary: memory.calibrationTrend.totalEvaluated >= CALIBRATION_MATURITY_THRESHOLD
                    ? `Prediction-reality calibration covers ${this.formatCount(memory.calibrationTrend.totalEvaluated, "evaluation")} with a ${this.formatMovement(memory.calibrationTrend.movement)} trend classification.`
                    : `Only ${this.formatCount(memory.calibrationTrend.totalEvaluated, "evaluation")} recorded so far. Calibration signals remain preliminary and should not be treated as trend-stable.`,
                supportingEvidence: [
                    { sourceType: "memory", sourceId: "calibration-trend", label: "Calibration trend", derivedAt: now },
                ],
            });
        }

        // Informational: governance blockers
        if (memory.governanceConstraintPatterns.length > 0) {
            findings.push({
                id: "finding-governance-patterns",
                severity: "informational",
                title: "Recurring Governance Constraints",
                summary: `${this.formatCount(memory.governanceConstraintPatterns.length, "governance constraint pattern")} detected. Most frequent: "${memory.governanceConstraintPatterns[0].category}" (${this.formatCount(memory.governanceConstraintPatterns[0].occurrences, "occurrence")}).`,
                supportingEvidence: [
                    { sourceType: "memory", sourceId: "governance-patterns", label: "Governance constraint analysis", derivedAt: now },
                ],
            });
        }

        if (replayStatusSummary.baselineOnlyCount > 0) {
            findings.push({
                id: "finding-baseline-only-experiments",
                severity: "important",
                title: "Baseline-Only Experiments Remain",
                summary: `${replayStatusSummary.baselineOnlyCount} experiment(s) still expose only baseline-only replay lineage. Their evidence chain is insufficient for stored-evidence-chain replay until simulation and benchmark artifacts are attached.`,
                supportingEvidence: experimentDetails
                    .filter(detail => detail.replay.lineageStatus === "baseline-only")
                    .slice(0, 3)
                    .map(detail => ({
                        sourceType: "experiment" as const,
                        sourceId: detail.experiment.experimentId,
                        label: detail.experiment.objective.title,
                        derivedAt: now,
                    })),
            });
        }

        if (replayStatusSummary.fullCount > 0) {
            const strongestFull = experimentDetails.find(detail => detail.replay.lineageStatus === "full-replay-package");
            findings.push({
                id: "finding-full-replay-lineage",
                severity: "informational",
                title: "Artifact-Complete Replay Lineage Exists",
                summary: `${replayStatusSummary.fullCount} experiment(s) now expose artifact-complete replay-package lineage. This reflects persisted baseline, simulation, benchmark, and execution evidence, not guaranteed branch-perfect reproduction.`,
                supportingEvidence: strongestFull
                    ? [
                        { sourceType: "experiment", sourceId: strongestFull.experiment.experimentId, label: strongestFull.experiment.objective.title, derivedAt: now },
                        ...(strongestFull.replay.replayPackage
                            ? [{ sourceType: "replay-package" as const, sourceId: strongestFull.replay.replayPackage.replayPackageId, label: strongestFull.replay.replayPackage.lineageStatus, derivedAt: now }]
                            : []),
                    ]
                    : [],
            });
        }

        if (comparativeEvaluation.strongestExperimentTitle) {
            findings.push({
                id: "finding-comparative-leader",
                severity: comparativeEvaluation.highConfidenceComparisonCount > 0 ? "informational" : "important",
                title: "Comparative Evidence Leader Identified",
                summary: `${comparativeEvaluation.strongestExperimentTitle} currently leads the experiment set at ${comparativeEvaluation.strongestComparativeWeightLabel} comparative weight. ${comparativeEvaluation.comparativeCaveat}`,
                supportingEvidence: comparativeEvaluation.evaluations.slice(0, 2).map(evaluation => ({
                    sourceType: "experiment" as const,
                    sourceId: evaluation.experimentId,
                    label: evaluation.experimentTitle,
                    derivedAt: now,
                })),
            });
        }

        if (comparativeEvaluation.totalExperiments > 1 && comparativeEvaluation.highConfidenceComparisonCount === 0) {
            findings.push({
                id: "finding-comparison-still-thin",
                severity: "important",
                title: "Comparative Interpretation Still Sample-Limited",
                summary: "Multiple experiments exist, but no high-confidence comparison is justified yet. Additional benchmark repetition or execution-backed evidence is required before a stronger comparative claim should be made.",
                supportingEvidence: comparativeEvaluation.evaluations.slice(0, 3).map(evaluation => ({
                    sourceType: "experiment" as const,
                    sourceId: evaluation.experimentId,
                    label: `${evaluation.experimentTitle}: ${evaluation.comparativeConfidence}`,
                    derivedAt: now,
                })),
            });
        }

        if (latestEvaluationRecord) {
            findings.push({
                id: "finding-persisted-evaluation-snapshot",
                severity: "informational",
                title: "Comparative Interpretation Is Persisted",
                summary: latestEvaluationDrift
                    ? `Latest evaluation snapshot was persisted at ${new Date(latestEvaluationRecord.generatedAt).toLocaleString()}. ${latestEvaluationDrift.narrative}`
                    : `Latest evaluation snapshot was persisted at ${new Date(latestEvaluationRecord.generatedAt).toLocaleString()}. No historical drift comparison is available yet.`,
                supportingEvidence: [
                    {
                        sourceType: "evaluation-snapshot",
                        sourceId: latestEvaluationRecord.evaluationRecordId,
                        label: latestEvaluationRecord.evaluationRecordId,
                        derivedAt: now,
                    },
                ],
            });
        }

        return findings.map(finding => ({
            ...finding,
            prioritization:
                finding.id === "finding-baseline-only-experiments"
                    ? ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "evidence-deficient-but-promising")
                    : finding.id === "finding-comparison-still-thin" || finding.id === "finding-persisted-evaluation-snapshot"
                        ? ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "comparison-limited")
                        : finding.id === "finding-full-replay-lineage"
                            ? ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "saturation-emerging")
                            : null,
        }));
    }

    // ─── Constraints ──────────────────────────────────────────────

    private static buildConstraints(
        memory: ExperimentSessionRecord,
        latent: LatentRepoState,
        replayStatusSummary: ReplayStatusSummary,
        comparativeEvaluation: ExperimentEvaluationPortfolio,
        latestEvaluationRecord: ReturnType<typeof EvaluationSnapshotStore.getLatest>,
        prioritizationContext: ResearchPrioritizationContext,
        now: string
    ): ConstraintRegister[] {
        return [
            {
                id: "constraint-no-learned-model",
                domain: "prediction",
                constraint: "All predictions are deterministic structural calculations, not learned probabilistic models.",
                implication: "Prediction quality is bounded by the fidelity of static analysis proxies. No neural world model is active.",
                evidenceRefs: [
                    { sourceType: "world-state", sourceId: latent.sourceWorldStateId, label: "Observed repository state", derivedAt: now },
                    { sourceType: "latent-state", sourceId: latent.id, label: "Derived structural latent state", derivedAt: now },
                ],
                prioritization: null,
            },
            {
                id: "constraint-calibration-coverage",
                domain: "calibration",
                constraint: "Calibration loop requires executed interventions with recorded outcomes to produce trend data.",
                implication: "Systems with no executed interventions cannot derive calibration scores or movement trends.",
                evidenceRefs: [
                    { sourceType: "memory", sourceId: "calibration-trend", label: `Calibration record spanning ${this.formatCount(memory.calibrationTrend.totalEvaluated, "evaluation")}`, derivedAt: now },
                ],
                prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "empirically-strong-but-calibration-limited"),
            },
            {
                id: "constraint-static-analysis",
                domain: "observation",
                constraint: "Dependency analysis is limited to static import/require resolution.",
                implication: "Cross-module runtime event bubbling, dynamic imports, and reflection-based coupling are not captured.",
                evidenceRefs: [
                    { sourceType: "world-state", sourceId: latent.sourceWorldStateId, label: "Static repository snapshot", derivedAt: now },
                ],
                prioritization: null,
            },
            {
                id: "constraint-strategy-heuristic",
                domain: "governance",
                constraint: "Strategy compatibility is computed from threshold-gated structural descriptors, not empirical outcome data.",
                implication: "Compatibility assessments may diverge from actual intervention success rates as code complexity grows.",
                evidenceRefs: [
                    { sourceType: "latent-state", sourceId: latent.id, label: "Threshold-gated latent descriptors", derivedAt: now },
                    { sourceType: "memory", sourceId: "experiment-memory", label: "Historical session corpus", derivedAt: now },
                ],
                prioritization: null,
            },
            {
                id: "constraint-replay-semantics",
                domain: "replay",
                constraint: "Full replayability means artifact-complete replay-package lineage, not exact historical branch reconstruction.",
                implication: replayStatusSummary.totalExperiments > 0
                    ? "Consumer surfaces must preserve the distinction between artifact completeness and historical certainty."
                    : "Replay semantics remain undefined until experiment-centered lineage exists.",
                evidenceRefs: replayStatusSummary.strongestExperimentId
                    ? [{ sourceType: "experiment", sourceId: replayStatusSummary.strongestExperimentId, label: replayStatusSummary.strongestExperimentTitle ?? "Strongest replay record", derivedAt: now }]
                    : [],
                prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "replay-mature-but-empirically-shallow"),
            },
            {
                id: "constraint-comparative-weighting",
                domain: "comparison",
                constraint: "Evidence-weighted comparison ranks experiments by persisted evidence classes and empirical depth rather than by causal proof or scientific certainty.",
                implication: comparativeEvaluation.totalExperiments > 1
                    ? "Comparative leaders can guide prioritization, but low-confidence or roughly comparable pairings should not be overstated as decisive wins."
                    : "A single experiment can be described, but meaningful comparison requires multiple persisted experiment records.",
                evidenceRefs: comparativeEvaluation.evaluations.slice(0, 2).map(evaluation => ({
                    sourceType: "experiment" as const,
                    sourceId: evaluation.experimentId,
                    label: `${evaluation.experimentTitle} (${evaluation.comparativeWeightLabel})`,
                    derivedAt: now,
                })),
                prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "comparison-limited"),
            },
            {
                id: "constraint-evaluation-persistence",
                domain: "comparison",
                constraint: "Persisted evaluation snapshots are explicit interpretation artifacts and must be created on write paths only.",
                implication: latestEvaluationRecord
                    ? "GET surfaces may read the latest evaluation snapshot, but they must not silently materialize or refresh it."
                    : "Comparative persistence is currently absent until an explicit snapshot or export write path is invoked.",
                evidenceRefs: latestEvaluationRecord
                    ? [{ sourceType: "evaluation-snapshot", sourceId: latestEvaluationRecord.evaluationRecordId, label: latestEvaluationRecord.evaluationRecordId, derivedAt: now }]
                    : [],
                prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "comparison-limited"),
            },
        ];
    }

    // ─── Recommended Next Steps ───────────────────────────────────

    private static buildNextSteps(
        memory: ExperimentSessionRecord,
        latent: LatentRepoState,
        replayStatusSummary: ReplayStatusSummary,
        comparativeEvaluation: ExperimentEvaluationPortfolio,
        latestEvaluationRecord: ReturnType<typeof EvaluationSnapshotStore.getLatest>,
        prioritizationContext: ResearchPrioritizationContext,
        now: string
    ): RecommendedNextStep[] {
        const steps: Array<Omit<RecommendedNextStep, "prioritization">> = [];
        const primaryPressure = this.selectPrimaryPressure(latent, now);

        if (memory.totalSimulationSessions === 0) {
            steps.push({
                id: "step-first-simulation",
                priority: "high",
                action: "Execute a pilot simulation session to establish baseline empirical data.",
                suggestedInterventionClass: "minimal-touch",
                rationale: "Without at least one simulation session, strategy trends, evidence coverage, and calibration cannot be assessed.",
                blockedBy: null,
                evidenceRefs: [
                    { sourceType: "memory", sourceId: "experiment-memory", label: "Empty simulation history", derivedAt: now },
                ],
            });
        }

        if (memory.calibrationTrend.movement === "insufficient-evidence") {
            steps.push({
                id: "step-calibration-data",
                priority: "high",
                action: "Record prediction-reality comparison data from at least 3 executed interventions.",
                suggestedInterventionClass: "minimal-touch",
                rationale: "Calibration trend requires multiple data points to derive movement classification.",
                blockedBy: memory.totalSimulationSessions === 0 ? "step-first-simulation" : null,
                evidenceRefs: [
                    { sourceType: "memory", sourceId: "calibration-trend", label: "Preliminary calibration record", derivedAt: now },
                ],
            });
        }

        if (latent.compositePosture === "fragile" || latent.compositePosture === "pressured") {
            steps.push({
                id: "step-structural-remediation",
                priority: "high",
                action: `Prioritize ${primaryPressure.descriptorLabel.toLowerCase()} with a ${primaryPressure.suggestedInterventionClass} intervention.`,
                suggestedInterventionClass: primaryPressure.suggestedInterventionClass,
                rationale: `${primaryPressure.rationale} Recommended intervention class: ${primaryPressure.suggestedInterventionClass}.`,
                blockedBy: null,
                evidenceRefs: primaryPressure.evidenceRefs,
            });
        }

        if (replayStatusSummary.baselineOnlyCount > 0) {
            steps.push({
                id: "step-promote-baseline-experiments",
                priority: "medium",
                action: "Attach simulation and benchmark artifacts to baseline-only experiments before interpreting them as replay-ready.",
                suggestedInterventionClass: "minimal-touch",
                rationale: "Experiment registration alone is not enough for stored-evidence-chain replay. Baseline-only experiments still need persisted simulation and benchmark evidence.",
                blockedBy: null,
                evidenceRefs: [
                    { sourceType: "memory", sourceId: "experiment-memory", label: "Simulation and benchmark coverage", derivedAt: now },
                ],
            });
        }

        if (replayStatusSummary.partialCount > 0) {
            steps.push({
                id: "step-promote-partial-experiments",
                priority: "medium",
                action: "Capture execution evidence for stored-evidence-chain experiments that need artifact-complete replay-package lineage.",
                suggestedInterventionClass: "minimal-touch",
                rationale: "Partial replay maturity should advance only through persisted execution evidence, not narrative inference.",
                blockedBy: null,
                evidenceRefs: [
                    { sourceType: "memory", sourceId: "calibration-trend", label: "Execution-backed calibration coverage", derivedAt: now },
                ],
            });
        }

        if (comparativeEvaluation.totalExperiments > 1 && comparativeEvaluation.highConfidenceComparisonCount === 0) {
            steps.push({
                id: "step-strengthen-comparisons",
                priority: "medium",
                action: "Repeat benchmark and execution capture on the leading experiments before treating current rankings as decisive.",
                suggestedInterventionClass: "minimal-touch",
                rationale: "Evidence-weighted comparison exists, but the comparative confidence remains too low for stronger interpretation. Additional repeated benchmarks or execution-backed outcomes will raise empirical depth without changing doctrine.",
                blockedBy: null,
                evidenceRefs: comparativeEvaluation.evaluations.slice(0, 3).map(evaluation => ({
                    sourceType: "experiment" as const,
                    sourceId: evaluation.experimentId,
                    label: `${evaluation.experimentTitle}: ${evaluation.comparativeConfidence}`,
                    derivedAt: now,
                })),
            });
        }

        if (!latestEvaluationRecord) {
            steps.push({
                id: "step-persist-evaluation-snapshot",
                priority: "medium",
                action: "Persist an explicit evaluation snapshot before relying on comparative interpretation in exports or audits.",
                suggestedInterventionClass: "minimal-touch",
                rationale: "Comparative interpretation is live and bounded, but Phase 18 durability requires explicit persisted snapshots for drift tracking and comparative audits.",
                blockedBy: null,
                evidenceRefs: comparativeEvaluation.evaluations.slice(0, 2).map(evaluation => ({
                    sourceType: "experiment" as const,
                    sourceId: evaluation.experimentId,
                    label: evaluation.experimentTitle,
                    derivedAt: now,
                })),
            });
        }

        steps.push({
            id: "step-export-briefing",
            priority: "medium",
            action: "Export the current briefing as a persisted artifact for longitudinal comparison.",
            suggestedInterventionClass: "minimal-touch",
            rationale: "Persisted briefings enable cross-session posture drift detection and historical audit.",
            blockedBy: null,
            evidenceRefs: [
                { sourceType: "memory", sourceId: "experiment-memory", label: "Longitudinal session record", derivedAt: now },
            ],
        });

        steps.push({
            id: "step-expand-observation",
            priority: "low",
            action: "Extend observation encoder to capture cross-module event bus routing and dynamic imports.",
            suggestedInterventionClass: "structural-refactor",
            rationale: "Current static analysis misses runtime coupling, limiting dependency pressure accuracy.",
            blockedBy: null,
            evidenceRefs: [
                { sourceType: "world-state", sourceId: latent.sourceWorldStateId, label: "Static observation boundary", derivedAt: now },
            ],
        });

        return steps.map(step => ({
            ...step,
            prioritization:
                step.id === "step-calibration-data"
                    ? ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "empirically-strong-but-calibration-limited")
                    : step.id === "step-promote-baseline-experiments"
                        ? ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "evidence-deficient-but-promising")
                        : step.id === "step-promote-partial-experiments"
                            ? ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "replay-mature-but-empirically-shallow")
                            : step.id === "step-strengthen-comparisons"
                                ? ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "comparison-limited")
                                : null,
        }));
    }

    // ─── Known Limitations ────────────────────────────────────────

    private static buildLimitations(): string[] {
        return [
            "This briefing synthesizes from deterministic structural signals. No learned connectionist model is active.",
            "Strategy trends are derived from branch-ID heuristics and first-class metadata - not from validated causal inference.",
            "Evidence sufficiency labels reflect benchmark heuristic coverage, not independent verification.",
            "Evidence-weighted comparisons rank persisted evidence completeness and empirical depth, not causal proof or statistically mature causal effects.",
            "Cross-module runtime event bubbling cannot be captured by static AST proxy layers.",
            "Calibration alignment scores represent structural proximity, not prediction accuracy in the statistical sense.",
            "Full replay-package lineage does not guarantee branch-perfect or historically exact reproduction beyond what captured artifacts justify.",
        ];
    }

    private static buildReplayStatusSummary(experimentDetails: ExperimentDetailResponse[]): ReplayStatusSummary {
        const baselineOnlyCount = experimentDetails.filter(detail => detail.replay.lineageStatus === "baseline-only").length;
        const partialCount = experimentDetails.filter(detail => detail.replay.lineageStatus === "stored-evidence-chain").length;
        const fullCount = experimentDetails.filter(detail => detail.replay.lineageStatus === "full-replay-package").length;
        const strongestExperiment = experimentDetails.find(detail => detail.replay.lineageStatus === "full-replay-package")
            ?? experimentDetails.find(detail => detail.replay.lineageStatus === "stored-evidence-chain")
            ?? experimentDetails[0]
            ?? null;

        return {
            totalExperiments: experimentDetails.length,
            baselineOnlyCount,
            partialCount,
            fullCount,
            strongestExperimentId: strongestExperiment?.experiment.experimentId ?? null,
            strongestExperimentTitle: strongestExperiment?.experiment.objective.title ?? null,
            strongestReplayability: strongestExperiment?.replay.replayability ?? null,
            strongestLineageStatus: strongestExperiment?.replay.lineageStatus ?? null,
            evidenceClass: strongestExperiment?.replay.lineageStatus ?? "no-experiments",
            reproducibilityCaveat: strongestExperiment
                ? strongestExperiment.replay.replayability === "full"
                    ? "Full replay-package lineage is present for at least one experiment, but that still means artifact-complete lineage rather than exact historical reconstruction."
                    : strongestExperiment.replay.replayability === "partial"
                        ? "Stored-evidence-chain replay is present, but execution evidence is still missing for artifact-complete replay-package lineage."
                        : "Current experiments remain baseline-only and cannot yet support defensible replay beyond registered intent and persisted baseline artifacts."
                : "No experiments are registered, so replay maturity is not yet available.",
        };
    }

    private static selectPrimaryPressure(
        latent: LatentRepoState,
        now: string
    ): {
        descriptorLabel: string;
        rationale: string;
        suggestedInterventionClass: BranchStrategy;
        evidenceRefs: BriefEvidenceReference[];
    } {
        const candidates: Array<{
            score: number;
            descriptorLabel: string;
            rationale: string;
            suggestedInterventionClass: BranchStrategy;
            evidenceRefs: BriefEvidenceReference[];
        }> = [
            {
                score: this.scoreOrdinal(latent.complexity.posture, ["low", "moderate", "high", "extreme"]),
                descriptorLabel: "Structural Complexity",
                rationale: latent.complexity.rationale,
                suggestedInterventionClass: latent.complexity.posture === "extreme" ? "structural-refactor" : "minimal-touch",
                evidenceRefs: [
                    { sourceType: "latent-state", sourceId: latent.id, label: "Complexity descriptor", derivedAt: now },
                    { sourceType: "world-state", sourceId: latent.sourceWorldStateId, label: "File and module boundary counts", derivedAt: now },
                ],
            },
            {
                score: this.scoreOrdinal(latent.dependencyPressure.level, ["contained", "moderate", "concentrated", "systemic"]),
                descriptorLabel: "Dependency Pressure",
                rationale: latent.dependencyPressure.hotspotPaths.length > 0
                    ? `${latent.dependencyPressure.rationale} Hotspots: ${latent.dependencyPressure.hotspotPaths.join(", ")}.`
                    : latent.dependencyPressure.rationale,
                suggestedInterventionClass: "service-first",
                evidenceRefs: [
                    { sourceType: "latent-state", sourceId: latent.id, label: "Dependency pressure descriptor", derivedAt: now },
                    { sourceType: "world-state", sourceId: latent.sourceWorldStateId, label: "Dependency hotspot paths", derivedAt: now },
                ],
            },
            {
                score: this.scoreOrdinal(latent.validationBurden.level, ["low", "moderate", "heavy", "prohibitive"]),
                descriptorLabel: "Validation Burden",
                rationale: latent.validationBurden.rationale,
                suggestedInterventionClass: "minimal-touch",
                evidenceRefs: [
                    { sourceType: "latent-state", sourceId: latent.id, label: "Validation burden descriptor", derivedAt: now },
                ],
            },
            {
                score: this.scoreOrdinal(latent.governanceFriction.level, ["smooth", "cautious", "gated", "blocked"]),
                descriptorLabel: "Governance Friction",
                rationale: latent.governanceFriction.rationale,
                suggestedInterventionClass: "route-first",
                evidenceRefs: [
                    { sourceType: "latent-state", sourceId: latent.id, label: "Governance friction descriptor", derivedAt: now },
                    { sourceType: "memory", sourceId: "governance-patterns", label: "Recurring governance blockers", derivedAt: now },
                ],
            },
            {
                score: this.scoreOrdinal(latent.evidenceSufficiency.posture, ["strong", "adequate", "thin", "insufficient"]),
                descriptorLabel: "Evidence Sufficiency",
                rationale: latent.evidenceSufficiency.rationale,
                suggestedInterventionClass: "minimal-touch",
                evidenceRefs: [
                    { sourceType: "latent-state", sourceId: latent.id, label: "Evidence sufficiency descriptor", derivedAt: now },
                    { sourceType: "memory", sourceId: "experiment-memory", label: "Benchmark evidence coverage", derivedAt: now },
                ],
            },
        ];

        candidates.sort((left, right) => right.score - left.score);
        return candidates[0];
    }

    private static applyEditorialNormalization(brief: ObservatoryBrief): ObservatoryBrief {
        const normalize = (value: string): string => value
            .replace(/[\u2013\u2014]/g, "-")
            .replace(/[\u2192]/g, "->")
            .replace(/\s{2,}/g, " ")
            .replace(/\s+\./g, ".")
            .replace(/ \;/g, ";")
            .trim();

        return {
            ...brief,
            executiveSummary: normalize(brief.executiveSummary),
            sections: brief.sections.map(section => ({
                ...section,
                content: normalize(section.content),
            })),
            findings: brief.findings.map(finding => ({
                ...finding,
                title: normalize(finding.title),
                summary: normalize(finding.summary),
            })),
            constraints: brief.constraints.map(constraint => ({
                ...constraint,
                constraint: normalize(constraint.constraint),
                implication: normalize(constraint.implication),
            })),
            recommendedNextSteps: brief.recommendedNextSteps.map(step => ({
                ...step,
                action: normalize(step.action),
                rationale: normalize(step.rationale),
            })),
            knownLimitations: brief.knownLimitations.map(normalize),
        };
    }

    private static formatCount(count: number, singular: string, plural?: string): string {
        return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
    }

    private static formatList(items: string[]): string {
        if (items.length === 0) return "none";
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} and ${items[1]}`;
        return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
    }

    private static formatMovement(movement: ExperimentSessionRecord["calibrationTrend"]["movement"]): string {
        return movement.replace(/-/g, " ");
    }

    private static scoreOrdinal(value: string, order: string[]): number {
        const idx = order.indexOf(value);
        return idx === -1 ? 0 : idx + 1;
    }

    private static stripCompositeLead(rationale: string): string {
        return rationale.replace(/^Composite posture is (stable|cautious|pressured|fragile):\s*/i, "");
    }

    private static capitalizeSentence(value: string): string {
        if (!value) return value;
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    private static formatPatternDescription(value: string): string {
        return value.replace(/"/g, "'");
    }
}
