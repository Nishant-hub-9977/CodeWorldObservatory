#!/usr/bin/env node
// ─── CodeWorld Observatory — Repository Snapshot Generator ──────────────
//
// Read-only, local, deterministic snapshot generator. Node standard library
// only (fs, path, crypto, url). It scans a curated set of source families in
// the current repository, records approximate size metrics, extracts static
// import edges, classifies those edges, and emits a single JSON artifact at
// data/repository-snapshot.json.
//
// HARD BOUNDARIES (by construction):
//   • Never mutates source files — it only writes the one snapshot artifact.
//   • Never executes repository code and never spawns shell commands.
//   • Never touches the network and never calls any Git/GitHub API.
//   • Emits NO wall-clock timestamps, so re-running on an unchanged tree
//     produces byte-identical output (stable for CI and clean git status).
//
// This is a STATIC APPROXIMATION of structure — not a complete runtime
// dependency graph and not a bundler-accurate module resolution.

import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const OUTPUT_REL = "data/repository-snapshot.json";
const OUTPUT_ABS = path.join(REPO_ROOT, OUTPUT_REL);

const SCHEMA_VERSION = "1.0.0";
const GENERATOR = "scripts/generate-repository-snapshot.mjs";
const REPOSITORY_NAME = "codeworld-observatory";
const BOUNDARY =
    "Static, read-only approximation of repository structure produced locally by " +
    "scripts/generate-repository-snapshot.mjs. No code is executed, no files are mutated, " +
    "no Git write APIs are called. This is not a complete runtime dependency graph.";

// Directories never traversed.
const IGNORE_DIRS = new Set([
    ".git", ".next", "node_modules", ".vercel", ".turbo",
    "coverage", "dist", "build", "out", "external", "artifacts",
    ".idea", ".vscode",
]);

// File extensions considered part of the curated source surface.
const INCLUDE_EXT = new Set([
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".md", ".json", ".css", ".yml", ".yaml", ".py", ".svg",
]);

// Code extensions that participate in static import extraction.
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

// Exact filenames to skip (lockfile and generated-typing noise).
const IGNORE_FILES = new Set([
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "next-env.d.ts",
]);

// Config files that should be classified as "config".
const CONFIG_FILES = new Set([
    "tsconfig.json", "package.json", "postcss.config.mjs",
    "tailwind.config.ts", "next.config.ts", "eslint.config.mjs",
]);

const toPosix = (p) => p.split(path.sep).join("/");
const uniqSort = (arr) => Array.from(new Set(arr)).sort();

// ── File inclusion policy ───────────────────────────────────────────────
function shouldIgnoreFile(rel, base) {
    if (IGNORE_FILES.has(base)) return true;
    if (base.startsWith(".env")) return true;
    if (rel === OUTPUT_REL) return true;                 // never snapshot self
    if (rel.startsWith("quantum-lab/results/")) return true; // generated outputs
    const ext = path.extname(base).toLowerCase();
    if (ext === ".json") {
        // JSON allowlist: keep curated data stores + root config only.
        const allow = rel.startsWith("data/") || CONFIG_FILES.has(base);
        if (!allow) return true;
    }
    return false;
}

// ── Recursive read-only walk ────────────────────────────────────────────
async function walk(dirAbs, acc) {
    let entries;
    try {
        entries = await fs.readdir(dirAbs, { withFileTypes: true });
    } catch {
        return; // defensive: skip unreadable directories
    }
    for (const entry of entries) {
        const abs = path.join(dirAbs, entry.name);
        const rel = toPosix(path.relative(REPO_ROOT, abs));
        if (entry.isDirectory()) {
            if (IGNORE_DIRS.has(entry.name)) continue;
            await walk(abs, acc);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (!INCLUDE_EXT.has(ext)) continue;
            if (shouldIgnoreFile(rel, entry.name)) continue;
            acc.push(rel);
        }
    }
}

