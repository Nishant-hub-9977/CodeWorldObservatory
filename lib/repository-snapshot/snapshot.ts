// ─── Repository Snapshot — typed wrapper ───────────────────────────────
// Statically imports the locally generated snapshot artifact and exposes it
// as a typed constant. No filesystem is scanned at build or request time —
// this is exported, read-only evidence only. The JSON is normalized through
// a single `unknown` cast so the union-typed fields (family/domain/kind)
// are presented with their precise types to the rest of the app.

import snapshotJson from "@/data/repository-snapshot.json";
import type { RepositorySnapshot } from "./types";

export const repositorySnapshot = snapshotJson as unknown as RepositorySnapshot;
