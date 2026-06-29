// ─── Prediction-versus-Reality Ledger (deterministic · derived) ────
// Builds a comparison ledger from a scenario's mock prediction and mock
// observed outcome. The comparison is fully deterministic: identical
// input always yields identical output. No model call, no randomness.
//
// BOUNDARY: advisory-only. The ledger records what a simulation expected
// versus what was observed. It never writes to a repository and never
// triggers a deployment.

import type {
    InterventionScenario,
    InterventionPrediction,
    ObservedOutcome,
} from "./intervention-scenarios";

export type MismatchSeverity = "none" | "minor" | "notable";

export type PredictionQuality =
    | "accurate"
    | "slight-overestimate"
    | "slight-underestimate"
    | "divergent";

export interface LedgerRow {
    dimension: string;
    predicted: string;
    observed: string;
    mismatch: MismatchSeverity;
    note: string;
}

export interface PredictionRealityLedgerData {
    scenarioId: string;
    scenarioTitle: string;
    rows: LedgerRow[];
    predictionQuality: PredictionQuality;
    unresolvedUncertainty: string;
    humanDecisionState: InterventionScenario["humanDecisionState"];
    advisoryOnly: true;
    repositoryMutation: "none";
    evidencePreserved: boolean;
    evidenceRef: string;
}

function numericMismatch(predicted: number, actual: number): MismatchSeverity {
    const diff = Math.abs(predicted - actual);
    if (diff === 0) return "none";
    if (diff <= 1) return "minor";
    return "notable";
}

function categoricalMismatch(matched: boolean, adjacent: boolean): MismatchSeverity {
    if (matched) return "none";
    return adjacent ? "minor" : "notable";
}

function buildImpactMatches(
    prediction: InterventionPrediction,
    observed: ObservedOutcome,
): MismatchSeverity {
    // "rebuild-required" / "none" predicting a passing build is a match.
    // A predicted "may-break" against an actual "pass" is a benign (minor) miss.
    if (observed.actualBuildResult === "pass") {
        return prediction.expectedBuildImpact === "may-break" ? "minor" : "none";
    }
    // Actual build failed.
    return prediction.expectedBuildImpact === "may-break" ? "none" : "notable";
}

function lintImpactMatches(
    prediction: InterventionPrediction,
    observed: ObservedOutcome,
): MismatchSeverity {
    const predictedClean = prediction.expectedLintImpact === "none";
    const observedClean = observed.actualLintResult === "pass";
    const observedWarnings = observed.actualLintResult === "pass-with-warnings";
    if (predictedClean && observedClean) return "none";
    if (observed.actualLintResult === "fail") {
        return prediction.expectedLintImpact === "may-error" ? "none" : "notable";
    }
    // Warnings vs a clean/possible-warning prediction is, at most, minor.
    if (observedWarnings || !predictedClean) return "minor";
    return "minor";
}

function runtimeRiskMatches(
    prediction: InterventionPrediction,
    observed: ObservedOutcome,
): MismatchSeverity {
    if (observed.actualRuntimeResult === "clean") {
        // Predicting elevated risk but observing a clean run is a benign miss.
        return prediction.expectedRuntimeRisk === "elevated" ? "minor" : "none";
    }
    if (observed.actualRuntimeResult === "degraded") {
        return prediction.expectedRuntimeRisk === "negligible" ? "notable" : "minor";
    }
    // crash
    return "notable";
}

function deriveQuality(rows: LedgerRow[], predictedTotal: number, actualTotal: number): PredictionQuality {
    const anyNotable = rows.some((row) => row.mismatch === "notable");
    const anyMinor = rows.some((row) => row.mismatch === "minor");
    if (anyNotable) return "divergent";
    if (!anyMinor) return "accurate";
    if (predictedTotal === actualTotal) return "accurate";
    return predictedTotal > actualTotal ? "slight-overestimate" : "slight-underestimate";
}

export function buildPredictionRealityLedger(
    scenario: InterventionScenario,
): PredictionRealityLedgerData {
    const p = scenario.prediction;
    const o = scenario.observed;

    const filesMismatch = numericMismatch(p.predictedFilesTouched, o.actualFilesTouched);
    const testsMismatch = numericMismatch(p.testsLikelyToFail, o.actualFailingTests);
    const buildMismatch = buildImpactMatches(p, o);
    const lintMismatch = lintImpactMatches(p, o);
    const runtimeMismatch = runtimeRiskMatches(p, o);

    const riskMatched = p.expectedRuntimeRisk !== "elevated" || o.actualRuntimeResult !== "clean";
    const riskMismatch = categoricalMismatch(
        riskMatched && runtimeMismatch === "none",
        runtimeMismatch === "minor",
    );

    const rows: LedgerRow[] = [
        {
            dimension: "Files touched",
            predicted: String(p.predictedFilesTouched),
            observed: String(o.actualFilesTouched),
            mismatch: filesMismatch,
            note:
                filesMismatch === "none"
                    ? "Scope predicted exactly."
                    : `Δ ${Math.abs(p.predictedFilesTouched - o.actualFilesTouched)} file(s) versus prediction.`,
        },
        {
            dimension: "Test impact",
            predicted: `${p.testsLikelyToFail} likely to fail`,
            observed: `${o.actualFailingTests} failed`,
            mismatch: testsMismatch,
            note:
                testsMismatch === "none"
                    ? "Test impact predicted exactly."
                    : "Failing-test count diverged from prediction.",
        },
        {
            dimension: "Risk / runtime",
            predicted: `${p.expectedRuntimeRisk} risk`,
            observed: `${o.actualRuntimeResult} runtime`,
            mismatch: runtimeMismatch === "none" ? riskMismatch : runtimeMismatch,
            note:
                runtimeMismatch === "none"
                    ? "Runtime behaviour matched the risk posture."
                    : "Observed runtime differed from the predicted risk posture.",
        },
        {
            dimension: "Build impact",
            predicted: p.expectedBuildImpact,
            observed: o.actualBuildResult,
            mismatch: buildMismatch,
            note:
                buildMismatch === "none"
                    ? "Build outcome consistent with prediction."
                    : "Build outcome differed from the predicted impact.",
        },
        {
            dimension: "Lint impact",
            predicted: p.expectedLintImpact,
            observed: o.actualLintResult,
            mismatch: lintMismatch,
            note:
                lintMismatch === "none"
                    ? "Lint outcome consistent with prediction."
                    : "Lint outcome differed slightly from prediction.",
        },
    ];

    const predictedTotal = p.predictedFilesTouched + p.testsLikelyToFail;
    const actualTotal = o.actualFilesTouched + o.actualFailingTests;
    const predictionQuality = deriveQuality(rows, predictedTotal, actualTotal);

    return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        rows,
        predictionQuality,
        unresolvedUncertainty: p.uncertainty,
        humanDecisionState: scenario.humanDecisionState,
        advisoryOnly: true,
        repositoryMutation: "none",
        evidencePreserved: true,
        evidenceRef: scenario.evidenceRef,
    };
}
