# CodeWorld Observatory Constitution

> *Version 1.0 — Phase 0 Ratification*
> *This document is immutable after ratification. Amendments require a new version.*

---

## Preamble

CodeWorld Observatory is a simulation-first control plane for agentic software engineering. It treats software repositories as dynamic, observable, causal worlds — not static collections of text. This Constitution defines the foundational principles, inviolable constraints, and operating law that govern all present and future development of this system.

Any implementation, agent, skill, or MCP tool claiming to be part of CodeWorld Observatory must satisfy all articles herein. Partial compliance is non-compliance.

---

## Article I: The World Model Mandate

**Software repositories are worlds, not texts.**

The system must at all times maintain a representation of the repository's current state as a structured world model — not as a flat sequence of tokens. This world model must capture:

- File structure and content digests
- Dependency graph
- Type and contract boundaries
- Mutation history
- Entropy and uncertainty distribution

No agent may reason about the repository as pure text. All reasoning must be grounded in the world model.

---

## Article II: The Simulation Law

**No write may precede its simulation.**

This is the single most important operational invariant of the Observatory. It is not a guideline. It is a law.

Before any agent executes a write operation against the repository, a simulation pass must have been completed that predicts:

1. The intended outcome of the write
2. The estimated side effects
3. The confidence score of the prediction
4. The uncertainty regions where prediction is unreliable

Only after this simulation record exists as a verified artifact may the write operation proceed.

Agents that bypass simulation — for any reason, including urgency, trivial scope, or human override — are operating outside this system.

---

## Article III: The Branch Invariant

**The main timeline is never the first casualty of exploration.**

All candidate interventions must be evaluated as counterfactual branches in the world model before any branch is selected for execution. The system must always be able to present:

- At least two candidate futures for any non-trivial intervention
- A divergence score for each candidate
- A recommended candidate with justification

No intervention may be executed against the primary branch without prior branch evaluation.

---

## Article IV: The Visibility Principle

**Uncertainty is first-class data.**

The Observatory must make the system's uncertainty visible at all times. This includes:

- Model prediction confidence scores per candidate intervention
- File-level and module-level uncertainty regions
- Cases where the system is operating near or beyond its prediction horizon

Uncertainty must never be hidden, smoothed over, or omitted from the user-facing display. It is a trust instrument.

---

## Article V: The Artifact Contract

**Every significant operation produces a traceable artifact.**

The following operations must produce immutable, hashed artifacts:

- Implementation plans (before any code is written)
- Simulation results (before any intervention is approved)
- World state snapshots (before and after intervention)
- Verification records (after any intervention completes)
- Walkthrough summaries (at phase boundaries)

Artifacts are append-only. They may be superseded by newer artifacts but never modified. Every artifact must carry:

- A unique ID
- A SHA-256 hash of its content
- A trust level (high / medium / low / unverified)
- Creator identity (human / agent / system)
- A timestamp
- A link to the world state at time of creation

---

## Article VI: The Skills Governance Law

**Skills are the sanctioned extension points for agent capability.**

The Observatory recognizes four canonical skill classes:

1. **World-Model Governor** — validates state transitions, enforces causal ordering
2. **Counterfactual Planner** — generates and evaluates candidate futures
3. **Artifact Auditor** — audits artifact integrity, maintains the ledger
4. **Repo-State Capturer** — produces verified world state snapshots

No agent capability that crosses module boundaries may operate without an active, registered skill. Ad-hoc agent behavior outside the skill system is non-compliant.

---

## Article VII: The MCP Bridge Mandate

**External simulation tools are accessed exclusively through MCP.**

When simulation services, prediction APIs, or external analysis tools are integrated, they must be exposed exclusively as MCP tool surfaces. No direct HTTP calls, no embedded credentials, no ad-hoc integrations. MCP is the sanctioned bridge between the Observatory's intelligence layer and the outside world.

---

## Article VIII: The Evaluation Obligation

**Every prediction must be measurable against reality.**

The Observatory is under a standing obligation to compare every simulation prediction against the actual outcome of the corresponding intervention. This delta — the prediction-reality gap — is the primary signal for system calibration.

The Evaluation Framework (evals/) must maintain formal metrics for:

- Prediction precision
- Uncertainty calibration
- Intervention success rate
- Artifact trust progression

---

## Ratification

This Constitution was drafted in Phase 0: Foundation Scaffold.
All subsequent phases are bound by these articles.

*CodeWorld Observatory, 2026*
