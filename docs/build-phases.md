# Build Phases

> *The twenty-three-phase roadmap for CodeWorld Observatory (Phases 0–22).*
> *Each phase is gated on verifiable completion of the preceding phase.*

---

## Overview

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation Scaffold | ✅ Complete |
| 1 | State Capture Engine | ✅ Complete |
| 2 | Intervention Planner | ✅ Complete |
| 3 | Simulation Engine / Futures Foundation | ✅ Complete |
| 4 | Evaluation Framework / Calibration | ✅ Complete |
| 5 | MCP Simulation Bridge + Governance | ✅ Complete |
| 6 | Operational SE-JEPA Abstract Layer | ✅ Complete |
| 7 | Controlled Benchmarks & Simulation Hooks | ✅ Complete |
| 8 | Experiment Memory & Research Dossiers | ✅ Complete |
| 9 | Latent State Approximation | ✅ Complete |
| 10 | Research Export / Briefing Surface | ✅ Complete |
| 11 | Comparative Research Timeline + Narrative Playback | ✅ Complete |
| 12 | Experiment Registry + Historical State Capture | ✅ Complete |
| 13 | Scenario Library + Dataset Infrastructure | ✅ Complete |
| 14 | Reproducibility + Statistical Evaluation | ✅ Complete |
| 15 | Experiment Lineage + Replay Package Binding | ✅ Complete |
| 16 | Replay-Aware Research Consumers + Experiment Detail Surface | ✅ Complete |
| 17 | Research Evaluation Semantics + Evidence-Weighted Comparative Analysis | ✅ Complete |
| 18 | Evaluation Persistence + Comparative Research Surfaces | ✅ Complete |
| 19 | Research Prioritization Engine | ✅ Complete |
| 20 | Priority Drift + Recommendation Governance | ✅ Complete |
| 21 | Historical Priority Ledger + Comparative Governance History | ✅ Complete |
| 22 | Priority Snapshot Automation + Historical Comparison Surfaces | ✅ Complete |
| 23 | Comparative Governance Synthesis + Theme Architecture | ✅ Complete |

---

## Phase 0 — Foundation Scaffold

**Goal**: Create the complete, disciplined project foundation.

**Deliverables**:
- All top-level directories created with clear purpose
- Documentation backbone: constitution, charter, thesis, law, SE-JEPA mapping, UI system, architecture
- Full TypeScript type system for all core entities
- Next.js app shell with dark institutional design
- Multi-panel observatory UI (mock data)
- Four skill SKILL.md drafts
- MCP planning structure
- Eval framework skeleton
- Artifact ledger scaffold

**Gate Criteria**:
- [ ] `npm run dev` succeeds with no type errors
- [ ] All foundational observatory panels render with correct mock data
- [ ] All docs are substantive (no placeholder text)
- [ ] All type files are complete and internally consistent
- [ ] Skills and MCP directories are structured and documented

---

## Phase 1 — State Capture Engine

**Goal**: Replace mock world state with live, verified world-state snapshots.

**Deliverables**:
- `lib/services/world-state-capturer.ts` — file tree walker, content hasher, metadata aggregator
- `lib/services/dependency-analyzer.ts` — static dependency graph construction
- `app/api/snapshot/route.ts` — REST endpoint returning typed `WorldState`
- `tests/world-state-capturer.test.ts` — unit tests with verified fixtures
- Updated `WorldStatePanel` consuming live data

**Gate Criteria**:
- [x] API returns valid `RepoSnapshot` for the repo itself (self-capture)
- [x] File tree walk correctly ignores `node_modules`, `.next`, `.git`, etc.
- [x] Dependency graph represents local TS/TSX import structure
- [ ] All unit tests pass (deferred to post-Phase-1 pass)
- [x] `WorldStatePanel` renders live workspace data
- [x] `/api/snapshot` returns structured JSON with no crashes

---

## Phase 2 — Intervention Planner

**Goal**: Enable typed intervention proposals with scope analysis and risk classification.

**Deliverables**:
- `lib/services/intervention-planner.ts` — intervention creation, scope analysis, risk scoring
- `lib/services/scope-analyzer.ts` — static analysis of intervention scope and estimated radius
- Intervention API routes
- `InterventionsPanel` consuming live proposed interventions
- Agent skill: `counterfactual-planner` (first real implementation beyond SKILL.md)

**Gate Criteria**:
- [x] Typed intervention domain established (`InterventionBranch`, `CounterfactualComparison`, `ScopeImpact`, etc.)
- [x] Scope analysis derives first-order connected files from live dependency graph
- [x] Risk scoring is grounded in repo structure (route involvement, service layer, type contracts)
- [x] Intervention planner produces 3 meaningfully distinct candidate branches
- [x] `/api/interventions` returns structured branch planning data
- [x] `InterventionsPanel` renders live candidate branches with comparison table
- [x] Agents can propose typed interventions via the POST endpoint (UI flow deferred to Phase 4)
- [x] Counterfactual Planner skill is operational

