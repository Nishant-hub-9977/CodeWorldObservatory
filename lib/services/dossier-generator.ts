import fs from "fs";
import path from "path";
import type { ResearchDossier, DossierGenerationResponse, ResearchDossierSection } from "../types/research-memory";
import { ExperimentMemoryStore } from "./experiment-memory";
import { SessionComparator } from "./session-comparator";
import { ExperimentDetailBuilder } from "./experiment-detail-builder";
import { EvidenceWeightedEvaluator } from "./evidence-weighted-evaluator";
import { EvaluationSnapshotStore } from "./evaluation-snapshot-store";
import { OBSERVATORY_VERSION } from "../constants/observatory";
import { ResearchPrioritizationEngine } from "./research-prioritization-engine";
import { RecommendationGovernance } from "./recommendation-governance";
import { PriorityHistoryAnalyzer } from "./priority-history-analyzer";
import { SnapshotComparator } from "./snapshot-comparator";
import { ComparativeGovernanceSynthesizer } from "./comparative-governance-synthesizer";

// ─── Dossier Generator ───────────────────────────────────────────
// Synthesizes a structured research dossier from the Experiment Memory
// Store and the Session Comparator. Every section is data-driven from
// persisted artifacts — no hardcoded narrative content.

const DOSSIER_STORE_DIR = path.join(process.cwd(), "artifacts", "research");

// Ensure directory exists synchronously at startup
if (!fs.existsSync(DOSSIER_STORE_DIR)) {
    fs.mkdirSync(DOSSIER_STORE_DIR, { recursive: true });
}

export class DossierGenerator {
    /**
     * Generates a fully structured ResearchDossier by synthesizing data from
     * the Experiment Memory Store and the Session Comparator.
     */
    public static generateDossier(options: { persist?: boolean } = {}): DossierGenerationResponse {
        const memory = ExperimentMemoryStore.compileMemory();
        const experimentDetails = ExperimentDetailBuilder.list();
        const comparativeEvaluation = EvidenceWeightedEvaluator.evaluatePortfolio(experimentDetails);
        const latestEvaluationRecord = EvaluationSnapshotStore.getLatest();
        const latestEvaluationDrift = EvaluationSnapshotStore.deriveDriftHistory(1)[0] ?? null;
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
            reproducibilityCaveat: "Replay maturity remains bounded by persisted artifacts and does not imply exact historical reconstruction.",
        } as const;
        const prioritizationContext = ResearchPrioritizationEngine.buildContext(
            experimentDetails,
            comparativeEvaluation,
            replayStatusSummary,
            new Date().toISOString()
        );

        // ─── Governance synthesis ──────────────────────────────
        // Compute drift inline to avoid circular import with PriorityDriftAnalyzer.
        // PriorityDriftAnalyzer imports DossierGenerator, so we use lazy import.
        const { PriorityDriftAnalyzer } = require("./priority-drift-analyzer") as { PriorityDriftAnalyzer: typeof import("./priority-drift-analyzer").PriorityDriftAnalyzer };
        const priorityDrift = PriorityDriftAnalyzer.analyze(prioritizationContext);
        const recommendationGovernance = RecommendationGovernance.govern(prioritizationContext);
        const priorityHistorySummary = PriorityHistoryAnalyzer.analyze();
        const snapshotComparisons = SnapshotComparator.compare();
        const governanceSynthesis = ComparativeGovernanceSynthesizer.synthesize(
            prioritizationContext,
            priorityDrift,
            recommendationGovernance,
            priorityHistorySummary,
            snapshotComparisons,
        );

        // ─── Derive all dossier sections from data ────────────────
        const systemSnapshotContent = [
            `The CodeWorld Observatory is operating in Phase 23 (Comparative Governance Synthesis Layer).`,
            memory.totalSimulationSessions > 0
                ? ` It has ingested ${memory.totalSimulationSessions} branch simulation session(s)`
                : ` No branch simulation sessions have been recorded`,
            memory.totalBenchmarkRuns > 0
                ? ` and explicitly ranked ${memory.totalBenchmarkRuns} benchmark harness evaluation(s).`
                : ` and no benchmark harness evaluations have been performed.`,
            experimentDetails.length > 0
                ? ` ${experimentDetails.filter(detail => detail.replay.replayability === "full").length} experiment(s) currently expose artifact-complete replay-package lineage, while ${experimentDetails.filter(detail => detail.replay.replayability === "partial").length} remain at stored-evidence-chain maturity.`
                : ` No experiment-centered replay lineage is available yet.`,
        ].join("");

