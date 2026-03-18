import type {
    ExperimentSessionRecord,
    SessionComparison,
    ResearchDossierSection,
    BranchTrendRecord,
    GovernanceConstraintPattern,
    EvidenceCoverageSummary,
    CalibrationTrendRecord,
} from "../types/research-memory";

// ─── Session Comparator ──────────────────────────────────────────
// Derives comparative insights across multiple recorded simulation
// and benchmark sessions. Encapsulates the logic for identifying
// longitudinal patterns in repeated system runs.

export class SessionComparator {
    /**
     * Synthesizes a high-level narrative from the comparative session data.
     */
    public static generateTrendAnalysis(memory: ExperimentSessionRecord): ResearchDossierSection {
        const totalSessions = memory.totalSimulationSessions;

        if (totalSessions === 0) {
            return {
                title: "Recent Experiments",
                content: "No simulation sessions have been recorded in the persistent ledger.",
                confidence: "high"
            };
        }

        const topBlocker = memory.governanceConstraintPatterns[0]?.category || "None observed";
        const topBlockerCount = memory.governanceConstraintPatterns[0]?.occurrences || 0;
        const suffRatio = memory.evidenceCoverage.totalSessions > 0
            ? (memory.evidenceCoverage.strongEvidenceCount + memory.evidenceCoverage.adequateEvidenceCount) / memory.evidenceCoverage.totalSessions
            : 0;

        const content = [
            `Over a corpus of **${totalSessions}** recorded simulation sessions, the Observatory demonstrates consistent structural gating. `,
            topBlockerCount > 0
                ? `The prevailing governance constraint limiting autonomous execution is currently **${topBlocker}**, arising ${topBlockerCount} times. `
                : `No governance constraints have triggered branch rejection in the recorded corpus. `,
            memory.evidenceCoverage.totalSessions > 0
                ? `Evidence sufficiency across uncertainty burdens is maintained at a ${(suffRatio * 100).toFixed(1)}% adequate-or-better rating across benchmark evaluations.`
                : `No benchmark evaluations have been recorded to measure evidence sufficiency.`
        ].join("");

        return {
            title: "Recent Experiments & Uncertainty Trends",
            content,
            confidence: totalSessions >= 3 ? "high" : "medium"
        };
    }

    /**
     * Extracts narrative around the most commonly preferred intervention strategy.
     */
    public static generateStrategyAnalysis(memory: ExperimentSessionRecord): ResearchDossierSection {
        const primaryTrend = memory.preferredStrategyTrends[0];

        if (!primaryTrend || primaryTrend.selectionRate === 0) {
            return {
                title: "Preferred Branch Trends",
                content: "Insufficient data to determine dominant branching strategies. The system has not yet accumulated enough benchmark or simulation sessions to derive strategy preferences.",
                confidence: "low"
            };
        }

        const formattedRate = (primaryTrend.selectionRate * 100).toFixed(0);

        const secondaryTrend = memory.preferredStrategyTrends[1];
        const secondaryNote = secondaryTrend && secondaryTrend.selectionRate > 0
            ? ` Secondary preference: **${secondaryTrend.strategyClass}** at ${(secondaryTrend.selectionRate * 100).toFixed(0)}%.`
            : "";

        return {
            title: "Preferred Branch Trends",
            content: `The system exhibits a **${formattedRate}%** preference rate for **${primaryTrend.strategyClass}** branches when evaluating counterfactuals. ${primaryTrend.context}${secondaryNote}`,
            confidence: memory.totalSimulationSessions >= 3 ? "medium" : "low"
        };
    }

    /**
     * Detects recurring governance blockers and their significance across sessions.
     * Returns a structured dossier section describing the recurrence patterns.
     */
    public static generateGovernanceBlockerAnalysis(
        patterns: GovernanceConstraintPattern[]
    ): ResearchDossierSection {
        if (patterns.length === 0) {
            return {
                title: "Governance Constraint Patterns",
                content: "No governance blockers have been recorded. Either the system has no simulation data, or all branches have passed governance checks without triggering constraint events.",
                confidence: "high"
            };
        }

        const topPatterns = patterns.slice(0, 3);
        const patternDescriptions = topPatterns.map(p =>
            `**${p.category}** (${p.occurrences} occurrence${p.occurrences > 1 ? "s" : ""}, affecting: ${p.affectedObjectives.join(", ") || "unattributed"})`
        );

        const totalBlocker = patterns.reduce((s, p) => s + p.occurrences, 0);

        return {
            title: "Governance Constraint Patterns",
            content: `The system has recorded ${totalBlocker} governance constraint events across ${patterns.length} distinct categories. Primary blockers: ${patternDescriptions.join("; ")}. These patterns indicate recurring structural boundaries that the observation encoder cannot yet resolve.`,
            confidence: patterns.length >= 2 ? "medium" : "structural-only"
        };
    }