---

## Phase 3 — Simulation Engine

**Goal**: Implement prediction-before-write as a real computational step.

**Deliverables**:
- `lib/services/simulation-engine.ts` — rule-based prediction engine (Phase 3a)
- `lib/services/prediction-model.ts` — learned SE-JEPA predictor (Phase 3b)
- Confidence scoring per intervention
- Uncertainty surface computation
- `FuturesPanel` and `UncertaintyPanel` consuming live predictions
- `SimulationResult` artifacts produced for every intervention

**Gate Criteria**:
- [x] `lib/types/future-state.ts` implements robust prediction entities
- [x] Futures are visible without relying on hallucinated statistics
- [x] Uncertainty limits are cleanly quantified and displayed in the `UncertaintyPanel`
- [ ] The full runtime simulation completes before write (Phase 3b deferred)
- [x] The Simulation-Before-Write Law is enforced at the API level (Conceptually enforced for UI rendering)
- [x] All simulations produce persisted artifacts

---

## Phase 4 — Evaluation Framework

**Goal**: Close the prediction-reality loop with formal metrics, execution recording, and artifact calibration.

**Deliverables**:
- Prediction-reality comparator service
- Local artifact ledger persistence
- Execution record persistence
- `PredictionRealityPanel` showing live calibration summaries
- `ArtifactLedgerPanel` showing live artifact trails

**Gate Criteria**:
- [x] Typed `ExecutionRecord` and `PredictionRealityComparison` entities established
- [x] `ArtifactLedger` persists hashed trace records locally
- [x] Executed interventions produce a prediction-reality delta automatically
- [x] `PredictionRealityPanel` renders alignment/divergence visually without fake statistics
- [x] `ArtifactLedgerPanel` renders immutable audit trail

---

## Phase 5: MCP Simulation Bridge + Governance Layer

**Status**: **Complete**

**Goal**: Prepare the system for safe, formal agentic interaction by exposing observatory capabilities as typed MCP tools and strictly defining skill operations.

**Deliverables**:
- Formal MCP Contract Registry (`/api/mcp/contracts`)
- Evaluative Simulation Gate (`/api/mcp/evaluate`)
- Upgraded, operationally strict `skills/` lawbooks
- Minimal UI status indicators reflecting governance mode

**Gate Criteria**:
- [x] Live route returning structured JSON of available MCP tools
- [x] Simulation gate successfully classifies branch states
- [x] Skill files read as explicit, operational directives forbidding autonomous writes
- [x] System remains non-autonomous and audit-focused

## Phase 6 — SE-JEPA Operational Prototype Layer

**Goal**: Model the internal structures of Yann LeCun's JEPA architecture as software engineering proxies.

**Deliverables**:
- `lib/types/se-jepa.ts` — Types for observations, actions, predictions
- Explicit API exposing transition records
- Visual UI representing the prototype mapping

**Gate Criteria**:
- [x] Prototype mapping does not hallucinate ML implementation
- [x] UI visualizes state mapping accurately

---

## Phase 7: Controlled Simulation Requests + Benchmark Harness

**Status**: **Complete**

**Goal**: Create a formalized evaluation harness for counterfactual branches, producing rank-ordered structural intelligence.

**Deliverables**:
- Formal `SimulationRequest` payload builder
- Bounded, safe `SimulationRunner` and session output
- `BenchmarkHarness` ranking and rationale engine
- Session data persistence layer
- Validation UI surface

**Gate Criteria**:
- [x] Core Types implemented (`SimulationRequest`, `SimulationOutcomeClass`)
- [x] Runner accurately filters branch outcomes
- [x] Benchmark rankings prioritize structural safety and block out-of-bounds uncertainty
- [x] API outputs structured JSON results
- [x] Artifacts stored locally without database overhead
- [x] Restrained instrumentation UI surface integrated

---

## Phase 8 — Experiment Memory & Research Dossiers

**Status**: **Complete**

**Goal**: Establish a longitudinal memory layer capable of comparing simulation sessions over time to generate research dossiers.

**Deliverables**:
- `lib/types/research-memory.ts`
- `lib/services/experiment-memory.ts` and `session-comparator.ts`
- `lib/services/dossier-generator.ts`
- `/api/research/memory` and `/api/research/dossier` routes
- `ResearchDossierPanel` consuming aggregated trends

**Gate Criteria**:
- [x] Experiment memory aggregates sessions coherently
- [x] API returns structured cross-session data
- [x] Dossier generation succeeds and produces formal research artifacts
- [x] UI exposes a restrained comparative research surface
- [ ] No fabricated statistical claims