        const governanceSection = SessionComparator.generateGovernanceBlockerAnalysis(
            memory.governanceConstraintPatterns
        );

        const calibrationContent = memory.calibrationTrend.totalEvaluated > 0
            ? `Calibration mapping between predicted future states and executed reality shows a structural alignment score of ${(memory.calibrationTrend.alignmentScore * 100).toFixed(1)}%. Movement classification: **${memory.calibrationTrend.movement}**. ${memory.calibrationTrend.notes}`
            : `No prediction-reality comparisons have been recorded. Calibration trend cannot be derived. ${memory.calibrationTrend.notes}`;

        const evidenceSection = SessionComparator.generateEvidenceSufficiencyAnalysis(
            memory.evidenceCoverage
        );
        const comparativeEvaluationSummary = this.deriveComparativeEvaluationSummary(comparativeEvaluation, latestEvaluationRecord, latestEvaluationDrift);

        // ─── Simulation Gap Notes (data-aware) ───────────────────
        const gapNotes = this.deriveSimulationGapNotes(memory, experimentDetails);
        const replayReadinessSummary = this.deriveReplayReadinessSummary(experimentDetails);

        const dossier: ResearchDossier = {
            id: `dossier-${Date.now()}`,
            metadata: {
                generatedAt: new Date().toISOString(),
                systemVersion: OBSERVATORY_VERSION,
                totalSessionsCovered: memory.totalSimulationSessions,
                isPublicReady: false,
                prioritizationSummary: prioritizationContext.advisorySummary,
            },
            governanceSynthesis,
            sections: {
                systemSnapshot: {
                    title: "System Snapshot",
                    content: systemSnapshotContent,
                    confidence: "high",
                    prioritization: null,
                },
                recentExperiments: {
                    ...SessionComparator.generateTrendAnalysis(memory),
                    prioritization: null,
                },
                preferredBranchTrends: {
                    ...SessionComparator.generateStrategyAnalysis(memory),
                    prioritization: null,
                },
                governanceConstraintPatterns: {
                    ...governanceSection,
                    prioritization: null,
                },
                calibrationTrendSummary: {
                    title: "Longitudinal Calibration Trend",
                    content: calibrationContent,
                    confidence: memory.calibrationTrend.totalEvaluated >= 3 ? "medium" : "low",
                    prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "empirically-strong-but-calibration-limited"),
                },
                evidenceSufficiencySummary: {
                    ...evidenceSection,
                    prioritization: null,
                },
                replayReadinessSummary,
                comparativeEvaluationSummary,
                simulationGapNotes: gapNotes,
                architecturalInterpretation: {
                    title: "Architectural Interpretation of SE-JEPA",
                    content: "CodeWorld Observatory implements an abstract operational prototype of Yann LeCun's SE-JEPA model. Instead of continuous representation vectors, it uses discrete software AST proxies (structural profiles, dependency graphs, stability radii). This demonstrates that the core principles of Joint Embedding Predictive Architecture - specifically planning over abstract world-states rather than autoregressive token output - can fundamentally derisk autonomous software agents. The current prototype remains structural and heuristic; no learned connectionist model is active.",
                    confidence: "structural-only",
                    prioritization: null,
                },
                knownLimits: {
                    title: "Known Limitations",
                    content: "The current iteration acts as a structural constraint system. It lacks a learned connectionist model for continuous state updates and relies on explicit boundary detection. Replay maturity reflects artifact completeness, not exact historical branch reconstruction. Comparative weights rank persisted evidence classes and empirical depth, not causal certainty. Strategy trend analysis is derived from branch-ID heuristics and may not reflect true intervention intent without richer metadata. Research prioritization and governed recommendations remain advisory and do not constitute execution authority or validated research direction.",
                    confidence: "high",
                    prioritization: null,
                },
                advisoryResearchGaps: {
                    title: "Advisory Research Gap Highlights",
                    content: `${prioritizationContext.advisorySummary} ${prioritizationContext.topPriorities.map(signal => `${signal.priorityClass}: ${RecommendationGovernance.softenLanguage(signal.recommendedFocus)}`).join(" ")} All recommendations are advisory and bounded by current evidence only.`,
                    confidence: "high",
                    prioritization: prioritizationContext.topPriorities[0] ?? null,
                }
            }
        };

        dossier.sections.recentExperiments = {
            ...dossier.sections.recentExperiments,
            prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "evidence-deficient-but-promising"),
        };
        dossier.sections.preferredBranchTrends = {
            ...dossier.sections.preferredBranchTrends,
            prioritization: null,
        };
        dossier.sections.governanceConstraintPatterns = {
            ...dossier.sections.governanceConstraintPatterns,
            prioritization: null,
        };
        dossier.sections.evidenceSufficiencySummary = {
            ...dossier.sections.evidenceSufficiencySummary,
            prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "evidence-deficient-but-promising"),
        };
        dossier.sections.replayReadinessSummary = {
            ...dossier.sections.replayReadinessSummary,
            prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "replay-mature-but-empirically-shallow"),
        };
        dossier.sections.comparativeEvaluationSummary = {
            ...dossier.sections.comparativeEvaluationSummary,
            prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "comparison-limited"),
        };
        dossier.sections.simulationGapNotes = {
            ...dossier.sections.simulationGapNotes,
            prioritization: ResearchPrioritizationEngine.getPriorityByClass(prioritizationContext, "evidence-deficient-but-promising"),
        };

        // Persist internally
        if (options.persist ?? true) {
            this.saveDossier(dossier);
        }

        return { dossier };
    }

    /**
     * Derives simulation gap notes from the memory state. Instead of static
     * text, the gap analysis reflects actual data coverage patterns.
     */
    private static deriveSimulationGapNotes(
        memory: ReturnType<typeof ExperimentMemoryStore.compileMemory>,
        experimentDetails: ReturnType<typeof ExperimentDetailBuilder.list>
    ): ResearchDossierSection {
        const gaps: string[] = [];

        if (memory.totalSimulationSessions === 0) {
            gaps.push("No simulation sessions have been recorded — the entire simulation surface is unmapped.");
        }

        if (memory.totalBenchmarkRuns === 0 && memory.totalSimulationSessions > 0) {
            gaps.push("Simulation sessions exist but no benchmark harness evaluations have been performed, limiting comparative ranking capability.");
        }

        if (memory.calibrationTrend.movement === "insufficient-evidence") {
            gaps.push("Prediction-reality calibration loop has insufficient evidence for trend derivation.");
        }

        if (memory.evidenceCoverage.insufficientEvidenceCount > memory.evidenceCoverage.strongEvidenceCount) {
            gaps.push("More benchmark evaluations produced insufficient evidence than strong evidence — heuristic fallback is more common than validated structural analysis.");
        }

        const baselineOnlyExperiments = experimentDetails.filter(detail => detail.replay.lineageStatus === "baseline-only");
        if (baselineOnlyExperiments.length > 0) {
            gaps.push(`${baselineOnlyExperiments.length} experiment(s) remain baseline-only and cannot yet support stored-evidence-chain replay.`);
        }

        const partialExperiments = experimentDetails.filter(detail => detail.replay.lineageStatus === "stored-evidence-chain");
        if (partialExperiments.length > 0) {
            gaps.push(`${partialExperiments.length} experiment(s) have stored evidence chains but still lack execution evidence for artifact-complete replay-package lineage.`);
        }

        // Persistent architectural gap
        gaps.push("Cross-module runtime event bubbling cannot be captured by static AST proxy layers. Next phases must address implicit event bus routing.");

        return {
            title: "Simulation Gap Notes",
            content: gaps.join(" "),
            confidence: "low",
            prioritization: null,
        };
    }

    private static deriveReplayReadinessSummary(
        experimentDetails: ReturnType<typeof ExperimentDetailBuilder.list>
    ): ResearchDossierSection {
        if (experimentDetails.length === 0) {
            return {
                title: "Replay Readiness",
                content: "No experiments are registered yet, so replay maturity cannot be assessed.",
                confidence: "low",
                prioritization: null,
            };
        }

        const baselineOnlyCount = experimentDetails.filter(detail => detail.replay.lineageStatus === "baseline-only").length;
        const partialCount = experimentDetails.filter(detail => detail.replay.lineageStatus === "stored-evidence-chain").length;
        const fullCount = experimentDetails.filter(detail => detail.replay.lineageStatus === "full-replay-package").length;
        const strongestExperiment = experimentDetails.find(detail => detail.replay.lineageStatus === "full-replay-package")
            ?? experimentDetails.find(detail => detail.replay.lineageStatus === "stored-evidence-chain")
            ?? experimentDetails[0];

        return {
            title: "Replay Readiness",
            content: `${experimentDetails.length} experiment(s) are currently tracked: ${baselineOnlyCount} baseline-only, ${partialCount} stored-evidence-chain, and ${fullCount} full-replay-package. Strongest current record: '${strongestExperiment.experiment.objective.title}' at ${strongestExperiment.replay.lineageStatus} / ${strongestExperiment.replay.replayability}. Full replay-package lineage remains artifact-complete rather than branch-perfect historical reconstruction.`,
            confidence: fullCount > 0 ? "medium" : "low",
            prioritization: null,
        };
    }

    private static deriveComparativeEvaluationSummary(
        comparativeEvaluation: ReturnType<typeof EvidenceWeightedEvaluator.evaluatePortfolio>,
        latestEvaluationRecord: ReturnType<typeof EvaluationSnapshotStore.getLatest>,
        latestEvaluationDrift: ReturnType<typeof EvaluationSnapshotStore.deriveDriftHistory>[number] | null
    ): ResearchDossierSection {
        if (comparativeEvaluation.totalExperiments === 0) {
            return {
                title: "Comparative Evaluation",
                content: "No registered experiments are available for evidence-weighted comparison.",
                confidence: "low",
                prioritization: null,
            };
        }

        const strongestEvaluation = comparativeEvaluation.evaluations[0];
        const leadingComparison = comparativeEvaluation.comparisonHighlights[0];

        return {
            title: "Comparative Evaluation",
            content: leadingComparison
                ? `Strongest current experiment: '${strongestEvaluation.experimentTitle}' at ${strongestEvaluation.comparativeWeightLabel} comparative weight with ${strongestEvaluation.comparativeConfidence} confidence. Leading comparison: ${leadingComparison.rationale} ${latestEvaluationRecord ? `Latest persisted evaluation snapshot: ${new Date(latestEvaluationRecord.generatedAt).toLocaleString()}.` : "No persisted evaluation snapshot exists yet."} ${latestEvaluationDrift ? latestEvaluationDrift.narrative : "No evaluation drift history is available yet."} ${comparativeEvaluation.comparativeCaveat}`
                : `Only one experiment is currently available for comparison. '${strongestEvaluation.experimentTitle}' carries ${strongestEvaluation.comparativeWeightLabel} comparative weight with ${strongestEvaluation.comparativeConfidence} confidence. ${latestEvaluationRecord ? `Latest persisted evaluation snapshot: ${new Date(latestEvaluationRecord.generatedAt).toLocaleString()}.` : "No persisted evaluation snapshot exists yet."} ${comparativeEvaluation.comparativeCaveat}`,
            confidence: comparativeEvaluation.highConfidenceComparisonCount > 0 ? "medium" : "low",
            prioritization: null,
        };
    }

    private static saveDossier(dossier: ResearchDossier): void {
        const filePath = path.join(DOSSIER_STORE_DIR, `${dossier.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(dossier, null, 2), "utf-8");
    }

    /**
     * Retrieves the most recently generated dossier.
     */
    public static getLatestDossier(): DossierGenerationResponse | null {
        if (!fs.existsSync(DOSSIER_STORE_DIR)) return null;

        const files = fs.readdirSync(DOSSIER_STORE_DIR).filter(f => f.startsWith("dossier-"));
        if (files.length === 0) return null;

        files.sort((a, b) => {
            const statA = fs.statSync(path.join(DOSSIER_STORE_DIR, a));
            const statB = fs.statSync(path.join(DOSSIER_STORE_DIR, b));
            return statB.mtimeMs - statA.mtimeMs;
        });

        const data = fs.readFileSync(path.join(DOSSIER_STORE_DIR, files[0]), "utf-8");
        return { dossier: JSON.parse(data) as ResearchDossier };
    }
}
