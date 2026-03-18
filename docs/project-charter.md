# Project Charter

> *CodeWorld Observatory — Phase 0 Charter*
> *Effective: March 2026*

---

## Mission

Build a simulation-first control plane for agentic software engineering — an observatory for counterfactual debugging and future-state planning — that demonstrates a new interaction model in which software agents imagine code futures before acting.

---

## Problem Statement

The current generation of AI coding assistants operates on a write-first, discover-later model. They generate code by predicting tokens, execute changes against live repositories, and surface consequences only after the fact. This is structurally insufficient for high-trust software engineering at the frontier of agentic capability.

The emerging agentic software engineering stack — including systems like Antigravity — creates the conditions for a fundamentally different model: one where the agent simulates before it acts, evaluates counterfactual futures, quantifies uncertainty, and produces accountable artifacts for every significant operation.

CodeWorld Observatory is the first serious instantiation of this model as a disciplined, research-grade product.

---

## Scope

### In Scope

- A Next.js application serving as the observatory interface and control plane
- A world-state capture engine that produces typed WorldState snapshots
- A counterfactual planning layer that evaluates candidate interventions
- A simulation service (initially mock; real in Phase 3)
- A multi-panel observatory UI representing all world-model surfaces
- An artifact ledger with append-only, hashed, trusted artifact records
- A skills system with four canonical skill classes
- An MCP tool surface plan (implementation in Phase 4)
- An evaluation framework measuring prediction vs. reality

### Out of Scope (Phase 0/1/2/3/4 — now closed)

- ~~Real world-state capture~~ — **Delivered in Phase 1**
- ~~Real simulation/futures prediction bounds~~ — **Delivered in Phase 3**
- ~~Live artifact ledger and prediction/reality delta~~ — **Delivered in Phase 4**
- ~~Live MCP server architecture boundaries~~ — **Delivered in Phase 5**
- ~~Operational SE-JEPA Abstract Layer~~ — **Delivered in Phase 6**
- Fully Autonomous execution / multi-agent write coordination (beyond scope)
- Cloud deployment
- User authentication

### Current Status (Phase 23 Active)

The observatory has integrated **live sensing, planning, projection, calibration, MCP interface boundaries, SE-JEPA architectural framing, Benchmark Harness, Experiment Memory with Comparative Research Dossiers, Latent State Approximation, Research Export hardening, and comparative timeline playback** (Phases 1–11 complete).

With Phases 12–16, the system now adds **formal experiment registration, historical world-state capture, scenario-linked dataset infrastructure, reproducibility summaries, deterministic statistical evaluation, first-class lineage binding across simulation, benchmark, execution, and replay-package artifacts, and replay-aware research consumers that read the same experiment-centered evidence chain**. The Observatory has moved from a research logbook into a deeper research operating chain capable of formalizing experimental intent and reporting replay readiness with explicit evidence limits. Full replay continues to require an attached baseline snapshot, linked simulation and benchmark artifacts, execution evidence, and a persisted replay package.

Phase 17 adds **evidence-weighted comparative evaluation semantics** on top of that experiment-centered evidence chain. The Observatory can now compare experiments in a bounded way using persisted evidence completeness, empirical depth, replay maturity, calibration support, and strategy interpretation without drifting into stronger claims than the attached artifacts justify.

Phase 18 adds **evaluation persistence and comparative durability** on top of Phase 17. The Observatory can now persist explicit evaluation snapshots on write paths, expose comparative route surfaces, and track how experiment interpretation changes over time without silently materializing interpretation artifacts during observational reads.

Phase 19 adds **advisory-only research prioritization** on top of Phase 18. The Observatory can now surface where evidence, replay maturity, calibration depth, or comparative support should be strengthened across brief, dossier, timeline, export, and dedicated priority surfaces. Prioritization ranks structural research gaps; it does not imply causal proof, exact replay certainty, or autonomous decision-making.

Phase 20 adds **priority drift detection and recommendation governance** on top of Phase 19. The Observatory can now compare the current ephemeral prioritization context against the most recent persisted dossier's prioritization signals, detect appeared/disappeared/level-changed/focus-shifted drifts, and wrap all priority recommendations with explicit governance metadata (supporting and missing evidence classes, confidence limitations, advisory boundaries, non-execution caveats). All imperative language has been softened at both source and governance boundary. The dossier section formerly titled "nextResearchPriorities" is now "advisoryResearchGaps", and all priority-facing UI surfaces carry inline advisory caveats.

Phase 21 adds **historically durable priority history and comparative governance traceability** on top of Phase 20. The Observatory can now persist priority snapshots as historical records on explicit write paths, analyze chronicity patterns (persistent, intermittent, resolved, recent), track posture trends (stable, escalating, de-escalating, oscillating), and synthesize governance evolution narratives across multiple snapshots. Priority history is descriptive and non-causal; repeated appearance of a priority class indicates structural recurrence, not truth confirmation.

Phase 22 adds **priority snapshot automation and historical comparison surfaces** on top of Phase 21. The Observatory now co-creates priority-history snapshots alongside export writes, provides pairwise snapshot-to-snapshot comparison, per-experiment advisory stability tracking, and signal direction classification (emerging, weakening, persistent). Snapshot automation is explicit and governed — records are created only on POST, never on GET. Historical comparisons describe structural advisory-posture changes, not research outcomes or causal certainty.

