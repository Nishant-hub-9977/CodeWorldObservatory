# Release Governance

Release discipline for **CodeWorld Observatory** — a public proof-of-work system.
This document defines how changes reach production, how they are verified, and how
they are rolled back. It is a process document; it does not change the system's
simulation-first thesis or the Quantum Research Annex boundaries.

---

## Production facts

| Item | Value |
| --- | --- |
| Production URL | <https://code-world-observatory.vercel.app> |
| Quantum Research Annex | <https://code-world-observatory.vercel.app/quantum-annex> |
| Production branch | `main` |
| Repository | <https://github.com/Nishant-hub-9977/CodeWorldObservatory> |
| Hosting | Vercel (zero-config Next.js, no `vercel.json`) |
| Node.js | 22.x (LTS) |

> **Vercel is connected to GitHub.** A push to `main` can **auto-deploy production**.
> Treat every merge to `main` as a production release.

---

## Continuous Integration (verification only)

CI is defined in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) and runs on
**every pull request** and on **pushes to `main`**.

It validates, in order:

1. `npm run type-check` — TypeScript (`tsc --noEmit`)
2. `npm run lint` — ESLint flat config
3. `npm run build` — `next build`
4. `python quantum-lab/experiments/resource_consequence_placeholder.py` — confirms the
   local-only Resource Consequence Ledger evidence script still runs

CI is **verification only**. It holds **no secrets**, and it **never deploys**. Production
deployment is handled exclusively by Vercel's GitHub integration. The local quantum-lab
script runs on the CI runner purely as an evidence-generation check and is never executed
inside the Vercel runtime.

---

## Recommended workflow (going forward)

Direct pushes to `main` deploy straight to production. The recommended, lower-risk flow is:

```
feature branch  →  pull request  →  CI passes  →  merge to main  →  Vercel deploys
```

1. Branch from `main` (e.g. `fix/...`, `feat/...`, `docs/...`).
2. Open a pull request. CI runs automatically.
3. Merge only after CI is green and the change is reviewed.
4. Merging to `main` triggers the Vercel production deployment.
5. Run the [production verification checklist](#production-verification-checklist) once the
   deploy is live.

Direct pushes to `main` remain possible for urgent hotfixes (see below), but should be the
exception, not the default.

---

## Rollback procedure (Vercel Instant Rollback)

If a production deployment regresses:

1. Open the Vercel dashboard → project **code-world-observatory** → **Deployments**.
2. Find the last known-good **Ready** production deployment.
3. Use **Instant Rollback** (⋯ menu → *Promote to Production* / *Instant Rollback*) to
   re-promote that build. This is near-instant and requires no rebuild.
4. Confirm the production URL is healthy using the verification checklist below.
5. Fix forward on a branch, let CI pass, then merge to `main` to supersede the rollback.

> Instant Rollback only re-points production at an existing build; it does not alter Git
> history. Always follow up with a real fix merged through `main`.

---

## Hotfix procedure

For an urgent production defect (e.g. a client-side runtime crash):

1. Reproduce locally and identify the root cause.
2. Apply the **smallest safe change**. Prefer defensive guards over refactors.
3. Verify locally — the full [production verification checklist](#production-verification-checklist):
   `type-check`, `lint`, `build`, then `npm run start` and exercise `/` and `/quantum-annex`.
4. Commit with a clear, accurate message (e.g. `fix: harden evidence status rendering`).
5. If the GitHub flow is available, open a PR so CI runs; otherwise push to `main` only after
   local verification is complete.
6. After Vercel reports the deployment **Ready**, run the verification checklist against the
   live URLs.
7. If the hotfix itself regresses, use **Instant Rollback** while you investigate.

> Reference precedent: the Q4A hotfix resolved a production-only crash
> (`Cannot read properties of undefined (reading 'evidenceClass')`) caused by selecting a
> legacy export manifest. Persisted artifacts can drift from the current schema — renderers
> must defend against it.

---

## Production verification checklist

Run after every production deploy. Full step-by-step commands live in
[production-verification.md](production-verification.md).

**Local gates (before merge/push)**

- [ ] `npm run type-check` exits 0
- [ ] `npm run lint` exits 0 (pre-existing warnings only — see below)
- [ ] `npm run build` exits 0
- [ ] `python quantum-lab/experiments/resource_consequence_placeholder.py` writes evidence
- [ ] `npm run start`, then `/` and `/quantum-annex` render locally

**Live routes**

- [ ] <https://code-world-observatory.vercel.app> returns HTTP 200
- [ ] <https://code-world-observatory.vercel.app/quantum-annex> returns HTTP 200

**Console-error check**

- [ ] No "Application error: a client-side exception has occurred." overlay on either route
- [ ] Browser DevTools console shows **no errors** on `/` and `/quantum-annex`

**Boundary / safety-language verification**

The Quantum Research Annex must continue to display its safety boundaries. Confirm the live
`/quantum-annex` page still contains:

- [ ] "does not claim quantum advantage"
- [ ] "does not imply affiliation with Google"
- [ ] "Resource Consequence Ledger"

Confirm the core surfaces still read:

- [ ] "CodeWorld Observatory"
- [ ] "Quantum Research Annex"

If any safety-language string is missing, treat it as a release blocker and roll back.

---

## Known non-blocking warnings

These are documented, understood, and out of scope for routine releases:

- **Pre-existing lint warnings (4).** `react-hooks/set-state-in-effect` warnings in
  `ExperimentRegistryPanel.tsx`, `ResearchStatisticsPanel.tsx`, `ScenarioLibraryPanel.tsx`,
  and `theme-provider.tsx`. `npm run lint` still exits 0. Left as warnings intentionally.
- **Multiple-lockfile warning.** Next.js may warn that it detected a second lockfile
  (`~/pnpm-lock.yaml`) alongside the repository `package-lock.json`. This is harmless and
  does not affect Vercel builds.
- **Legacy export manifests.** Older manifests in `artifacts/research/manifests/` predate the
  current export schema. They remain in the repo but are now **safely guarded**: the export
  builder deterministically selects a current-schema manifest, and the panels fall back to a
  neutral notice if a legacy manifest is encountered.

---

## Hard boundaries (unchanged)

Release activities must never:

- claim quantum advantage, or claim Google affiliation / partnership / endorsement
- clone external quantum repositories into the app, or import Cirq / qsim / Qualtran /
  OpenFermion / TensorFlow Quantum into the web runtime
- run Python inside the Vercel runtime
- connect CodeWorld to trading, broker execution, or financial signals
- remove existing safety language

See [public-proof.md](public-proof.md) and [quantum-annex.md](quantum-annex.md) for the
authoritative boundary language.
