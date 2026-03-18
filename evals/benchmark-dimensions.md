# Benchmark Dimensions

> *The dimensions across which CodeWorld Observatory's simulation system is evaluated.*

---

## Dimension 1: Prediction Accuracy

**What it measures**: The proportion of interventions whose predicted primary outcome matches the actual observed outcome.

**Scope**: All executed interventions with a prior simulation pass.

**Grading**:
- `exact`: The predicted summary accurately describes the resulting diff.
- `partial`: The prediction covers the primary effects but misses secondary effects.
- `miss`: The prediction does not match the actual outcome in any meaningful way.

**Target (Phase 4+)**: ≥ 75% exact or partial.

---

## Dimension 2: Scope Accuracy

**What it measures**: The overlap between the predicted affected file set and the actual affected file set.

**Formula**:
```
scope_accuracy = |predicted_files ∩ actual_files| / |predicted_files ∪ actual_files|
```

This is a Jaccard similarity coefficient. 1.0 = perfect scope prediction. 0.0 = no overlap.

**Target (Phase 4+)**: Mean ≥ 0.70 across all interventions.

---

## Dimension 3: Test Delta Accuracy

**What it measures**: How accurately the system predicted the change in test suite results.

**Computed fields**:
- `predicted_passing_delta` vs `actual_passing_delta`
- `predicted_failing_delta` vs `actual_failing_delta`
- `predicted_new_tests` vs `actual_new_tests`

**Composite score**: Mean absolute error across the three fields, normalized by total test count.

**Target (Phase 4+)**: Normalized MAE ≤ 0.10.

---

## Dimension 4: Uncertainty Calibration

**What it measures**: Whether the system's uncertainty regions were actually the hard-to-predict parts.

**Method**: For each predicted `uncertainRegion` file path, compute the scope_accuracy for that file specifically. If the system flagged files as uncertain, those files should have lower per-file scope_accuracy (i.e., the uncertainty signal is real).

**Target (Phase 4+)**: Uncertain files should have scope_accuracy at least 20% lower than non-uncertain files.

---

## Dimension 5: Confidence Calibration

**What it measures**: Whether the system's confidence scores are statistically calibrated.

**Method**: Bucket interventions by declared confidence score (e.g., 0.6-0.7, 0.7-0.8, 0.8-0.9, 0.9-1.0). For each bucket, measure the actual success rate (prediction_accuracy = 'exact' or 'partial').

**Target (Phase 4+)**: Actual success rate in each bucket should be within ±10% of the bucket's midpoint confidence score.

---

## Dimension 6: Intervention Success Rate

**What it measures**: The proportion of executed interventions that achieved their declared intent without requiring remediation.

**Grading**:
- `success`: Intent achieved, no rollback required.
- `partial`: Intent partially achieved, minimal remediation needed.
- `failure`: Rollback required, intent not achieved.

**Target (Phase 4+)**: ≥ 85% success, ≤ 5% failure.

---

## Dimension 7: Simulation Output Classification (Phase 7+)

**What it measures**: The accuracy of the Simulation Runner + Benchmark Harness in assigning comparative structural ranks.

**Grading**:
- `accurate-block`: Correctly flagged a dangerous branch as `blocked-by-evidence`.
- `accurate-prefer`: Correctly ranked the structurally safest branch as #1.
- `false-positive`: Flagged a safe branch as review-heavy or blocked.
- `false-negative`: Ranked an unsafe branch as structurally-favorable (Critical Failure).

**Target (Phase 7+)**: 0% false-negative rate (absolute strictness constraint).

---

## Reporting Cadence

- Per-intervention: immediately after execution and verification
- Aggregate: at every phase gate, and on demand via `calibration_report` MCP tool
- Trend: rolling 30-day window plotted in the `PredictionRealityPanel`
