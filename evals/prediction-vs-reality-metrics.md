# Prediction vs Reality Metrics

> *Formal metric definitions for the CodeWorld Observatory evaluation framework.*

---

## Data Model: PredictionRecord

Each executed intervention produces one `PredictionRecord`:

```typescript
interface PredictionRecord {
  id: string;
  interventionId: string;
  worldStateIdBefore: string;
  worldStateIdAfter: string;

  // Predicted (from SimulationResult / Phase 7 Benchmark Harness)
  predicted: {
    primaryOutcome: string;
    fileScopePredicted: string[];
    confidenceScore: number;        // 0.0 – 1.0
    uncertainRegions: string[];
    testDelta: { passing: number; failing: number; new: number };
    benchmarkRank?: number;         // Comparative structural standing
    outcomeClass?: string;          // From Phase 7 SimulationOutcomeClass
  };

  // Actual (from post-execution WorldState)
  actual: {
    primaryOutcome: string;
    filesAffected: string[];        // from git diff
    testDelta: { passing: number; failing: number; new: number };
    executedAt: string;             // ISO 8601
  };

  // Computed deltas
  computed: {
    scopeAccuracy: number;          // Jaccard coefficient
    testPassingError: number;       // |predicted - actual| for passing tests
    testFailingError: number;
    testNewError: number;
    outcomGrade: "exact" | "partial" | "miss";
    successGrade: "success" | "partial" | "failure";
  };
}
```

---

## Metric: `scope_accuracy`

```
scope_accuracy = |predicted_files ∩ actual_files| / |predicted_files ∪ actual_files|
```

Ranges from 0.0 (no overlap) to 1.0 (perfect match). Computed per intervention.

**Aggregate**: Mean across all `PredictionRecord` instances in scope.

---

## Metric: `prediction_accuracy_rate`

```
prediction_accuracy_rate = 
  count(records where outcome_grade ∈ ["exact", "partial"]) 
  / count(all records)
```

Where `outcome_grade` is assigned by the Artifact Auditor during verification:
- `exact`: The predicted primary outcome description matches ≥ 80% of the actual change
- `partial`: 40–80% match
- `miss`: < 40% match

---

## Metric: `test_delta_normalized_mae`

```
test_delta_normalized_mae = 
  mean(
    |predicted_passing - actual_passing|,
    |predicted_failing - actual_failing|,
    |predicted_new - actual_new|
  ) / total_test_count
```

Lower is better. 0.0 = perfect test delta prediction. 1.0 = completely wrong.

---

## Metric: `confidence_calibration_error`

For each confidence bucket `b` (e.g., [0.7, 0.8)):

```
bucket_actual_rate(b) = 
  count(records in b where outcome_grade != "miss")
  / count(records in b)

confidence_calibration_error(b) = |mean(b) - bucket_actual_rate(b)|
```

**Overall calibration error** = mean across all buckets with ≥ 5 samples.

Target: ≤ 0.10 (within 10% of declared confidence in each bucket).

---

## Metric: `uncertainty_signal_validity`

For each predicted `uncertainRegion` path:

```
uncertain_scope_accuracy = 
  Jaccard(uncertain_predicted ∩ actual_files_changed_in_that_region,
          uncertain_predicted ∪ actual_files_changed_in_that_region)
```

Compare to overall `scope_accuracy`. If uncertainty signal is valid, uncertain files should be harder to predict (lower scope_accuracy in uncertain regions vs. non-uncertain regions).

**Signal validity**: `mean_scope_accuracy_certain - mean_scope_accuracy_uncertain ≥ 0.20`

---

## Metric: `intervention_success_rate`

```
intervention_success_rate = 
  count(records where success_grade == "success")
  / count(all records with at least one executed intervention)
```

Where `success_grade` is assigned after verification:
- `success`: No rollback. Test suite stable or improved. Intent achieved.
- `partial`: Minor remediation needed. No rollback. Intent mostly achieved.
- `failure`: Rollback executed. Intent not achieved.

---

## Reporting Format

The `calibration_report` MCP tool returns a JSON object matching this schema:

```typescript
{
  reportedAt: string;              // ISO 8601
  totalInterventions: number;
  executedInterventions: number;
  metrics: {
    scopeAccuracyMean: number;
    predictionAccuracyRate: number;
    testDeltaNormalizedMae: number;
    confidenceCalibrationError: number;
    uncertaintySignalValidity: boolean;
    interventionSuccessRate: number;
    interventionFailureRate: number;
  };
  byRiskLevel: Record<RiskLevel, {
    count: number;
    predictionAccuracyRate: number;
    successRate: number;
  }>;
}
```

---

## Phase 8: Longitudinal Calibration Trends

With the introduction of Experiment Memory in Phase 8, individual `PredictionRealityComparison` records are aggregated over time. 

### Metric: `longitudinal_structural_alignment`
This metric tracks the moving average of `scopeAccuracy` combined with `predictionAccuracyRate` over a rolling window (e.g., last 50 interventions). The system must demonstrate stable or improving structural alignment as operational volume increases, rather than fluctuating randomly. This is a core indicator that the SE-JEPA observational proxies are successfully acting as a predictive world model.
