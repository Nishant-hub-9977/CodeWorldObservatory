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
import {
    getSnapshotEvidenceForScenario,
    type ScenarioSnapshotEvidence,
} from "./snapshot-bridge";
import {
    deriveSnapshotRisk,
    type SnapshotRiskSummary,
} from "./snapshot-risk";

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
    snapshotEvidence: ScenarioSnapshotEvidence;
    snapshotRisk: SnapshotRiskSummary;
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

function pathMatches(predictedPath: string, actualPath: string): boolean {
    if (predictedPath === actualPath) return true;
    const wildcardIndex = predictedPath.indexOf("*");
    if (wildcardIndex >= 0) {
        return actualPath.startsWith(predictedPath.slice(0, wildcardIndex));
    }
    return false;
}

function overlapCount(expectedPaths: string[], actualPaths: string[]): number {
    return expectedPaths.filter((expectedPath) =>
        actualPaths.some((actualPath) => pathMatches(expectedPath, actualPath)),
    ).length;
}

function yesNo(value: boolean): string {
    return value ? "yes" : "no";
}

function buildSnapshotRows(
    scenario: InterventionScenario,
    snapshotEvidence: ScenarioSnapshotEvidence,
    snapshotRisk: SnapshotRiskSummary,
): LedgerRow[] {
    const predictedMatchCount = overlapCount(
        scenario.prediction.predictedFilePaths,
        snapshotEvidence.matchedFiles,
    );
    const observedMatchCount = overlapCount(
        scenario.observed.actualFilePaths,
        snapshotEvidence.matchedFiles,
    );
    const hasStaticAlignment = snapshotEvidence.staticDependencyEvidenceAvailable &&
        (predictedMatchCount > 0 || observedMatchCount > 0);
    const alignmentMismatch: MismatchSeverity = hasStaticAlignment
        ? snapshotRisk.widenedMismatchSurface
            ? "minor"
            : "none"
        : "notable";

    return [
        {
            dimension: "Snapshot Evidence Used",
            predicted: `${scenario.prediction.predictedFilesTouched} predicted file(s)`,
            observed: `${snapshotEvidence.matchedFiles.length} snapshot-matched file(s)`,
            mismatch: alignmentMismatch,
            note: snapshotEvidence.staticDependencyEvidenceAvailable
                ? "Static repository evidence was available and attached to the prediction."
                : "No static snapshot evidence was available for this scenario mapping.",
        },
        {
            dimension: "Static Graph Alignment",
            predicted: `${predictedMatchCount} predicted path match(es)`,
            observed: `${observedMatchCount} observed path match(es)`,
            mismatch: alignmentMismatch,
            note: snapshotRisk.widenedMismatchSurface
                ? "Snapshot evidence widened the review surface beyond the mock prediction."
                : snapshotRisk.narrowedMismatchSurface
                    ? "Snapshot evidence narrowed the review surface to an isolated static surface."
                    : "Snapshot evidence aligned with the predicted or observed file surface.",
        },
        {
            dimension: "Route Blast Radius",
            predicted: scenario.prediction.predictedDependencyZones.join(", "),
            observed: `${snapshotEvidence.routeBlastRadius} route(s) exposed`,
            mismatch: snapshotEvidence.routeBlastRadius >= 3 ? "minor" : "none",
            note: "Route exposure is estimated from static snapshot evidence and shared infrastructure classification.",
        },
        {
            dimension: "Shared Infrastructure Exposure",
            predicted: `${scenario.prediction.expectedRuntimeRisk} runtime risk`,
            observed: yesNo(snapshotEvidence.sharedInfrastructureTouched),
            mismatch: snapshotEvidence.sharedInfrastructureTouched ? "minor" : "none",
            note: "Shared shell, layout, or UI primitives widen review even when file count is small.",
        },
        {
            dimension: "Evidence Confidence",
            predicted: "static snapshot enrichment",
            observed: snapshotRisk.evidenceConfidence,
            mismatch: snapshotRisk.evidenceConfidence === "LIMITED" ? "minor" : "none",
            note: snapshotRisk.staticApproximationCaveat,
        },
    ];
}

export function buildPredictionRealityLedger(
    scenario: InterventionScenario,
): PredictionRealityLedgerData {
    const p = scenario.prediction;
    const o = scenario.observed;
    const snapshotEvidence = getSnapshotEvidenceForScenario(scenario.id);
    const snapshotRisk = deriveSnapshotRisk(snapshotEvidence);

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

    const coreRows: LedgerRow[] = [
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
    const predictionQuality = deriveQuality(coreRows, predictedTotal, actualTotal);
    const rows = [...coreRows, ...buildSnapshotRows(scenario, snapshotEvidence, snapshotRisk)];

    return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        rows,
        snapshotEvidence,
        snapshotRisk,
        predictionQuality,
        unresolvedUncertainty: p.uncertainty,
        humanDecisionState: scenario.humanDecisionState,
        advisoryOnly: true,
        repositoryMutation: "none",
        evidencePreserved: true,
        evidenceRef: scenario.evidenceRef,
    };
}