---

## Phase 9 — Latent State Approximation + Strategy Identity Stabilization

**Status**: **Complete**

**Goal**: Strengthen the internal representational layer by introducing explicit typed latent structural descriptors for repository state and stable strategy-state compatibility reasoning.

**Honesty Constraint**: All representations are typed latent-state approximations — not neural embeddings, not trained JEPA parameters, not inferred latent variables.

**Deliverables**:
- `lib/types/latent-state.ts` — `LatentRepoState`, `StructuralComplexityDescriptor`, `DependencyPressureDescriptor`, `ValidationBurdenDescriptor`, `GovernanceFrictionDescriptor`, `EvidenceSufficiencyDescriptor`, `StrategyCompatibilityAssessment`, `TransitionPatternRecord`, `LatentStateTransitionSummary`
- `lib/services/latent-state-encoder.ts` — deterministic derivation of typed latent structural state
- `lib/services/strategy-compatibility-analyzer.ts` — per-strategy compatibility assessment against current latent state
- `lib/services/transition-pattern-analyzer.ts` — recurring latent-state-to-strategy motif detection
- `lib/services/latent-transition-chain.ts` — extended SE-JEPA chain with latent descriptors
- `/api/latent-state`, `/api/strategy-compatibility`, `/api/transition-patterns` routes
- `LatentStatePanel`, `StrategyCompatibilityPanel`, `TransitionPatternsPanel` observatory panels

**Gate Criteria**:
- [x] Latent state encoder derives from live repo signals — not placeholders
- [x] Strategy compatibility uses bounded architectural reasoning — no fake classifiers
- [x] Transition patterns are derived from historical experiment data
- [x] All API routes return typed, deterministic responses
- [x] All panels render cleanly with loading/error/empty states
- [x] No regression in Phases 1–8
- [ ] No fabricated ML or neural claims

---

## Phase 10 — Research Export / Briefing Surface

**Status**: **Complete**

**Goal**: Transform the Observatory’s accumulated structural intelligence into a frontier-lab-grade briefing surface with deterministic, auditable export capabilities and full evidence lineage.

**Honesty Constraint**: Briefings synthesize from deterministic structural signals. No learned model is active. Confidence labels reflect signal coverage, not probabilistic certainty.

**Deliverables**:
- `lib/types/research-export.ts` — `ObservatoryBrief`, `BriefSection`, `BriefEvidenceReference`, `ExecutiveFinding`, `ConstraintRegister`, `RecommendedNextStep`, `ResearchSummaryCard`, `ExportArtifactRecord`, `ExportManifest`
- `lib/services/research-brief-generator.ts` — synthesizes structured brief from all data sources (world state, benchmarks, memory, dossier, latent state, compatibility, transition patterns)
- `lib/services/briefing-snapshot-writer.ts` — persists briefings under `artifacts/research/briefings/`
- `lib/services/export-manifest-builder.ts` — deterministic export manifest with SHA-256 artifact hashes and evidence lineage
- `/api/research/brief` and `/api/research/export` routes
- `ResearchBriefPanel` and `ExportManifestPanel` observatory panels

**Gate Criteria**:
- [x] Brief generator synthesizes from all available data sources — not placeholders
- [x] Export manifest includes SHA-256 hashes for all persisted artifacts
- [x] Evidence lineage traces from brief sections back to source data
- [x] Constraint register documents system boundaries explicitly
- [x] All API routes return typed, deterministic responses
- [x] All panels render cleanly with loading/error/empty states
- [x] No regression in Phases 1–9
- [ ] No fabricated ML or probabilistic claims

---

## Phase 11 — Comparative Research Timeline + Narrative Playback

**Status**: **Complete**

**Goal**: Surface the observatory's chronological research history as a deterministic timeline showing strategy preference changes, blocker recurrence, calibration movement, and readable narrative playback.

**Honesty Constraint**: Timeline playback reorders and summarizes persisted evidence only. It does not reconstruct missing historical world-state diffs or infer causal explanations beyond the stored record.

**Deliverables**:
- `lib/types/research-timeline.ts` - `ResearchTimeline`, `TimelineSessionRecord`, `TimelineStrategyShift`, `TimelineBlockerPattern`, `TimelineCalibrationTrajectory`, `TimelineNarrativeEvent`
- `lib/services/research-timeline-builder.ts` - deterministic assembly of chronological timeline state
- `lib/services/strategy-shift-detector.ts`, `blocker-pattern-detector.ts`, `calibration-trajectory-analyzer.ts`
- `/api/research/timeline` and `/api/research/timeline/export` routes
- `ResearchTimelinePanel` observatory panel
- `docs/research-timeline-model.md`

