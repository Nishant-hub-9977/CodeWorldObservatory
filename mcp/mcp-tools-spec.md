# MCP Tools Specification

> *CodeWorld Observatory — MCP Tool Surface (Phase 5)*

---

## Tool: `capture_world_state`

**Purpose**: Trigger a fresh world-state snapshot of a target repository.

**Phase**: 5 (active)

### Input Schema

```typescript
{
  repositoryPath: string;     // Absolute path to the repository root
  excludePatterns?: string[]; // Glob patterns to exclude
  maxDepth?: number;          // Maximum file tree depth
}
```

### Output Schema

```typescript
{
  worldStateId: string;       // ID of the captured WorldState
  capturedAt: string;         // ISO 8601
  fileTreeDigest: string;     // sha256 of file tree
  totalFiles: number;
  snapshotArtifactId: string; // ID of the registered world-snapshot artifact
}
```

### Behavior
- Invokes the Repo-State Capturer skill
- Registers the resulting WorldState snapshot in the Observatory data store
- Produces and registers a `world-snapshot` artifact
- Returns immediately with the snapshot ID

---

## Tool: `simulate_execution`

**Purpose**: Submit a proposed code diff or intervention to the SE-JEPA engine for latent-space simulation.

**Phase**: 3 (planned — active as rule-based stub in Phase 2)

### Input Schema

```typescript
{
  worldStateId: string;         // ID of the current world state to simulate from
  proposedDiff: string;         // Unified diff of the proposed change
  targetFiles: string[];        // Files explicitly targeted by the change
  interventionType: InterventionType; // write | refactor | delete | schema | etc.
}
```

### Output Schema

```typescript
{
  simulationId: string;
  predictedStateEmbedding?: number[];  // Latent vector (Phase 3+)
  confidenceScore: number;             // 0.0 – 1.0
  predictedScope: string[];            // Estimated affected files
  uncertainRegions: string[];          // Files where confidence < threshold
  predictedTestDelta: {
    gained: number;
    lost: number;
    unchanged: number;
  };
  estimatedRiskLevel: RiskLevel;
  simulationArtifactId: string;
}
```

### Behavior
- In Phase 2: applies rule-based heuristics to estimate scope and confidence
- In Phase 3: feeds the multimodal world state into the trained SE-JEPA predictor
- Produces a `SimulationResult` artifact linked to the baseline world state
- Returns a confidence score that is checked by the World-Model Governor before write approval

---

## Tool: `evaluate_counterfactual`

**Purpose**: Submit multiple alternative intervention proposals for parallel comparison. Returns the approach with the optimal predicted outcome.

**Phase**: 3 (planned)

> This is the core SE-JEPA evaluation tool. It allows the agent to navigate the optimization search space in imagination — evaluating competing approaches before committing to any of them.

### Input Schema

```typescript
{
  worldStateId: string;
  candidates: Array<{
    label: string;         // Branch label (A, B, C, ...)
    proposedDiff: string;
    strategy: BranchStrategy;
    targetFiles: string[];
  }>;
  costFunction?: {
    riskWeight: number;    // 0.0 – 1.0 — how much to penalize risk
    scopeWeight: number;   // 0.0 – 1.0 — how much to penalize blast radius
  };
}
```

### Output Schema

```typescript
{
  comparison: CounterfactualComparison;  // All branches, scored
  recommendedBranchLabel: string;        // The winning branch
  comparisonArtifactId: string;
}
```

### Behavior
- Dispatches all candidate branches in parallel to the simulation engine
- Evaluates each against the cost function
- Returns the branch with optimal predicted outcome
- Produces a `CounterfactualComparison` artifact

---

## Tool: `evaluate_simulation_gate`

**Purpose**: Submit a branch for evaluation against the simulation gate boundaries.

**Phase**: 5 (active)

### Input Schema

```typescript
{
  interventionId: string;     // ID of an existing, typed Intervention
  worldStateId: string;       // ID of the current world state to simulate from
  maxBranches?: number;       // Number of counterfactual branches to generate (default: 2)
}
```

### Output Schema

```typescript
{
  futureStateId: string;      // ID of the generated FutureState
  simulationArtifactId: string;
  recommendedBranchId: string;
  estimatedCompletionMs: number; // Expected simulation time for complex repos
}
```

### Behavior
- Dispatches to the active simulation engine (rule-based Phase 3, learned Phase 4+)
- Produces a `FutureState` with at least `maxBranches` candidate branches
- All branches produce `SimulationResult` artifacts
- Blocks until simulation is complete (or returns a job ID for async retrieval)

---

## Tool: `prediction_retrieve`

**Purpose**: Retrieve the simulation results for a specific intervention.

**Phase**: 4

### Input Schema

```typescript
{
  interventionId: string;
}
```

### Output Schema

```typescript
{
  found: boolean;
  futureState?: FutureState;
  simulationArtifacts?: Artifact[];
}
```

---

## Tool: `artifact_register`

**Purpose**: Register a new artifact in the Observatory Artifact Ledger.

**Phase**: 1 (active)

### Input Schema

```typescript
{
  artifact: Omit<Artifact, 'id' | 'hash'>; // ID and hash computed server-side
  rawContent: string;                        // Content to hash
}
```

### Output Schema

```typescript
{
  artifactId: string;
  hash: ArtifactHash;
  trustLevel: TrustLevel;
  registered: boolean;
  auditViolations: string[]; // Empty if clean
}
```

### Behavior
- Invokes the Artifact Auditor skill
- Computes SHA-256 hash of `rawContent`
- Validates structural completeness
- Assigns appropriate trust level
- Registers in the append-only ledger
- Returns registration confirmation

---

## Tool: `calibration_report`

**Purpose**: Retrieve the current prediction calibration metrics from the eval framework.

**Phase**: 4

### Input Schema

```typescript
{
  since?: string;   // ISO 8601 — report on interventions since this date
  riskLevel?: RiskLevel; // Filter by risk level
}
```

### Output Schema

```typescript
{
  totalInterventions: number;
  executedInterventions: number;
  predictionAccuracy: number;        // 0.0 – 1.0
  uncertaintyCalibration: number;    // 0.0 – 1.0
  meanConfidenceScore: number;
  interventionSuccessRate: number;
  deltaRecords: PredictionRecord[];  // All records in scope
}
```

---

## Error Handling

All MCP tools must return structured errors:

```typescript
{
  error: {
    code: string;   // e.g., "WORLD_STATE_NOT_FOUND", "SIMULATION_TIMEOUT", "CONFIDENCE_BELOW_THRESHOLD"
    message: string;
    context?: Record<string, unknown>;
  }
}
```

No tool may return an unstructured error or a 5xx HTTP response without a JSON body.

### Standard Error Codes

| Code | Trigger |
|---|---|
| `WORLD_STATE_NOT_FOUND` | `worldStateId` does not exist in the store |
| `WORLD_STATE_STALE` | Captured > 10 minutes ago |
| `SIMULATION_TIMEOUT` | Prediction engine did not respond in time |
| `CONFIDENCE_BELOW_THRESHOLD` | Simulation result confidence < threshold for risk level |
| `ARTIFACT_TAMPERED` | Hash mismatch on artifact retrieval |
| `BRANCH_COLLISION` | Two agents submitted conflicting diffs for the same files |

---

## Authentication (Phase 5)

In Phase 5, all MCP tool calls will require a bearer token associated with an authorized Observatory operator. The token is passed in the MCP call context, not in the tool input schema.