    /**
     * Summarizes uncertainty burden patterns derived from evidence coverage
     * and calibration trends across the session corpus.
     */
    public static generateUncertaintyBurdenAnalysis(
        evidence: EvidenceCoverageSummary,
        calibration: CalibrationTrendRecord
    ): ResearchDossierSection {
        if (evidence.totalSessions === 0 && calibration.totalEvaluated === 0) {
            return {
                title: "Uncertainty Burden Summary",
                content: "No evidence or calibration data available. The uncertainty burden of the system is entirely unmapped.",
                confidence: "low"
            };
        }

        const insufficientRatio = evidence.totalSessions > 0
            ? evidence.insufficientEvidenceCount / evidence.totalSessions
            : 0;

        let burden: string;
        if (insufficientRatio > 0.5) {
            burden = "The system carries a **high uncertainty burden**: more than half of all benchmark evaluations yielded insufficient evidence for confident outcome classification.";
        } else if (insufficientRatio > 0.2) {
            burden = "The system carries a **moderate uncertainty burden**: a non-trivial proportion of evaluations produced insufficient evidence.";
        } else {
            burden = "The system maintains a **low uncertainty burden**: the majority of benchmark evaluations produced adequate or strong structural evidence.";
        }

        const calibrationContext = calibration.totalEvaluated > 0
            ? ` Calibration movement: **${calibration.movement}** (alignment score: ${(calibration.alignmentScore * 100).toFixed(1)}%).`
            : " No prediction-reality comparisons are available for calibration assessment.";

        return {
            title: "Uncertainty Burden Summary",
            content: `${burden}${calibrationContext}`,
            confidence: evidence.totalSessions >= 3 ? "medium" : "low"
        };
    }

    /**
     * Generates an evidence sufficiency assessment from the coverage summary.
     */
    public static generateEvidenceSufficiencyAnalysis(
        evidence: EvidenceCoverageSummary
    ): ResearchDossierSection {
        if (evidence.totalSessions === 0) {
            return {
                title: "Evidence Sufficiency",
                content: "No benchmark sessions have been evaluated. Evidence sufficiency cannot be assessed.",
                confidence: "low"
            };
        }

        return {
            title: "Evidence Sufficiency",
            content: `Of the ${evidence.totalSessions} evaluated benchmark sessions, ${evidence.strongEvidenceCount} held 'strong' structural evidence, ${evidence.adequateEvidenceCount} were 'adequate', and ${evidence.insufficientEvidenceCount} required fallback to base heuristic modeling. The strong+adequate ratio is ${(((evidence.strongEvidenceCount + evidence.adequateEvidenceCount) / evidence.totalSessions) * 100).toFixed(1)}%.`,
            confidence: "high"
        };
    }

    /**
     * Compares repeated sessions to detect convergence or divergence in
     * preferred outcomes over time.
     */
    public static detectConvergenceSignal(
        comparisons: SessionComparison[]
    ): ResearchDossierSection {
        if (comparisons.length === 0) {
            return {
                title: "Session Convergence",
                content: "No comparative session data available to assess convergence patterns.",
                confidence: "low"
            };
        }

        const multiSessionGroups = comparisons.filter(c => c.sessionCount > 1);
        if (multiSessionGroups.length === 0) {
            return {
                title: "Session Convergence",
                content: "All recorded sessions target unique objectives. Repeat-session convergence analysis requires at least two sessions with matching objectives.",
                confidence: "structural-only"
            };
        }

        const notes = multiSessionGroups.map(g =>
            `Objective "${g.objectiveSample}" has been simulated ${g.sessionCount} times.`
        );

        return {
            title: "Session Convergence",
            content: `${multiSessionGroups.length} objective group(s) have repeat simulations. ${notes.join(" ")} Repeat simulation data enables trend detection for structural preference convergence.`,
            confidence: "medium"
        };
    }
}
