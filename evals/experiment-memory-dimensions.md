# Experiment Memory Dimensions (Phase 8)

## Purpose

This document defines the evaluation boundaries for the Phase 8 Experiment Memory layer. The memory system aggregates simulation sessions and benchmark runs into a longitudinal record. These dimensions establish what constitutes valid memory behavior and where interpretation limits must be respected.

---

## Dimensions

### 1. Session Aggregation Fidelity (SAF)

**Definition:** The accuracy with which the memory layer reflects the true count, ordering, and classification of persisted simulation sessions and benchmark runs.

**Measurement:**
- Total session count must exactly match the number of valid `session-*.json` files in `artifacts/simulations/`.
- Total benchmark count must exactly match the number of valid `benchmark-*.json` files in `artifacts/simulations/`.
- Recent session ordering must be strictly descending by `simulatedAt` timestamp.

**Failure Condition:** Any discrepancy between file count and reported count constitutes a data integrity violation.

---

### 2. Strategy Trend Derivation Accuracy (STDA)

**Definition:** The fidelity of preferred branch strategy rates relative to actual benchmark and session outcome data.

**Measurement:**
- Strategy selection rates must be derivable from the `strongestCandidateId` and `branchId` fields in benchmark and session records.
- No strategy rate may be hardcoded or assumed without empirical derivation.
- When zero sessions exist, all rates must be reported as `0` with an explicit insufficiency note.

**Boundary:** Strategy classification currently relies on branch-ID naming heuristics (`branch-a`, `branch-b`, `branch-c`). This is a known approximation. Future phases should introduce explicit strategy metadata on branches to eliminate this heuristic.

---

### 3. Governance Blocker Recurrence Significance (GBRS)

**Definition:** Whether the recurrence count and categorization of governance blockers meaningfully reflects structural impediments to autonomous execution.

**Measurement:**
- Blocker categories must be sourced exclusively from `governanceBlockers` arrays in `SimulationResult` records.
- Affected objectives must be correctly attributed to the parent session's objective.
- A blocker with ≥ 3 occurrences across distinct objectives is classified as **structurally significant**.
- A blocker with 1-2 occurrences is classified as **emerging signal**.

**Boundary:** Blocker categories are free-text strings set during simulation. No controlled vocabulary exists. Normalization across sessions is approximate.

---

### 4. Calibration Trend Confidence (CTC)

**Definition:** The reliability of the longitudinal calibration trend signal derived from prediction-vs-reality comparisons.

**Measurement:**
- Alignment score must be computed from actual `CalibrationResult` values in `data/executions.json`.
- Movement classification (`stable` / `improving` / `mixed` / `insufficient-evidence`) must follow the threshold rules defined in `CalibrationTracker`.
- Minimum 3 comparisons required before any movement classification other than `insufficient-evidence` is permitted.

**Boundary:** The calibration score is a weighted average of discrete classification outcomes, not a continuously-learned loss function. It reflects structural proxy accuracy, not learned model convergence.

---

### 5. Evidence Sufficiency Mapping (ESM)

**Definition:** The correctness of the evidence coverage summary relative to actual benchmark harness outputs.

**Measurement:**
- `strongEvidenceCount`, `adequateEvidenceCount`, and `insufficientEvidenceCount` must exactly match the `overallEvidenceSufficiency` field across all benchmark records.
- The strong+adequate ratio must be computed without rounding bias.

**Boundary:** Evidence sufficiency is defined per benchmark run, not per branch within a run. Intra-run branch-level evidence granularity is not captured at the memory layer.

---

### 6. Comparative Session Grouping (CSG)

**Definition:** Whether sessions sharing the same objective are correctly grouped for cross-session comparison.

**Measurement:**
- Sessions are grouped by normalized (lowercased, trimmed) objective text.
- Each group must accurately report its session count and aggregated outcome distribution.
- Dominant blockers within a group must be sourced only from that group's sessions.

**Boundary:** Objective matching is purely textual. Semantically equivalent objectives with different phrasing will produce separate groups. Future phases should introduce objective hashing or embedding-based similarity.

---

## Interpretation Limits

The following interpretation constraints must be respected when consuming Experiment Memory outputs:

1. **No causal claims.** Session memory identifies correlations (e.g., "minimal-touch branches are preferred 65% of the time") but cannot establish causation without controlled experimental design.

2. **No confidence in small samples.** Any metric derived from fewer than 3 data points must be annotated with a confidence of `low` or `insufficient-evidence`.

3. **No extrapolation beyond observed scope.** The memory layer summarizes what has been recorded. It does not predict future session outcomes or system behavior.

4. **No implied learning.** The system does not learn from memory in a connectionist sense. Memory enables human researchers to observe longitudinal patterns; it does not train a model.

5. **No fabrication of trends.** If no trend signal exists in the data, the system must report the absence of a trend rather than generating a plausible-sounding narrative.

---

## Relationship to Other Eval Materials

| Related Eval | Dependency |
|---|---|
| [research-dossier-metrics.md](research-dossier-metrics.md) | Dossier sections consume memory outputs; dossier accuracy depends on memory fidelity |
| [simulation-session-metrics.md](simulation-session-metrics.md) | Session data is the raw input to the memory aggregation layer |
| [prediction-vs-reality-metrics.md](prediction-vs-reality-metrics.md) | Calibration trend derivation depends on prediction-reality comparison records |
| [benchmark-dimensions.md](benchmark-dimensions.md) | Evidence sufficiency mapping depends on benchmark harness output classification |
