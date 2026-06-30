# CodeWorld Observatory

> **A simulation-first control plane for agentic software engineering — treating software repositories as dynamic causal worlds, not static text.**

**Version:** v0.24.0-rc1 · **Status:** Release Candidate · **Phase:** Phase 24 — Closure Hardening + Release Conditioning

## Quick links

- **Live deployment:** <https://code-world-observatory.vercel.app> — see [docs/deployment.md](docs/deployment.md)
- **Portfolio:** [Living Systems Portfolio](https://architected-ai-systems.lovable.app/)
- **Quantum Research Annex:** [docs/quantum-annex.md](docs/quantum-annex.md) (route: `/quantum-annex`)
- **Public positioning:** [docs/public-proof.md](docs/public-proof.md)

---

## Overview

CodeWorld Observatory is a **simulation-first control plane for agentic software engineering**.

It treats software systems not as static codebases, but as **dynamic causal environments** that can be explored, compared, and evaluated before execution.

The system is designed to support:

- counterfactual reasoning  
- branch-aware evaluation  
- governance-aware interpretation  
- advisory-first decision support  

It does **not execute actions** and does **not modify systems**.  
It remains strictly observational and advisory.

---

## Why it exists

Autoregressive, write-first agents generate code by predicting the next token; they cannot reason about causal consequences before acting. CodeWorld Observatory inverts that order: it models a repository as an observable world with state, dependencies, histories, tests, fragile zones, and possible futures — so consequences can be imagined, compared, and reviewed **before** any write.

## Core Architecture

- **Next.js 16 (App Router, Turbopack)** web application — the observatory surface.
- **Typed service layer** (`lib/`) for world-state capture, dependency analysis, and research synthesis.
- **API routes** (`app/api/*`) exposing snapshots, futures, interventions, and research artifacts as JSON.
- **Research annex** (`/quantum-annex`) — a restrained resource-accounting interpretation layer.
- **Local experiment layer** (`quantum-lab/`) — offline, evidence-producing scripts kept out of the web runtime.

---

## Core Principles

### 1. Simulation Before Execution

All reasoning occurs in simulated or reconstructed contexts prior to any real-world action.

### 2. Observational Integrity

Read paths are strictly non-mutating.  
No hidden writes, no implicit materialization.

### 3. Advisory-Only Posture

The system provides structured interpretation, not commands, automation, or execution.

### 4. Governance Awareness

All outputs are bounded by explicit uncertainty, limitation, and non-causal framing.

### 5. Evidence Over Assertion

Outputs reflect observable structure and comparison — not claims of correctness or optimality.

---

## System Capabilities

The observatory supports:

- comparative research synthesis  
- timeline reconstruction  
- priority drift analysis  
- governance interpretation  
- exportable research artifacts  

Outputs include:

- research briefs  
- structured dossiers  
- timeline views  
- export manifests  

All outputs are **interpretive artifacts**, not directives.

---

## Interface Design

The interface is intentionally:

- restrained  
- institutional  
- low-noise  
- dark/light parity aligned  

It is designed to function as a **research instrument**, not a dashboard.

---

## Version Context

`v0.24.0-rc1` represents:

- first-cycle closure  
- semantic unification across services and UI  
- export and artifact consistency  
- governance synthesis integration  
- final UI signal compression pass  

This is a **release candidate**, not a final system.

---

## Boundaries

This system does not:

- execute code  
- modify repositories  
- provide guarantees of correctness  
- claim causal inference  
- act autonomously  

It is a **decision-support surface**, not an execution layer.

---

## Intended Use

CodeWorld Observatory is intended for:

- research workflows  
- structured system analysis  
- evaluation-first engineering approaches  
- governance-aware reasoning environments  

---

## Quantum Research Annex

A separated research and interpretation layer ([docs/quantum-annex.md](docs/quantum-annex.md), route `/quantum-annex`):

- Explores **quantum-inspired resource accounting** and simulation-first reasoning.
- External quantum tools (Cirq, qsim, Qualtran, OpenFermion, TensorFlow Quantum) are **references and optional local research dependencies**, not bundled application code.
- The production-facing app does **not** run heavy quantum simulation.
- Vercel deployment displays documentation and exported JSON evidence, not live quantum compute.
- **No quantum advantage is claimed. No Google affiliation is implied.**

> This annex is a research and interpretation layer. It does not claim quantum advantage, does not run production quantum workloads, does not imply affiliation with Google, and does not modify CodeWorld's core simulation-first repository governance thesis.

### Resource Consequence Ledger

The annex's CodeWorld-native contribution: quantum-style **explicit resource accounting** applied to software interventions. Each entry records files affected, dependency zones touched, predicted failing test surfaces, intervention hypothesis, predicted vs. actual outcome, evidence hash/timestamp, uncertainty, human approval state, rollback posture, and simulation status. It is a discipline of accounting — not a performance or advantage claim.

### Local Experiment Layer

A lightweight, offline lab (`quantum-lab/`) produces Resource Consequence Ledger style JSON evidence. The web app renders that exported evidence (the evidence card on `/quantum-annex`); it never runs Python or quantum libraries during rendering. External reference repositories clone only to `external/google-quantum/` (gitignored), never the app runtime.

---

## Deployment

Standard zero-config Next.js — no `vercel.json` required.

| Setting | Value |
| --- | --- |
| Framework preset | **Next.js** |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output | `.next` (managed by Vercel) |
| Node.js | 22.x (LTS) recommended |

Vercel renders the web application and exported JSON evidence only. Local quantum experiments remain outside the runtime. Full steps and troubleshooting: [docs/deployment.md](docs/deployment.md).

---

## Release Governance

CodeWorld Observatory follows a lightweight release discipline so the public deployment stays trustworthy.

- **Continuous Integration** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on every pull request and on pushes to `main`, validating **type-check**, **lint**, **build**, and **local evidence generation** (the offline Resource Consequence Ledger script). CI is verification-only — it holds no secrets and never deploys.
- **Vercel handles production deployment.** The GitHub repository is connected to Vercel, so a merge/push to `main` auto-deploys production.
- **The local `quantum-lab/` stays outside the runtime.** CI runs the evidence script on its runner only; Vercel never executes Python or quantum libraries.

Full process — the recommended branch → PR → CI → merge flow, rollback (Vercel Instant Rollback), hotfix procedure, and verification checklists:

- **Release governance:** [docs/release-governance.md](docs/release-governance.md)
- **Production verification:** [docs/production-verification.md](docs/production-verification.md)

---

## Prediction-versus-Reality Ledger

The **Repository Intervention Simulator** (route: `/intervention-simulator`) turns the repository-as-world thesis into a concrete workflow: observe a repository world, propose an intervention, predict its consequences **before** acting, then compare that prediction against an observed outcome.

- **Deterministic mock intervention scenarios** — predefined proposals with intent, scope, failure modes, and rollback posture. No AI model call; CodeWorld is **not** a trained world model.
- **Predicted-versus-observed comparison** — a ledger surfaces files, tests, build, lint, and runtime mismatches, with an overall prediction quality and unresolved uncertainty.
- **Human review state** — every scenario records a human decision; approval sits above any real action.
- **Advisory-only simulator** — **no real repository writes**, no shell commands, no Git API, no deployment trigger. All data is static and typed.

Details and boundaries: [docs/prediction-reality-ledger.md](docs/prediction-reality-ledger.md).

---

## Repository Snapshot Evidence

The **Repository Snapshot** (route: `/repository-snapshot`) is a real, read-only capture of this repository's own structure, rendered as static dependency-graph evidence.

- **Local read-only generation** — [`scripts/generate-repository-snapshot.mjs`](scripts/generate-repository-snapshot.mjs) (Node standard library only) scans curated source families and emits [`data/repository-snapshot.json`](data/repository-snapshot.json). The app imports the artifact through a typed wrapper and **never scans the filesystem at request time**.
- **Static dependency graph evidence** — file families, domains, most-connected files, and a deterministic content digest. It is a static approximation, **not** a complete runtime dependency graph.
- **Consequence-bearing edge classification** — edges are ranked by cross-route blast radius, so the few shared dependencies that ripple across multiple routes stand out from ordinary structural edges.
- **Relationship to the prediction-versus-reality workflow** — the snapshot supplies the structural ground truth the Intervention Simulator's predictions should eventually consult.
- **Advisory-only, no mutation** — no repository writes, no shell commands, no GitHub API, no tokens, no runtime scanning.

Regenerate with `npm run snapshot:repo`. Details and boundaries: [docs/repository-snapshot.md](docs/repository-snapshot.md).

---

## Snapshot-to-Simulator Bridge

The **Snapshot-to-Simulator Bridge** connects the Q6 simulator to Q7 static repository evidence. The Intervention Simulator still uses deterministic scenarios, but prediction cards now show route blast radius, shared infrastructure exposure, consequence-bearing edge count, static edge involvement, and evidence confidence from the committed repository snapshot.

- **Q6 consumes Q7 evidence** — snapshot data is imported through the existing typed wrapper, not scanned at request time.
- **Prediction enrichment** — simulator cards and the prediction-versus-reality ledger show snapshot risk, static graph alignment, and shared-infrastructure exposure.
- **Read-only and deterministic** — no real repository writes, no shell commands, no GitHub writes, no tokens, no runtime filesystem scanning.
- **Advisory-only and human-reviewed** — snapshot risk is evidence for review, not authority to act.

Details and boundaries: [docs/snapshot-simulator-bridge.md](docs/snapshot-simulator-bridge.md).

---

## Links

- **Live deployment:** <https://code-world-observatory.vercel.app>
- **Portfolio:** [Living Systems Portfolio](https://architected-ai-systems.lovable.app/)
- **Deployment guide:** [docs/deployment.md](docs/deployment.md)
- **Release governance:** [docs/release-governance.md](docs/release-governance.md)
- **Production verification:** [docs/production-verification.md](docs/production-verification.md)
- **Prediction-versus-Reality Ledger:** [docs/prediction-reality-ledger.md](docs/prediction-reality-ledger.md) (route: `/intervention-simulator`)
- **Repository Snapshot Evidence:** [docs/repository-snapshot.md](docs/repository-snapshot.md) (route: `/repository-snapshot`)
- **Snapshot-to-Simulator Bridge:** [docs/snapshot-simulator-bridge.md](docs/snapshot-simulator-bridge.md)
- **Public positioning & proof language:** [docs/public-proof.md](docs/public-proof.md)
- **Quantum Research Annex:** [docs/quantum-annex.md](docs/quantum-annex.md)

---

## License

(Define as appropriate)

---

## Author

Nishant Dodiya
