// ─── Intervention Planner ─────────────────────────────────────────
// Server-only. Deterministic 3-branch planner.
// Phase 2: structural legitimacy, not generative fiction.
// Produces typed InterventionBranch objects from request + repo signals.

import type {
    InterventionTarget,
    InterventionBranch,
    CounterfactualComparison,
    BranchStrategy,
    RiskLevel,
} from "@/lib/types/intervention";
import type { DependencyReport } from "@/lib/types/world-state";
import { analyzeScope, computeRisk } from "./scope-analyzer";

// ─── Branch template system ───────────────────────────────────────

interface BranchTemplate {
    id: string;
    label: string;
    strategy: BranchStrategy;
    titlePrefix: string;
    summaryTemplate: (objective: string) => string;
    targetPattern: (hints: string[]) => string[];
    rationaleTemplate: (scopeClass: string, risk: RiskLevel) => string;
    limitationsTemplate: (connectedCount: number) => string[];
}

const BRANCH_TEMPLATES: BranchTemplate[] = [
    {
        id: "branch-A",
        label: "A",
        strategy: "service-first",
        titlePrefix: "Service-First:",
        summaryTemplate: (obj) =>
            `Build the data and service layer for "${obj}" before wiring UI or API routes.`,
        targetPattern: (hints) => {
            const serviceFiles = hints.filter(
                (h) => h.includes("lib/services") || h.includes("lib/types"),
            );
            if (serviceFiles.length > 0) return serviceFiles;
            return ["lib/services/", "lib/types/"];
        },
        rationaleTemplate: (scopeClass, risk) =>
            `Service-first ordering reduces integration risk when scope is ${scopeClass}. ` +
            `By establishing typed service contracts before touching UI panels or routes, ` +
            `any downstream consumers can be built against stable interfaces. ` +
            `${risk === "low" || risk === "medium" ? "Risk is contained to the service layer initially." : "High-radius scope makes data-layer stability especially important."}`,
        limitationsTemplate: (cc) => [
            "Service layer completeness depends on type contract stability from Phase 1.",
            cc > 3
                ? `${cc} connected files are implicated — confirm no circular dependencies before proceeding.`
                : "Relatively bounded connection surface — proceed with standard review.",
            "No simulation result available to validate predicted outcomes. Phase 3 will close this gap.",
        ],
    },
    {
        id: "branch-B",
        label: "B",
        strategy: "route-first",
        titlePrefix: "Route-First:",
        summaryTemplate: (obj) =>
            `Wire the API surface for "${obj}" first, accepting service stubs, then backfill.`,
        targetPattern: (hints) => {
            const routeFiles = hints.filter(
                (h) => h.includes("app/api") || h.includes("route.ts"),
            );
            if (routeFiles.length > 0) return routeFiles;
            return ["app/api/"];
        },
        rationaleTemplate: (scopeClass, risk) =>
            `Route-first enables early integration testing of the API contract. ` +
            `UI components and services can be developed in parallel once the endpoint shape is established. ` +
            `${scopeClass === "cross-module" || scopeClass === "structural" ? "With cross-module scope, committing to the route contract early reduces rework in dependent panels." : "Straightforward when scope is bounded to a single module."}`,
        limitationsTemplate: (cc) => [
            "Stub services accepted initially — backfill debt must be tracked explicitly.",
            "Route contract decisions made before service internals are stable introduce reversion risk.",
            cc > 5
                ? "High connection count: route changes may propagate to more consumers than currently visible."
                : "Connection surface is manageable.",
            "No simulation result available. Risk of unexpected consumer breakage is non-zero.",
        ],
    },
    {
        id: "branch-C",
        label: "C",
        strategy: "minimal-touch",
        titlePrefix: "Minimal-Touch:",
        summaryTemplate: (obj) =>
            `Apply the smallest footprint change to address "${obj}" with lowest blast radius.`,
        targetPattern: (hints) => {
            if (hints.length === 0) return [];
            // Take only the single most targeted file hint
            const prioritised =
                hints.find((h) => h.includes("lib/services")) ??
                hints.find((h) => h.includes("components")) ??
                hints[0];
            return [prioritised];
        },
        rationaleTemplate: (_scopeClass, risk) =>
            `Minimal-touch strategy constrains the intervention to the highest-leverage single point of change. ` +
            `${risk === "high" || risk === "critical" ? "Given the elevated risk surface, limiting blast radius is the most defensible approach." : "Even at low risk, smaller changes are easier to simulate, verify, and revert."} ` +
            `This branch trades completeness for confidence.`,
        limitationsTemplate: (cc) => [
            "Intentionally incomplete — follow-up interventions will be required.",
            "Integration with adjacent systems deferred — creates future coordination cost.",
            cc > 0
                ? `${cc} connected files exist but are explicitly excluded — monitor for silent breakage.`
                : "No connected files in immediate radius — minimal-touch is well-suited here.",
            "No simulation available. Actual blast radius may exceed what static analysis reveals.",
        ],
    },
];

// ─── Target file derivation ───────────────────────────────────────

function deriveTargetFiles(
    template: BranchTemplate,
    hint: string[],
    objective: string,
): string[] {
    const derived = template.targetPattern(hint);

    // If no hints, derive sensible defaults from objective keywords
    if (derived.length === 0) {
        const lower = objective.toLowerCase();
        if (lower.includes("panel") || lower.includes("ui") || lower.includes("component")) {
            if (template.strategy === "service-first") return ["lib/services/", "lib/types/"];
            if (template.strategy === "route-first") return ["app/api/"];
            return ["components/observatory/"];
        }
        if (lower.includes("api") || lower.includes("route") || lower.includes("endpoint")) {
            if (template.strategy === "service-first") return ["lib/services/"];
            if (template.strategy === "route-first") return ["app/api/"];
            return ["app/api/"];
        }
        // Generic fallback
        if (template.strategy === "service-first") return ["lib/services/", "lib/types/"];
        if (template.strategy === "route-first") return ["app/api/"];
        return ["lib/services/"]; // minimal-touch defaults to service layer
    }

    return derived;
}

