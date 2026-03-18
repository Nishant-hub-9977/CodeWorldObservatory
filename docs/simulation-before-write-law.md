# The Simulation-Before-Write Law

> *Article II of the CodeWorld Observatory Constitution, expanded.*

---

## The Law, Stated Plainly

> **No agentic write operation may execute against a software repository without a prior, completed simulation pass.**

This is not a performance guideline. It is not a suggestion for complex changes. It is a categorical constraint that applies to every write, regardless of scope, urgency, or operator instruction.

---

## Why This Law Exists

Autoregressive write-first agents fail in consistent, predictable ways:

1. **Undetected side effects**: A change to a utility function silently breaks consumers in another module.
2. **Cascading type errors**: A schema change propagates through untraced type boundaries.
3. **Test suite degradation**: An apparently safe refactor causes test coverage loss in adjacent paths.
4. **Contract violations**: A write crosses a module boundary without acknowledging the affected API surface.

These failures are not bugs in the agent's code generation — they are consequences of the write-first operating model. The agent has no world model, no prediction of consequences, and no structured mechanism to surface uncertainty before acting.

The Simulation-Before-Write Law eliminates this class of failure categorically.

---

## What Constitutes a Valid Simulation

A simulation is valid if and only if it produces a `SimulationResult` artifact that contains:

| Field | Requirement |
|---|---|
| `id` | Unique identifier, referenced by the intervention |
| `interventionId` | Links to the intervention being evaluated |
| `simulatedAt` | ISO 8601 timestamp |
| `predictedOutcome` | Natural-language description of expected post-intervention state |
| `predictedSideEffects` | List of anticipated effects beyond the primary target |
| `confidenceScore` | Float 0.0–1.0. Must be above system threshold (default 0.60) |
| `uncertainRegions` | File paths where model confidence is below threshold |
| `predictedTestDelta` | Expected change in passing/failing/new test counts |

A simulation that omits any required field is not a valid simulation. The write operation must not proceed.

---

## Confidence Thresholds

The system enforces confidence thresholds per risk level:

| Risk Level | Minimum Confidence to Proceed |
|---|---|
| Low | 0.60 |
| Medium | 0.75 |
| High | 0.85 |
| Critical | Manual approval required regardless of confidence |

If a simulation returns a confidence score below the threshold for the intervention's declared risk level, the write is blocked. The agent must either:

1. Reduce the scope of the intervention
2. Gather additional world state information
3. Request human review

---

## The Simulation Artifact

Every valid simulation must produce a persisted artifact in the Artifact Ledger with:

- `type: "simulation"`
- `trustLevel: "medium"` (minimum)
- A SHA-256 hash of the simulation result content
- A link to the baseline world state snapshot

This artifact is the evidentiary basis for the write operation. If the artifact does not exist, the write does not happen.

---

## What Happens After the Write

The Simulation-Before-Write Law has a paired obligation: **verification after write**.

After an approved intervention executes, the system must:

1. Capture a new world state snapshot
2. Compare actual execution status and touched surfaces to predicted scope
3. Compare actual validation burden to predicted burden
4. Produce a `verification` or `comparison` artifact recording the prediction-reality delta
5. Feed the delta back to the Evaluation Framework (Phase 4 active)

This closes the loop. The simulation is not just a gate — it is the source of the training signal for future predictions.

---

## Edge Cases

### "Trivial" changes

There are no trivial changes in the Observatory. A one-line fix can cascade through a type system. The simulation cost for a low-risk, high-confidence change is low. The simulation is always worth it.

### Human override requests

The system may surface a mechanism for human override of the simulation requirement. However, an override must itself be recorded as an artifact, tagged `type: "raw-output"`, with `trustLevel: "unverified"`. The artifact ledger will always reflect that the law was bypassed.

### Phase 0 scaffolding

During Phase 0 (Foundation Scaffold), writes are performed by the Antigravity agent during the initial bootstrap. These are the only permissible write-without-prior-simulation operations in the system's lifetime. All Phase 1+ writes are subject to the law without exception.

### Phase 2: Intervention representation

As of Phase 2, the observatory has a typed intervention planning layer (`InterventionBranch`, `CounterfactualComparison`, `ScopeImpact`). This layer produces the structured candidate plans that will feed the simulation gate in Phase 3. The presence of a plan does **not** constitute a valid simulation. A plan is a pre-requisite for simulation, not a substitute for it. The Simulation-Before-Write Law remains fully in effect: no branch may be executed until a `SimulationResult` artifact with `confidenceScore ≥ threshold` is produced.

