# Neon Reserved Registry Boundary

The **Neon Reserved Registry Boundary** establishes a server-only database
connection preflight for future registry work. It does not implement registry
persistence, upload storage, table creation, migrations, user accounts, or write
endpoints.

Q10 answers one narrow question:

> Can CodeWorld safely recognize a server-only database connection without
> turning the product into a write-enabled SaaS surface yet?

The answer is yes: a server-only health check can report whether reserved Neon
infrastructure is configured and reachable, while keeping credentials private and
leaving all registry persistence disabled.

---

## What Q10 adds

- A placeholder-only `.env.example` showing the server-only `DATABASE_URL` name.
- Server-only registry helpers under `lib/registry/`.
- A read-only health function that returns a safe status if `DATABASE_URL` is
  missing and performs only `SELECT 1` when it is present.
- A GET-only API route at `/api/registry/health`.
- A Registry Boundary page at `/registry-boundary`.
- Boundary language that confirms no writes, no persistence, no upload storage,
  no auth system, and no production registry readiness claim.

---

## Local DATABASE_URL setup

1. Copy `.env.example` to `.env.local`.
2. Replace the placeholder with the local server-only Neon connection value.
3. Keep `.env.local` local. It is ignored by git and must never be committed.
4. Do not print the value in logs, docs, README text, code comments, or UI.

The app must still build and run when `DATABASE_URL` is absent. Missing
configuration returns an unconfigured preflight status rather than an exception.

---

## Vercel DATABASE_URL setup

In Vercel project settings, add `DATABASE_URL` as a server-side environment
variable for the relevant environment. Do not create a public variable for this
value.

CI does not require live Neon access. GitHub Actions should continue to pass
without `DATABASE_URL`.

---

## Why DATABASE_URL is server-only

Database credentials grant infrastructure access. They must only be read from
server-side `process.env` inside server-only modules. The client should only see
safe derived status fields such as `configured`, `connected`, `writesEnabled`,
`persistenceEnabled`, and `secretVisible: false`.

---

## Why no NEXT_PUBLIC variable must be used

Any `NEXT_PUBLIC_*` environment variable can be bundled into client-visible
JavaScript. A database connection value must never be exposed that way. Q10 uses
only `DATABASE_URL`, and only inside server-only code.

---

## No writes / no persistence boundary

Q10 does not write to the database. It does not create tables, insert rows,
update records, delete records, persist evidence packs, or store uploads. The
preflight query is read-only and exists only to confirm that reserved
infrastructure can be recognized safely.

---

## No table creation or migrations yet

No migration files are created in Q10. No schema is applied. No ORM is added.
Schema work must be reviewed separately.

---

## Future schema proposal for Q11

Documentation-only proposal; not an executable migration:

```text
evidence_registry
- id
- pack_id
- source_type
- repository_label
- schema_version
- validation_status
- digest
- file_count
- edge_count
- consequence_edge_count
- risk_surface_count
- human_review_state
- created_at
```

This schema would require a separate approval phase, migration plan, rollback
plan, and read/write boundary review before implementation.

---

## Relationship to Q9 External Evidence Pack

Q9 created a static external evidence-pack boundary. It validates and displays a
committed sample pack without upload storage or persistence. Q10 reserves the
future registry infrastructure boundary, but Q9 evidence packs are still not
stored in a database.

---

## Future direction: Q11

Recommended next phase:

> **CODEWORLD-Q11 - Evidence Registry Schema and Migration Proposal.**

Q11 should remain proposal-first: schema design, migration plan, rollback plan,
write-boundary review, and human approval before any table creation or
persistence is enabled.