// ── Classification: family ──────────────────────────────────────────────
function familyFor(rel) {
    const ext = path.extname(rel).toLowerCase();
    const base = path.posix.basename(rel);

    if (rel.startsWith("app/")) {
        if (base === "page.tsx") return "route";
        if (base === "layout.tsx") return "layout";
        if (ext === ".css") return "style";
        if (ext === ".svg") return "asset";
        return "module"; // route handlers, helpers under app/
    }
    if (rel.startsWith("components/")) return "component";
    if (rel.startsWith("lib/")) return "module";
    if (rel.startsWith(".github/workflows/")) return "workflow";
    if (rel.startsWith("scripts/")) return "script";
    if (rel.startsWith("quantum-lab/")) {
        if (ext === ".py") return "script";
        if (ext === ".md") return "documentation";
        if (ext === ".json") return "data";
        return "module";
    }
    if (CONFIG_FILES.has(base) || /\.config\.(ts|js|mjs|cjs)$/.test(base)) return "config";
    if (ext === ".yml" || ext === ".yaml") return "config";
    if (ext === ".md") return "documentation";
    if (ext === ".css") return "style";
    if (ext === ".svg") return "asset";
    if (ext === ".json") return "data";
    return "module";
}

// ── Classification: domain (four-domain model) ──────────────────────────
function domainFor(rel) {
    const l = rel.toLowerCase();
    if (l.includes("quantum")) return "quantum-annex";
    if (l.includes("intervention") || l.includes("prediction-reality")) return "intervention-simulator";
    if (
        rel.startsWith(".github/") ||
        rel.startsWith("scripts/") ||
        rel === "README.md" ||
        rel === "docs/release-governance.md" ||
        rel === "docs/production-verification.md"
    ) {
        return "release-governance";
    }
    return "core-observatory";
}

// ── Size metrics ────────────────────────────────────────────────────────
function countLines(text) {
    if (text.length === 0) return 0;
    let newlines = 0;
    for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) === 10) newlines++;
    }
    // Trailing newline means the last line is terminated, not an extra line.
    return text.charCodeAt(text.length - 1) === 10 ? newlines : newlines + 1;
}

// ── Import extraction (deterministic regex, not a parser) ────────────────
const IMPORT_PATTERNS = [
    /\bimport\s+(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']/g, // import ... from "x" | import "x"
    /\bexport\s+(?:[^"';]*?\sfrom\s+)["']([^"']+)["']/g,  // export ... from "x"
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,             // dynamic import("x")
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,               // require("x")
];

function extractSpecifiers(text) {
    const specs = [];
    for (const re of IMPORT_PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text)) !== null) {
            if (m[1]) specs.push(m[1]);
        }
    }
    return specs;
}

// Resolve a module specifier to a normalized repository path (best-effort).
function resolveSpecifier(fromRel, spec) {
    let base;
    if (spec.startsWith("@/")) base = spec.slice(2);
    else if (spec.startsWith(".")) base = toPosix(path.posix.join(path.posix.dirname(fromRel), spec));
    else return { type: "external", value: spec };

    const candidates = [
        base,
        `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`,
        `${base}.mjs`, `${base}.cjs`, `${base}.json`,
        `${base}/index.ts`, `${base}/index.tsx`, `${base}/index.js`,
    ];
    for (const cand of candidates) {
        if (existsSync(path.join(REPO_ROOT, cand))) {
            return { type: "resolved", value: toPosix(cand) };
        }
    }
    return { type: "unresolved", value: spec };
}

// ── Markdown local-link extraction (light touch) ─────────────────────────
const MD_LINK_RE = /\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;

function extractMarkdownTargets(fromRel, text, nodeSet) {
    const resolved = [];
    MD_LINK_RE.lastIndex = 0;
    let m;
    while ((m = MD_LINK_RE.exec(text)) !== null) {
        let target = m[1];
        if (!target) continue;
        if (/^(https?:|mailto:|#)/i.test(target)) continue; // skip external/anchors
        target = target.split("#")[0];
        if (!target) continue;

        const candidates = [];
        if (target.startsWith("/")) {
            // route-style link → map to an app route file
            const routeBase = target === "/" ? "app" : `app${target}`;
            candidates.push(`${routeBase}/page.tsx`, `${routeBase}.tsx`, toPosix(target.slice(1)));
        } else {
            const joined = toPosix(path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), target)));
            candidates.push(joined);
        }
        for (const cand of candidates) {
            if (nodeSet.has(cand)) {
                resolved.push(cand);
                break;
            }
        }
    }
    return uniqSort(resolved);
}

