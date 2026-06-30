# External Evidence Pack Boundary

The **External Evidence Pack Boundary** shows how CodeWorld could accept
repository evidence from another project while preserving safety, determinism,
and human review.

Q9 uses a committed static sample only. It does not add a live upload flow,
connect to GitHub, scan a repository at request time, execute code, or mutate any
repository.

---

## What Q9 adds

- A static sample external evidence pack at `data/external-evidence-pack.json`.
- Typed validation and normalization helpers under `lib/evidence-pack/`.
- A new route, `/evidence-pack`, for reviewing the pack as read-only evidence.
- Schema validation status, warnings, and rejected unsupported fields.
- File-family and domain summaries.
- Risk and consequence-surface review.
- A static comparison against the current CodeWorld repository snapshot.

---

## What an evidence pack is

An evidence pack is a portable, structured summary of repository evidence. In
Q9, it contains counts, family/domain breakdowns, consequence-bearing edges,
risk surfaces, limitations, and boundary declarations.

It is evidence for review, not an execution request. It does not contain secrets,
credentials, tokens, private repository data, or personal data.

---

## What the static sample proves

The sample proves that CodeWorld can import and display external repository
evidence through a strict boundary:

- Required fields are checked.
- Optional fields are normalized.
- Unsupported capabilities are rejected or flagged.
- Unsafe boundary claims fail validation.
- Comparison against CodeWorld's own snapshot remains static and read-only.

---

## What it does not claim

- It does **not** claim CodeWorld is a trained world model, JEPA model, or
  learned AI system.
- It does **not** claim quantum advantage.
- It does **not** imply affiliation with Google, Meta, Yann LeCun, Vercel,
  GitHub, or any research institution.
- It does **not** claim complete runtime dependency knowledge.
- It does **not** perform repository ingestion, upload storage, or execution.

---

## Validation boundary

Validation is deterministic and defensive. The app imports committed JSON,
normalizes it into a typed shape, and returns one of three statuses:

- `VALID`
- `VALID_WITH_WARNINGS`
- `INVALID_STATIC_SAMPLE`

Warnings remain visible. Unsupported capabilities are not silently ignored; they
are displayed as rejected or unsupported boundary evidence.

---

## No upload/storage boundary

Q9 does not provide upload storage or accept user files. The sample pack is
committed static data. A future import workflow would need a separate boundary
review before accepting any user-provided file.

---

## No GitHub API boundary

Q9 does not connect to GitHub APIs, does not require tokens, and does not call
GitHub write APIs. The route demonstrates what an already-produced evidence pack
could look like after safe import.

---

## No mutation boundary

The page does not mutate repositories, write files from the web UI, execute shell
commands, scan the filesystem at request time, run Python in Vercel, or perform
runtime dependency analysis.

---

## Relationship to Q7 Repository Snapshot

Q7 created CodeWorld's internal repository snapshot and dependency-graph
evidence. Q9 places a hypothetical external pack beside that current snapshot so
reviewers can compare file count, edge count, route count, consequence-bearing
edges, unresolved imports, dominant families, risk surfaces, and validation
status.

---

## Relationship to Q8 Snapshot-to-Simulator Bridge

Q8 lets the Intervention Simulator consume CodeWorld's internal static snapshot
evidence. Q9 does **not** feed external packs into the simulator. It establishes
the import boundary first: validate, summarize, compare, and require human
review.

---

## Future direction: Q10

Recommended next phase:

> **CODEWORLD-Q10 — Evidence Pack to Simulator Import Preview.**

Q10 should preview how a validated static evidence pack could inform simulator
predictions without granting upload storage, write authority, GitHub access,
runtime scanning, or execution.
