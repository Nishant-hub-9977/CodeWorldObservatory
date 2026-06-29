# Production Verification

A repeatable checklist for confirming that **CodeWorld Observatory** is healthy — locally
before a release, and against production after every deploy. Pair this with
[release-governance.md](release-governance.md).

---

## 1. Local commands

Run from the repository root:

```bash
npm run type-check   # tsc --noEmit            → expect exit 0
npm run lint         # eslint .                → expect exit 0 (warnings only, see §6)
npm run build        # next build              → expect exit 0
python quantum-lab/experiments/resource_consequence_placeholder.py
                     # regenerates local evidence → expect "Wrote Resource Consequence Ledger…"
```

Optional local production smoke test:

```bash
npm run start        # serves the built app at http://localhost:3000
```

Then open and confirm both routes render:

- <http://localhost:3000/>
- <http://localhost:3000/quantum-annex>

> Note: running the placeholder script rewrites `quantum-lab/results/sample_result.json`
> (new `run_id` and `timestamp`). That file is statically imported by the web app. If you only
> meant to verify the script, restore it afterward with
> `git restore quantum-lab/results/sample_result.json` to keep your changeset scoped.

---

## 2. Production URLs to check

| Route | URL |
| --- | --- |
| Root | <https://code-world-observatory.vercel.app> |
| Quantum Research Annex | <https://code-world-observatory.vercel.app/quantum-annex> |

---

## 3. Expected status

- Both routes return **HTTP 200**.
- Both routes render fully — no blank page and no error overlay.
- The favicon loads (no `/favicon.ico` or `/icon.svg` 404 in the Network tab).
- The Vercel deployment shows **Ready** in the dashboard.

---

## 4. Browser console expectations

Open DevTools → Console and reload each route:

- **No** "Application error: a client-side exception has occurred." overlay.
- **No** red console errors (e.g. `Cannot read properties of undefined (reading 'evidenceClass')`).
- Warnings are acceptable only if they match the known, non-blocking set in §6.

---

## 5. Required text checks

These strings must be present on the live site. They protect the project's public posture and
the Quantum Research Annex boundaries — treat any missing string as a release blocker.

**On `/` (and shared chrome):**

- [ ] `CodeWorld Observatory`

**On `/quantum-annex`:**

- [ ] `Quantum Research Annex`
- [ ] `Resource Consequence Ledger`
- [ ] `does not claim quantum advantage`
- [ ] `does not imply affiliation with Google`

---

## 6. Expected (non-blocking) warnings

Do not treat these as failures:

- **4 pre-existing lint warnings** — `react-hooks/set-state-in-effect` in
  `ExperimentRegistryPanel.tsx`, `ResearchStatisticsPanel.tsx`, `ScenarioLibraryPanel.tsx`,
  and `theme-provider.tsx`. `npm run lint` still exits 0.
- **Multiple-lockfile warning** from Next.js (a second lockfile detected outside the repo).
  Harmless; does not affect Vercel.
- **Legacy export manifests** remain in `artifacts/research/manifests/` but are now safely
  guarded by the export builder and the panel fallbacks.

---

## 7. If a client-side exception appears again

If `/` (or any route) shows "Application error: a client-side exception has occurred.":

1. **Triage fast.** Open DevTools → Console and capture the exact error message. Production
   builds preserve object property names, so a message like
   `reading 'evidenceClass'` points directly at the source property being read.
2. **Rollback first if user-facing.** Use Vercel **Instant Rollback** to re-promote the last
   known-good deployment while you investigate (see
   [release-governance.md](release-governance.md#rollback-procedure-vercel-instant-rollback)).
3. **Reproduce the root cause.** Note that "works locally, crashes on Vercel" often indicates
   environment-dependent data selection — e.g. ordering persisted artifacts by file mtime,
   which is non-deterministic on Vercel's immutable filesystem. Inspect the API the failing
   component consumes (`/api/research/export`, `/api/research/brief`, etc.).
4. **Fix defensively.** Add optional-chaining / fallback guards at the render boundary and make
   any "latest artifact" selection deterministic and schema-aware. Avoid broad refactors.
5. **Verify** with §§1–5 locally, then merge through `main` (CI runs) so Vercel redeploys.
6. **Re-verify production** against this checklist before considering the incident closed.
