# Artifacts

> *The Observatory Artifact Ledger — append-only record of all significant operations.*

---

## What is an Artifact?

In CodeWorld Observatory, an artifact is an immutable, hashed, timestamped record of a significant operation. Artifacts are the trust instruments of the system. They answer the question:

> **Can we verify what happened, when, by whom, and whether the prediction was correct?**

Without artifacts, the system cannot be trusted. With artifacts, every operation is accountable.

---

## Artifact Types

| Type | Description | When Created |
|---|---|---|
| `plan` | Implementation plan before any code is written | Before any implementation begins |
| `simulation` | Predicted outcome of an intervention | During counterfactual planning |
| `prediction` | Model prediction record | When a simulation result is sealed |
| `world-snapshot` | Captured world state | Before and after any intervention |
| `verification` | Test and check results after intervention | After execution completes |
| `walkthrough` | Completed work summary | At phase boundaries |
| `eval-result` | Evaluation outcome | After prediction-reality delta is computed |
| `constitution` | Governance document | On ratification |

---

## Storage Policy

- Artifacts are **append-only**. An artifact created is never modified.
- To supersede an artifact, create a new one with a `links` entry `{ relationship: "supersedes" }`.
- File-backed artifacts are stored in this directory (or referenced by path).
- The Artifact Ledger panel in the Observatory UI reads from the registered ledger, not this directory directly.

---

## Phase 0 Artifacts

The following artifacts exist as of Phase 0:

| ID | Type | Title |
|---|---|---|
| `art-001` | `plan` | Phase 0 Implementation Plan |
| `art-002` | `constitution` | Observatory Constitution |
| `art-003` | `simulation` | Simulation: WorldState Capturer Intervention |

See `lib/data/mock-observatory-data.ts` for the full artifact records.
