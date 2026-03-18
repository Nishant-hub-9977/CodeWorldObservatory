# Architecture

> *System architecture of CodeWorld Observatory. This document describes layers, data flows, component responsibilities, and integration points.*

---

## Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Observatory UI                           │
│  (Next.js App Router · Multi-Panel Control Surface)         │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                                │
│  (Next.js Route Handlers · Typed JSON contracts)            │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                             │
│  WorldState Capturer · Intervention Planner · Sim Engine    │
├─────────────────────────────────────────────────────────────┤
│                    Model Layer                               │
│  TypeScript interfaces · Typed entities · Domain logic      │
├─────────────────────────────────────────────────────────────┤
│                    Skills Layer                              │
│  World-Model Governor · Counterfactual Planner              │
│  Artifact Auditor · Repo-State Capturer                     │
├─────────────────────────────────────────────────────────────┤
│                    SE-JEPA Proxy Layer (Phase 6)             │
│  Observation Encoder · Action Encoder · Future Mapper       │
├─────────────────────────────────────────────────────────────┤
│                    Experiment Memory (Phase 8)               │
│  Session Comparator · Dossier Generator · Longitudinal Trends│
├─────────────────────────────────────────────────────────────┤
│                    Research Export (Phase 10)                │
│  Brief Generator · Export Manifest · Briefing Snapshots     │
├─────────────────────────────────────────────────────────────┤
│                    Research Timeline (Phase 11)              │
│  Timeline Builder · Shift Detector · Narrative Playback     │
├─────────────────────────────────────────────────────────────┤
│                    Research Infrastructure (Phases 12-14)    │
│  Experiment Registry · Scenario Library · Dataset Store     │
│  Reproducibility Engine · Statistical Evaluator             │
├─────────────────────────────────────────────────────────────┤
│                    Benchmark Harness (Phase 7)              │
│  Simulation Request Builder · Simulation Runner · Rationale │
├─────────────────────────────────────────────────────────────┤
│                    MCP Bridge (Phase 5)                     │
│  Tool registry · Simulation dispatch · Gate Enforcement     │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
codeworld-observatory/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout + PageShell
│   ├── page.tsx            # Observatory homepage
│   ├── globals.css         # Design system tokens (dark/light)
│   └── api/                # Route handlers (Phase 1+)
│       ├── snapshot/       # World state capture
│       ├── interventions/  # Intervention management
│       └── artifacts/      # Artifact ledger
├── components/
│   ├── shell/
│   │   └── PageShell.tsx   # Root shell + nav + footer
│   ├── ui/
│   │   ├── SectionHeader.tsx
│   │   └── PrincipleCard.tsx
│   └── observatory/        # Observatory panel components
│       ├── ObservatoryPanel.tsx   # Base primitive
│       ├── WorldStatePanel.tsx
│       ├── InterventionsPanel.tsx
│       ├── FuturesPanel.tsx
│       ├── UncertaintyPanel.tsx
│       ├── PredictionRealityPanel.tsx
│       └── ArtifactLedgerPanel.tsx
├── lib/
│   ├── types/              # Core TypeScript interfaces
│   │   ├── world-state.ts
│   │   ├── intervention.ts
│   │   ├── future-state.ts
│   │   └── artifact.ts
│   ├── constants/
│   │   └── observatory.ts  # Named constants
│   ├── theme/
│   │   └── theme-provider.tsx # ThemeProvider + useTheme hook
│   ├── data/
│   │   └── mock-observatory-data.ts
│   └── services/           # Business logic (Phase 1+)
├── docs/                   # Documentation backbone
├── artifacts/              # Artifact ledger storage
├── prompts/                # Antigravity operating prompts
├── skills/                 # Antigravity skills
├── mcp/                    # MCP planning and specs
├── evals/                  # Evaluation framework
├── data/                   # Raw and processed data
├── scripts/                # Utility scripts
└── tests/                  # Test suite
```

---

## Data Flow: World State → UI

```
Repository on disk
    │
    ▼ [Phase 1: world-state-capturer]
WorldState snapshot (typed)
    │
    ▼ [API: /api/snapshot]
