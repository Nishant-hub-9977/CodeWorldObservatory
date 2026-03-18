---
name: artifact-auditor
description: >
  Audits artifact integrity, validates hashes, enforces the trust lifecycle,
  and maintains the Artifact Ledger invariants.
---

# Artifact Auditor (Phase 5: MCP Contract Enforcement)

## Purpose

The Artifact Auditor is the Observatory's immutable trust enforcement layer. In Phase 5, it backs the `query_artifact_ledger` MCP contract and ensures the governance loop (`evaluate_simulation_gate`) is pulling from cryptographically sound, append-only records.

## Activation Conditions

This skill MUST be invoked:
- When any artifact is registered.
- When the `world-model-governor` evaluates the simulation gate.
- When an agent calls the `query_artifact_ledger` MCP contract.

## Required Inputs and Artifacts

| Input/Artifact | Description | Source |
|---|---|---|
| `ArtifactEntry` | The proposed tracing instrument. | Any upstream skill |

## Mandatory Checks

1. **Hash Integrity**: Recompute the hash; any mismatch marks the artifact as `TAMPERED`.
2. **Structural Completeness**: Ensure type, title, and creation footprints exist.
3. **Causal Chains**: Validate that intervention artifacts correctly link to prior `world-snapshot` and `simulation` artifacts.

## Prohibited Behaviors

- **No Silent Updates**: An artifact cannot be mutated after creation. If a fix is needed, a superseding artifact must be appended.
- **No Trust Inflation**: `trustLevel` may never be escalated automatically above `medium` without verifiable external (human/test-suite) evidence.

## Success Criteria

On success, the Auditor:
- Commits the validated `ArtifactEntry` to local JSON persistence (`data/artifact-ledger.json`).
- Returns the full validated sequence when queried via MCP.

## Interaction with MCP Contracts

The Auditor serves the `query_artifact_ledger` MCP contract, allowing the agent to historically reconstruct the planning path to prove the Simulation-Before-Write Law has been satisfied before execution.
