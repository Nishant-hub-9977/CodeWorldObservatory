# MCP Server Plan

> *Architecture plan for the CodeWorld Observatory MCP server.*
> *Target: Phase 4 implementation.*

---

## Overview

The Observatory MCP server is a standalone process that exposes the five tool surfaces defined in `mcp-tools-spec.md`. It acts as the bridge between Antigravity agents and the Observatory's backend services.

```
Antigravity Agent
    │
    │  MCP protocol (stdio or HTTP/SSE)
    ▼
Observatory MCP Server
    │
    ├── world_state_capture ──► Repo-State Capturer (lib/services)
    ├── simulation_dispatch ──► Simulation Engine (lib/services)
    ├── prediction_retrieve ──► Simulation Store (data/)
    ├── artifact_register ───► Artifact Auditor + Ledger (lib/services)
    └── calibration_report ──► Eval Framework (evals/)
```

---

## Transports

The MCP server will support two transports:

### 1. stdio (Primary — Agent Use)
- Process-to-process communication
- Used by Antigravity when the agent has shell access to the host running the Observatory
- Zero network overhead
- Suitable for local development and single-user setups

### 2. HTTP + SSE (Secondary — Remote Agents)
- HTTP for request-response tools
- SSE for streaming tool outputs (e.g., long-running simulations)
- Used when agents are sandboxed or remote
- Requires authentication via bearer token (Phase 5)

---

## Tool Registry

Tools are registered at server startup from a central registry:

```typescript
// mcp/server/registry.ts
const tools: MCPTool[] = [
  worldStateCaptureHandler,
  simulationDispatchHandler,
  predictionRetrieveHandler,
  artifactRegisterHandler,
  calibrationReportHandler,
];
```

Each handler is a pure function: `(input: ToolInput) => Promise<ToolOutput>`. No tool handler may have side effects beyond calling Observatory services.

---

## Logging and Audit

All tool calls are logged to the Observatory audit log:

| Field | Description |
|---|---|
| `callId` | Unique ID per invocation |
| `toolName` | The tool that was called |
| `calledAt` | ISO 8601 timestamp |
| `agentId` | Identifier of the calling agent |
| `inputHash` | SHA-256 of the tool input (not the content — the schema hash) |
| `outputHash` | SHA-256 of the tool output |
| `durationMs` | Wall-clock time |
| `error` | Any error, structured |

MCP tool call logs are not full artifacts (too high volume), but they feed the audit trail that the Artifact Auditor can reference.

---

## Server Location

The MCP server source will live at:

```
mcp/
└── server/
    ├── index.ts          # Server entry point
    ├── registry.ts       # Tool registry
    ├── handlers/         # One file per tool
    │   ├── world-state-capture.ts
    │   ├── simulation-dispatch.ts
    │   ├── prediction-retrieve.ts
    │   ├── artifact-register.ts
    │   └── calibration-report.ts
    └── audit.ts          # Audit logger
```

---

## Phase 4 Implementation Plan

1. Set up `@modelcontextprotocol/sdk` as a dependency
2. Implement stdio transport server with registry
3. Wire `world_state_capture` to the Phase 1 Repo-State Capturer
4. Wire `artifact_register` to the Phase 0 Artifact Auditor
5. Stub `simulation_dispatch` and `prediction_retrieve` pending Phase 3 engine
6. Implement `calibration_report` from Phase 4 eval framework output
7. Add HTTP/SSE transport
8. Integration test: end-to-end Antigravity agent → MCP → Observatory service