WorldStatePanel ──► Observatory UI
```

---

## Phase 1 — Live Sensing Layer

As of Phase 1, the following services are operational:

### `lib/services/world-state-capturer.ts`
Server-only Node.js module. Recursively walks the workspace using `fs.readdirSync`. Ignores standard noise directories (`node_modules`, `.next`, `.git`, `dist`, `build`, `coverage`). For each file: captures relative path, extension, byte size, and last-modified timestamp. Computes SHA-256 content digests for files ≤ 1 MB. Returns a `RepoSnapshot` — a fully typed, flat representation of the workspace structure.

### `lib/services/dependency-analyzer.ts`
Server-only module. Accepts the `RepoNode[]` list from the capturer. Filters to `.ts` / `.tsx` files. Extracts local relative imports using a pragmatic regex (no AST parser). Builds a directed edge list. Derives connectivity metrics: `mostConnected` (top 5 by edge count) and `orphanCandidates` (files with no import edges in either direction). Returns a `DependencyReport`.

### `app/api/snapshot/route.ts`
Next.js App Router GET route at `/api/snapshot`. Invokes the capturer and analyzer in sequence. Returns structured JSON. Handles all errors with a typed error response — never crashes silently.

### `components/observatory/WorldStatePanel.tsx`
Converted to a client component. Fetches `/api/snapshot` on mount. Displays: Repository Surface, Structural Composition, Dependency Signals, Recent Change Activity, and Observability Notes. Loading and error states are handled gracefully.

---

## Phase 2 — Intervention Planning Layer

As of Phase 2, the following services are operational:

### `lib/services/scope-analyzer.ts`
Server-only module. Accepts proposed target file paths and the live `DependencyReport` from Phase 1. Derives: first-order connected files from import edges, touched surface labels (API routes, service layer, type contracts, etc.), scope class (`isolated` / `local` / `cross-module` / `structural`), and a readable risk rationale from scoring factors including route involvement, shared service access, type contract scope, and target count.

### `lib/services/intervention-planner.ts`
Server-only deterministic 3-branch planner. Produces a `CounterfactualComparison` with three `InterventionBranch` objects: Branch A (service-first), Branch B (route-first), Branch C (minimal-touch). Each branch is built from a typed template system against real repo signals. Selects a preferred branch via heuristic scoring. Generates readable comparison notes. No LLM dependency — the planning is structural and deterministic.

### `app/api/interventions/route.ts`
Next.js App Router GET + POST route at `/api/interventions`. GET returns the canonical seed planning response. POST accepts `{ objective, targetFiles?, type?, context? }`, validates input, and returns a full `InterventionApiResponse`. Both invocations reuse Phase 1 live capture + analysis signals. All errors return structured JSON.

### `components/observatory/InterventionsPanel.tsx`
Converted to a client component. Fetches `/api/interventions` on mount. Displays: Intervention Objective with repo signal stats, three Candidate Branch cards (expand/collapse with rationale + observability limits), a Branch Comparison table (strategy / scope / risk / file radius / limits), and Counterfactual Notes with the planner's synthesis.

---

## Phase 3 — Futures + Uncertainty Foundation

As of Phase 3, the prediction and uncertainty heuristic layer is live:

### `lib/services/futures-generator.ts`
Server-only deterministic generator. Consumes intervention planning output and produces strongly-typed `BranchOutcomeProjection`s. Evaluates validation burden, instability zones, and overall execution readiness without relying on hallucinated model inference.

### `lib/services/uncertainty-analyzer.ts`
Server-only heuristic analyzer. Derives structured `UncertaintySignal`s from the scope constraint, execution bounds, and cross-cutting path touches limiting true observability.

### `app/api/futures/route.ts`
Next.js API route that coordinates the generator and returns a complete `FuturesApiResponse`.

### `FuturesPanel` & `UncertaintyPanel`
Both converted to live client components consuming the `/api/futures` endpoint. `FuturesPanel` renders predicted impacts with institutional sobriety. `UncertaintyPanel` categorizes bounded regions of uncertainty with severity signals mapping strictly to underlying scope complexities.

---

## Phase 4 — Prediction vs Reality + Artifact Ledger

As of Phase 4, the initial calibration loop is live:

### `lib/types/execution.ts` & `lib/types/artifact.ts`
Establishes strong types for `ExecutionRecord`, `ActualOutcome`, `PredictionRealityComparison`, and expands `ArtifactEntry` with verification statuses.

### `lib/services/prediction-reality-comparator.ts`
Compares a predicted `BranchOutcomeProjection` against an `ActualOutcome` executed in reality. It evaluates readiness, unpredicted fragile zones, and surface drift, assigning a formal `CalibrationResult` (`aligned`, `partially-aligned`, `divergent`, `insufficient-evidence`).

### `lib/services/execution-store.ts` & `lib/services/artifact-ledger.ts`
Provides local file-backed persistence for executions and artifacts, establishing the first empirical, append-only verification trail that outlives a single UI session.

### `app/api/executions/route.ts` & `app/api/artifacts/route.ts`
Exposes the stored records. The execution route handles generating the prediction-reality delta upon receiving a POST observation.

### `PredictionRealityPanel` & `ArtifactLedgerPanel`
Client components that render the audit trail. `PredictionRealityPanel` visualizes the empirical comparison between the futures projection and the actual outcome. `ArtifactLedgerPanel` renders the chronological, hashed trust instruments.

---

## Phase 5 — MCP Simulation Bridge & Governance Layer

Phase 5 establishes the first formal interface boundary allowing an agent to safely interact with the repository's internal simulation architecture.

### `lib/types/mcp.ts` & `lib/services/mcp-contracts.ts`
Formalizes the Model Context Protocol definitions (`capture_world_state`, `evaluate_simulation_gate`, etc.). This creates a typed, machine-readable inventory of what the repository allows an agent to request, bounded strictly by "observation" and "simulation" (no write execution).

### `lib/services/simulation-gate.ts`
The operational logic powering the `evaluate_simulation_gate` contract. It structurally audits the existence of required planning and simulation artifacts before returning a strict governance classification (`blocked`, `advisory-only`, `ready-for-reviewed-execution`).

### `skills/` Operations Upgrade
The agent skills (`world-model-governor`, `counterfactual-planner`, `repo-state-capturer`, `artifact-auditor`) are no longer philosophical text; they dictate explicit mandatory checks, prohibited behaviors (e.g., no code writing), and map to specific MCP contracts.

---

## Phase 6 — SE-JEPA Operational Prototype Layer

Phase 6 introduces the explicit architectural framing required by the SE-JEPA thesis, creating a structural proxy pipeline for future learned models.

### `lib/types/se-jepa.ts`
Establishes the core data structures matching the JEPA theory: `ObservationState`, `ActionRepresentation`, `PredictedFutureState`, `LatentStateDescriptor`, and `StateTransitionRecord`.

### `ObservationEncoder` & `ActionEncoder`
Structural proxies that map explicit repository state (`WorldState`) and interventions (`InterventionBranch`) into the normalized dimensional space required by the JEPA thesis (e.g., observability profiles, strategic intent).

### `StateTransitionChainer`
Stitches the empirical world models, the action plans, and the generated futures into a single coherent `StateTransitionRecord` that maps exactly to the equation: `ŝ = predict(s, z)`.

### `PrototypeMappingPanel`
A new UI component that visualizes this architectural transition chain, demonstrating Phase 6 as `STRUCTURAL-PROTOTYPE ACTIVE`.

---

## Phase 7 — Controlled Simulation Requests + Benchmark Harness

Phase 7 establishes explicit bounds on how counterfactual branches are evaluated against one another.

### `lib/types/simulation.ts`
Establishes the structured record types for empirical simulation: `SimulationRequest`, `SimulationResult`, `SimulationOutcomeClass`, and `BenchmarkHarnessRun`.

### `SimulationRunner` & `BenchmarkHarness`
Services that consume a Phase 3 futures projection and algorithmically derive comparative structural rankings. Validates risk profiles and explicitly gates `review-heavy` or `blocked-by-evidence` branches.

### `app/api/simulations` & `app/api/benchmarks`
Routes that manage session execution and harnessing. Strict invariance: these routes only produce structural evidence and never execute autonomous source writes.

### `BenchmarkHarnessPanel`
A research-grade UI component appending the Phase 7 comparison data to the Observatory dashboard.

---

## Phase 8 — Experiment Memory + Comparative Research Dossier Layer

Phase 8 introduces longitudinal memory, allowing the system to compare simulation and benchmark sessions over time to extract research-grade insights.

### `lib/types/research-memory.ts`
Establishes types for `ExperimentMemoryRecord`, `SessionComparisonRecord`, and `ResearchDossier`, shifting focus from single-session execution to multi-session trend analysis.

### `lib/services/experiment-memory.ts` & `session-comparator.ts`
Services that read the persisted artifact ledgers (simulations, benchmarks, and predictions) and aggregate them. They identify the most common structural governance constraints and strategy preferences over time.

### `lib/services/dossier-generator.ts`
A formal publishing engine that synthesizes the memory record into a structured `ResearchDossier` containing architectural insights, calibration trend summaries, and evidence accumulation metrics.

### `ResearchDossierPanel`
A dashboard UI element surfacing the longitudinal metrics without introducing hype or vanity stats.

---

## Phases 12-14 — Research Infrastructure Deepening

The Observatory now extends beyond timeline playback into a formal research operations substrate.

### `lib/services/experiment-registry.ts`
Maintains persistent experiment records under `artifacts/research/experiments/registry.json`. Each record stores a formal objective, explicit hypothesis, strategy class, lifecycle state, and links to snapshots, scenarios, simulations, benchmarks, and downstream artifacts.

### `lib/services/world-state-capture.ts`
Wraps the Phase 1 live capturer with durable historical persistence. It serializes repo structure, stores dependency maps, records key files, and writes durable state snapshots under `artifacts/research/world-state/`. These snapshots can be linked to experiments without altering the original Phase 1 sensing layer.

### `lib/services/scenario-library.ts` & `research-dataset-store.ts`
The scenario library provides canonical research frames for evaluating repository interventions. The dataset store packages experiment-linked simulations, benchmarks, and calibration records into deterministic dataset artifacts under `artifacts/research/datasets/`, preserving evidence lineage for later replay and review. Dataset artifacts are materialized on explicit write-side events, not generated implicitly by read routes.

### `lib/services/reproducibility-engine.ts` & `statistical-evaluator.ts`
The reproducibility engine reconstructs the stored evidence chain for a formal experiment and reports whether replay is full, partial, or blocked by insufficient evidence. In the current architecture, `full` replay means artifact-complete replay-package lineage and should not be implied by baseline snapshot presence alone or reinterpreted as exact historical reconstruction. The statistical evaluator computes deterministic weighted prediction accuracy, strategy success rates, Wilson confidence intervals, and small-sample maturity notes from persisted execution and simulation records.

### New API Surfaces
- `/api/experiments` and `/api/experiments/register` formalize experiment creation and retrieval
- `/api/world-state/snapshot` and `/api/world-state/history` expose durable historical capture
- `/api/scenarios` and `/api/datasets` surface scenario-linked dataset infrastructure
- `/api/research/replay` and `/api/research/statistics` expose reproducibility and evaluation summaries

### New Observatory Panels
- `ExperimentRegistryPanel` turns experiment registration and state capture into a first-class observatory workflow
- `ScenarioLibraryPanel` links formal experiments to canonical scenarios and dataset coverage
- `ResearchStatisticsPanel` presents replay readiness, prediction accuracy, and bounded confidence intervals

---

## Data Flow: Proposed Intervention → Write

```
Agent proposes Intervention
    │
    ▼ [Phase 2: intervention-planner]
