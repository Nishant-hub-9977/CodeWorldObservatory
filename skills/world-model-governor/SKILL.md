---
name: world-model-governor
description: >
  Governs world-model consistency across the Observatory system.
  Validates state transitions, enforces causal ordering of operations,
  and ensures no agent action violates the structural invariants
  of the current world state.
---

# World-Model Governor (Phase 5: MCP Enforcement)

## Purpose

The World-Model Governor is the Observatory's strict consistency enforcement oracle. It operates at the intersection of the world state, proposed plans, and predicted futures. Its job is to evaluate whether a proposed execution path is **legal and safe** according to the Simulation-Before-Write Law.

In Phase 5, this skill dictates how agents interact with the newly formalized MCP Contract Registry (`/api/mcp/contracts`) and the Simulation Gate (`/api/mcp/evaluate`).

## Activation Conditions

This skill MUST be invoked:
- Before any file modification is attempted.
- Before a final `plan` artifact is considered ready for execution.
- Immediately after generating a `simulation` artifact (to verify limits).
- When crossing the MCP Simulation Gate boundary.

## Required Inputs and Artifacts

| Input/Artifact | Description | Source |
|---|---|---|
| Current `WorldState` | The most recent verified snapshot of the repository. | `/api/snapshot` |
| `InterventionPlan` | The proposed structural branch. | Phase 2 Artifact Ledger |
| `FuturesProjection` | The heuristically projected impact bounds. | Phase 3 Artifact Ledger |

## Mandatory Checks

Before clearing an intervention for execution, the Governor must verify:
1. **Simulation Prerequisite**: A `simulation` artifact exists for the target branch.
2. **State Freshness**: The baseline `WorldState` ID matches the current operational state.
3. **Execution Readiness**: The projected outcome explicitly states `executionReadiness: "ready"`.
4. **Gate Classifier**: The MCP endpoint `/api/mcp/evaluate` returns `ready-for-reviewed-execution`.

## Prohibited Behaviors

- **Autonomous Write Forbidden**: The Governor may NOT auto-execute code upon successful validation. It may only grant "ready for reviewed execution" status.
- **Ignoring Uncertainty**: The Governor may NOT suppress or bypass severe `UncertaintySignal` warnings. If a region is unobservable, the path must be manually audited.
- **Direct State Mutation**: The Governor may NOT edit the file system to "fix" an invalid state. It must issue a rejection artifact.

## Success Criteria

On success, the Governor produces:
- An artifact of type `verification` confirming all invariants passed.
- A positive resolution from the `/api/mcp/evaluate` simulation gate.
- Clear clearance for a human or separate supervised-execution agent to proceed.

## Interaction with MCP Contracts

The Governor is the primary consumer of the `evaluate_simulation_gate` MCP tool. 

1. Agent queries `query_artifact_ledger` to confirm artifacts exist.
2. Agent invokes `evaluate_simulation_gate` with the `branchId`.
3. If the gate returns `blocked` or `advisory-only`, the Governor enforces a halt.
4. If the gate returns `ready-for-reviewed-execution`, the Governor records the clearance artifact.
