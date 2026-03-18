import fs from "fs";
import path from "path";
import type { PredictionRealityComparison, CalibrationResult } from "../types/execution";
import type { TimelineCalibrationPoint, TimelineCalibrationTrajectory } from "../types/research-timeline";
import { CalibrationTracker } from "./calibration-tracker";

const EXECUTIONS_PATH = path.join(process.cwd(), "data", "executions.json");

interface ExecutionStoreData {
    comparisons: PredictionRealityComparison[];
}

export class CalibrationTrajectoryAnalyzer {
    public static analyze(): TimelineCalibrationTrajectory {
        const comparisons = this.loadComparisons().sort((left, right) => {
            return new Date(left.comparedAt).getTime() - new Date(right.comparedAt).getTime();
        });

        if (comparisons.length === 0) {
            return {
                maturity: "preliminary",
                points: [],
                summary: "No prediction-reality comparisons are available yet. Calibration trajectory cannot be established.",
            };
        }

        let runningWeight = 0;
        const points: TimelineCalibrationPoint[] = comparisons.map((comparison, index) => {
            runningWeight += this.weightFor(comparison.calibrationResult);
            const totalEvaluated = index + 1;
            const aggregateAlignmentScore = runningWeight / totalEvaluated;
            const trend = CalibrationTracker.deriveTrend(totalEvaluated, aggregateAlignmentScore);

            return {
                pointId: comparison.id,
                comparedAt: comparison.comparedAt,
                totalEvaluated,
                aggregateAlignmentScore,
                movement: trend.movement,
                latestResult: comparison.calibrationResult,
                note: trend.notes,
            };
        });

        const latestPoint = points[points.length - 1];

        return {
            maturity: points.length >= 3 ? "established" : "preliminary",
            points,
            summary: points.length >= 3
                ? `Calibration trajectory is ${latestPoint.movement.replace(/-/g, " ")} across ${points.length} recorded comparisons, with an aggregate alignment score of ${(latestPoint.aggregateAlignmentScore * 100).toFixed(1)}%.`
                : `Calibration trajectory is preliminary. ${points.length} comparison${points.length === 1 ? "" : "s"} recorded so far, with ${(latestPoint.aggregateAlignmentScore * 100).toFixed(1)}% aggregate alignment.`
        };
    }

    private static loadComparisons(): PredictionRealityComparison[] {
        try {
            if (!fs.existsSync(EXECUTIONS_PATH)) return [];
            const raw = fs.readFileSync(EXECUTIONS_PATH, "utf-8");
            const store = JSON.parse(raw) as ExecutionStoreData;
            return Array.isArray(store.comparisons) ? store.comparisons : [];
        } catch {
            return [];
        }
    }

    private static weightFor(result: CalibrationResult): number {
        const weights: Record<CalibrationResult, number> = {
            aligned: 1.0,
            "partially-aligned": 0.65,
            divergent: 0.2,
            "insufficient-evidence": 0.4,
        };

        return weights[result] ?? 0.4;
    }
}