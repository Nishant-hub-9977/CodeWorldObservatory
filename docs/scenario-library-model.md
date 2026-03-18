# Scenario Library Model

The scenario library provides canonical evaluation frames that can be attached to registered experiments.

## Scenario Shape

Each scenario defines:

- `scenarioId`
- description
- target repository type
- risk profile
- recommended strategies
- evaluation metrics

## Dataset Relationship

When a scenario is linked to an experiment, the dataset layer can package:

- linked simulation session IDs
- linked benchmark IDs
- linked calibration comparison IDs
- calibration summary derived from persisted execution evidence

## Artifact Behavior

- Dataset IDs are stable per experiment: `dataset-<experimentId>`
- Dataset `createdAt` is preserved after first materialization
- Dataset `updatedAt` advances only during explicit write-side materialization events
- Dataset read routes do not create or rewrite artifacts implicitly

## Design Constraint

Scenarios are curated research frames, not learned clusters or inferred archetypes. Dataset artifacts summarize only persisted evidence actually linked to the experiment.