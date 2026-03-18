# SE-JEPA Mapping

> *How Joint Embedding Predictive Architecture concepts map to software engineering in CodeWorld Observatory.*

---

## Background: What is JEPA?

JEPA (Joint Embedding Predictive Architecture), developed by Yann LeCun and colleagues at Meta AI, is a framework for learning world models from high-dimensional data. Unlike generative models that reconstruct raw observations, JEPA learns to predict *representations* of future states — operating in latent space, not pixel or token space.

The core JEPA insight: **good world models predict abstractions of consequences, not raw reconstructions of content.**

This matters enormously for software engineering, where we want to reason about semantic consequences (type errors, test failures, API breakage) — not reconstruct code character by character.

---

## The Four JEPA Components

JEPA defines four architectural elements. Here is how each maps to the software engineering domain:

### 1. World Encoder `s = enc(x)`

**JEPA**: Encodes raw observations (images, video) into a compact latent state representation.

**SE-JEPA**: Encodes a repository state (file tree, dependency graph, type annotations, test status) into a compact world-state vector. The encoder must capture the *semantically meaningful* aspects of the codebase:

- Module boundaries and dependency structure
- Type contract surfaces
- Test coverage topology
- Historical mutation patterns

In CodeWorld Observatory Phase 1-2, the world encoder is bootstrapped from structured snapshots (`WorldState`) rather than learned embeddings. In Phase 3, the encoder becomes a trained predictive model.

### 2. Action / Context Encoder `z = enc_action(a)`

**JEPA**: Encodes the "context" — the part of the observation used to make predictions.

**SE-JEPA**: Encodes a proposed intervention (type, scope, file targets, intent) into a representation that can be composed with the world state embedding. The key attributes:

- Intervention type (write / refactor / delete / schema)
- File scope and estimated radius
- Breaking change risk
- Declared intent (the "why")

### 3. Predictor `ŝ = predict(s, z)`

**JEPA**: Predicts the embedded future state from the current state embedding plus action context.

**SE-JEPA**: The predictor is the heart of the system. Given a world state `s` and an intervention encoding `z`, it predicts:

- The resulting world state embedding `ŝ`
- A confidence distribution over the prediction
- The uncertainty regions (file paths where prediction is unreliable)

In Phase 0-2, this is a structured rule engine. In Phase 3, it becomes a learned model. The Observatory's architecture is designed to support both transparently.

### 4. Uncertainty / Energy Model `E = energy(s, z, ŝ)`

**JEPA**: The energy function measures the compatibility between observation and prediction — lower energy = more compatible = more confident.

**SE-JEPA**: The uncertainty model assigns a confidence score to each prediction and identifies the *uncertainty surface* — the regions of the codebase where the model's predictions are least reliable. This surfaces directly in the `UncertaintyPanel`.

---

## Key Differences from Standard JEPA

| Dimension | Original JEPA | SE-JEPA |
|---|---|---|
| State space | Continuous (image pixels) | Structured (file trees, type graphs) |
| Actions | Learned or specified | Explicitly typed interventions |
| Prediction target | Future frame embeddings | Future world state + side effects |
| Ground truth | Next video frame | Test suite, type checker, lint results |
| Training signal | Self-supervised on video | Prediction-reality delta from evals |

---

## JEPA Variants and Their SE-JEPA Analogues

The JEPA family has been extended across many modalities. Each variant offers conceptual design precedents for SE-JEPA:

| Variant | Modality | SE-JEPA Lesson |
|---|---|---|
| I-JEPA | Static Images | Patch masking → file-block masking for code comprehension |
| V-JEPA 2 | Video (spatiotemporal) | Temporal dynamics → mutation history and execution trace sequences |
| VL-JEPA | Vision-Language | Multimodal embedding alignment → AST + docstring + test co-embedding |
| C-JEPA | Causal Dynamics | Causal inductive biases → dependency-aware prediction, change propagation |
| Drive-JEPA | Autonomous Navigation | Goal-conditioned planning → intervention-conditioned code path prediction |
| LANG-JEPA | Natural Language | Concept-space prediction → semantic consequence prediction without token reconstruction |

The key cross-variant observation: **prediction in latent space is always more compute-efficient and more semantically aligned** than prediction in observation space. This principle is universal across all modalities, including software.

---

## Why CWM Is Not Enough

Meta's Code World Model (CWM) is a 32-billion parameter execution-grounded model that consumes interpreter traces, execution logs, and simulated debugging sessions. It is a significant advance over static code models — it has seen how code behaves at runtime.

However, CWM remains a causal language model operating in token space. It:
- Relies on sequential token prediction
- Generates next tokens, not next-state embeddings
- Cannot natively perform counterfactual simulation without generating tokens for every hypothetical
- Is susceptible to the hallucination cascades inherent in autoregressive generation

SE-JEPA differs fundamentally: it predicts **state embeddings**, not token sequences. It does not hallucinate what the next character in a stack trace will be — it predicts whether the resulting state embedding will be near or far from known failure-state attractors. This is a qualitative difference in the architecture's relationship to truth.

---

## Why Generative Models Fail Here

A key JEPA principle: **predictive world models should not be generative**. They should not reconstruct the full observation — they should predict a compact representation of consequences.

This directly applies to software engineering:

- A generative model (like an LLM) reconstructs code tokens → overfits to surface form
- A predictive world model predicts semantic consequences → generalizes across surface variations

