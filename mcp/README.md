# MCP Integration — CodeWorld Observatory

## Overview

Model Context Protocol (MCP) is the sanctioned bridge between CodeWorld Observatory's intelligence layer and external simulation tools, prediction services, and analytic backends (Article VII, Constitution).

This directory contains the planning, specification, and server architecture for the Observatory's MCP integration. The MCP server layer is **active as of Phase 5**.

## Why MCP

MCP provides:
- A standardized tool interface that works across all Antigravity-compatible agents
- Audit logging of all external tool calls (required by the Artifact Contract)
- Transport-agnostic deployment (stdio, HTTP, SSE)
- Clean separation between the Observatory's intelligence layer and its execution layer

Direct HTTP calls to external simulation services are **prohibited** (Article VII). All external calls must route through registered MCP tools.

## Planned MCP Tool Surfaces

See `mcp-tools-spec.md` for the full specification.

| Tool | Phase | Purpose |
|---|---|---|
| `capture_world_state` | 5 | Trigger a live snapshot of a target repository |
| `evaluate_simulation_gate` | 5 | Submit an intervention for simulation gate verification |
| `query_artifact_ledger` | 5 | Retrieve sequence artifacts for audit |
| `plan_intervention` | 5 | Propose counterfactual paths |
| `compare_prediction_to_reality` | 5 | Record calibration |

## Directory Structure

```
mcp/
├── README.md           # This file
├── mcp-tools-spec.md  # Detailed tool interface specifications
└── server-plan.md     # MCP server architecture and deployment plan
```

## Phase 4 Prerequisite

The MCP server will not be implemented before Phase 4. The Evaluation Framework (Phase 4) must be operational first, since the MCP tools expose calibrated prediction data that the eval framework produces.

All MCP planning documents in this directory are design-time artifacts — they are not executable yet.