**Gate Criteria**:
- [x] Timeline output preserves chronological session ordering
- [x] Strategy shifts derive from recorded benchmark or session evidence
- [x] Recurring governance blockers are surfaced with first-seen and last-seen timestamps
- [x] Calibration trajectory is built from persisted execution comparisons
- [x] Timeline playback avoids speculative world-state claims
- [x] API routes return typed, deterministic responses
- [x] No regression in Phases 1-10

---

## Phase 12 — Experiment Registry + Historical State Capture

**Status**: **Complete**

**Goal**: Introduce formal experiment registration and durable world-state history so research work can be traced from objective and hypothesis through repository context snapshots.

**Honesty Constraint**: Historical state capture stores deterministic repo structure and dependency evidence only. It does not claim semantic diffs, runtime causality, or implicit intent beyond the captured artifact record.

**Deliverables**:
- `lib/types/experiment-registry.ts` - `ExperimentRecord`, `ExperimentObjective`, `ExperimentHypothesis`, `WorldStateSnapshotRecord`
- `lib/services/experiment-registry.ts` - persistent experiment registration and linkage updates
- `lib/services/world-state-capture.ts` - formal snapshot persistence and experiment-linked history retrieval
- `/api/experiments`, `/api/experiments/register`, `/api/experiments/[id]`
- `/api/world-state/snapshot`, `/api/world-state/history`
- `ExperimentRegistryPanel` observatory panel

**Gate Criteria**:
- [x] Experiments persist objective, hypothesis, strategy, and lifecycle status
- [x] Historical state snapshots persist file-structure and dependency evidence deterministically
- [x] Snapshots can be linked back to formal experiment records
- [x] API routes return typed, deterministic responses
- [x] Panel supports registration, historical capture, and empty/error states

---

## Phase 13 — Scenario Library + Dataset Infrastructure

**Status**: **Complete**

**Goal**: Establish canonical research scenarios and dataset artifacts so experiments can be grouped under reusable evaluation frames with repeatable evidence packaging.

**Honesty Constraint**: Scenario records are curated frames for evaluation, not learned world models. Dataset summaries surface only persisted simulation, benchmark, and calibration artifacts actually present in the repository.

**Deliverables**:
- `lib/types/scenario.ts` and `lib/types/research-dataset.ts`
- `lib/services/scenario-library.ts` and `lib/services/research-dataset-store.ts`
- `/api/scenarios`, `/api/scenarios/library`, `/api/datasets`, `/api/datasets/[id]`
- `ScenarioLibraryPanel` observatory panel

**Gate Criteria**:
- [x] Scenario library provides stable canonical research frames
- [x] Experiments can be linked to scenarios without mutating prior evidence
- [x] Dataset artifacts package simulation, benchmark, and calibration references deterministically
- [x] API routes return typed, deterministic responses
- [x] Panel surfaces scenario assignment and dataset coverage without placeholder claims

---

## Phase 14 — Reproducibility + Statistical Evaluation

**Status**: **Complete**

**Goal**: Add reproducibility summaries and deterministic statistical evaluation so the Observatory can report replay readiness, prediction accuracy, and strategy performance with explicit evidence limits.

**Honesty Constraint**: Reproducibility surfaces only reconstruct stored evidence chains. If branch inputs or supporting artifacts are missing, the system must report partial or insufficient replayability rather than implying full reproduction.

**Hardening Note**: Dataset read paths must remain non-mutating, full replay must remain reserved for explicit replay-package lineage, and statistical intervals must be framed as descriptive rather than mature when sample sizes are small.

**Deliverables**:
- `lib/services/reproducibility-engine.ts` and `lib/services/statistical-evaluator.ts`
- `/api/research/replay` and `/api/research/statistics`
- `ResearchStatisticsPanel` observatory panel
- `docs/reproducibility-model.md`

**Gate Criteria**:
- [x] Replay service reports evidence-backed replayability rather than speculative reproducibility
- [x] Prediction accuracy and strategy success metrics are derived from persisted artifacts only
- [x] Confidence intervals are deterministic and bounded
- [x] API routes return typed, deterministic responses
- [x] Panel surfaces metrics, replay status, and epistemic limits clearly

---

## Phase 15 — Experiment-to-Simulation / Benchmark Lineage Binding

**Status**: **Complete**

**Goal**: Bind experiment records directly to simulation creation, benchmark evaluation, execution evidence, and replay package assembly so replayability upgrades only on persisted evidence chains.

**Honesty Constraint**: Replay-package assembly must happen on write-side events, experiment detail hydration must reflect stored lineage rather than inferred links, and `full` replayability remains reserved for experiments with baseline, simulation, benchmark, and execution evidence attached.

