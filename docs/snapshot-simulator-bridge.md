# Snapshot-to-Simulator Bridge

The **Snapshot-to-Simulator Bridge** connects Q7 repository snapshot evidence to
the Q6 Repository Intervention Simulator. It answers a narrow question:

> How does a real repository snapshot influence intervention-risk prediction?

The answer is deliberately static and advisory: the simulator still uses
predefined deterministic scenarios, but each scenario now carries a mapped set of
repository snapshot evidence — matched files, static edges, consequence-bearing
edges, route blast radius, shared-infrastructure exposure, and an explainable
snapshot risk tier.

---

## What Q8 adds

- A deterministic bridge layer under `lib/interventions/` that imports the
  existing typed repository snapshot wrapper.
- Explicit scenario-to-snapshot mappings for every existing simulator scenario.
- Snapshot-informed risk enrichment: **LOW**, **MEDIUM**, or **HIGH**, based on
  static graph evidence rather than fuzzy matching or model inference.
- Simulator UI panels that show snapshot evidence and risk alongside the
  existing prediction-before-action workflow.
- Ledger rows for **Snapshot Evidence Used**, **Static Graph Alignment**,
  **Route Blast Radius**, **Shared Infrastructure Exposure**, and **Evidence
  Confidence**.

---

## How snapshot evidence enriches predictions

The bridge does not replace the original mock prediction. It adds structural
context:

- Matched repository domain and file families.
- Snapshot-matched files for the scenario.
- Relevant consequence-bearing edges from the static dependency graph.
- Estimated route blast radius.
- Static edge count involved.
- Unresolved import exposure, when present.
- Shared infrastructure, governance, simulator, and Quantum Annex surface flags.
- Static evidence availability and confidence.

Risk is determined by explicit rules:

- **HIGH** if shared infrastructure is touched, multiple consequence-bearing
  edges are involved, or route blast radius is wide.
- **MEDIUM** if route, governance, simulator, Quantum Annex, or unresolved-import
  exposure is present.
- **LOW** if the matched static surface is isolated.

---

## What it proves

Q8 proves that CodeWorld can use a real static repository snapshot to enrich a
prediction-before-action workflow. A simulator scenario no longer speaks only
from hand-authored mock scope; it can point to actual repository structure and
explain why a small change may carry a wide blast radius.

---

## What it does not claim

- It does **not** claim CodeWorld is a trained world model, JEPA model, or
  learned AI system.
- It does **not** claim quantum advantage.
- It does **not** imply affiliation with Google, Meta, Yann LeCun, Vercel, or any
  research institution.
- It does **not** claim complete runtime dependency knowledge.
- It does **not** execute, approve, or perform interventions.

---

## Static approximation boundary

Snapshot evidence is derived from `data/repository-snapshot.json`, which is a
static approximation generated locally and committed as an artifact. The bridge
uses explicit scenario mappings and deterministic rules. It performs no fuzzy AI
matching, no runtime dependency analysis, and no filesystem scan at request time.

---

## Read-only boundary

The bridge preserves the same boundaries as Q6 and Q7:

- No runtime filesystem scanning.
- No repository mutation.
- No shell execution from the web UI.
- No GitHub write APIs.
- No GitHub tokens required.
- No Python in the Vercel runtime.
- No runtime dependency analysis.
- Advisory-only and human-reviewed.

---

## Relationship to Q6 Intervention Simulator

Q6 established the prediction-versus-reality workflow: observe a repository-like
world, propose an intervention, predict consequences before action, compare with
an observed outcome, and preserve human review. Q8 leaves that behavior intact
and adds a static evidence layer beneath the prediction: the selected scenario
now has a mapped structural context from the real repository snapshot.

---

## Relationship to Q7 Repository Snapshot

Q7 created the static snapshot artifact and `/repository-snapshot` evidence page.
Q8 consumes that artifact through the existing typed wrapper and uses the derived
structure in the simulator. The snapshot page remains the source-of-truth view;
the simulator uses a scenario-specific slice of that evidence.

---

## Future direction: Q9

Recommended next phase:

> **CODEWORLD-Q9 — Real Snapshot Upload / Import Boundary and External
> Repository Evidence Pack.**

Q9 should stay within the same governance posture: static import boundaries,
explicit user review, no mutation, no GitHub writes, no runtime scanning, and no
execution from the web UI.
