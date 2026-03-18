---
name: counterfactual-planner
description: >
  Plans and evaluates counterfactual futures before any write operation.
  Given a proposed intervention and the current world state, generates
  candidate future branches and projects uncertainty boundaries.
---

# Counterfactual Planner (Phase 5: MCP Integration)

## Purpose

The Counterfactual Planner is the Observatory's forward-reasoning engine. It prevents premature commitment to a single path of action by structurally modeling candidate futures *before* any write operation is permitted. It strictly obeys the "Plan-Before-Write" enforcement doctrine.

In Phase 5, the Planner relies on MCP contracts to formalize its output so that the `world-model-governor` can evaluate it at the simulation gate.

## Activation Conditions

This skill MUST be invoked:
- When a new intervention objective is proposed by the user.
- When an existing plan is rejected by the World-Model Governor requiring alternatives.
- Before invoking the `project_futures` MCP contract.

## Required Inputs

| Input | Description | Source |
|---|---|---|
| `objective` | The target change description. | Operator input |
| `baselineWorldStateId` | The ID of the current clean repo snapshot. | `capture_world_state` MCP |

## Mandatory Checks

1. **Baseline Validation**: The planner must query the world state to ensure it is operating on fresh data.
2. **Alternative Mandatory**: The planner MUST generate at least two structurally distinct branches (e.g., "Service-first" vs "Route-first").
3. **Traceability**: Every output branch must be traceable back to the provided `baselineWorldStateId`.

## Prohibited Behaviors

- **No Code Generation**: The Planner models structure, files, and impact bounds. It does NOT generate the implementation code.
- **No Execution**: The Planner may not invoke testing suites or write processes.
- **No Monolithic Plans**: The Planner may not output a single, uncontested path for complex features.

## Success Criteria

On success, the Planner produces:
- An `InterventionPlan` containing at least two candidate `InterventionBranch` structures.
- An immutable `plan` artifact submitted to the `artifact-ledger`.

## Interaction with MCP Contracts

The Planner orchestrates the early stages of the MCP lifecycle:
1. Connect via `capture_world_state` to obtain the baseline.
2. (Internal) Generate the counterfactual plan.
3. Submit the plan as a `plan` artifact.
4. Hand off the optimal `branchId` to the simulation layer via the `project_futures` contract, allowing the system to project the formal bounds required by the simulation gate.
