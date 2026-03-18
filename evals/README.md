# Evaluation Framework

> *CodeWorld Observatory — Prediction vs Reality accountability system.*

---

## Purpose

The evaluation framework is, structurally speaking, the most important part of the Observatory. Without it, simulation is theater. With it, every prediction the system makes is held accountable to what actually happened.

The evaluations in this directory operationalize Article VIII of the Constitution:

> *Every prediction must be measurable against reality.*

---

## Structure

```
evals/
├── README.md                      # This file
├── benchmark-dimensions.md        # Formal evaluation dimensions
└── prediction-vs-reality-metrics.md # Metric definitions and formulas
```

---

## Current Status

**Phase 0**: Structure only. No evaluation data exists yet — no interventions have been executed, so no deltas can be measured.

**Phase 4+**: The evaluation framework will become live. The `PredictionRealityPanel` in the Observatory UI will display running metrics from this framework.

---

## What Gets Evaluated

For every executed intervention, the system evaluates:

1. **Prediction accuracy**: Did the predicted outcome match the actual outcome?
2. **Scope accuracy**: Did the affected files match the predicted scope?
3. **Test delta accuracy**: Did the test suite change in the predicted way?
4. **Uncertainty calibration**: Were the predicted uncertainty regions actually hard to predict?
5. **Confidence calibration**: When the model said 90% confidence, was it right ~90% of the time?

See `benchmark-dimensions.md` and `prediction-vs-reality-metrics.md` for full definitions.

---

## The Calibration Loop

```
Predict → Execute → Measure Delta → Update Calibration → Better Predictions
```

This loop is the learning signal for the Phase 3 simulation engine. Without evals, the engine cannot improve. The eval framework is not optional infrastructure — it is the system's epistemological foundation.
