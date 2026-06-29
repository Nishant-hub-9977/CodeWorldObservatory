# Deployment

CodeWorld Observatory is a standard **Next.js 16** (App Router, Turbopack) application. It deploys to Vercel with **zero configuration** — no `vercel.json` is required.

> Boundary: Vercel renders the web application and **exported JSON evidence** only. Local quantum experiments (`quantum-lab/`) remain outside the runtime. No Python and no quantum libraries run during web rendering.

---

## Local development

```bash
npm install         # install dependencies
npm run dev         # start dev server at http://localhost:3000
```

## Quality gates

```bash
npm run type-check  # tsc --noEmit
npm run lint        # eslint .
npm run build       # next build → .next
```

All three should pass before deploying. `lint` currently emits only pre-existing warnings (see Troubleshooting).

---

## Vercel deployment

### Settings

| Setting | Value |
| --- | --- |
| Framework preset | **Next.js** (auto-detected) |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `.next` (managed by Vercel — leave default) |
| Node.js version | **22.x** (LTS) recommended |
| Environment variables | none required |

### Option A — Dashboard (recommended)

1. Push the repository to GitHub.
2. In Vercel, **New Project → Import** the GitHub repository.
3. Confirm the **Next.js** preset is detected (defaults above are correct).
4. Click **Deploy**. Vercel runs `npm install` then `npm run build`.

### Option B — Vercel CLI

```bash
npm i -g vercel        # if not installed
vercel login           # authenticate (interactive — enter credentials yourself)
vercel                 # create a preview deployment
vercel --prod          # promote to production (only with explicit approval)
```

> Do not run `vercel --prod` in automated flows without explicit human approval.

---

## What should NOT be deployed or run on Vercel

- **Python / `quantum-lab/`** — local-only. Never executed in the Vercel runtime.
- **Quantum libraries** (Cirq, qsim, Qualtran, OpenFermion, TensorFlow Quantum) — never imported into the web app.
- **`external/google-quantum/`** — gitignored study-only clones; never committed or deployed.

The web app reads the committed `quantum-lab/results/sample_result.json` as static exported evidence — it does not invoke any quantum compute.

## External repository strategy

External quantum repositories are **references, not bundled code**. They may be cloned locally for study only, into `external/google-quantum/` (gitignored). See [../external/README.md](../external/README.md). Never import them into `app/`, `lib/`, `components/`, or any served directory.

## Quantum lab (local-only)

```bash
python quantum-lab/experiments/resource_consequence_placeholder.py
# → writes quantum-lab/results/sample_result.json
```

Standard-library only; no quantum dependencies required. Re-running changes `run_id` and `timestamp` in the exported evidence.

---

## Troubleshooting

### Multiple-lockfile warning (harmless)

During local `dev`/`build` you may see:

```text
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles ...
```

This happens when a `pnpm-lock.yaml` exists in a parent directory (e.g. your home folder) alongside the repo's `package-lock.json`. It is **harmless** and does **not** affect Vercel — Vercel only sees the repository directory and its `package-lock.json`.

Optional fixes (not required):

- Remove the stray parent lockfile, **or**
- Pin the workspace root in `next.config.ts`:

  ```ts
  import path from "path";
  const nextConfig: NextConfig = {
    turbopack: { root: path.resolve(__dirname) },
  };
  ```

### `/api/snapshot` data on Vercel

The snapshot route walks the deployed serverless filesystem (build output), not your local workspace. This is expected; it remains read-only and non-mutating.
