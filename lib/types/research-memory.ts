import type { SimulationOutcomeClass, SimulationSession, BenchmarkHarnessRun } from "./simulation";
import type { ResearchPrioritySignal } from "./research-prioritization";
import type { ComparativeGovernanceSynthesis } from "./governance-synthesis";

export interface EvidenceCoverageSummary {
    totalSessions: number;
    strongEvidenceCount: number;
    adequateEvidenceCount: number;
    insufficientEvidenceCount: number;
}

export interface GovernanceConstraintPattern {
    category: string;
    occurrences: number;
    affectedObjectives: string[];
}

export interface CalibrationTrendRecord {
    totalEvaluated: number;
    alignmentScore: number; // 0-1
    movement: "stable" | "improving" | "mixed" | "insufficient-evidence";
    notes: string;
}

export interface BranchTrendRecord {
    strategyClass: "service-first" | "route-first" | "minimal-touch" | "structural-refactor" | "ui-first" | "unknown";
    selectionRate: number; // 0-1
    context: string;
}

export interface SessionComparison {
    objectiveHash: string;
    objectiveSample: string;
    sessionCount: number;
    preferredOutcomes: Partial<Record<SimulationOutcomeClass, number>>;
    dominantBlockers: string[];
}

// Replaces older SimulationSession summary in context of memory
export interface ExperimentSessionSummary {
    sessionId: string;
    timestamp: string;
    objective: string;
    simulatedBranches: number;
    outcome: string;
}

// Maps directly to the stored session/benchmark data at the memory level
export interface ExperimentSessionRecord {
    lastUpdatedAt: string;
    totalSimulationSessions: number;
    totalBenchmarkRuns: number;
    recentSessions: ExperimentSessionSummary[];
    evidenceCoverage: EvidenceCoverageSummary;
    preferredStrategyTrends: BranchTrendRecord[];
    governanceConstraintPatterns: GovernanceConstraintPattern[];
    calibrationTrend: CalibrationTrendRecord;
    comparativeSessions: SessionComparison[];
}

export interface ResearchDossierSection {
    title: string;
    content: string;
    confidence: "high" | "medium" | "low" | "structural-only";
    prioritization?: ResearchPrioritySignal | null;
}

export interface DossierExportMetadata {
    generatedAt: string;
    systemVersion: string;
    totalSessionsCovered: number;
    isPublicReady: boolean;
    prioritizationSummary: string;
}

export interface ResearchDossier {
    id: string;
    metadata: DossierExportMetadata;
    governanceSynthesis: ComparativeGovernanceSynthesis | null;
    sections: {
        systemSnapshot: ResearchDossierSection;
        recentExperiments: ResearchDossierSection;
        preferredBranchTrends: ResearchDossierSection;
        governanceConstraintPatterns: ResearchDossierSection;
        calibrationTrendSummary: ResearchDossierSection;
        evidenceSufficiencySummary: ResearchDossierSection;
        replayReadinessSummary: ResearchDossierSection;
        comparativeEvaluationSummary: ResearchDossierSection;
        simulationGapNotes: ResearchDossierSection; // Added per prompt
        architecturalInterpretation: ResearchDossierSection;
        knownLimits: ResearchDossierSection;
        advisoryResearchGaps: ResearchDossierSection;
    };
}

export interface DossierGenerationResponse {
    dossier: ResearchDossier;
}

export interface ResearchMemoryResponse {
    memory: ExperimentSessionRecord;
}
