import { BranchOutcomeProjection } from "../types/future-state";
import { ActualOutcome, PredictionRealityComparison, CalibrationResult } from "../types/execution";

export class PredictionRealityComparator {

    public static compare(
        branchId: string,
        executionRecordId: string,
        prediction: BranchOutcomeProjection,
        reality: ActualOutcome
    ): PredictionRealityComparison {

        // 1. Evaluate Readiness
        const readinessMatch = prediction.impact.executionReadiness === reality.executionReadinessActual;

        // 2. Evaluate Fragile Zones vs Observed Issues
        // This is a heuristic comparison. In a real system, this would involve 
        // deeper embedding similarity or stack trace mapping.
        const predictedZones = prediction.impact.instabilityZones.map(z => z.toLowerCase());
        const actualIssues = reality.observedIssues.map(i => i.toLowerCase());

        const issuesForeseen = actualIssues.filter(issue =>
            predictedZones.some(zone => issue.includes(zone) || zone.includes(issue))
        ).length;

        const unforeseenIssues = actualIssues.length - issuesForeseen;

        // 3. Evaluate Validation Burden
        const burdenMatch = prediction.impact.validationBurden === reality.validationBurden;

        // 4. Derive Calibration Result
        let result: CalibrationResult = "insufficient-evidence";
        let note = "Comparison incomplete.";

        if (reality.status === "success" && readinessMatch && unforeseenIssues === 0 && burdenMatch) {
            result = "aligned";
            note = "Execution proceeded exactly as projected. Model bounds safely contained the intervention.";
        } else if (reality.status === "success" && (!readinessMatch || unforeseenIssues > 0 || !burdenMatch)) {
            result = "partially-aligned";
            note = "Intervention succeeded but encountered unpredicted friction or scope drift.";
        } else if (reality.status === "failure" || reality.status === "rolled-back") {
            if (prediction.impact.executionReadiness === "blocked" || prediction.impact.executionReadiness === "needs-review") {
                result = "aligned";
                note = "Intervention failed, but the model correctly identified it as high-risk and advised against execution.";
            } else {
                result = "divergent";
                note = "Critical calibration failure: Model projected safety, but execution failed or required rollback.";
            }
        }

        // Evidence Sufficiency
        let evidenceNote = "Adequate evidence captured.";
        if (reality.touchedSurfaces.length === 0 && prediction.likelyTouchedSurfaces.length > 0) {
            evidenceNote = "Inconclusive: Agent executed without touching predicted surfaces, suggesting a fundamentally different approach was taken.";
            result = "insufficient-evidence";
        }

        return {
            id: `cmp-${Date.now().toString(36)}`,
            executionRecordId,
            branchId,

            expectedReadiness: prediction.impact.executionReadiness,
            actualReadiness: reality.executionReadinessActual,

            expectedFragileZones: prediction.impact.instabilityZones,
            observedIssues: reality.observedIssues,

            expectedValidationBurden: prediction.impact.validationBurden,
            actualValidationBurden: reality.validationBurden,

            expectedSurfaces: prediction.likelyTouchedSurfaces,
            actualSurfaces: reality.touchedSurfaces,

            calibrationResult: result,
            calibrationNote: note,
            evidenceSufficiencyNote: evidenceNote,

            comparedAt: new Date().toISOString()
        };
    }
}
