# Latent State Model

> *Phase 9 — typed latent-state approximations for CodeWorld Observatory*

---

## What is a Latent State in This System?

In JEPA-inspired architectures, a **latent state** is a compressed, abstract representation of the observed world that captures only the structurally relevant information needed for prediction and planning.

In the CodeWorld Observatory, latent states are **typed structural descriptors** — not learned embeddings, not neural vectors, not statistical inferences. They are deterministic, compositional assessments derived from observable repo signals.

### What They Are

- **Explicit typed structures**: Every descriptor has a defined schema in `lib/types/latent-state.ts`
- **Deterministic**: Given the same inputs, the same latent state is always produced
- **Compositional**: The overall `LatentRepoState` is composed from independent orthogonal descriptors
- **Auditable**: Every field has a `rationale` string explaining how it was derived

### What They Are NOT

- Neural latent embeddings
- Trained JEPA vectors or learned representations
- Statistical inference outputs
- Probabilistic latent variables
- Continuous representations in a high-dimensional space

---

## The Five Structural Descriptors

### 1. Structural Complexity (`StructuralComplexityDescriptor`)

Measures repository size, module boundary count, edge density, and deep nesting.

| Posture | Meaning |
|---|---|
| `low` | Small repo, few modules, shallow nesting |
| `moderate` | Medium-sized, manageable boundaries |
| `high` | Large codebase with dense connectivity |
| `extreme` | Very large, deeply nested, high edge density |

### 2. Dependency Pressure (`DependencyPressureDescriptor`)

Measures how concentrated the dependency graph is — whether a few files carry disproportionate traffic.

| Level | Meaning |
|---|---|
| `contained` | Edges spread evenly, no hotspots |
| `moderate` | Some concentration, manageable |
| `concentrated` | Top files dominate the graph |
| `systemic` | Pervasive coupling across the codebase |

### 3. Validation Burden (`ValidationBurdenDescriptor`)

Measures the cost of verifying changes — open problems, mutation rate, test coverage.

| Level | Meaning |
|---|---|
| `low` | Few open issues, stable codebase |
| `moderate` | Some churn, manageable verification |
| `heavy` | Frequent mutations, verification-intensive |
| `prohibitive` | Verification cost exceeds intervention benefit |

### 4. Governance Friction (`GovernanceFrictionDescriptor`)

Measures how often simulation sessions encounter governance blockers.

| Level | Meaning |
|---|---|
| `smooth` | No historical governance constraints |
| `cautious` | Occasional blockers, manageable |
| `gated` | Frequent constraints requiring review |
| `blocked` | Majority of sessions hit governance walls |

### 5. Evidence Sufficiency (`EvidenceSufficiencyDescriptor`)

Measures the quality of benchmark evidence available for decision-making.

| Posture | Meaning |
|---|---|
| `strong` | Majority of benchmarks produce strong evidence |
| `adequate` | Sufficient evidence for most decisions |
| `thin` | Evidence exists but is not robust |
| `insufficient` | Not enough benchmark data to support conclusions |

---

## Composite Posture

The five descriptors are aggregated into a single `compositePosture`:

| Posture | Meaning |
|---|---|
| `stable` | All dimensions within normal bounds |
| `cautious` | Some dimensions elevated but manageable |
| `pressured` | Multiple dimensions showing stress |
| `fragile` | System is under significant structural pressure |

The composite posture is the primary signal that drives strategy compatibility reasoning.

---

## Strategy Compatibility Model

Given a latent state, the `StrategyCompatibilityAnalyzer` assesses each `BranchStrategy` for structural fit:

| Compatibility Class | Meaning |
|---|---|
| `favorable` | Strategy is well-suited to current conditions (suitability ≥ 0.7) |
| `viable-with-review` | Strategy can work but requires human oversight (0.45 ≤ suitability < 0.7) |
| `structurally-misaligned` | Strategy is a poor fit (suitability < 0.45) |

Each assessment includes:
- **Suitability score** (0–1)
- **Reasoning** — bounded architectural explanation
- **Key factors** — which latent descriptors most influenced the rating

---

## Transition Pattern Memory

The `TransitionPatternAnalyzer` examines historical sessions to detect recurring motifs:

- Which latent conditions (complexity + pressure + friction) tend to produce which strategy selections
- Which governance blockers recur across sessions
- Where calibration burden concentrates

This moves the system from "branch X won in session Y" toward "under conditions A+B+C, strategy S tends to dominate."

---

## Relationship to SE-JEPA

The Phase 9 latent state position in the SE-JEPA chain:

```
enc(x)  →  LatentRepoState  →  StrategyCompatibility  →  ActionRepresentation  →  PredictedFuture  →  Calibration
  ↑                                                                                                        ↓
Observation                                                                                    TransitionPatternMemory
```

In JEPA terms:
- `enc(x)` → `ObservationEncoder` (Phase 6)
- `z` → `LatentRepoState` (Phase 9) — this is the latent representation
- The predictor operates in latent space → `StrategyCompatibilityAnalyzer` makes predictions about strategy viability from latent state
- The energy function → compatibility classification acts as the loss surface

The system is architecturally positioned to replace these deterministic approximations with learned representations in a future phase — but it makes no claim that this is happening now.

---

## Design Constraints

1. **No fake embeddings**: All descriptors are typed structures, not vectors
2. **No mock confidence**: Suitability scores are bounded heuristics with known derivation
3. **No statistical inference**: Pattern detection is frequency-based, not probabilistic
4. **No training claims**: The system does not learn — it remembers and counts
5. **Backward compatibility**: All new types are additive; no Phase 1–8 contracts are broken
