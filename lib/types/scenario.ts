import type { BranchStrategy } from "./intervention";

export interface ScenarioRecord {
    scenarioId: string;
    description: string;
    targetRepoType: string;
    riskProfile: "low" | "moderate" | "high" | "critical";
    recommendedStrategies: BranchStrategy[];
    evaluationMetrics: string[];
}

export interface ScenarioLibraryResponse {
    scenarios: ScenarioRecord[];
}

export interface ScenarioLinkResponse {
    scenario: ScenarioRecord;
    experimentId: string;
    linkedAt: string;
}