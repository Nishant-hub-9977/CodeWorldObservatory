---
name: repo-state-capturer
description: >
  Captures complete, verified world-state snapshots of a software repository.
  Produces typed WorldState objects that serve as the ground truth for all
  planning, simulation, and intervention operations in the Observatory.
---

# Repo-State Capturer (Phase 5: MCP Integration)

## Purpose

The Repo-State Capturer is the Observatory's sensing engine. In Phase 5, it formally exposes the `capture_world_state` MCP contract, ensuring agents can safely observe the repository without manually executing arbitrary terminal scans.

## Activation Conditions

This skill MUST be invoked:
- By the agent calling the `capture_world_state` MCP contract.
- Before beginning an `InterventionPlan`.
- After an intervention completes to capture the delta.

## Required Inputs

| Input | Description | Source |
|---|---|---|
| `path` (Optional) | Target subdirectory to scope the capture. | MCP Request |

## Mandatory Checks

1. **Deterministic Hashing**: The capturer must generate a consistent `fileTreeDigest`.
2. **Read-Only Scope**: The capturer must ONLY read data.
3. **Exclusion Adherence**: Ignore patterns (e.g., `node_modules`, `.next`) must be strictly honored to prevent out-of-memory errors on massive repositories.

## Prohibited Behaviors

- **No State Mutation**: The capturer may not install missing dependencies, format code, or alter the environment in any way during capture.
- **No Side-Channel Data**: The capturer must rely solely on the structured snapshot APIs. It may not bypass the API to run undocumented queries.

## Success Criteria

On success, the Capturer produces:
- A `RepoSnapshot` (JSON) response via the MCP contract.
- A `world-snapshot` artifact submitted to the `artifact-ledger`.

## Interaction with MCP Contracts

The Capturer is the implementation behind `capture_world_state`:
1. Agent invokes `capture_world_state`.
2. The skill executes the snapshot logic (Phase 1 codebase).
3. The snapshot ID and data are returned to the agent securely via the MCP boundary.
