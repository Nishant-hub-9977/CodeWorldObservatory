# Experiment Registry Model

The experiment registry formalizes research work that previously existed only as implicit session history.

## Core Record

Each experiment persists:

- `experimentId`
- explicit objective title, summary, and target files
- explicit hypothesis statement, expected signal, and success criteria
- primary strategy class
- lifecycle status
- linked simulations, benchmarks, artifacts, scenarios, and historical world-state snapshots

## Persistence

- Registry store: `artifacts/research/experiments/registry.json`
- Historical state snapshots: `artifacts/research/world-state/wss-*.json`

## Hardening Notes

- Experiment IDs are generated uniquely and treated as durable record identifiers.
- `createdAt` is immutable after registration; `updatedAt` changes only on explicit linkage updates.
- Linked artifact paths are normalized for stable cross-platform lineage.
- Historical snapshots are structural baselines. They do not, by themselves, imply replayable historical diffs.

## Design Constraint

The registry records intent and evidence lineage. It does not infer semantic success or causal correctness on its own. Those judgments remain downstream in calibration, dossier, and statistical layers.