InterventionScope + RiskLevel assigned
    │
    ▼ [Phase 3: simulation-engine]
SimulationResult artifact produced
    │  (confidence ≥ threshold?)
    ├─ NO  → Write blocked. Agent revises.
    └─ YES
        │
        ▼ [Approval gate]
    Human or agent approves
        │
        ▼ [Execution]
    Write applied to repo
        │
        ▼ [Phase 1: world-state-capturer]
    New WorldState captured
        │
        ▼ [Phase 4: evals]
    Prediction-reality delta computed → Artifact produced
```

---

## Component Responsibilities

### ObservatoryPanel (base primitive)
- Provides titled, status-badged panel wrapper
- No data fetching — purely presentational
- All data panels compose this primitive

### WorldStatePanel
- Displays current world state snapshot
- Phase 0: mock data
- Phase 1: live from `/api/snapshot`

### InterventionsPanel
- Lists proposed interventions with scope, risk, and simulation result
- Phase 0: mock data
- Phase 2: live from `/api/interventions`

### FuturesPanel
- Displays counterfactual branches with projected outcomes, validation burden, and Fragile Zones
- Phase 0: mock data
- Phase 3: live projection from `/api/futures`

### UncertaintyPanel
- Surfaces explicitly modeled limits on prediction confidence
- Phase 0: derived from mock futures
- Phase 3: live structural uncertainty from `/api/futures`

### PredictionRealityPanel
- Compares predicted futures to actual execution outcomes
- Phase 0: empty (no executed interventions)
- Phase 4: live empirical calibration data from `/api/executions`

### Phase 5 Signals
- Observes the new `Phase 5: MCP Simulation Bridge + Governance` status indicator.
- Indicates the system is operating under `ADVISORY` enforcement mode via MCP contracts.

---

## Skills Integration

Skills operate as Antigravity-native capability modules. Each skill defines:

- **Activation triggers**: conditions under which the skill should be invoked
- **Required inputs**: data the skill expects from the world model
- **Outputs**: artifacts or state mutations produced
- **Constraints**: invariants the skill must preserve

Skills interact with the service layer, not the UI. They are the agent's hands in the world.

---

## MCP Integration Point (Phase 4)

The MCP bridge will expose:

- `world_state_capture` — trigger a snapshot of the current repo
- `simulation_dispatch` — submit an intervention for simulation
- `prediction_retrieve` — fetch simulation results
- `artifact_register` — add an artifact to the ledger
- `calibration_report` — retrieve current prediction calibration metrics

All calls are logged, audited, and tied to the active artifact chain.

---

## Phase 9: Latent State Approximation Layer

Phase 9 introduces an explicit internal representational layer between raw observation and strategy selection.

### Architectural Extension

The SE-JEPA proxy chain is extended to:

```
Observation State
→ Latent Structural Descriptor (Phase 9)
→ Strategy Compatibility Assessment (Phase 9)
→ Strategy Representation
→ Predicted Future State
→ Actual Outcome
→ Calibration Delta
→ Transition Pattern Memory (Phase 9)
```

### Service Layer

| Service | Purpose |
|---|---|
| `latent-state-encoder.ts` | Derives typed `LatentRepoState` from live repo signals |
| `strategy-compatibility-analyzer.ts` | Assesses per-strategy fit against current latent conditions |
| `transition-pattern-analyzer.ts` | Detects recurring latent-state-to-strategy motifs |
| `latent-transition-chain.ts` | Extended SE-JEPA chain with latent descriptors |

### Representational Model

All new descriptors are **typed latent-state approximations** — compositional, deterministic, and auditable. They are not:
- Neural latent embeddings
- Trained JEPA vectors
- Statistical inference outputs
- ML-derived representations

Each descriptor (complexity, pressure, burden, friction, sufficiency) maps directly to observable structural signals.

### API Surface

- `/api/latent-state` — current latent structural state
- `/api/strategy-compatibility` — strategy compatibility matrix
- `/api/transition-patterns` — recurring transition motifs

### Panel Integration

Three new observatory panels surface Phase 9 data:
- `LatentStatePanel` — five structural descriptors with composite posture
- `StrategyCompatibilityPanel` — per-strategy compatibility matrix with reasoning
- `TransitionPatternsPanel` — historical transition motif analysis

---

## Phase 10: Research Export / Briefing Surface

Phase 10 introduces a frontier-lab-grade briefing synthesis surface and deterministic export pipeline.

### Architectural Extension

The Observatory data flow is extended to support briefing synthesis:

```
All Data Sources (World State, Benchmarks, Memory, Dossier, Latent State, Compatibility, Patterns)
→ Research Brief Generator (Phase 10)
→ ObservatoryBrief (structured briefing artifact)
→ Briefing Snapshot Writer (persistence)
→ Export Manifest Builder (SHA-256 hashed, auditable artifact package)
```

### Service Layer

| Service | Purpose |
|---|---|
| `research-brief-generator.ts` | Synthesizes structured brief from all data sources |
| `briefing-snapshot-writer.ts` | Persists briefings under `artifacts/research/briefings/` |
| `export-manifest-builder.ts` | Builds deterministic, SHA-256 hashed export manifests |

### Type System

`lib/types/research-export.ts` establishes:
- `ObservatoryBrief` — top-level briefing with sections, findings, constraints, and recommended steps
- `BriefSection` with `BriefEvidenceReference` for full evidence lineage
- `ExecutiveFinding` with severity classification
- `ConstraintRegister` documenting system boundaries
- `ExportManifest` with per-artifact SHA-256 hashes

### API Surface

- `/api/research/brief` — live synthesized briefing (GET)
- `/api/research/export` — persist briefing + build export manifest (POST), retrieve latest (GET)

### Panel Integration

Two new observatory panels surface Phase 10 data:
- `ResearchBriefPanel` — executive summary, findings, posture, sections, constraints, recommended next steps
- `ExportManifestPanel` — artifact table with SHA-256 hashes, evidence lineage, export metadata

---

## Phase 11: Comparative Research Timeline + Narrative Playback

Phase 11 introduces a deterministic research logbook layer that replays accumulated observatory history as a chronological timeline.

### Architectural Extension

```
Simulation Sessions + Benchmark Runs + Execution Comparisons
-> Research Timeline Builder (Phase 11)
-> Timeline Session Records
-> Strategy Shift Detection / Blocker Recurrence / Calibration Trajectory
-> Narrative Playback Events
```

### Service Layer

| Service | Purpose |
|---|---|
| `research-timeline-builder.ts` | Builds a chronological research timeline from persisted session artifacts |
| `strategy-shift-detector.ts` | Detects preferred-strategy changes across adjacent sessions |
| `blocker-pattern-detector.ts` | Aggregates recurring governance blockers with first/last seen timestamps |
| `calibration-trajectory-analyzer.ts` | Builds cumulative calibration movement from execution comparisons |

### API Surface

- `/api/research/timeline` - full deterministic timeline object
- `/api/research/timeline/export` - timeline plus narrative summary for reporting

### Panel Integration

`ResearchTimelinePanel` surfaces:
- chronological session playback
- strategy shift detection
- blocker recurrence
- calibration trajectory
- narrative event log

### Honesty Boundaries

Phase 11 does not invent historical world-state diffs. When only baseline snapshot references exist, the timeline states that limitation explicitly.

---

## Phase 17: Research Evaluation Semantics + Evidence-Weighted Comparative Analysis

Phase 17 extends the experiment-centered lineage model into a bounded comparison layer.

### Architectural Extension

```
Experiment Detail Builder + Replay Status + Statistical Evaluator
-> Evidence-Weighted Evaluator (Phase 17)
-> Experiment Evaluations + Comparison Highlights
-> Brief / Dossier / Timeline / Trends Consumers
```

### Service Layer

| Service | Purpose |
|---|---|
| `evidence-weighted-evaluator.ts` | Derives experiment comparison from persisted evidence completeness, empirical depth, calibration support, and replay maturity |
| `experiment-detail-builder.ts` | Remains the shared consumer composition center for evidence and evaluation |

### Honesty Boundaries

Phase 17 does not create a mystical score. Comparative weights remain prioritization aids only, subordinate to persisted evidence classes and explicit caveats.

---

## Phase 18: Evaluation Persistence + Comparative Research Surfaces

Phase 18 makes the Phase 17 comparison layer durable and inspectable without changing the observational contract of existing GET surfaces.

### Architectural Extension

```
Experiment Detail Builder + Evidence-Weighted Evaluator
-> Evaluation Snapshot Store (Phase 18 write-side only)
-> Persisted Evaluation Records + Drift Summaries
-> Comparative APIs / Export Manifest / Timeline Drift Surfaces
```

### Service Layer

| Service | Purpose |
|---|---|
| `evaluation-snapshot-store.ts` | Builds, persists, lists, and compares explicit evaluation snapshots |
| `export-manifest-builder.ts` | Includes persisted evaluation artifacts in export packages |

### API Surface

- `/api/research/evaluations` - read live plus latest persisted evaluation context (GET), persist an explicit evaluation snapshot (POST)
- `/api/research/comparisons` - bounded comparative portfolio and drift context (GET)

### Honesty Boundaries

Persisted evaluation records are interpretation artifacts. They capture how the observatory interpreted evidence at a moment in time, but they do not become stronger than the underlying replay, benchmark, execution, or dataset artifacts they summarize.

---

## Phase 19: Research Prioritization Engine

Phase 19 adds advisory-only research prioritization that ranks structural evidence, replay, calibration, and comparison gaps without drifting into causal claims or autonomous decision-making.

### Architectural Extension

```
Experiment Detail Builder + Evidence-Weighted Evaluator + Replay Status
-> Research Prioritization Engine (advisory ranking)
-> Brief / Dossier / Timeline / Export / Dedicated Priority Route
```

### Service Layer

| Service | Purpose |
|---|---|
| `research-prioritization-engine.ts` | Deterministic advisory-only gap ranking from persisted experiment evidence |
| `observatory-status.ts` | Single source of truth for phase, version, and descriptive labels |
| `observatory-key.ts` | Canonical key generation with category-specific builders for artifact, derived, and summary identity |

### API Surface

- `/api/research/priorities` — advisory-only prioritization context with bounded gap signals (GET)
- Prioritization context also consumed by `/api/research/brief`, `/api/research/dossier`, `/api/research/timeline`, and `/api/research/export`

### Priority Classes

- `evidence-deficient-but-promising`
- `replay-mature-but-empirically-shallow`
- `empirically-strong-but-calibration-limited`
- `comparison-limited`
- `saturation-emerging`

### Honesty Boundaries

Prioritization is interpretation, not execution. It ranks structural gaps only, does not imply causal proof, and does not act as a hidden write-side decision system. Priority signals can change as evaluation snapshots and evidence evolve.

---

## Phase 20: Priority Drift + Recommendation Governance

Phase 20 makes research prioritization historically traceable and wraps all priority recommendations with explicit governance constraints.

### Architectural Extension

```
Research Prioritization Engine + Most Recent Persisted Dossier
-> Priority Drift Analyzer (Phase 20)
-> PriorityDriftHistory (appeared / disappeared / level-changed / focus-shifted / class-stable)
-> Recommendation Governance (Phase 20)
-> GovernedRecommendation (advisory metadata + softened language)
-> Brief / Dossier / Timeline / Export / Dedicated Drift Route
```

### Service Layer

| Service | Purpose |
|---|---|
| `priority-drift-analyzer.ts` | Compares current ephemeral prioritization context against most recent persisted dossier's prioritization signals; detects appeared, disappeared, level-changed, and focus-shifted drifts |
| `recommendation-governance.ts` | Wraps priority signals with governance metadata (supporting/missing evidence classes, confidence limitation, advisory boundary, non-execution caveat); softens imperative language to conditional phrasing |

### Type System

`lib/types/research-priority-drift.ts` establishes:
- `PriorityDriftKind` — `appeared | disappeared | class-stable | level-changed | focus-shifted`
- `PriorityDriftRecord` — per-class drift record with change drivers and timestamps
- `PriorityDriftHistory` — aggregated drift analysis with summary and governance caveat
- `GovernedRecommendation` — recommendation text with supportingEvidenceClasses, missingEvidenceClasses, confidenceLimitation, advisoryBoundary, nonExecutionCaveat
- `RecommendationGovernanceContext` — collection of governed recommendations with governance boundary statement

### API Surface

- `/api/research/priority-drift` — drift analysis plus governance context (GET)
- Drift and governance context also consumed by `/api/research/brief`, `/api/research/dossier`, `/api/research/timeline`, and `/api/research/export`

### Consumer Integration

- **Brief**: Includes drift summary in executive summary; carries `priorityDrift` and `recommendationGovernance` fields
- **Dossier**: Section renamed from `nextResearchPriorities` to `advisoryResearchGaps`; all recommendedFocus text softened via governance layer; governance note added to known limits
- **Timeline**: Priority drift events added to narrative playback; drift metric card added
- **Export Manifest**: `priorityDriftSummary` and `governanceSummary` fields added; two new integrity guarantees

### UI Hardening

- Brief panel: heading changed to "Research Prioritization (Advisory Only)"; inline caveat "Advisory — not execution authority" on priority cards
- Dossier panel: inline caveat "Advisory — bounded by current evidence only" on prioritization blocks
- Timeline panel: dedicated Priority Drift section with drift records and change driver details

### Honesty Boundaries

Drift detection compares the current ephemeral prioritization context against the most recent persisted dossier snapshot. It does not invent historical drift sequences, does not imply causal explanation for why priorities changed, and does not treat drift as evidence of progress or regression. Governed recommendations must never use imperative verbs and must carry explicit advisory boundaries.

---

## Phase 21: Historical Priority Ledger + Comparative Governance History

Phase 21 makes prioritization history durable across time and introduces longitudinal governance analysis over multiple persisted snapshots.

### Architectural Extension

```
Priority History Store (write-side-only persistence)
-> Persisted PriorityHistoryRecord artifacts (artifacts/research/priorities/)
-> Priority History Analyzer (read-side longitudinal analysis)
-> ChronicityPattern + PostureTrend + GovernanceEvolution
-> Brief / Dossier / Timeline / Export Consumers
```

### Service Layer

| Service | Purpose |
|---|---|
| `priority-history-store.ts` | Write-side-only persistence for historical priority records under `artifacts/research/priorities/`. Records are created only on explicit POST, never on GET. |
| `priority-history-analyzer.ts` | Read-side longitudinal analysis: chronicity patterns (persistent, intermittent, resolved, recent, single-snapshot), posture trends (stable, escalating, de-escalating, oscillating), governance evolution narratives, stability assessment |

### Type System

`lib/types/research-priority-history.ts` establishes:
- `PriorityHistoryRecord` — full prioritization + governance snapshot at a point in time
- `PriorityClassHistoryEntry` — flattened per-class view at one snapshot
- `ChronicityLabel` — `persistent | intermittent | resolved | recent | single-snapshot`
- `PostureTrend` — `stable | escalating | de-escalating | oscillating | insufficient-history`
- `PriorityChronicityPattern` — per-class pattern with narrative and evidence gap persistence
- `GovernanceHistorySummary` — aggregated summary with evolution narrative and stability assessment

### API Surface

- `/api/research/priority-history` — GET: observational read of persisted history + bounded summaries; POST: explicit snapshot creation (the only write path)
- Priority history summaries also consumed by `/api/research/brief`, `/api/research/timeline`, and `/api/research/export`

### Consumer Integration

- **Brief**: Includes priority history snapshot count and stability assessment in the prioritization section
- **Timeline**: Priority History section with chronicity patterns and posture trends; History metric card
- **Export Manifest**: `priorityHistorySummary` field; integrity guarantee about interpretation snapshots

### Honesty Boundaries

Priority history records are interpretation snapshots. They capture how the observatory prioritized structural gaps at a specific moment. Repeated appearance of a priority class across snapshots indicates persistent structural posture, not validated truth. Chronicity does not strengthen claims beyond the underlying experiment, replay, or calibration artifacts. The analyzer does not infer hidden causes, validate recommendations through repetition, or imply that persistent priorities are more correct than transient ones.

---

## Phase 22: Priority Snapshot Automation + Historical Comparison Surfaces

Phase 22 makes priority-history creation easier through co-creation with export writes, and introduces richer historical comparison: pairwise snapshot transitions, per-experiment stability, and signal direction classification.

### Architectural Extension

```
Export POST
-> Export Snapshot Coordinator (co-creates priority-history snapshot)
-> Priority History Store (persist)
-> Snapshot Comparator (read-side pairwise comparison)
-> PairwiseSnapshotComparison + ExperimentPriorityStability + SignalDirections
-> Brief / Timeline / Export Consumers
```

### Service Layer

| Service | Purpose |
|---|---|
| `export-snapshot-coordinator.ts` | Co-creates a priority-history snapshot alongside export writes. Invoked only from the export POST handler — no background, no GET-triggered writes. |
| `snapshot-comparator.ts` | Read-side pairwise comparison across consecutive snapshots: class transitions (appeared, disappeared, level-changed, stable), per-experiment advisory stability, evidence gap deltas, signal direction classification (emerging, weakening, persistent). |

### Type System

`lib/types/research-priority-history.ts` extends with:
- `SnapshotTransitionKind` — `appeared | disappeared | level-changed | stable`
- `SnapshotClassTransition` — per-class transition with evidence gap delta and narrative
- `PairwiseSnapshotComparison` — consecutive pair comparison summary
- `ExperimentPriorityStability` — per-experiment advisory stability (stable, variable, insufficient-history)
- `SnapshotComparisonSummary` — full comparison summary with emergingSignals, weakeningSignals, persistentSignals

### API Surface

- `/api/research/priority-history` — GET now includes `snapshotComparisons` when ≥2 snapshots exist
- Export POST now co-creates priority-history snapshots via ExportSnapshotCoordinator
- Snapshot comparisons also consumed by `/api/research/brief`, `/api/research/timeline`, and `/api/research/export`

### Consumer Integration

- **Brief**: Shows comparison signals (persistent, emerging) below priority history line
- **Timeline**: Snapshot Comparisons section with experiment stability cards and signal direction summaries; Comparisons metric card
- **Export Manifest**: `snapshotComparisons` field; integrity guarantee about advisory-posture changes

### Honesty Boundaries

Snapshot comparisons describe structural advisory-posture changes between consecutive snapshots. They do not imply research progress, regression, or causal direction. Per-experiment stability metrics describe advisory-level consistency, not truth confirmation. Signal direction classification is based on presence in snapshot halves, not on validated research trajectory. Snapshot automation is explicit and governed — records are created only on POST, never on GET.

## Phase 23: Comparative Governance Synthesis Layer

Phase 23 unifies the five previously fragmented governance stories — prioritization, drift, history, snapshot comparison, and recommendation governance — into a single comparative governance synthesis. This is a closure-conditioning phase: coherence over feature count.

### Architectural Extension

```
Prioritization Context ──┐
Priority Drift ───────────┤
Recommendation Governance ┤──> ComparativeGovernanceSynthesizer (read-only)
Priority History Summary ─┤        ↓
Snapshot Comparisons ─────┘    ComparativeGovernanceSynthesis
                                   ↓
                   Brief / Timeline / Export / Dossier / Experiment Consumers
