# Benchmark Philosophy

> *Why current AI benchmarks fail world-model systems — and what better evaluation looks like.*

---

## The Problem With SWE-Bench

SWE-bench is the dominant benchmark for evaluating AI in software engineering. It measures whether an AI agent can generate a code change that causes a failing unit test to pass. It is a useful benchmark. It is also structurally insufficient for evaluating world-model-native systems.

SWE-bench measures **output**. It does not measure:

- Whether the agent understood the causal structure of the codebase before acting
- Whether the agent simulated the consequences of alternative approaches before committing
- Whether the agent's confidence in the solution was calibrated to its actual correctness
- Whether the agent could have predicted the failure mode of an incorrect approach without executing it
- Whether the reasoning behind the correct solution was coherent and auditable

An agent that hallucinates a correct solution by statistical token prediction scores identically on SWE-bench to an agent that genuinely reasoned through the causal graph. This is not a minor omission. It is a fundamental misalignment between the benchmark and the capability being built.

---

## What World-Model Systems Actually Need to Be Measured

A world-model-native agent should be evaluated on a different set of dimensions:

### 1. Counterfactual Simulation Fidelity

Given the current world state and a proposed intervention, how accurately does the agent predict the resulting world state? This can be measured empirically: run the intervention, capture the actual post-intervention state, compare to the predicted state.

**Metric**: Mean embedding distance between predicted and actual post-intervention state. Lower = better.

### 2. Uncertainty Calibration

When the agent flags uncertainty about a prediction, is its uncertainty estimate correct? Calibration requires that a prediction flagged as "60% confident" should be correct approximately 60% of the time empirically.

**Metric**: Expected Calibration Error (ECE) across a population of predictions. Lower = better.

### 3. Scope Accuracy

When the agent estimates the blast radius of a proposed change (files affected, API surfaces broken, test regressions expected), how close is this estimate to reality?

**Metric**: F1-score over actually-affected vs. predicted-affected file sets. Higher = better.

### 4. Pre-Execution Failure Detection

Given a proposed change that would fail in execution (type error, runtime crash, test regression), does the agent detect the failure in simulation before executing? This is the anti-hallucination metric.

**Metric**: Recall of pre-execution failure detection. Higher = better. This metric specifically cannot be gamed by token autocomplete — it requires genuine predictive reasoning.

### 5. Branch Diversity Quality

When the agent generates multiple candidate branches for a proposed intervention, are the branches meaningfully distinct? A degenerate planner generates three identical branches with superficial label differences.

**Metric**: Pairwise embedding distance between branch proposals, weighted by scope difference. Higher = better.

### 6. Prediction-Reality Delta Over Time

Does the agent's prediction accuracy improve as it accumulates more interaction traces with a specific repository? This measures whether the system actually learns the causal structure of the codebase, or merely pattern-matches.

**Metric**: Rolling prediction accuracy over time, segmented by repository familiarity depth. Improving = learning. Flat = not learning.

---

## The Calibration Loop as a First-Class Metric Surface

The Observatory's Prediction vs. Reality panel is not cosmetic. It is the primary calibration instrument of the system. Every executed intervention produces a prediction-reality delta record.

*(Note: As of Phase 4, the Observatory integrates `ExecutionRecord`s and `PredictionRealityComparison`s into a local `ArtifactLedger`, serving as the first true functional calibration loop).*

```
delta = {
  interventionId: string,
  predictedScope: string[],         // files agent predicted would be affected
  actualScope: string[],            // files actually modified
  predictedTestDelta: { ... },
  actualTestDelta: { ... },
  predictedRisk: RiskLevel,
  actualOutcome: "success" | "partial" | "failure",
  confidenceScore: number,
  calibrationError: number           // |predictedConfidence - actualAccuracy|
}
```

Accumulating these records produces the training signal for Phase 3: the learned SE-JEPA predictor is trained on prediction-reality deltas, not on raw code. This is the principled path from heuristic rules to genuine world-model intelligence.

