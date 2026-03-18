import fs from "fs";
import path from "path";
import type { PredictionRealityComparison } from "../types/execution";
import type { SimulationSession } from "../types/simulation";

const EXECUTIONS_PATH = path.join(process.cwd(), "data", "executions.json");
const SIM_DIR = path.join(process.cwd(), "artifacts", "simulations");

interface ExecutionStoreData {
    comparisons: PredictionRealityComparison[];
}

export interface ResearchStatistics {
    predictionAccuracy: {
        totalComparisons: number;
        weightedAccuracy: number;
        confidenceInterval: { lower: number; upper: number } | null;
        maturity: "none" | "early" | "developing" | "stable";
        note: string;
    };
    strategySuccessRates: Array<{
        strategy: string;
        totalRuns: number;
        successRate: number;
        confidenceInterval: { lower: number; upper: number } | null;
        maturity: "early" | "developing" | "stable";
        note: string;
    }>;
    caveat: string;
}

export class StatisticalEvaluator {
    public static evaluatePredictionAccuracy(): ResearchStatistics["predictionAccuracy"] {
        const comparisons = this.loadComparisons();
        const successful = comparisons.filter(comparison => comparison.calibrationResult === "aligned" || comparison.calibrationResult === "partially-aligned").length;
        const weightedAccuracy = comparisons.length > 0
            ? comparisons.reduce((sum, comparison) => sum + this.weightFor(comparison.calibrationResult), 0) / comparisons.length
            : 0;

        return {
            totalComparisons: comparisons.length,
            weightedAccuracy,
            confidenceInterval: comparisons.length > 0 ? this.calculateConfidenceIntervals(successful, comparisons.length) : null,
            maturity: this.classifyMaturity(comparisons.length),
            note: this.describeAccuracyMaturity(comparisons.length),
        };
    }

    public static evaluateStrategySuccessRate(): ResearchStatistics["strategySuccessRates"] {
        const sessions = this.loadSessions();
        const strategyMap = new Map<string, { total: number; successful: number }>();

        for (const session of sessions) {
            for (const result of session.branchResults) {
                const strategy = result.strategyClass ?? "unknown";
                const current = strategyMap.get(strategy) ?? { total: 0, successful: 0 };
                current.total += 1;
                if (result.outcomeClass === "structurally-favorable" || result.outcomeClass === "review-heavy") {
                    current.successful += 1;
                }
                strategyMap.set(strategy, current);
            }
        }

        return Array.from(strategyMap.entries())
            .map(([strategy, data]) => ({
                strategy,
                totalRuns: data.total,
                successRate: data.total > 0 ? data.successful / data.total : 0,
                confidenceInterval: data.total > 0 ? this.calculateConfidenceIntervals(data.successful, data.total) : null,
                maturity: this.classifyRunMaturity(data.total),
                note: this.describeRunMaturity(data.total),
            }))
            .sort((left, right) => right.successRate - left.successRate);
    }

    public static calculateConfidenceIntervals(successes: number, total: number): { lower: number; upper: number } | null {
        if (total === 0) return null;

        const z = 1.96;
        const p = successes / total;
        const denominator = 1 + (z * z) / total;
        const center = (p + (z * z) / (2 * total)) / denominator;
        const margin = (z * Math.sqrt((p * (1 - p) / total) + ((z * z) / (4 * total * total)))) / denominator;

        return {
            lower: Math.max(0, center - margin),
            upper: Math.min(1, center + margin),
        };
    }

    public static summarize(): ResearchStatistics {
        return {
            predictionAccuracy: this.evaluatePredictionAccuracy(),
            strategySuccessRates: this.evaluateStrategySuccessRate(),
            caveat: "These statistics summarize persisted structural evidence only. Small sample sizes widen uncertainty and should not be treated as mature empirical claims.",
        };
    }

    private static classifyMaturity(totalComparisons: number): ResearchStatistics["predictionAccuracy"]["maturity"] {
        if (totalComparisons === 0) return "none";
        if (totalComparisons < 3) return "early";
        if (totalComparisons < 8) return "developing";
        return "stable";
    }

    private static classifyRunMaturity(totalRuns: number): ResearchStatistics["strategySuccessRates"][number]["maturity"] {
        if (totalRuns < 3) return "early";
        if (totalRuns < 8) return "developing";
        return "stable";
    }

    private static describeAccuracyMaturity(totalComparisons: number): string {
        if (totalComparisons === 0) {
            return "No prediction-reality comparisons are available yet.";
        }
        if (totalComparisons < 3) {
            return `Only ${totalComparisons} comparison${totalComparisons === 1 ? " is" : "s are"} available; the interval is descriptive but not yet trend-grade.`;
        }
        if (totalComparisons < 8) {
            return "The sample is still developing; interval estimates remain directionally useful but not mature.";
        }
        return "The sample is large enough for a more stable descriptive interval, though it remains bounded to persisted observatory evidence.";
    }

    private static describeRunMaturity(totalRuns: number): string {
        if (totalRuns < 3) {
            return `Only ${totalRuns} run${totalRuns === 1 ? " is" : "s are"} available for this strategy; treat the rate as provisional.`;
        }
        if (totalRuns < 8) {
            return "This strategy has a developing evidence base; the rate is still sensitive to additional runs.";
        }
        return "This strategy has enough recorded runs for a more stable descriptive estimate.";
    }

    private static loadComparisons(): PredictionRealityComparison[] {
        try {
            if (!fs.existsSync(EXECUTIONS_PATH)) return [];
            const raw = fs.readFileSync(EXECUTIONS_PATH, "utf-8");
            const parsed = JSON.parse(raw) as ExecutionStoreData;
            return Array.isArray(parsed.comparisons) ? parsed.comparisons : [];
        } catch {
            return [];
        }
    }

    private static loadSessions(): SimulationSession[] {
        if (!fs.existsSync(SIM_DIR)) return [];
        return fs.readdirSync(SIM_DIR)
            .filter(file => file.startsWith("session-") && file.endsWith(".json"))
            .map(file => {
                const raw = fs.readFileSync(path.join(SIM_DIR, file), "utf-8");
                return JSON.parse(raw) as SimulationSession;
            });
    }

    private static weightFor(result: PredictionRealityComparison["calibrationResult"]): number {
        const weights: Record<PredictionRealityComparison["calibrationResult"], number> = {
            aligned: 1,
            "partially-aligned": 0.65,
            divergent: 0.2,
            "insufficient-evidence": 0.4,
        };

        return weights[result] ?? 0.4;
    }
}