# Evaluation Persistence Model

The evaluation persistence layer exists to make comparative interpretation durable and inspectable without collapsing observational reads into hidden writes.

## Purpose

Phase 17 introduced live evidence-weighted comparison. Phase 18 adds a narrow persistence layer so the observatory can answer a second question:

- how did comparative interpretation change over time?

This persistence is useful for:

- comparative audits
- export lineage
- historical evaluation drift tracking
- reproducibility of interpretation

It is not intended to duplicate raw evidence or replace the experiment-detail center.

## Artifact Class

Persisted evaluation records live under `artifacts/research/evaluations/`.

Each record is:

- explicit
- write-side only
- version-aware
- doctrine-preserving
- clearly marked as interpretation rather than raw truth

## Read / Write Boundary

- `GET /api/research/evaluations` is observational. It reads the latest persisted record if one exists and computes a live comparison snapshot for inspection. It does not persist.
- `POST /api/research/evaluations` is the explicit write path for creating an evaluation snapshot.
- `POST /api/research/export` may also persist an evaluation snapshot as part of a deliberate export operation.

No existing GET surface should silently materialize evaluation artifacts.

## Drift Semantics

Evaluation drift is derived by comparing adjacent persisted evaluation records.

The system tracks bounded changes such as:

- comparative leader changes
- weight label changes
- confidence changes
- evidence completeness changes
- replay and lineage posture changes
- ranking changes across the experiment portfolio

Drift does not imply causal explanation. It only states that the observatory's artifact-grounded interpretation changed because the underlying persisted evidence changed.

## Doctrinal Constraint

Persisted evaluation snapshots do not strengthen replay semantics.

In particular:

- `full` still means artifact-complete replay-package lineage
- benchmark-supported does not mean validated
- execution-supported does not mean generalizable
- persisted interpretation does not become raw truth

Comparative interpretation remains epistemically bounded by the evidence chain it summarizes.