This is why autoregressive code completion is structurally insufficient for high-trust software engineering, and why SE-JEPA is the correct architectural framing.

---

## Anti-Collapse Mechanisms

A known failure mode in joint-embedding learning is **representation collapse** — where the encoder learns to map all inputs to a trivial constant vector. This makes prediction trivially easy but meaningless.

In image JEPA, this is prevented by variance-invariance-covariance (VIC) regularization, which ensures embeddings remain diverse and information-rich.

In SE-JEPA, the analogous collapse risk is: the predictor learns to predict "no change" for every intervention. The anti-collapse mechanism is empirical: every prediction is measured against the actual post-intervention world state. A collapsed predictor will have catastrophically high calibration error and will be detectable immediately in the Prediction vs. Reality panel.

---

## Mapping to Observatory Panels

| Observatory Panel | SE-JEPA Component |
|---|---|
| World State | World Encoder output (current state) |
| Candidate Interventions | Action Encoder inputs (proposed actions) |
| Counterfactual Futures | Predictor outputs (predicted future states) |
| Uncertainty Surface | Energy / Uncertainty Model output |
| Prediction vs Reality | Training signal (prediction-reality delta) |
| Artifact Ledger | Model provenance and trust chain |

---

## Phase 6: Operational Prototyping

In Phase 6, the Observatory implemented a structural prototype of the SE-JEPA pipeline:
`ObservationState -> ActionRepresentation -> PredictedFutureState -> ActualOutcome`

This is a **structural proxy**, not a learned model. It validates the *architecture* of the thesis:
- **Observation Encoder**: Maps raw `WorldState` into complexity and observability profiles.
- **Action Encoder**: Maps `InterventionBranch` into strategic action representations.
- **Predictor (Prototype Mapper)**: Maps explicit simulation outputs into latent-style proxy descriptors (stability, failure surfaces).

This establishes the exact data structures and API boundaries needed for Phase 7 while maintaining strict empirical grounding. The system continues to operate under the "Simulation-Before-Write" law, using architectural heuristics as a stand-in for latent prediction.

## Phase 7: Controlled Benchmarking

Phase 7 expands the Phase 6 structural prototype by wrapping it in a formal Benchmark Harness.

While Phase 6 established the *representation* pipeline (`Observation -> Action -> Future`), Phase 7 creates the *evaluation* pipeline. It acts as the loss function / energy discriminator for the proxies:

- **Simulation Runner**: Simulates counterfactuals structurally, producing `SimulationResult` evidence.
- **Benchmark Harness**: Evaluates the results cross-sectionally. Identifies the structurally safest latent path. Acts as the `Energy(s, z, ŝ)` evaluator at the policy level.
- **Outcome Classification**: Maps the structural bounds to specific go/no-go states (`structurally-favorable`, `review-heavy`, `blocked`), enforcing the anti-collapse strictness required before execution.

## Phase 8: Longitudinal Experiment Memory

Phase 8 acts as the macroscopic training loop. By aggregating Simulation Sessions and Prediction-Reality Deltas across time into a `ResearchDossier`, the system formalizes the gradient descent of the model. Identifying recurrent *Governance Constraints* (e.g., "alias-resolution missing 15 times") provides explicit targets for improving the Observation Encoder (`enc(x)`) in future iterations.

## Phase 9: Latent State Approximation

Phase 9 introduces the representational layer that JEPA theory identifies as the "latent space" — but implemented as **typed structural descriptors** rather than learned embeddings.

The SE-JEPA chain is extended to:

```
enc(x) → Latent Structural Descriptor → Strategy Compatibility → Action → Predicted Future → Calibration
```

This maps to JEPA concepts as follows:

| JEPA Concept | SE-JEPA Phase 9 Implementation |
|---|---|
| Latent embedding `z` | `LatentRepoState` — compositional structural descriptor |
| Predictor in latent space | `StrategyCompatibilityAnalyzer` — assessing strategy suitability from structural conditions |
| Energy function | Compatibility classification: `favorable` / `viable-with-review` / `structurally-misaligned` |
| Training memory | `TransitionPatternAnalyzer` — recurring latent-state-to-strategy motifs |

**Critical honesty constraint**: These are typed approximations. They do not learn. They do not train. They derive deterministic structural assessments from observable signals. The system acknowledges this explicitly.

## Phase 10: Research Export / Briefing Surface

Phase 10 completes the SE-JEPA operational cycle by providing a **synthesis and export layer** — the equivalent of a research publication pipeline for the model's accumulated intelligence.

In JEPA terms, Phase 10 maps to the moment when a world model's learned representations are externalized as actionable reports:

| JEPA Concept | SE-JEPA Phase 10 Implementation |
|---|---|
| Model checkpoint export | `ExportManifest` — SHA-256 hashed artifact package with evidence lineage |
| State summary | `ObservatoryBrief` — structured synthesis from all data sources |
| Interpretability | `ConstraintRegister` — explicit documentation of model boundaries |
| Research reporting | `ExecutiveFinding` + `RecommendedNextStep` — actionable intelligence derived from structural signals |

The briefing surface does not introduce new representational capacity. Instead, it provides the **observability window** into all existing representations — world state, latent descriptors, compatibility assessments, transition patterns, calibration trends — synthesized into a single auditable research artifact.

**Critical honesty constraint**: Briefings synthesize from deterministic structural signals. Confidence labels reflect signal coverage, not probabilistic certainty. No learned model is active in the synthesis pipeline.