**Deliverables**:
- expanded lineage fields across experiment, simulation, execution, and artifact contracts
- `lib/services/replay-package-builder.ts`
- experiment-aware `/api/simulations`, `/api/benchmarks`, `/api/executions`, `/api/experiments/[id]`, and `/api/research/replay`
- observatory replay panel wording updated to expose replay-package status explicitly

**Gate Criteria**:
- [x] Experiment-linked simulation sessions persist `experimentId` lineage at creation time
- [x] Benchmark runs inherit experiment lineage from linked simulation sessions
- [x] Execution evidence and comparison artifacts can be attached directly to experiments
- [x] Replay packages materialize from persisted lineage artifacts rather than read-time inference
- [x] Replayability upgrades from `insufficient-evidence` to `partial` to `full` only when the corresponding evidence chain exists

---

## Phase 16 — Replay-Aware Research Consumers + Experiment Detail Surface

**Status**: **Complete**

**Goal**: Bind the replay-package and lineage model into the research-consumption surfaces so dossier, timeline, briefing, export, and experiment detail all consume the same evidence-grounded chain.

**Honesty Constraint**: Read consumers must stay observational, status vocabulary must remain uniform across backend and surface layers, and `full` continues to mean artifact-complete replay-package lineage rather than exact historical reconstruction.

**Deliverables**:
- shared experiment detail consumer builder reused by detail route and research consumers
- replay-aware dossier, briefing, timeline, and export manifest integration
- replay transition surfacing in timeline consumers
- evidence-first experiment detail surface in the observatory UI

**Gate Criteria**:
- [x] Experiment detail route returns replay status, lineage status, dataset linkage, replay packages, and evidence caveats from persisted artifacts only
- [x] Dossier, brief, timeline, and export surfaces consume replay maturity coherently
- [x] Dossier GET remains observational and does not silently materialize persisted artifacts
- [x] Export manifest includes replay-aware artifact classes and replay status context
- [x] UI wording preserves the distinction between artifact completeness and exact historical reconstruction

---

## Phase 17 — Research Evaluation Semantics + Evidence-Weighted Comparative Analysis

**Status**: **Complete**

**Goal**: Introduce experiment-centered comparison semantics that rank persisted evidence quality and empirical depth without overstating replay certainty, causal proof, or scientific maturity.

**Honesty Constraint**: Comparison must remain decomposable and evidence-grounded. Read paths stay observational, `full` continues to mean artifact-complete replay-package lineage, and comparative leaders must never be described as stronger than their attached artifacts justify.

**Deliverables**:
- shared evidence-weighted experiment evaluator reused by experiment detail, briefing, timeline, trends, and dossier consumers
- experiment evaluation summaries and bounded comparison highlights
- strategy, calibration, replay, and evidence-completeness semantics surfaced together rather than in fragmented session-only narratives
- documentation updates that preserve replay doctrine and explain the comparison caveat explicitly

**Gate Criteria**:
- [x] Experiment detail surface exposes bounded experiment evaluation semantics from persisted artifacts only
- [x] Brief, timeline, dossier, and trends surfaces consume the same evidence-weighted comparison vocabulary
- [x] Comparison language stays caveat-preserving and does not imply exact replay reconstruction or causal proof
- [x] Observational GET paths remain non-mutating while comparative summaries are computed on read
- [x] Verification confirms the new contracts compile and build successfully

---

## Phase 18 — Evaluation Persistence + Comparative Research Surfaces

**Status**: **Complete**

**Goal**: Make experiment comparison durable, inspectable, and exportable by introducing explicit persisted evaluation artifacts and dedicated comparative route surfaces while keeping read paths observational.

**Honesty Constraint**: Persisted evaluation snapshots are interpretation artifacts, not raw evidence truth. They must remain write-side only, preserve replay doctrine, and avoid turning descriptive comparison into causal proof or stronger reproducibility claims.

**Deliverables**:
- explicit evaluation snapshot artifact store under `artifacts/research/evaluations/`
- dedicated `/api/research/evaluations` and `/api/research/comparisons` route surfaces
- comparative drift tracking across persisted evaluation snapshots
- export manifest integration for persisted evaluation artifacts
- consumer hardening in timeline, dossier, briefing, export, and experiment detail surfaces

**Gate Criteria**:
- [x] Evaluation persistence is explicit and write-side only
- [x] Comparative GET surfaces remain observational and do not silently persist new interpretation artifacts
- [x] Timeline, dossier, briefing, export, and experiment detail surfaces can read persisted comparative context without forking vocabulary
- [x] Comparative drift is derived from persisted evaluation history rather than rewritten narrative memory
- [x] Verification confirms type-check and production build still pass after the persistence layer is introduced

---

## Phase 19 — Research Prioritization Engine

