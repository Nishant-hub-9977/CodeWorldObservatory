# Antigravity Operating Model

> *How Antigravity functions as the orchestration substrate for CodeWorld Observatory, and what this means in the context of SE-JEPA.*

---

## What Antigravity Is and Is Not

Antigravity is not a chatbot with file access. It is a **multi-agent orchestration platform** — a mission-control layer for autonomous software engineering. The distinction is architectural, not cosmetic.

A chat-based coding assistant generates code tokens and expects a human to evaluate, apply, and debug the result. Antigravity is designed for a different operating model: the human specifies objectives, and autonomous agents plan, execute, verify, and report — operating asynchronously across workspaces without constant supervision.

For CodeWorld Observatory, Antigravity is the **execution substrate** within which SE-JEPA operates. It provides:

- The sensing layer (repo scanner, browser subagent)
- The actuation layer (file writes, terminal commands, git operations)
- The trust layer (artifacts, diffs, walkthroughs)
- The extensibility layer (MCP, skills)

SE-JEPA is the intelligence layer that governs how that actuation is permitted to proceed.

---

## The Three Architectural Surfaces

### Editor (Sensing + Authoring)

The Editor is the developer-facing surface. It provides contextual awareness of the active workspace: open files, cursor position, type errors, inline completions. In Antigravity, the Editor is the nexus where developer intent is captured and translated into agent objectives.

In the Observatory model, the Editor is the entry point for intervention proposals. When a developer describes a desired change, the Editor surfaces capture the current world state before any planning begins.

### Agent Manager (Orchestration)

The Agent Manager is the mission control surface. It spawns, coordinates, and monitors multiple agents working in parallel across tasks. Agents may operate on different parts of the codebase simultaneously, with the Agent Manager resolving conflicts and sequencing dependencies.

In the Observatory model, the Agent Manager is the surface through which the World-Model Governor operates — intercepting agent actions before execution and routing them through the simulation gate (activated via MCP in Phase 5).

### Browser Subagent (Visual State Capture)

The Browser Subagent is a purpose-built agent that can autonomously actuate a web browser. It captures screenshots of live application previews, runs UI tests, and reads dashboards. In a standard workflow, it provides proof that UI changes were successfully applied.

In the SE-JEPA model, the Browser Subagent is a **visual state sensor**. Screenshots become one modality of the multimodal world state representation that feeds the latent dynamics predictor.

---

## Artifacts as Trust Instruments

In any autonomous system, the question of trust is fundamental. How does a developer know that what an agent did is correct, safe, and recoverable?

Antigravity answers this through **structured artifacts**: typed, versioned, reviewable outputs that the agent produces as evidence of its reasoning and work. The key artifact types and their trust function:

| Artifact Type | Trust Function |
|---|---|
| Task List | Verifiable plan before execution begins — developer approves before compute is spent |
| Implementation Plan | Architectural alignment check — scope, files, dependencies |
| Walkthrough | Completion record with exact test and verification instructions |
| Code Diff | Semantic change review — the minimal reviewable unit of agent action |
| Screenshots / Recordings | Visual proof of UI state before and after intervention |

In the Observatory model, artifacts are elevated further: they are **cryptographically hashed**, linked to specific world states, and classified by trust level (`high`, `medium`, `low`, `unverified`). The Artifact Ledger is not a convenience — it is the evidentiary basis for every approved intervention.

> The Implementation Plan artifact combined with the Latent Simulation Verification artifact constitutes the immutable ledger of safe reasoning required for certified autonomous deployment.

---

## Skills as Operating Procedures

Agent Skills are reusable instruction sets that teach an agent how to execute specific procedures correctly. They follow a three-phase model that mirrors good engineering practice:

1. **Discovery**: The skill advertises its capabilities at the start of a planning pass. The agent determines if the skill is relevant to the current objective.
2. **Activation**: If relevant, the skill's constraints are loaded into the agent's operating context.
3. **Execution**: The agent follows the skill's procedural steps exactly. Non-negotiable constraints are enforced throughout.

In the SE-JEPA model, skills are the enforcement mechanism for the Simulation-Before-Write Law. The `world-model-governor` skill intercepts every write operation. The `counterfactual-planner` skill forces branch generation before any intervention is approved. Skills are not suggestions — they are the procedural law of the Observatory.

---

## MCP as the Intelligence Bridge

The Model Context Protocol is the bridge between the Antigravity editor and the Observatory's extended intelligence surfaces: the SE-JEPA prediction engine, the dependency analyzer, the calibration framework.

Without MCP, an agent's knowledge is bounded by its training data and the textual context window. With MCP, the agent can:

- Query the live repo state at any moment
- Dispatch a proposed intervention to the simulation engine
- Retrieve calibration metrics from previous prediction-reality comparisons
- Register artifacts in the append-only ledger

MCP is what makes the Observatory's simulation-first paradigm operationalizable. It is the channel through which `simulate_execution` and `evaluate_counterfactual` tools are exposed to the planning agent.

---

## The Operating Model in Practice

The canonical Antigravity + SE-JEPA operating sequence:

```
1. Developer defines objective → captured by Editor
2. Agent captures current WorldState → repo-state-capturer skill
3. Agent generates intervention proposal → counterfactual-planner produces 3 branches
4. World-Model Governor validates baseline + scope
5. Agent dispatches proposed intervention to simulation engine via MCP
6. Simulation result returned → SE-JEPA prototype captures calibration data
7. Benchmark Harness (Phase 7) structurally ranks branches and filters `blocked-by-evidence` paths
8. If structurally-favorable path exists → Implementation Plan artifact created
9. Developer reviews and approves → write proceeds
10. Post-write snapshot captured → prediction-reality delta recorded
11. Delta feeds calibration framework → model improves over time
```

Steps 1–8 are enforced by skills. Steps 9–10 are enforced by the Artifact Auditor. No step can be skipped without producing an explicit override artifact tagged `trustLevel: unverified`.

---

## What Antigravity Cannot Yet Do

Being honest about current limitations is a project discipline, not a weakness.

As of Phase 2:
- Antigravity uses autoregressive generative models as its primary intelligence layer
- The SE-JEPA predictor is structural and rule-based, not learned
- Multimodal state fusion (AST + execution trace + visual) is not yet implemented
- The simulation gate is a gating structure without a trained dynamics model
- MCP tools expose structure but do not yet route to a learned predictor

These are not failures — they are the scaffolding. The Observatory is built to make the transition from rule-based to learned prediction transparent and gradual. Phase 3 introduces the first learned prediction components into this already-running infrastructure.
