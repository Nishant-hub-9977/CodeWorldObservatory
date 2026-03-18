# Research Dossier Model

> *How the Comparative Research Dossier layer works and why it exists.*

---

## Purpose

The Research Dossier is the synthesis artifact of Phase 8. It converts raw experiment memory — accumulated simulation sessions, benchmark evaluations, and prediction-reality comparisons — into a structured, human-readable research document.

The dossier does not generate new insights through inference. It organizes existing evidence into a deterministic, reproducible format that a principal architect or external reviewer can audit without accessing the underlying data stores directly.

---

## Why Experiment Memory Matters

Before Phase 8, every simulation and benchmark session was episodic. The system could evaluate a set of counterfactual branches, rank them, and produce artifacts — but it had no mechanism to compare session 5 against session 1, detect that the same governance blocker appeared in both, or track whether calibration was improving over time.

Phase 8 closes this gap. The Experiment Memory layer reads the full historical record from:

- `artifacts/simulations/session-*.json` — past simulation sessions
- `artifacts/simulations/benchmark-*.json` — past benchmark harness runs
- `data/executions.json` — prediction-vs-reality comparisons

It then derives:

- **Recent session timelines** — what was simulated, when, and what the outcome was
- **Strategy preference trends** — which branch strategies (minimal-touch, refactor, etc.) are empirically preferred
- **Governance constraint patterns** — which blockers recur most frequently
- **Calibration movement** — whether prediction accuracy is stable, improving, or degrading
- **Evidence sufficiency distribution** — how often benchmark evaluations produce strong vs. insufficient evidence

---

## Dossier Structure

A `ResearchDossier` contains exactly 10 named sections. Each section has a `title`, `content` (narrative text), and `confidence` classification.

### Sections

| Section | What It Contains | Confidence Source |
|---|---|---|
| **System Snapshot** | Phase, session counts, benchmark counts | Direct count from persistence — always `high` |
| **Recent Experiments** | Trend narrative across the simulation corpus | Derived from session data — depends on corpus size |
| **Preferred Branch Trends** | Which strategy classes win benchmarks | Empirical from benchmark rankings |
| **Governance Constraint Patterns** | Most frequent blockers and affected objectives | Aggregated from session branch results |
| **Calibration Trend Summary** | Alignment score and movement classification | From prediction-reality comparison records |
| **Evidence Sufficiency** | Strong / adequate / insufficient distribution | Direct count from benchmark records — `high` |
| **Simulation Gap Notes** | Areas where the simulation surface is incomplete | Data-aware gap detection — always `low` |
| **Architectural Interpretation** | How the system maps to the SE-JEPA thesis | Structural interpretation — `structural-only` |
| **Known Limitations** | What the system cannot do | Honest assessment — `high` |
| **Next Research Priorities** | What Phase 9 should address | Forward-looking — `high` |

### Confidence Classifications

| Value | Meaning |
|---|---|
| `high` | Content is directly derived from persisted records with no interpretation |
| `medium` | Content involves aggregation and heuristic classification |
| `low` | Content is speculative or based on sparse evidence |
| `structural-only` | Content describes architectural design intent, not empirical evidence |

---

## Data Flow

```
artifacts/simulations/*.json ──→ ExperimentMemoryStore.compileMemory()
data/executions.json ─────────→ CalibrationTracker.deriveFromLedger()
                                          │
                                          ▼
                                  ExperimentSessionRecord
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
          SessionComparator                            DossierGenerator
     (section-level analysis)                    (section assembly + persist)
                    │                                           │
                    └───────────────────┬───────────────────────┘
                                        │
                                        ▼
                                  ResearchDossier
                                        │
                           ┌────────────┴────────────┐
                           ▼                          ▼
                  artifacts/research/         /api/research/dossier
                  dossier-*.json              (GET/POST JSON response)
```

---

## What Remains Structural vs. Learned

This distinction must be maintained explicitly in all dossier outputs:

| Capability | Current State | Learned Equivalent (Future) |
|---|---|---|
| Strategy trend derivation | Branch-ID heuristic matching | Embeddings over strategy metadata |
| Calibration scoring | Weighted average of discrete outcomes | Continuous loss function over latent predictions |
| Governance pattern detection | String-match aggregation over `governanceBlockers` | Semantic clustering of blocker descriptions |
| Evidence sufficiency | Discrete 3-level classification per benchmark | Continuous confidence surface per branch |
| Simulation gap detection | Rule-based checklist of expected data | Coverage analysis over state-space topology |

The dossier always marks structural-proxy sections with `confidence: "structural-only"` to prevent consumers from treating heuristic output as empirically validated intelligence.

---

## Persistence

Generated dossiers are persisted as JSON files in `artifacts/research/dossier-{timestamp}.json`. The most recent dossier is served by the GET endpoint; new dossiers are generated via POST.

Dossier files are append-only artifacts. Old dossiers are never overwritten or deleted. This preserves the longitudinal audit trail.

---

## API Surface

| Route | Method | Behavior |
|---|---|---|
| `/api/research/memory` | GET | Returns the current `ExperimentSessionRecord` |
| `/api/research/trends` | GET | Returns strategy, blocker, uncertainty, and calibration trends |
| `/api/research/dossier` | GET | Returns the most recent dossier (or generates one if none exists) |
| `/api/research/dossier` | POST | Forces generation of a new dossier from current memory state |

---

## Anti-Drift Constraints

The dossier layer must NOT:

- Present heuristic-derived trends as machine-learned intelligence
- Generate narrative that implies autonomous insight generation
- Fabricate trends when data is absent (report absence instead)
- Over-polish language to sound like a marketing document
- Introduce confidence scores that are not derivable from underlying records
- Discard the `structural-only` confidence level for sections based on architectural interpretation