### Phase 3: Projected Futures Foundation

As of Phase 3, the system introduces `BranchOutcomeProjection` and explicit `UncertaintySignal`s. By structurally estimating instability zones and validation burden from the Phase 2 plan, this codifies the requirement that predicted futures and unobservable boundaries must be mapped and reviewed before any code changes. True simulation execution (Phase 3b) will ultimately satisfy the hard gating requirements laid out above.

### Phase 4: Prediction vs Reality + Artifact Ledger

As of Phase 4, the Verification loop is active. Executions are recorded as structural `ExecutionRecord` entities, and aligned against the earlier prediction to produce a `PredictionRealityComparison` artifact. This enforces the immutable append-only Artifact Ledger rule as per Article V.

### Phase 5: MCP Simulation Bridge + Skill Enforcement

As of Phase 5, the Simulation-Before-Write Law is actively enforced via an explicit MCP boundary (`evaluate_simulation_gate`). Agents interacting with the system must prove they have generated `plan` and `simulation` artifacts before receiving clearance. The system explicitly blocks autonomous execution, enforcing an ADVISORY posture where human operators or supervised execution pathways must grant final write permissions.

### Phase 7: Controlled Benchmark Strictness

As of Phase 7, the system implements a strict Benchmark Harness that acts as the final structural gate before a branch can be presented to an operator. Any branch classified as `blocked-by-evidence` (due to unmapped failure surfaces or extreme calibration divergence) is programmatically disqualified from execution consideration context entirely. This hard-codes the safety floor.

### Phase 8: Experiment Memory + Research Dossiers

As of Phase 8, the Simulation-Before-Write Law gains a longitudinal dimension. The Experiment Memory layer aggregates all prior simulation sessions and benchmark evaluations into a persistent record. This allows the system to detect recurring governance blockers across sessions and track whether calibration is improving, stable, or degrading over time. The Research Dossier synthesizes this longitudinal evidence into an auditable narrative artifact. Critically, the dossier reports the absence of evidence honestly — if calibration data is sparse, the dossier marks it as `insufficient-evidence` rather than fabricating a trend. The law now extends not just to individual simulation gates but to the institutional memory of all gates ever evaluated.

---

## Counterfactual Debugging as a First-Class Operation

The simulation requirement is not merely a safety check. It is the mechanism by which the system performs **counterfactual debugging**: evaluating the consequences of an intervention without executing it in the live environment.

In traditional development, verifying a complex code change requires executing the code, running test suites, and reading crash logs after the fact. This is reactive debugging. If the code corrupts state or introduces a regression, recovery requires rollback — expensive, risky, and slow.

Counterfactual debugging allows the agent to ask, and answer, predictive questions before any write:

- What would be the exact impact on test coverage if this conditional logic were inverted?
- How would the type graph change if this interface were refactored?
- What is the predicted consequence of a null response from this external dependency?
- What failure modes exist in Branch B that are absent in Branch A?

A system operating in latent space — predicting state embeddings rather than generating code tokens — can answer these questions without compiling the code or touching the runtime. This is the structural advantage that the Simulation-Before-Write Law makes mandatory.

---

## Why This Law Is Uniquely Enforceable in Software

In physical robotics, enforcing "simulate before act" is difficult: sensor noise, friction, and unpredictable external variables mean simulations are always approximations of reality.

In a software repository, the world is deterministic. The same action applied to the same state always produces the same result. This means:

- Simulations can be verified against ground truth after execution
- Calibration error is measurable and actionable
- The prediction model can be improved as a direct function of accumulated prediction-reality deltas
- The enforcement of the law does not require human judgment — it requires a correct implementation

This is the reason the software engineering domain is the ideal first proving ground for simulation-first agent architectures. The law can be enforced with mathematical rigor that is simply not available in noisier environments.

---

## The Philosophical Grounding

The Simulation-Before-Write Law is the software engineering analog of the scientific method's **hypothesis before experiment** principle.

A scientist does not run an experiment without a prior prediction. The prediction is what makes the experiment informative — it produces a comparison point between expected and observed outcomes. Without a prior prediction, the result cannot be evaluated as a success or failure of a theory.

Similarly, an agent that writes code without a prior simulation cannot evaluate whether the result confirms or refutes its model of the codebase. The simulation is not overhead — it is the mechanism by which the system learns.