// ─── Preferred branch heuristic ───────────────────────────────────

function selectPreferredBranch(
    branches: InterventionBranch[],
): string {
    // Prefer service-first at medium risk, minimal-touch at high/critical risk,
    // route-first when scope is local and API-dominant
    const high = branches.filter((b) => b.riskLevel === "high" || b.riskLevel === "critical");
    if (high.length === branches.length) {
        // All high/critical — prefer minimal-touch to contain blast
        return branches.find((b) => b.strategy === "minimal-touch")?.id ?? branches[0].id;
    }

    // Prefer service-first as the most principled approach
    const serviceFirst = branches.find((b) => b.strategy === "service-first");
    if (serviceFirst && (serviceFirst.riskLevel === "low" || serviceFirst.riskLevel === "medium")) {
        return serviceFirst.id;
    }

    // Fall back to lowest risk
    const sorted = [...branches].sort((a, b) => {
        const order = { low: 0, medium: 1, high: 2, critical: 3 };
        return order[a.riskLevel] - order[b.riskLevel];
    });
    return sorted[0].id;
}

// ─── Comparison notes ─────────────────────────────────────────────

function buildComparisonNotes(
    branches: InterventionBranch[],
    preferred: string,
): string {
    const prefBranch = branches.find((b) => b.id === preferred);
    const risks = branches.map((b) => b.riskLevel);
    const allLow = risks.every((r) => r === "low");
    const anyHigh = risks.some((r) => r === "high" || r === "critical");

    if (allLow) {
        return (
            `All three candidate branches carry low risk for this objective. ` +
            `${prefBranch?.strategy === "service-first" ? "Branch A (service-first) is preferred to establish stable contracts before consumers are built." : `Branch ${prefBranch?.label} is preferred on structural grounds.`}`
        );
    }

    if (anyHigh) {
        return (
            `Risk diverges meaningfully across branches. ` +
            `Branch C (minimal-touch) contains blast radius at the cost of completeness. ` +
            `${prefBranch ? `The planner recommends Branch ${prefBranch.label} as the most defensible starting point.` : ""} ` +
            `No simulation result is available — Phase 3 will quantify confidence before any write is permitted.`
        );
    }

    return (
        `Candidate branches differ primarily in ordering: when type contracts, service logic, and UI wiring happen. ` +
        `${prefBranch ? `Branch ${prefBranch.label} (${prefBranch.strategy}) is preferred: ` + prefBranch.rationale.split(".")[0] + "." : ""}` +
        ` All branches will require a simulation pass before execution.`
    );
}

// ─── Main export ──────────────────────────────────────────────────

export function planIntervention(
    target: InterventionTarget,
    depReport: DependencyReport | null,
    repoTotalFiles: number,
): CounterfactualComparison {
    const hintFiles = target.hintFiles ?? [];

    const branches: InterventionBranch[] = BRANCH_TEMPLATES.map((template) => {
        const targetFiles = deriveTargetFiles(template, hintFiles, target.objective);

        // Scope analysis per branch (branch C deliberately narrows scope)
        const scopeImpact = analyzeScope(targetFiles, depReport);
        const { riskLevel, riskRationale } = computeRisk(
            scopeImpact.directTargets,
            scopeImpact.connectedFiles,
            scopeImpact.touchedSurfaces,
            scopeImpact.scopeClass,
        );

        return {
            id: template.id,
            label: template.label,
            strategy: template.strategy,
            title: `${template.titlePrefix} ${target.objective}`,
            summary: template.summaryTemplate(target.objective),
            targetFiles,
            scopeImpact: { ...scopeImpact, riskRationale },
            riskLevel,
            rationale: template.rationaleTemplate(scopeImpact.scopeClass, riskLevel),
            limitations: template.limitationsTemplate(scopeImpact.connectedFiles.length),
            preferred: false,
        };
    });

    const preferredId = selectPreferredBranch(branches);
    const typedBranches = branches.map((b) => ({ ...b, preferred: b.id === preferredId }));

    return {
        id: `cmp-${Date.now().toString(36)}`,
        generatedAt: new Date().toISOString(),
        objective: target,
        branches: typedBranches as [InterventionBranch, InterventionBranch, InterventionBranch],
        preferredBranchId: preferredId,
        comparisonNotes: buildComparisonNotes(typedBranches, preferredId),
    };
}

// ─── Seed objective ───────────────────────────────────────────────
// A canonical demo objective grounded in the current project context.

export const SEED_INTERVENTION_TARGET: InterventionTarget = {
    objective: "Implement live Futures and Uncertainty panels using Phase 1 snapshot data",
    type: "write",
    hintFiles: [
        "lib/services/futures-generator.ts",
        "lib/types/future-state.ts",
        "app/api/futures/route.ts",
        "components/observatory/FuturesPanel.tsx",
        "components/observatory/UncertaintyPanel.tsx",
    ],
    context:
        "Phase 1 established live repo-state sensing. Phase 3 will deliver real prediction. " +
        "This intervention bridges mock future-state data to a structured planner-generated future skeleton.",
};
