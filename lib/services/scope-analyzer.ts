// ─── Scope Analyzer ───────────────────────────────────────────────
// Server-only. Derives scope impact and risk classification from
// proposed target files + live dependency report signals.
// Phase 2: pragmatic static analysis, no speculation.

import type { DependencyReport } from "@/lib/types/world-state";
import type { ScopeClass, ScopeImpact, RiskLevel } from "@/lib/types/intervention";

// ─── Surface classifiers ──────────────────────────────────────────

const SURFACE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /^app\/api\//, label: "API routes" },
    { pattern: /^app\/layout\./, label: "app shell layout" },
    { pattern: /^app\/page\./, label: "root page" },
    { pattern: /^app\//, label: "app layer" },
    { pattern: /^components\/shell\//, label: "shell components" },
    { pattern: /^components\/observatory\//, label: "observatory panels" },
    { pattern: /^components\/ui\//, label: "UI primitives" },
    { pattern: /^components\//, label: "component layer" },
    { pattern: /^lib\/services\//, label: "service layer" },
    { pattern: /^lib\/types\//, label: "type contracts" },
    { pattern: /^lib\/data\//, label: "mock data layer" },
    { pattern: /^lib\/constants\//, label: "constants" },
    { pattern: /^lib\//, label: "lib layer" },
    { pattern: /^docs\//, label: "documentation" },
    { pattern: /^tests?\//, label: "test suite" },
    { pattern: /^tailwind\.config/, label: "design system config" },
    { pattern: /^next\.config/, label: "Next.js config" },
    { pattern: /tsconfig/, label: "TypeScript config" },
];

function classifySurfaces(paths: string[]): string[] {
    const surfaces = new Set<string>();
    for (const p of paths) {
        for (const { pattern, label } of SURFACE_PATTERNS) {
            if (pattern.test(p)) {
                surfaces.add(label);
                break;
            }
        }
    }
    return Array.from(surfaces);
}

// ─── Scope class derivation ───────────────────────────────────────

function deriveScopeClass(
    directTargets: string[],
    connectedFiles: string[],
    touchedSurfaces: string[],
): ScopeClass {
    const totalFiles = directTargets.length + connectedFiles.length;
    const isStructural =
        touchedSurfaces.some((s) =>
            ["app shell layout", "TypeScript config", "design system config", "type contracts"].includes(s)
        );

    if (isStructural) return "structural";

    const uniqueDirs = new Set(directTargets.map((p) => p.split("/").slice(0, 2).join("/")));
    if (totalFiles <= 1 && connectedFiles.length === 0) return "isolated";
    if (totalFiles <= 4 && uniqueDirs.size <= 2) return "local";
    return "cross-module";
}

// ─── Risk rationale ───────────────────────────────────────────────

function deriveRiskLevel(
    directTargets: string[],
    connectedFiles: string[],
    touchedSurfaces: string[],
    scopeClass: ScopeClass,
): { riskLevel: RiskLevel; rationale: string } {
    const reasons: string[] = [];
    let score = 0;

    if (directTargets.length >= 5) {
        score += 2;
        reasons.push(`${directTargets.length} direct files targeted`);
    } else if (directTargets.length >= 3) {
        score += 1;
        reasons.push(`${directTargets.length} direct targets`);
    }

    if (connectedFiles.length >= 5) {
        score += 2;
        reasons.push(`${connectedFiles.length} connected files implicated`);
    } else if (connectedFiles.length >= 2) {
        score += 1;
        reasons.push(`${connectedFiles.length} connected files in radius`);
    }

    if (touchedSurfaces.includes("API routes")) {
        score += 2;
        reasons.push("public API surface affected");
    }
    if (touchedSurfaces.includes("app shell layout")) {
        score += 3;
        reasons.push("app shell layout is cross-cutting");
    }
    if (touchedSurfaces.includes("type contracts")) {
        score += 2;
        reasons.push("type contract changes propagate silently");
    }
    if (touchedSurfaces.includes("service layer")) {
        score += 1;
        reasons.push("shared service layer touched");
    }
    if (scopeClass === "structural") {
        score += 2;
        reasons.push("structural scope class");
    }

    const riskLevel: RiskLevel =
        score >= 7 ? "critical" :
            score >= 4 ? "high" :
                score >= 2 ? "medium" : "low";

    const rationale =
        reasons.length > 0
            ? reasons.join("; ") + "."
            : "Narrow, well-bounded change with limited propagation surface.";

    return { riskLevel, rationale };
}

// ─── Connected file extraction ────────────────────────────────────

function getConnectedFiles(
    directTargets: string[],
    depReport: DependencyReport | null,
): string[] {
    if (!depReport) return [];

    const connected = new Set<string>();

    for (const edge of depReport.edges) {
        const fromMatches = directTargets.some(
            (t) => edge.from === t || edge.from.startsWith(t),
        );
        if (fromMatches && !directTargets.includes(edge.to)) {
            connected.add(edge.to);
        }

        const toMatches = directTargets.some((t) => {
            // Try to match resolved import paths
            return (
                edge.to === t ||
                edge.to.includes(t.replace(/\.[^.]+$/, "")) // strip extension
            );
        });
        if (toMatches && !directTargets.includes(edge.from)) {
            connected.add(edge.from);
        }
    }

    return Array.from(connected).slice(0, 12); // cap for display sanity
}

// ─── Main export ──────────────────────────────────────────────────

export function analyzeScope(
    directTargets: string[],
    depReport: DependencyReport | null,
): ScopeImpact {
    const connectedFiles = getConnectedFiles(directTargets, depReport);
    const allTouched = [...directTargets, ...connectedFiles];
    const touchedSurfaces = classifySurfaces(allTouched);
    const scopeClass = deriveScopeClass(directTargets, connectedFiles, touchedSurfaces);
    const { riskLevel: _rl, rationale: riskRationale } = deriveRiskLevel(
        directTargets,
        connectedFiles,
        touchedSurfaces,
        scopeClass,
    );

    return {
        directTargets,
        connectedFiles,
        touchedSurfaces,
        scopeClass,
        estimatedFileRadius: directTargets.length + connectedFiles.length,
        riskRationale,
    };
}

export function computeRisk(
    directTargets: string[],
    connectedFiles: string[],
    touchedSurfaces: string[],
    scopeClass: ScopeClass,
): { riskLevel: RiskLevel; riskRationale: string } {
    const { riskLevel, rationale } = deriveRiskLevel(
        directTargets,
        connectedFiles,
        touchedSurfaces,
        scopeClass,
    );
    return { riskLevel, riskRationale: rationale };
}
