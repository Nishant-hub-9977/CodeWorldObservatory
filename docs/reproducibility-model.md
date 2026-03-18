# Reproducibility Model

The reproducibility layer answers a narrow question: how much of an experiment's evidence chain can be reconstructed from persisted artifacts?

## Replayability Classes

- `full`: all required supporting artifacts are present and a dedicated replay package preserves the original replay inputs
- `partial`: the major evidence chain is present, but some regeneration inputs are missing
- `insufficient-evidence`: the repository cannot reconstruct a defensible replay package

## Current Posture

Phase 15 adds write-time lineage binding from experiments into baseline snapshots, simulation sessions, benchmark runs, execution records, and dedicated replay packages. Replayability still upgrades conservatively:

- `insufficient-evidence` remains the default when only experiment registration or baseline-only artifacts exist
- `partial` becomes available when a persisted baseline snapshot, simulation session, and benchmark run form a stored evidence chain
- `full` is reserved for experiments that also include execution evidence and a replay package whose lineage status is `full-replay-package`

The system still does not claim branch-perfect reproduction. It reports only the maturity justified by persisted lineage artifacts.

Phase 16 extends that same vocabulary into the experiment detail route, dossier, timeline, briefing, export manifest, and observatory UI. Those surfaces now consume replay status and lineage status from persisted artifacts rather than reinterpreting them independently.

Phase 17 adds evidence-weighted comparative evaluation on top of that same chain. Comparative leaders are determined by persisted evidence completeness, empirical depth, calibration support, and replay maturity. This is a bounded prioritization aid, not a claim of causal superiority or a stronger replay guarantee than the artifacts justify.

## Statistical Evaluation

The statistical evaluator reports:

- weighted prediction accuracy from `PredictionRealityComparison` records
- strategy success rates from persisted simulation session branch outcomes
- Wilson confidence intervals for bounded proportion estimates
- maturity notes describing when sample sizes remain too small for strong empirical claims

## Design Constraint

The replay engine must not imply that a missing simulation or benchmark can be regenerated from narrative memory alone. When branch inputs or linked artifacts are absent, the system reports the missing evidence directly.

`full` remains a statement about artifact-complete replay-package lineage. It must not drift into meaning guaranteed deterministic replay, exact historical branch reconstruction, or stronger scientific certainty than the captured artifacts justify.