**Status**: ✅ Complete

**Goal**: Add advisory-only research prioritization that ranks structural evidence, replay, calibration, and comparison gaps across brief, dossier, timeline, export, and dedicated priority surfaces.

**Honesty Constraint**: Prioritization ranks structural research gaps only. It must not imply causal proof, exact replay certainty, hidden persistence, or stronger conclusions than the underlying artifacts justify.

**Deliverables**:
- `lib/services/research-prioritization-engine.ts`
- `lib/constants/observatory-status.ts`
- canonical key integrity utilities for artifact-heavy and timeline/briefing surfaces
- `/api/research/priorities`
- prioritization context integrated into briefing, dossier, timeline, and export manifest surfaces
- `docs/research-prioritization-model.md`

**Gate Criteria**:
- [x] Research prioritization remains advisory-only and deterministic
- [x] Export, brief, dossier, and timeline surfaces reuse one priority vocabulary
- [x] Canonical keys prevent heterogeneous artifact collisions in observatory surfaces
- [x] UI phase/version truth is read from shared status constants rather than stale hardcoded labels
- [x] Verification confirms no duplicate-key warnings, type-check success, and production build success

---

## Phase 20 — Priority Drift + Recommendation Governance

**Status**: ✅ Complete

**Goal**: Make research prioritization historically traceable, governance-bounded, and recommendation-safe. Priority signals must be comparable across dossier snapshots, and all recommendations must carry inline governance metadata.

**Honesty Constraint**: Drift detection compares the current ephemeral prioritization context against the most recent persisted dossier's prioritization signals. It does not imply causal explanation for why priorities changed. Governed recommendations must never use imperative language and must carry explicit advisory boundaries.

**Deliverables**:
- `lib/types/research-priority-drift.ts`
- `lib/services/priority-drift-analyzer.ts`
- `lib/services/recommendation-governance.ts`
- `/api/research/priority-drift`
- Priority drift and governance context integrated into brief, dossier, timeline, and export manifest surfaces
- Imperative language softened at source (prioritization engine) and at governance boundary
- Inline advisory caveats on all priority-facing UI panels
- Dossier section renamed from `nextResearchPriorities` to `advisoryResearchGaps`

**Gate Criteria**:
- [x] Priority drift compares current ephemeral context against most recent persisted dossier — no invented history
- [x] Governed recommendations carry supportingEvidenceClasses, missingEvidenceClasses, confidenceLimitation, advisoryBoundary, nonExecutionCaveat
- [x] All imperative verbs in recommendedFocus text are softened to conditional language
- [x] Brief, dossier, timeline, and export manifest surfaces carry drift and governance context
- [x] Inline advisory caveats present on all priority surfaces in the UI
- [x] Dossier "nextResearchPriorities" renamed to "advisoryResearchGaps"
- [x] Verification confirms type-check and production build pass; all routes return 200; zero imperative verbs in governed text

---

## Phase 21 — Historical Priority Ledger + Comparative Governance History

**Status**: ✅ Complete

**Goal**: Make prioritization history durable across time, not just detectable against the latest dossier. The observatory should be able to describe how priority posture changed across multiple snapshots, how recommendation governance evolved, and which priorities persisted, oscillated, or resolved.

**Honesty Constraint**: Priority history records are persisted interpretation snapshots. They capture how the observatory prioritized structural gaps at a specific moment. Chronicity patterns describe structural recurrence, not truth confirmation. Repeated appearance of a priority class does not strengthen its claim beyond what the underlying artifacts support.

**Deliverables**:
- `lib/types/research-priority-history.ts`
- `lib/services/priority-history-store.ts`
- `lib/services/priority-history-analyzer.ts`
- `/api/research/priority-history` (GET observational, POST explicit snapshot)
- Priority history summary integrated into brief, dossier, timeline, and export manifest surfaces
- Chronicity patterns: persistent, intermittent, resolved, recent, single-snapshot
- Posture trends: stable, escalating, de-escalating, oscillating, insufficient-history
- Governance evolution narrative and stability assessment

**Gate Criteria**:
- [x] Priority history records are created only on explicit POST — never on GET reads
- [x] Historical analysis is descriptive, non-causal, and bounded by snapshot evidence
- [x] Chronicity patterns do not inflate certainty through repetition
- [x] Brief, dossier, timeline, and export manifest surfaces carry priority history summaries
- [x] No execution language, no causal storytelling, no hidden write paths
- [x] Verification confirms type-check and production build pass; all routes return 200

---

## Phase 22 — Priority Snapshot Automation + Historical Comparison Surfaces

**Status**: **Complete**

