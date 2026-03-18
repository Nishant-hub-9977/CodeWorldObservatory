# Research Dossier Metrics (Phase 8)

## Purpose
This document establishes the evaluation criteria for the Phase 8 Comparative Research Dossier generation. The goal is to measure the system's ability to reliably aggregate, compare, and summarize longitudinal experiment memory without hallucinating statistical confidence or fabricating trends.

## Metrics

### 1. Evidence Accumulation Quality (EAQ)
**Definition:** The fidelity with which the dossier reflects the precise counts and categories of evidence generated in underlying benchmark sessions.
**Measurement:**
- 100% exact match required between the dossier's stated `totalSessionsCovered` and the actual count of valid benchmark artifacts in the ledger.
- Exact mapping of `strong` vs `adequate` vs `insufficient` evidence counts back to their source session artifacts.

### 2. Dossier Interpretability Score (DIS)
**Definition:** The clarity, sobriety, and structural accuracy of the generated narrative sections.
**Measurement:**
- Human review on a 1-5 scale. A score of 5 requires:
  - Zero use of marketing language or hype.
  - Explicit demarcation between structural evidence (e.g., "AST boundary broken") and heuristics.
  - Clear distillation of recurring governance blockers.

### 3. Preferred-Branch Stability (PBS)
**Definition:** Measures whether the system can correctly identify and articulate when the simulation harness demonstrates a stable preference for a specific intervention class over time.
**Measurement:**
- Accurate calculation of the `selectionRate` for the dominant strategy class across all aggregated sessions.

### 4. Longitudinal Calibration Fidelity (LCF)
**Definition:** The accuracy of the aggregated calibration trend output, ensuring it correctly sums the prediction-reality deltas from Phase 4/6 into a unified performance metric.
**Measurement:**
- The trend score must mathematically equal the moving average of the underlying `PredictionRealityComparison` artifacts.

## Governance Constraint Tracking
A key structural output of Phase 8 is tracking **Blocker Recurrence Rates**. The dossier must prioritize and clearly state which structural obstacles (e.g., alias-resolution, unspecified bounds) most frequently prevent autonomous execution. This metric directly informs where future SE-JEPA observational capabilities must be improved.
