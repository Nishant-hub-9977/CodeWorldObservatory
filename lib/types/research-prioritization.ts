export type ResearchPriorityClass =
    | "evidence-deficient-but-promising"
    | "replay-mature-but-empirically-shallow"
    | "empirically-strong-but-calibration-limited"
    | "comparison-limited"
    | "saturation-emerging";

export type ResearchPriorityLevel = "critical" | "high" | "medium" | "low";

export interface ResearchPrioritySignal {
    id: string;
    priorityClass: ResearchPriorityClass;
    advisoryLevel: ResearchPriorityLevel;
    experimentId: string | null;
    experimentTitle: string | null;
    summary: string;
    rationale: string;
    evidenceGaps: string[];
    recommendedFocus: string;
    caveat: string;
}

export interface ResearchPrioritizationContext {
    generatedAt: string;
    topPriorities: ResearchPrioritySignal[];
    totalSignals: number;
    advisorySummary: string;
    prioritizationCaveat: string;
}

export interface ResearchPrioritiesApiResponse {
    priorities: ResearchPrioritizationContext;
    generatedAt: string;
}