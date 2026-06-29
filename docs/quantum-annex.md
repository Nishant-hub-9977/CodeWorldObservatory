# Quantum Research Annex

**Subtitle:** Resource estimation, simulation-first reasoning, and evidence-preserving software intervention.

> This annex is a research and interpretation layer. It does not claim quantum advantage, does not run production quantum workloads, does not imply affiliation with Google, and does not modify CodeWorld's core simulation-first repository governance thesis.

---

## Why quantum appears in CodeWorld

Quantum resource estimation is one of the few engineering disciplines that demands fully explicit accounting of cost *before* execution. CodeWorld Observatory borrows that posture and applies it to software interventions: imagine the consequences, account for them, then act.

## Why this is a research annex

The annex is intentionally separated from the core. It strengthens the thesis around resource estimation, intervention consequence modeling, and simulation-first governance — without turning CodeWorld into a quantum product or runtime.

## Why no quantum advantage is claimed

No advantage, speedup, or production quantum capability is asserted. The value is interpretive: a discipline of consequence accounting, not a performance claim.

## Why external quantum repositories are references, not bundled code

External quantum repositories are studied locally and cited by URL. They are not vendored, imported, redistributed, or committed into CodeWorld source. They may be cloned only into `external/google-quantum/`, which is gitignored.

## How resource-estimation thinking maps into software engineering

Explicit resource estimation becomes intervention accounting: which files, dependency zones, and test surfaces a change consumes, with predicted versus actual outcomes recorded as evidence.

## How the repository-as-world thesis remains primary

The simulation-first repository governance architecture is unchanged. The annex is additive, advisory, and reversible.

---

## Resource Consequence Ledger

The most important CodeWorld-native contribution. It maps quantum-style resource accounting onto software intervention governance. It is **inspired by the discipline of explicit resource accounting**, applied to software repositories as technical worlds — not copied quantum marketing.

| Field | Meaning |
| --- | --- |
| files affected | Scope of the change surface |
| dependency zones touched | Coupled regions that may propagate effects |
| test surfaces predicted to fail | Pre-execution failure hypotheses |
| intervention hypothesis | The proposed change and its intent |
| predicted outcome | Expected result before any write |
| actual outcome | Observed result after evaluation |
| evidence hash or timestamp | Tamper-evident provenance |
| uncertainty level | Explicit confidence bound |
| human approval state | Pending, approved, or rejected |
| rollback posture | Reversibility and recovery stance |
| simulation status | Whether simulation preceded the write |

---

## External Tool Map

| Tool | Role | CodeWorld interpretation | Status | Repo |
| --- | --- | --- | --- | --- |
| Cirq | Circuit construction & simulation | Intervention composition model | reference | https://github.com/quantumlib/Cirq |
| qsim | High-performance simulation | Scaling simulation-before-write | reference | https://github.com/quantumlib/qsim |
| Qualtran | Algorithm & resource estimation | Resource Consequence Ledger discipline | reference | https://github.com/quantumlib/qualtran |
| OpenFermion | Fermionic/scientific systems | Future scientific branch | future | https://github.com/quantumlib/OpenFermion |
| TensorFlow Quantum | Hybrid quantum-classical ML | Future hybrid branch (not in app) | future | https://github.com/tensorflow/quantum |

Metadata: `research/quantum/tools.json`, `research/quantum/references.json`, `research/quantum/experiments.json`.

---

## Local Experiment Layer

A lightweight local lab generates Resource Consequence Ledger style JSON. The production app displays exported evidence only; it never runs heavy quantum simulation.

```bash
python quantum-lab/experiments/resource_consequence_placeholder.py
# Output: quantum-lab/results/sample_result.json
```

External repositories may be cloned for study only into `external/google-quantum/` (see `external/README.md`).
