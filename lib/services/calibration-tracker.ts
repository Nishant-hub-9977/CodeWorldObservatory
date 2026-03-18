import fs from "fs";
import path from "path";
import type { CalibrationTrendRecord } from "../types/research-memory";
import type { PredictionRealityComparison, CalibrationResult } from "../types/execution";

// ─── Calibration Tracker ─────────────────────────────────────────
// Derives longitudinal calibration trend signals from prediction-vs-reality
// records stored in the execution ledger. Preserves epistemic honesty when
// evidence is sparse or absent.

const EXECUTIONS_PATH = path.join(process.cwd(), "data", "executions.json");

interface ExecutionStoreData {
    executions: unknown[];
    comparisons: PredictionRealityComparison[];
    lastUpdated: string;
}

export class CalibrationTracker {
    /**
     * Reads the prediction-vs-reality comparison records from persistence
     * and derives a structural alignment score and movement classification.
     */
    public static deriveFromLedger(): CalibrationTrendRecord {
        const comparisons = this.loadComparisons();
        if (comparisons.length === 0) {
            return this.deriveTrend(0, 0);
        }

        const alignmentScore = this.computeAlignmentScore(comparisons);
        return this.deriveTrend(comparisons.length, alignmentScore);
    }

    /**
     * Core trend derivation from aggregate metrics. Can be called directly
     * when comparison data has already been compiled externally.
     */
    public static deriveTrend(
        totalEvaluated: number,
        aggregateAlignmentScore: number
    ): CalibrationTrendRecord {
        let movement: "stable" | "improving" | "mixed" | "insufficient-evidence" = "insufficient-evidence";
        let notes = "Not enough data points to establish a structural baseline.";

        if (totalEvaluated >= 3) {
            if (aggregateAlignmentScore >= 0.85) {
                movement = "stable";
                notes = "Calibration exhibits stable structural alignment across recorded sessions.";
            } else if (aggregateAlignmentScore >= 0.70) {
                movement = "improving";
                notes = "Calibration is adequate but shows variance over deep nested component trees.";
            } else if (aggregateAlignmentScore >= 0.45) {
                movement = "mixed";
                notes = "Early evidence suggests mixed calibration. Prediction divergence occurs primarily in highly coupled graph regions.";
            } else {
                movement = "mixed";
                notes = "Calibration indicates significant structural divergence between predicted and actual outcomes. Review observation encoder coverage.";
            }
        } else if (totalEvaluated > 0) {
            // Fewer than 3 comparisons — evidence exists but is too sparse for trend
            movement = "insufficient-evidence";
            notes = `Only ${totalEvaluated} prediction-reality ${totalEvaluated === 1 ? "comparison" : "comparisons"} available. Minimum 3 required for trend classification.`;
        }

        return {
            totalEvaluated,
            alignmentScore: totalEvaluated > 0 ? Math.min(Math.max(aggregateAlignmentScore, 0), 1) : 0,
            movement,
            notes
        };
    }

    /**
     * Computes a structural alignment score from a set of prediction-reality
     * comparisons. Each CalibrationResult maps to a numeric weight reflecting
     * how closely the prediction matched the observed outcome.
     */
    private static computeAlignmentScore(comparisons: PredictionRealityComparison[]): number {
        const weights: Record<CalibrationResult, number> = {
            "aligned": 1.0,
            "partially-aligned": 0.65,
            "divergent": 0.2,
            "insufficient-evidence": 0.4,
        };

        const totalWeight = comparisons.reduce((sum, c) => {
            return sum + (weights[c.calibrationResult] ?? 0.4);
        }, 0);

        return totalWeight / comparisons.length;
    }

    /**
     * Safely loads comparison records from the executions persistence file.
     * Returns empty array if persistence does not yet exist.
     */
    private static loadComparisons(): PredictionRealityComparison[] {
        try {
            if (!fs.existsSync(EXECUTIONS_PATH)) return [];
            const raw = fs.readFileSync(EXECUTIONS_PATH, "utf-8");
            const store: ExecutionStoreData = JSON.parse(raw);
            return Array.isArray(store.comparisons) ? store.comparisons : [];
        } catch {
            return [];
        }
    }
}
