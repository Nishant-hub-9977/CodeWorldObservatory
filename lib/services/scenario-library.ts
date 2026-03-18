import type { ScenarioLibraryResponse, ScenarioRecord } from "../types/scenario";
import { ExperimentRegistry } from "./experiment-registry";

const SCENARIOS: ScenarioRecord[] = [
    {
        scenarioId: "scn-service-boundary-hardening",
        description: "Evaluate how a service-heavy repository absorbs contained interface hardening without destabilizing route contracts.",
        targetRepoType: "service-oriented Next.js workspace",
        riskProfile: "moderate",
        recommendedStrategies: ["service-first", "minimal-touch"],
        evaluationMetrics: ["prediction accuracy", "dependency pressure drift", "governance blocker recurrence"],
    },
    {
        scenarioId: "scn-ui-contract-expansion",
        description: "Study how UI-facing contract expansion changes evidence burden and route review load.",
        targetRepoType: "UI and route coupled workspace",
        riskProfile: "high",
        recommendedStrategies: ["ui-first", "route-first", "minimal-touch"],
        evaluationMetrics: ["strategy success rate", "calibration movement", "review burden"],
    },
    {
        scenarioId: "scn-structural-refactor-probe",
        description: "Stress-test whether a high-complexity repository can support structural refactors under explicit governance constraints.",
        targetRepoType: "high-complexity modular workspace",
        riskProfile: "critical",
        recommendedStrategies: ["structural-refactor", "minimal-touch"],
        evaluationMetrics: ["confidence interval width", "blocker recurrence", "simulation-to-execution divergence"],
    },
];

export class ScenarioLibrary {
    public static listScenarios(): ScenarioLibraryResponse {
        return { scenarios: SCENARIOS };
    }

    public static loadScenario(scenarioId: string): ScenarioRecord | null {
        return SCENARIOS.find(scenario => scenario.scenarioId === scenarioId) ?? null;
    }

    public static linkScenarioToExperiment(experimentId: string, scenarioId: string): ScenarioRecord | null {
        const scenario = this.loadScenario(scenarioId);
        if (!scenario) return null;

        const linked = ExperimentRegistry.linkScenario(experimentId, scenarioId);
        if (!linked) return null;

        return scenario;
    }
}