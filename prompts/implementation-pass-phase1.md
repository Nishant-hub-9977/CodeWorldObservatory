# Implementation Pass — Phase 1: State Capture Engine

> *Operating prompt for the Phase 1 implementation pass.*
> *Goal: Replace all mock world state data with live, verified world-state snapshots.*

---

## Phase Gate Check

Before beginning this pass, confirm that Phase 0 gate criteria are met:

- [ ] `npm run dev` succeeds with no type errors
- [ ] All six observatory panels render (may be mock data)
- [ ] All docs exist and are substantive
- [ ] All TypeScript type files are internally consistent
- [ ] All skills and MCP directories are structured and documented

If any criterion is unmet, this pass must not proceed.

---

## Objective

Implement the Repo-State Capturer as a live Node.js service and wire it into the `WorldStatePanel` via a Next.js API route. After this pass:

- The `WorldStatePanel` displays live data from the current repository
- The `fileTreeDigest` changes when a file is modified
- The dependency graph reflects real import structure
- A `world-snapshot` artifact is produced on each capture

---

## Files to Create

### New Service Files

1. **`lib/services/world-state-capturer.ts`**
   - File tree walker (using Node `fs.promises`, not any third-party library)
   - Content hasher (`crypto.createHash('sha256')`)
   - Tree serializer (deterministic JSON sort)
   - Tree digest computer
   - WorldState assembler

2. **`lib/services/file-walker.ts`**
   - Recursive file tree walk
   - Exclude handling (`.gitignore` patterns + custom excludes)
   - Returns `FileNode[]`

3. **`lib/services/dependency-analyzer.ts`**
   - Static import parser (regex-based for Phase 1)
   - Returns `DependencyEdge[]`

### New API Route

4. **`app/api/snapshot/route.ts`**
   - `GET /api/snapshot` → returns typed `WorldState` JSON
   - `POST /api/snapshot` → triggers a fresh capture and returns result
   - No authentication (Phase 1 — local only)

### Updated Component

5. **`components/observatory/WorldStatePanel.tsx`**
   - Change data source from `mockWorldState` to `fetch('/api/snapshot')`
   - Handle loading state
   - Handle error state

---

## Simulation Obligation

Before writing any of the above files:

1. Invoke `repo-state-capturer` skill to snapshot the current state
2. Invoke `counterfactual-planner` to generate candidate implementation sequences:
   - Branch A: service-first, then API, then component
   - Branch B: API-stub first, then service, then component
3. Select the higher-confidence branch
4. Produce a `plan` artifact before writing a single line of code

---

## Verification

After implementation:

1. `GET /api/snapshot` returns a valid `WorldState` for this repository
2. `fileTreeDigest` changes after touching a file
3. `WorldStatePanel` renders live data
4. A `world-snapshot` artifact is in the ledger
5. All TypeScript type checks pass (`npm run type-check`)
6. Tests pass (`npm test`)
