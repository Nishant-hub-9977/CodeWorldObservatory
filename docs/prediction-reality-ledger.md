# Prediction-versus-Reality Ledger

The **Repository Intervention Simulator** (route: `/intervention-simulator`) is the first
product-evolution layer built on top of CodeWorld Observatory's release-governance
foundation. It turns the repository-as-world thesis into a concrete, reviewable workflow.

---

## What the simulator is

A simulation-first, advisory-only surface that walks an agent-style intervention through
five steps:

1. **Observe** — read a mock repository "world": build status, fragile zones, dependency
   graph, recent change history, risk zones, and open assumptions.
2. **Propose** — select one of several predefined interventions, each with an intent,
   affected files, affected dependency zones, expected benefit, possible failure modes,
   rollback posture, and a human-approval requirement.
3. **Predict** — show a **Prediction Before Action**: predicted files touched, dependency
   zones disturbed, tests likely to fail, expected build/lint impact, runtime risk,
   confidence/uncertainty, recommended verification commands, and whether human approval is
   required.
4. **Observe Reality** — reveal a mock **Observed Reality**: actual files touched, actual
   failing tests, build/lint/runtime result, console status, and deployment status.
5. **Reconcile** — render the **Prediction-versus-Reality Ledger**: a row-by-row comparison
   with a mismatch surface, an overall prediction quality, unresolved uncertainty, the human
   review state, and the advisory-only / no-mutation posture.

---

## What it proves

- That a system can **form a representation of a repository world**, **predict the
  consequences of an intervention before acting**, and then **hold that prediction against an
  observed outcome** — the simulate-before-write discipline, made tangible.
- That predictions can be **honest about uncertainty**: some scenarios match exactly, others
  show a **minor mismatch surface** (for example, one more file touched than predicted, or a
  conservative over-estimate of failing tests).
- That **evidence is preserved**: each reconciliation carries a mock provenance reference and
  a recorded human decision state.

---

## What it does **not** claim

- It does **not** claim CodeWorld is a trained JEPA model or any learned world model.
- It does **not** perform real machine learning; predictions are **deterministic mock data**.
- It does **not** claim quantum advantage.
- It does **not** claim affiliation with, endorsement by, or partnership with Google, Meta,
  or any individual researcher. Where the philosophy is referenced, it is described only as
  "inspired by broader world-model research."

---

## Advisory-only boundary

The simulator is strictly advisory. It does **not**:

- write to a repository or create any repository mutation,
- execute shell commands,
- contact a real GitHub (or any Git) write API,
- trigger a production deployment,
- connect to trading, brokers, or financial systems.

Human approval is the authority layer above every proposed intervention. The simulator
exists to **model consequences, not to bypass review**.

---

## Mock-data boundary

All inputs and outputs are static, typed, local modules:

- [`lib/interventions/mock-repository-state.ts`](../lib/interventions/mock-repository-state.ts)
  — the mock repository world.
- [`lib/interventions/intervention-scenarios.ts`](../lib/interventions/intervention-scenarios.ts)
  — predefined interventions, each with a deterministic prediction and observed outcome.
- [`lib/interventions/prediction-reality-ledger.ts`](../lib/interventions/prediction-reality-ledger.ts)
  — a pure function that derives the comparison ledger from a scenario.

The comparison is fully deterministic: identical input always yields identical output. There
is no randomness and no network call.

---

## Relationship to repository-as-world thinking

Inspired by broader world-model research, the simulator maps a general principle onto
software engineering:

| World-model idea | CodeWorld mapping |
| --- | --- |
| The physical world | The repository world |
| Future-state prediction | Intervention-consequence prediction |
| Cost of action | Files affected, dependency zones touched, tests likely to fail, rollback risk, uncertainty |
| Observation | Repository-state reading (here, mock) |
| Accountability when prediction fails | The mismatch surface and preserved evidence |
| Human authority | Human review above any real action |

CodeWorld's simulation-first repository-governance thesis is unchanged; this layer is
additive, advisory, and reversible.

---

## Relationship to Q5 release governance

The simulator complements, and does not replace, the release-governance foundation:

- [release-governance.md](release-governance.md) defines how changes reach production (CI →
  review → merge → Vercel) and how to roll back.
- [production-verification.md](production-verification.md) defines how production is verified.

Several built-in scenarios deliberately mirror real phases of this project — adding a typed
evidence export, hardening panels with defensive guards, introducing a static route, changing
a shared UI primitive, and adding CI verification — so the prediction-versus-reality story is
grounded in work that actually happened.

---

## Future direction: real repository-state ingestion

This phase is intentionally mock-only. A future phase could ingest **real, read-only**
repository state — a committed snapshot and a static dependency graph — and compare predicted
intervention consequences against observable structure, while preserving every current
boundary: read-only, advisory-only, human-reviewed, and with no repository mutation.

> Recommended next phase: **CODEWORLD-Q7 — Real Repository Snapshot Import and Static
> Dependency Graph Evidence.**