---

## The Benchmark Harness (Phase 7)

Phase 7 of the CodeWorld Observatory operationalized this philosophy into a real-time `BenchmarkHarness` service. Rather than waiting for SWE-bench test runs, the framework generates structurally-scored `SimulationResult` elements per candidate branch. By algorithmically filtering out unacceptably risky bounds (`blocked-by-evidence` or `review-heavy`), the harness programmatically zeroes in on the most fundamentally sound, structurally-favorable code variation *before* an execution event.

---

## Longitudinal Memory (Phase 8)

A true benchmark cannot be purely episodic. In Phase 8, the Observatory introduces Experiment Memory, aggregating calibration and benchmark records over time. This shifts the evaluation from "how well did the agent solve this ticket?" to "how rapidly is the agent's structural mapping converging to reality across N interventions?" The ultimate benchmark metric is the derivative of the calibration error.

---

## Latent State Approximation (Phase 9)

Phase 9 extends the evaluation surface to include the quality of the **internal representational layer** itself. With typed latent structural descriptors, the system can now ask:

- **Descriptor stability**: Do the same repo conditions produce the same latent state classification?
- **Strategy compatibility reasoning**: Do the assessments correctly predict which strategies succeed?
- **Transition motif reliability**: Do detected patterns actually recur, or are they noise?

This moves benchmarking from "did the agent pick the right branch?" toward "does the agent's internal model of its own conditions produce actionable structural intelligence?"

The key metric introduced in Phase 9 is **strategy-state alignment accuracy**: the rate at which the compatibility analyzer's `favorable` assessment leads to `structurally-favorable` simulation outcomes.

---

## Research Export Quality (Phase 10)

Phase 10 introduces a meta-evaluation dimension: **briefing quality**. The question shifts from "does the agent predict correctly?" to "does the agent synthesize its knowledge into a coherent, honest, auditable research artifact?"

Key evaluation dimensions:

- **Evidence lineage completeness**: Does every finding trace back to a concrete data source?
- **Constraint accuracy**: Does the constraint register truthfully bound what the system can claim?
- **Finding severity calibration**: Do critical findings align with actual structural risk?
- **Export integrity**: Are all artifact hashes valid and reproducible?
- **Longitudinal drift**: How do sequential briefings compare over time?

This is benchmarking the system's ability to **communicate** its structural intelligence — not its ability to generate tokens, but to produce honest, evidence-grounded research artifacts.

---

## The Open Science Imperative

AMI Labs' commitment to open science is not altruism — it is a strategic move to establish evaluation standards before competitors do. The same logic applies to CodeWorld Observatory.

An open-source Observatory plugin for the Antigravity ecosystem would provide the global research community with:

- A standardized, accessible benchmark environment for counterfactual simulation fidelity
- A production-quality dataset of prediction-reality deltas from real software development sessions
- A reference implementation of the simulation-before-write law in a production IDE
- A reproducible evaluation harness for comparing world-model approaches

This positions CodeWorld Observatory not just as an internal tool but as **infrastructure for the field** — the empirical sandbox that world-model research has needed but not yet had.

---

## What We Do Not Measure (And Why)

It is important to be explicit about metrics that are deliberately excluded:

| Excluded Metric | Reason |
|---|---|
| Lines of code generated per session | Rewards verbosity, not quality |
| Number of tests passing | Equivalent to SWE-bench — measures output, not reasoning |
| Token generation speed | Irrelevant to simulation-first paradigm |
| Confidence percentage shown to user | Meaningful only if calibrated — raw confidence is noise |
| "Correctness" without uncertainty | Undefined without a calibration baseline |

The Observatory does not display meaningless confidence scores. It does not reward fast hallucination. It measures prediction accuracy, calibration, and scope estimation — the dimensions that distinguish a world-model agent from a well-prompted text generator.