**Goal**: Make priority-history creation easier and historical comparison more legible, while preserving explicit write behavior, advisory-only posture, non-causal interpretation, and epistemic restraint. The observatory should be able to compare priority posture across consecutive snapshots, track per-experiment advisory stability, and classify signal directions (emerging, weakening, persistent) without implying that repetition equals truth.

**Honesty Constraint**: Snapshot comparisons describe structural advisory-posture changes between consecutive snapshots. They do not imply research progress, regression, or causal direction. Per-experiment stability metrics describe advisory-level consistency, not truth confirmation. Signal direction classification (emerging, weakening, persistent) is based on presence in snapshot halves, not on validated research trajectory.

**Deliverables**:
- `lib/services/snapshot-comparator.ts` — pairwise snapshot comparison, experiment stability, signal direction classification
- `lib/services/export-snapshot-coordinator.ts` — co-creates priority-history snapshot on export POST
- Snapshot automation: priority-history snapshots created automatically alongside export writes (explicit POST only)
- Extended `/api/research/priority-history` GET to include `snapshotComparisons`
- New types: `SnapshotTransitionKind`, `SnapshotClassTransition`, `PairwiseSnapshotComparison`, `ExperimentPriorityStability`, `SnapshotComparisonSummary`
- Brief, timeline, and export manifest surfaces carry `snapshotComparisons`
- UI panels updated: ResearchBriefPanel shows comparison signals; ResearchTimelinePanel shows experiment stability and signal directions

**Gate Criteria**:
- [x] Snapshot automation creates records only on explicit POST (export) — never on GET reads
- [x] Historical comparison is descriptive, non-causal, and bounded by snapshot evidence
- [x] No certainty inflation from repeated snapshots or comparison results
- [x] Brief, timeline, and export manifest surfaces carry snapshot comparison summaries
- [x] No execution language, no causal storytelling, no hidden write paths
- [x] Verification confirms type-check and production build pass; all routes return 200

---

## Phase 23 — Comparative Governance Synthesis + Theme Architecture

**Status**: ✅ Complete

**Goal**: (A) Unify the five previously fragmented governance stories — prioritization, drift, history, snapshot comparison, and recommendation governance — into a single comparative governance synthesis consumed by all major surfaces. (B) Introduce a system-wide dark/light theme architecture based on CSS design tokens, ensuring every panel, route, and UI component responds to a single theme toggle without altering layout, spacing, or component structure. This is a closure-conditioning phase: coherence over feature count.

**Honesty Constraint**: Governance synthesis integrates descriptive signals from multiple sources without inflating certainty. Persistent signals reflect structural recurrence, not validated truth. No signal category implies execution authority, causal proof, or hidden decision-making. The synthesis does not create new data — it reads and merges what already exists.

**Deliverables**:
- `lib/types/governance-synthesis.ts` — unified synthesis types: `ComparativeGovernanceSynthesis`, `SynthesizedAdvisorySignal`, `SignalPosture`, `EvidenceLimitationSummary`, `GovernanceBoundaryStatement`
- `lib/services/comparative-governance-synthesizer.ts` — read-only service that merges prioritization, drift, history, comparisons, and recommendation governance into one descriptive synthesis
- `governanceSynthesis` field added to `ObservatoryBrief`, `ResearchTimeline`, `ExportManifest`
- Brief generator, timeline builder, and export manifest builder consume the shared synthesis
- Export manifest `integrityGuarantees` consolidated: 5 governance-duplicate items replaced with single reference to `governanceSynthesis.governanceBoundaries`
- Timeline `knownLimitations` references canonical `governanceSynthesis.governanceCaveat` instead of `prioritizationCaveat`
- UI panels updated: ResearchBriefPanel shows synthesized signal postures and evidence limitations; ResearchTimelinePanel shows governance synthesis section with per-signal posture narratives; ResearchDossierPanel shows Governance Synthesis (Advisory) section with posture assessment, per-signal cards, evidence limitations, and governance caveat; ExportManifestPanel renders governance synthesis posture, signal classifications, and limitation narrative; ExperimentRegistryPanel shows per-experiment Governance Advisory with signal posture, narrative, and stability
- `governanceSynthesis` field added to `ResearchDossier` type; `DossierGenerator` now calls the full governance chain (drift → recommendation governance → history → comparisons → synthesis)
- `GET /api/research/governance-synthesis` — lightweight read-only endpoint returning the comparative governance synthesis without regenerating a full brief or dossier
- `globals.css` extended with semantic RGB-format CSS design tokens (`--background`, `--surface`, `--surface-elevated`, `--border-subtle`, `--text-primary`, `--accent`, `--info`, `--success`, `--warning`, `--danger`, etc.) with `:root` as light mode and `.dark` overrides for dark mode
- `tailwind.config.ts` extended with semantic theme token colors referencing CSS variables with `<alpha-value>` opacity support plus `observatory` and `observatory-soft` shadows
- `lib/theme/theme-provider.tsx` — client-side ThemeProvider with `useTheme()` hook, `light | dark | system` support, localStorage persistence, and resolved-theme handling
- `layout.tsx` — inline script for flash-free theme initialization, `suppressHydrationWarning` on `<html>`, ThemeProvider wrapper
- Theme toggle added to PageShell navigation as a restrained segmented control for `light`, `system`, and `dark`
- All 15+ panel components migrated from hardcoded Tailwind colors and transitional `t-*` classes to semantic token classes (`bg-surface`, `bg-surface-elevated`, `text-text-primary`, `text-accent`, `text-success`, etc.)
- All inline theme values across panels, page.tsx, and PrincipleCard migrated to semantic `rgb(var(--token) / opacity)` syntax
- Component-layer CSS (badges, panel-input, panel-button, obs-panel, data-row, obs-divider, status-dot) migrated to CSS variable references
- Version bump: `0.23.0-alpha`

