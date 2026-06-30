# Repository Snapshot Evidence

The **Repository Snapshot** layer (route: `/repository-snapshot`) is the first
real, read-only evidence layer about CodeWorld Observatory's own structure. It
makes the repository-as-world thesis concrete: a deterministic, locally
generated artifact that the web app renders as static dependency-graph evidence.

It is the structural counterpart to the [Prediction-versus-Reality
Ledger](prediction-reality-ledger.md): the simulator predicts the consequences
of a change, and the snapshot describes the structure those predictions should
eventually rest on.

---

## What the snapshot layer does

- A local Node script — [`scripts/generate-repository-snapshot.mjs`](../scripts/generate-repository-snapshot.mjs)
  — scans a curated set of source families in **read-only** mode and emits a
  single JSON artifact at [`data/repository-snapshot.json`](../data/repository-snapshot.json).
- For each included file it records: path, extension, **family** (route, layout,
  component, module, documentation, script, config, workflow, data, style,
  asset), **domain** (Core Observatory, Quantum Annex, Intervention Simulator,
  Release Governance), approximate line count, approximate byte size, resolved
  internal imports, unresolved imports, external package imports, and (for
  documentation) local doc links.
- It derives a static dependency graph: node count, edge count, family and
  domain breakdowns, most-connected files, and an **edge classification** layer.
- The web app imports the artifact through a typed wrapper
  ([`lib/repository-snapshot/snapshot.ts`](../lib/repository-snapshot/snapshot.ts))
  and renders it. **The app never scans the filesystem at request time.**

Uses the Node standard library only (`fs`, `path`, `crypto`, `url`) — no new
runtime dependency is added.

---

## What it proves

- That CodeWorld can hold a **real, structural representation of its own
  repository world** — not a mock — and present it as legible evidence.
- That hidden dependencies can be ranked by **consequence** rather than shown as
  undifferentiated graph noise. The classification surfaces the handful of
  **consequence-bearing edges** (shared shell, layout, and UI/modules reachable
  from multiple routes) that carry the widest blast radius.
- That the capture is **deterministic**: re-running on an unchanged tree
  produces byte-identical output, anchored by a content digest.

---

## What it does **not** claim

- It does **not** claim CodeWorld is a trained world model or JEPA model.
- It does **not** claim quantum advantage.
- It does **not** claim affiliation with, or endorsement by, Google, Meta,
  Vercel, any individual researcher, or any research institution.
- It does **not** claim a complete runtime dependency graph. The edges are a
  static approximation from import statements and documentation links, and do
  not capture dynamic, conditional, or framework-injected wiring.

---

## Static approximation boundary

Import edges are extracted with deterministic regular expressions and resolved
with simple extension probing — not a bundler-accurate module resolver.
Resolved internal edges, external package imports, and unresolved specifiers are
recorded in **separate buckets** and never silently merged. This keeps the
approximation honest: the graph shows resolved internal references only, and the
unresolved/external counts are reported alongside.

---

## Read-only boundary

The generator and the rendered page observe the same hard boundaries that govern
every CodeWorld surface:

- **No runtime filesystem scanning.** Generation happens in development/CI; the
  app only imports a static artifact.
- **No repository mutation.** The script writes exactly one file — the snapshot
  artifact — and never modifies source.
- **No GitHub API writes.** No Git or GitHub write API is contacted, and no
  tokens are required.
- **No code execution or shell commands** are run against the repository.
- **No runtime dependency scanning in production**, and **no Python in the Vercel
  runtime**.

---

## Relationship to the Q6 Intervention Simulator

The [Intervention Simulator](prediction-reality-ledger.md) models the
consequences of a proposed change before acting and reconciles the prediction
against an observed outcome. The snapshot provides the **structural ground
truth** that such predictions should eventually consult: which files exist, how
they reference one another, and which shared targets are consequence-bearing.

Today the two layers are intentionally **independent** — the simulator still runs
on deterministic mock scenarios. Connecting them is a deliberate future step (see
below), kept separate so each layer can be verified on its own.

---

## How this answers the hidden-dependency / noise problem

> "How do we map hidden dependencies without turning the repository into
> meaningless graph noise?"

Three deterministic choices:

1. **Curate the surface.** Only meaningful source families are scanned; build
   output, vendored repositories, and generated artifacts are ignored.
2. **Resolve honestly.** Resolved internal edges, external packages, and
   unresolved specifiers are separated rather than merged into one tangled graph.
3. **Rank by consequence.** Edges are classified by cross-route blast radius, so
   a few consequence-bearing dependencies stand out from hundreds of ordinary
   structural edges — and the page renders quiet tables, not a neon node-link
   canvas.

---

## Future direction: Q8

This layer captures and renders structural evidence but does not yet feed it into
prediction. The natural next phase connects the two:

> Recommended next phase: **CODEWORLD-Q8 — Snapshot-to-Simulator Bridge: use real
> snapshot evidence to prefill intervention-risk predictions.**

Every boundary above would carry forward unchanged: read-only, static,
advisory-only, human-reviewed, and with no repository mutation.

---

## Regenerating the snapshot

```bash
npm run snapshot:repo
```

The artifact is deterministic, so a clean tree stays clean unless repository
structure actually changed. CI runs the same generator as a verification step;
it never deploys and never requires secrets (see
[release-governance.md](release-governance.md)).