// ── Consequence-bearing test — cross-route blast radius ──────────────────
// An edge is consequence-bearing when its target is shared infrastructure
// reachable from MULTIPLE distinct routes (changing it can ripple across more
// than one route), or when it is the shell/layout that wraps every route.
function isConsequenceBearing(toRel, routeFanIn) {
    if (toRel === "app/layout.tsx") return true;
    if (toRel.startsWith("components/shell/")) return true;
    return (routeFanIn.get(toRel) ?? 0) >= 2;
}

// ── Edge classification (single primary kind, precedence ordered) ────────
function classifyEdge(fromRel, toRel, routeFanIn, fileMap) {
    if (isConsequenceBearing(toRel, routeFanIn)) return "consequence";
    const fromDomain = fileMap.get(fromRel)?.domain;
    const toDomain = fileMap.get(toRel)?.domain;
    const domains = [fromDomain, toDomain];
    if (domains.includes("quantum-annex")) return "research";
    if (domains.includes("intervention-simulator")) return "simulator";
    if (domains.includes("release-governance")) return "governance";
    return "structural";
}

async function main() {
    // 1) Walk the curated source surface.
    const paths = [];
    await walk(REPO_ROOT, paths);
    paths.sort();
    const nodeSet = new Set(paths);

    // 2) Build file records with size metrics and raw specifiers.
    const files = [];
    const fileMap = new Map();
    const rawImportsByFile = new Map();
    const mdTargetsByFile = new Map();

    for (const rel of paths) {
        const ext = path.extname(rel).toLowerCase();
        let text = "";
        try {
            text = await fs.readFile(path.join(REPO_ROOT, rel), "utf8");
        } catch {
            text = ""; // defensive: unreadable file recorded as empty
        }

        const record = {
            path: rel,
            ext,
            family: familyFor(rel),
            domain: domainFor(rel),
            lines: countLines(text),
            bytes: Buffer.byteLength(text, "utf8"),
            imports: [],
            unresolvedImports: [],
            externalImports: [],
            docLinks: [],
        };

        if (CODE_EXT.has(ext)) {
            const specs = extractSpecifiers(text);
            const internal = [];
            const unresolved = [];
            const external = [];
            for (const spec of specs) {
                const res = resolveSpecifier(rel, spec);
                if (res.type === "external") external.push(res.value);
                else if (res.type === "unresolved") unresolved.push(res.value);
                else if (nodeSet.has(res.value)) internal.push(res.value);
                // resolved-but-excluded targets are intentionally dropped
            }
            record.unresolvedImports = uniqSort(unresolved);
            record.externalImports = uniqSort(external);
            rawImportsByFile.set(rel, uniqSort(internal));
        } else if (ext === ".md") {
            mdTargetsByFile.set(rel, text); // resolved in a second pass (needs nodeSet)
        }

        files.push(record);
        fileMap.set(rel, record);
    }

    // 3) Resolve markdown doc-links now that the node set is complete.
    for (const [rel, text] of mdTargetsByFile) {
        const targets = extractMarkdownTargets(rel, text, nodeSet);
        const record = fileMap.get(rel);
        if (record) record.docLinks = targets;
    }

    // 4) Assemble raw node-to-node edges (code imports + doc links).
    const rawEdges = [];
    for (const rel of paths) {
        for (const to of rawImportsByFile.get(rel) ?? []) {
            if (nodeSet.has(to)) rawEdges.push({ from: rel, to });
        }
        const record = fileMap.get(rel);
        for (const to of record?.docLinks ?? []) {
            if (nodeSet.has(to) && to !== rel) rawEdges.push({ from: rel, to });
        }
    }

    // Dedupe edges and reflect resolved imports back onto each file record.
    const edgeKey = (e) => `${e.from}\u0000${e.to}`;
    const dedupedEdges = new Map();
    for (const e of rawEdges) dedupedEdges.set(edgeKey(e), e);
    const baseEdges = Array.from(dedupedEdges.values());

    const importsByFile = new Map();
    for (const e of baseEdges) {
        if (!importsByFile.has(e.from)) importsByFile.set(e.from, []);
        importsByFile.get(e.from).push(e.to);
    }
    for (const record of files) {
        record.imports = uniqSort(importsByFile.get(record.path) ?? []);
    }

    // 5) Route reachability (transitive) → cross-route fan-in per node.
    const adjacency = new Map();
    for (const e of baseEdges) {
        if (!adjacency.has(e.from)) adjacency.set(e.from, []);
        adjacency.get(e.from).push(e.to);
    }
    const routeFiles = files.filter((f) => f.family === "route").map((f) => f.path);
    const routeFanIn = new Map();
    for (const route of routeFiles) {
        const reached = new Set();
        const stack = [route];
        while (stack.length) {
            const current = stack.pop();
            for (const next of adjacency.get(current) ?? []) {
                if (!reached.has(next)) {
                    reached.add(next);
                    stack.push(next);
                }
            }
        }
        for (const node of reached) {
            routeFanIn.set(node, (routeFanIn.get(node) ?? 0) + 1);
        }
    }

    // Classify each edge using cross-route fan-in.
    const edges = baseEdges
        .map((e) => ({
            from: e.from,
            to: e.to,
            kind: classifyEdge(e.from, e.to, routeFanIn, fileMap),
        }))
        .sort((a, b) =>
            a.from === b.from
                ? a.to === b.to
                    ? a.kind.localeCompare(b.kind)
                    : a.to.localeCompare(b.to)
                : a.from.localeCompare(b.from),
        );

    // 6) Summary aggregates.
    const families = {};
    const domains = {};
    let totalLines = 0;
    let totalBytes = 0;
    let unresolvedImportCount = 0;
    let externalImportCount = 0;
    for (const f of files) {
        families[f.family] = (families[f.family] ?? 0) + 1;
        domains[f.domain] = (domains[f.domain] ?? 0) + 1;
        totalLines += f.lines;
        totalBytes += f.bytes;
        unresolvedImportCount += f.unresolvedImports.length;
        externalImportCount += f.externalImports.length;
    }
    const edgeKinds = {};
    for (const e of edges) edgeKinds[e.kind] = (edgeKinds[e.kind] ?? 0) + 1;

    const sortRecord = (obj) =>
        Object.fromEntries(Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0])));

    const summary = {
        fileCount: files.length,
        totalLines,
        totalBytes,
        edgeCount: edges.length,
        unresolvedImportCount,
        externalImportCount,
        families: sortRecord(families),
        domains: sortRecord(domains),
        edgeKinds: sortRecord(edgeKinds),
    };

    // 7) Deterministic content digest over files + edges (no timestamps).
    files.sort((a, b) => a.path.localeCompare(b.path));
    const canonical = JSON.stringify({ files, edges });
    const digest = "sha256:" + crypto.createHash("sha256").update(canonical).digest("hex");

    const snapshot = {
        schemaVersion: SCHEMA_VERSION,
        generator: GENERATOR,
        repositoryName: REPOSITORY_NAME,
        boundary: BOUNDARY,
        digest,
        summary,
        files,
        edges,
    };

    await fs.writeFile(OUTPUT_ABS, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

    // Concise, non-volatile console summary for local/CI visibility.
    process.stdout.write(
        `Repository snapshot written -> ${OUTPUT_REL}\n` +
        `  files=${summary.fileCount} edges=${summary.edgeCount} ` +
        `unresolved=${summary.unresolvedImportCount} external=${summary.externalImportCount}\n` +
        `  digest=${digest}\n`,
    );
}

main().catch((err) => {
    process.stderr.write(`Snapshot generation failed: ${err?.stack ?? err}\n`);
    process.exit(1);
});
