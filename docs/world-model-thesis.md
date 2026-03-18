# World Model Thesis

> *The theoretical case for treating a software repository as a dynamic causal world.*

---

## The Problem With Text-First Software Intelligence

Contemporary AI coding systems treat source code as text. The dominant paradigm is autoregressive: given a sequence of tokens representing the current state of a file or conversation, predict the next token. This approach is capable of remarkable pattern matching, but it is fundamentally limited as a substrate for high-trust software engineering.

Text-first systems cannot:
- Reason about causal consequences across module boundaries
- Maintain a consistent model of repository state across an agent session
- Predict the side effects of a proposed change before executing it
- Distinguish between changes that are structurally safe and changes that violate contracts
- Reason over counterfactual histories ("what if we had taken branch B?")

These are not engineering limitations to be overcome through scale. They are categorical limitations of the prediction-over-tokens framing.

---

## The Autoregressive Impasse

The fundamental deficit of autoregressive systems is their lack of causal understanding. These models map linguistic and syntactic patterns rather than modeling the underlying logical reality that the language describes. When a skilled engineer evaluates a proposed code change, they do not re-read every token in the file — they reason about the change's effects on the causal structure of the system.

Generative models allocate massive computational capacity to modeling exact token sequences rather than capturing the semantic action. Because they generate outputs one token at a time without the architectural capacity to backtrack or simulate downstream consequences, minor statistical deviations early in a sequence compound into logical failures. This makes autonomous decision-making in high-reliability environments structurally unsafe.

The inability to reason about counterfactual scenarios — asking "what would happen if a different action were taken" — is not a bug that better training will fix. It is inherent to the prediction target: next-token prediction cannot produce a causal world model, because tokens are not causes.

---

## The World Model Alternative

World models — as developed in the context of reinforcement learning and more recently in the JEPA (Joint Embedding Predictive Architecture) framework championed by Yann LeCun — offer a different framing.

A world model is a structured, predictive representation of an environment that:

1. **Maintains state** — the model knows where the world is now
2. **Predicts transitions** — given an action, the model predicts the resulting state
3. **Reasons counterfactually** — the model can evaluate multiple action sequences without committing to any
4. **Quantifies uncertainty** — the model knows where its predictions are reliable and where they are not

Applied to software repositories, a world model treats the codebase as a **deterministic, observable environment** with:

- **State**: the file tree, type graph, dependency graph, test status, and mutation history at any given moment
- **Actions**: writes, deletes, refactors, schema changes — any operation that modifies state
- **Transition model**: a prediction of what state results from applying a given action to the current state
- **Reward signal**: test coverage, type safety, contract validity, and prediction accuracy vs. reality

---

## The Repository as a Causal World

Software repositories are unusually well-suited to world-model treatment. Unlike physical or social environments, they are:

- **Deterministic**: the same action applied to the same state produces the same result
- **Observable**: the complete state can be captured, hashed, and stored
- **Instrumented**: type systems, test suites, and linters provide ground truth signals
- **Reversible**: version control makes state rollback first-class

This means that a world model for a software repository does not need to deal with the observation noise and partial observability that make physical-world modeling hard. The world is fully visible. The uncertainty comes, instead, from the **complexity of prediction horizons** — predicting the emergent consequences of changes across large, interconnected codebases.

> *Physical robotics research is frequently hampered by unpredictable sensor noise, friction, and chaotic external variables. In contrast, a software repository is an isolated, perfectly deterministic universe. Training a world model on software execution traces provides an incredibly high-fidelity environment to perfect the mathematical frameworks of hierarchical planning under uncertainty.*
>
> — SE-JEPA source thesis, 2026

This makes software engineering the **empirical sandbox** where world-model architectures can be validated before deployment in noisier physical or social domains.

---

## What Simulation Means in This Context

When we say "simulation" in CodeWorld Observatory, we do not mean running the program. We mean:

> Running the **world model** forward from the current world state, applying a proposed intervention, and predicting the resulting state — including side effects, uncertainty distributions, and test deltas.

This is analogous to what a skilled senior engineer does mentally when evaluating a proposed change: they "run" the codebase in their head, tracing data flows, checking type contracts, and anticipating test failures — before touching a file.

The Observatory operationalizes this mental simulation as a first-class computational step.

---

## Why This Changes Agentic Behavior

The world model framing changes the operating model of software agents in a fundamental way:

| Text-First Agent | World-Model Agent |
|---|---|
| Predicts next token | Predicts next world state |
| Acts, then discovers side effects | Simulates, then decides |
| Uncertainty is implicit | Uncertainty is explicit and visible |
| No memory of causal history | Full causal trace |
| Artifacts are optional | Artifacts are mandatory |
| Trust built post-hoc | Trust built pre-execution |

This is the transition from **autocomplete at scale** to **autonomous engineering with accountability**.

---

## The SE-JEPA Connection

The Software Engineering JEPA (SE-JEPA) hypothesis extends LeCun's JEPA framework to the software domain. The core insight is that an agent operating on a software repository should learn:

- A **world encoder**: a representation of repository state in a latent space
- An **action encoder**: a representation of proposed interventions
- A **predictor**: predicts the encoded future state resulting from applying an action to a state
- An **uncertainty model**: estimates prediction confidence across regions of the state space

This is not a generative model (it does not reconstruct code tokens). It is a **predictive** model — it predicts *consequences*, not *content*. This distinction is what makes it suitable for high-trust software engineering.

### The Three-Step Operational Model

When SE-JEPA is integrated into the Antigravity orchestration substrate, the development workflow becomes:

1. **Hypothesis Generation** — The agent drafts a proposed code change or architectural modification
2. **Latent Simulation** — Instead of executing the change, the agent dispatches it to the SE-JEPA predictor via MCP. The predictor returns a predicted future state embedding and a confidence score
3. **Iterative Refinement in Imagination** — If the predicted outcome indicates failure or high uncertainty, the agent discards the approach and generates an alternative, navigating the search space entirely within the model's abstract representation of the codebase

Only when simulation predicts a satisfactory outcome does the agent proceed to write code. This is the simulation-first paradigm. See `se-jepa-mapping.md` for the full technical mapping.

---

## Implications for the Observatory

The Observatory interface is the direct embodiment of this thesis:

1. **World State** → the current state of the world model
2. **Candidate Interventions** → proposed actions to be simulated
3. **Counterfactual Futures** → simulated future states for each candidate action
4. **Uncertainty Surface** → prediction confidence distribution over the codebase
5. **Prediction vs Reality** → the empirical calibration signal
6. **Artifact Ledger** → the immutable record of world model operations

In Phase 8, the Observatory introduces **Longitudinal Experiment Memory**, shifting the framework from single-session calibration to macroscopic gradient tracking. By aggregating prediction-reality deltas and simulation sessions into formal Research Dossiers, the system can systematically track where its abstract world model diverges from execution reality, providing clear signals for future agentic training.

The Observatory is not a UI layer over a coding assistant. It is the control plane for a world-model-native software engineering system.