**Gate Criteria**:
- [x] Synthesis service is read-only — never creates, writes, or persists data
- [x] All advisory signals classified by posture (persistent, recent, weakening, intermittent, etc.)
- [x] Evidence limitations integrated across chronic and current gaps
- [x] Canonical governance boundary statements replace fragmented caveat constants
- [x] No certainty inflation, no execution language, no causal claims
- [x] Brief, timeline, export manifest, and dossier carry `governanceSynthesis`
- [x] ExportManifestPanel renders governance synthesis inline
- [x] ExperimentRegistryPanel shows per-experiment governance advisory signal
- [x] Lightweight `/api/research/governance-synthesis` endpoint for experiment-detail consumption
- [x] Export `integrityGuarantees` no longer duplicates governance from caveat fields
- [x] Zero hardcoded hex colors or rgba() values in panel components — all resolved through CSS variables
- [x] Dark and light themes share identical component structure, spacing, and layout
- [x] Theme toggle persists via localStorage, initializes flash-free via inline script
- [x] Type-check and production build pass; all routes return 200

---

## Phase 24 — Closure Hardening + Release-Candidate Conditioning

**Status**: ✅ Complete

**Goal**: (A) Eliminate final semantic drift, vocabulary fragmentation, and inline-style residue across the entire observatory surface. (B) Condition the system toward release-candidate quality: a coherent Version 1 research operating system, not an advanced but fragmented alpha. (C) Refine the UI to be calmer, sharper, and more institutional — more research instrument, less mechanically assembled.

**Honesty Constraint**: This phase does not introduce new features or data surfaces. All changes are structural, visual, and vocabulary-level. No new endpoints, no new types, no new services. The observatory still observes — it does not decide, execute, or claim authority.

**Deliverables**:
- `lib/constants/governance.ts` — NEW: canonical governance vocabulary file with 6 domain-specific governance caveats, canonical boundary statements, posture labels, evidence sufficiency labels, advisory level labels, and route-level caveats
- 6 governance services updated to import caveats from canonical constants instead of defining their own
- `components/ui/ObsCommon.tsx` — NEW: 7 shared UI primitives for cross-panel visual consistency
- `app/globals.css` — refined panel hover shadow; added 7 utility classes for typography and section cards
- PageShell: fixed stale footer, unified advisory badge color, refined theme toggle
- Homepage: hero polish, inline style elimination, section rhythm improvement, roadmap completed-phase treatment
- `ObservatoryPanel.tsx` — all inline styles replaced with Tailwind; badge color unified to accent
- 8 observatory panels fully purged of inline styles
- Local POSTURE_LABEL maps replaced with canonical governance imports
- Route fix: `GET /api/world-state/snapshot` corrected from 201 to 200
- Version bump: `0.24.0-rc1`; Phase 24 added to BUILD_PHASES

**Gate Criteria**:
- [x] Zero inline `style={{}}` attributes in any observatory panel (except dynamic width/height)
- [x] All governance caveats sourced from single canonical constants file
- [x] Institutional accent color used consistently
- [x] All GET routes return 200
- [x] Dark and light themes maintain identical visual hierarchy
- [x] Type-check and production build pass

---

## Cross-Phase Principles

These apply throughout all phases:

1. **Artifacts first**: Every phase must produce verifiable artifacts before its gate criteria are considered met
2. **No phase skipping**: Phases are sequential. Phase 3 cannot begin until Phase 2 is gated
3. **Type contracts are frozen per phase**: Type interfaces defined in a phase cannot be broken in subsequent phases without a migration plan and artifact
4. **Docs precede code**: Significant new components require documentation before implementation
5. **Evals precede production**: Phase 4 (evals) must complete before Phase 5 (production)