Phase 23 adds a **comparative governance synthesis layer** on top of Phase 22. The five previously fragmented governance stories — prioritization, drift, history, snapshot comparison, and recommendation governance — are now unified into a single descriptive synthesis model consumed by all major surfaces (brief, timeline, export manifest). The synthesis classifies each advisory signal's posture (persistent-stable, persistent-escalating, recent, weakening, intermittent, etc.), integrates evidence limitations across chronic and current gaps, and provides one canonical set of governance boundary statements. This is a closure-conditioning phase: it makes the system more unified and coherent rather than larger.

---

## Stakeholders

| Role | Responsibility |
|---|---|
| Principal Architect | System design, constitutional governance, phase gate approval |
| Antigravity Agent | Implementation, artifact production, verification |
| User / Operator | Observatory observation, intervention approval, evaluation review |

---

## Phase Gates

Each phase is gated on verifiable completion criteria. No phase skipping is permitted.

| Phase | Name | Gate Criteria |
|---|---|---|
| 0 | Foundation Scaffold | All directories, docs, types, components, UI shell deployed and running |
| 1 | State Capture Engine | Live WorldState snapshots from real repos, typed API, tested |
| 2 | Intervention Planner | Typed interventions created by agents, scope analysis, risk classification |
| 3 | Simulation Engine / Futures | Predictions generated with structural heuristics, uncertainty surfaces mapped |
| 4 | Evaluation / Calibration | Prediction-reality deltas tracked natively, artifact ledger activated |
| 5 | MCP Simulation Bridge | MCP contracts surfaced via API, skills upgraded to strict governance loops |
| 6 | Operational SE-JEPA Layer | Abstract representation pipeline established successfully |
| 7 | Controlled Benchmark Harness | Empirical simulation ranking established without writing source code |
| 8 | Experiment Memory / Dossiers | Longitudinal session aggregation and dossier generation implemented |
| 9 | Latent State Approximation | Typed structural descriptors derived from live signals, strategy compatibility assessed |
| 10 | Research Export / Briefing Surface | Structured briefing synthesis from all sources, SHA-256 hashed export manifests |
| 11 | Comparative Research Timeline + Narrative Playback | Chronological session playback, strategy shifts, blocker recurrence, and calibration trajectory surfaced |
| 12 | Experiment Registry + Historical State Capture | Formal experiment records and durable world-state history linked to research objectives |
| 13 | Scenario Library + Dataset Infrastructure | Canonical scenarios and deterministic dataset packaging for experiment evidence |
| 14 | Reproducibility + Statistical Evaluation | Replay readiness, bounded statistics, and confidence intervals from persisted artifacts |
| 15 | Experiment Lineage + Replay Package Binding | Simulation, benchmark, execution, and replay-package artifacts bound into experiment-centered lineage |
| 16 | Replay-Aware Research Consumers + Experiment Detail Surface | Shared experiment detail, replay-aware consumers, and observational read semantics preserved |
| 17 | Research Evaluation Semantics + Evidence-Weighted Comparative Analysis | Bounded experiment comparison grounded in persisted evidence classes and empirical depth |
| 18 | Evaluation Persistence + Comparative Research Surfaces | Explicit evaluation snapshots, comparison routes, and persisted comparative drift surfaced without mutating reads |
| 19 | Research Prioritization Engine | Advisory-only research gap ranking across brief, dossier, timeline, export, and priority surfaces; bounded by evidence depth |
| 20 | Priority Drift + Recommendation Governance | Priority drift detection against persisted dossier state; governed recommendations with advisory metadata; imperative language removed; inline caveats on all priority surfaces |
| 21 | Historical Priority Ledger + Comparative Governance History | Durable priority history persistence; chronicity and posture trend analysis; governance evolution narrative; write-side-only snapshots; history integrated into brief, dossier, timeline, export |
| 22 | Priority Snapshot Automation + Historical Comparison Surfaces | Co-created priority-history snapshots on export POST; pairwise snapshot comparison; per-experiment stability; signal direction classification; comparison surfaces in brief, timeline, export; no hidden write paths |

---

## Non-Negotiable Constraints

The following constraints apply to all phases and cannot be overridden:

1. Simulation must precede every non-trivial write (Article II, Constitution)
2. Every intervention must produce a hashed artifact (Article V, Constitution)
3. Uncertainty must be visible at all times (Article IV, Constitution)
4. MCP is the only bridge to external simulation tools (Article VII, Constitution)
5. Skills are the only sanctioned extension point for agent capability (Article VI, Constitution)

---

## Success Criteria

The project succeeds when it can demonstrate — empirically, with artifact evidence — that:

- A software agent can simulate a proposed intervention before executing it
- The simulation produces a measurably accurate prediction of the real outcome
- The prediction-reality gap is tracked, visible, and calibrated over time
- All operations are traceable to immutable artifact records
- A human operator can understand and trust the system's reasoning
- Formal experiments can be replayed only to the degree supported by persisted evidence, or explicitly marked as partially reproducible / insufficient-evidence
- Research claims can be summarized with deterministic statistics and bounded confidence

This is not a coding assistant. It is a controlled, evidence-based operating environment for agentic software engineering.