```

### Service Layer

| Service | Purpose |
|---|---|
| `comparative-governance-synthesizer.ts` | Read-only synthesis. Merges all governance-producing subsystems into one `ComparativeGovernanceSynthesis` object: synthesized signals with posture classification, evidence limitations, canonical governance boundaries, posture assessment, and a single governance caveat. Never creates, writes, or persists data. |

### Type System

`lib/types/governance-synthesis.ts` introduces:
- `SignalPosture` — `persistent-stable | persistent-escalating | persistent-de-escalating | persistent-oscillating | recent | weakening | intermittent | single-observation | current-only`
- `SynthesizedAdvisorySignal` — per-class signal with posture, drift context, history context, comparison context, experiment stability, and narrative
- `EvidenceLimitationSummary` — chronic gaps, current gaps, comparison-limited areas, under-evidenced experiments
- `GovernanceBoundaryStatement` — canonical governance boundary text (advisory-only, no execution authority, no causal proof, no certainty inflation, no truth from repetition, plus domain-specific boundaries)
- `ComparativeGovernanceSynthesis` — top-level synthesis object with signals, evidence limitations, governance boundaries, narratives, and counts

### Consumer Integration

- **Brief**: `governanceSynthesis` field. UI shows posture assessment, persistent/unstable/recent/weakening signal classifications, evidence limitation narrative, and canonical governance caveat
- **Timeline**: `governanceSynthesis` field. UI shows Governance Synthesis section with per-signal posture cards and evidence limitation narrative
- **Export Manifest**: `governanceSynthesis` field. `integrityGuarantees` consolidated from 8 items (3 structural + 5 governance duplicates) to 4 items (3 structural + 1 reference to synthesis). UI renders governance synthesis posture, signal classifications, and limitation narrative
- **Dossier**: `governanceSynthesis` field. DossierGenerator calls the full governance chain (drift, recommendation governance, history, comparisons, synthesis). UI shows Governance Synthesis (Advisory) section with posture assessment, per-signal posture cards, evidence limitations, and canonical governance caveat
- **Experiment Registry**: `GET /api/research/governance-synthesis` supplies per-experiment advisory signals. ExperimentRegistryPanel cross-references experiment ID against synthesis signals and renders a Governance Advisory section with signal posture, narrative, stability label, and advisory-only caveat

### Fragmentation Resolved

Phase 23 resolved five specific fragmentation blockers:
1. **Fragmented governance story**: Five separate governance objects assembled independently → one shared synthesis
2. **Semantic inconsistency**: Eight caveat field names (`caveat`, `caveats`, `prioritizationCaveat`, `governanceCaveat`, `comparisonCaveat`, `doctrineCaveat`, `nonExecutionCaveat`, `reproducibilityCaveat`) → canonical `governanceCaveat` on synthesis
3. **Duplicated limitation language**: "Persistent ≠ Correct" repeated 3 times, "Descriptive Not Causal" repeated 3+ times → centralized in `GovernanceBoundaryStatement`
4. **Temporal signals without synthesis hierarchy**: Drift, history, and comparison signals presented adjacently without explaining how they relate → `SynthesizedAdvisorySignal` integrates all dimensions per priority class
5. **Closure risk from additive sprawl**: Export `integrityGuarantees` had 5 governance duplicate items → consolidated to single synthesis reference

### Honesty Boundaries

Governance synthesis integrates descriptive signals from multiple sources without inflating certainty. Persistent signals reflect structural recurrence, not validated truth. No signal category implies execution authority, causal proof, certainty, or hidden write-side decision-making. The synthesis does not create new data — it reads and merges what already exists.
