// ─── Snapshot-to-Simulator Bridge (deterministic · read-only) ───────
// Maps existing mock intervention scenarios to the static repository
// snapshot artifact. No filesystem access, no runtime scanning, no API
// calls, no randomness: this is advisory evidence derived from JSON.

import { repositorySnapshot } from "@/lib/repository-snapshot/snapshot";
import { consequenceBearingEdges, graphEvidence } from "@/lib/repository-snapshot/derived";
import type { EdgeKind, FileFamily, RepositoryDomain, SnapshotEdge, SnapshotFile } from "@/lib/repository-snapshot/types";

export interface ScenarioSnapshotMapping {
    scenarioId: string;
    matchedDomain: RepositoryDomain;
    matchedFileFamilies: FileFamily[];
    exactFiles: string[];
    pathPrefixes?: string[];
    pathIncludes?: string[];
    consequenceTargets?: string[];
    rationale: string;
}

export interface ScenarioSnapshotEvidence {
    scenarioId: string;
    matchedRepositoryDomain: RepositoryDomain;
    matchedFileFamilies: FileFamily[];
    matchedFiles: string[];
    relevantConsequenceBearingEdges: SnapshotEdge[];
    routeBlastRadius: number;
    staticEdgeCountInvolved: number;
    unresolvedImportCaveat: string;
    unresolvedImportExposure: number;
    sharedInfrastructureTouched: boolean;
    governanceSurfaceTouched: boolean;
    simulatorSurfaceTouched: boolean;
    quantumAnnexSurfaceTouched: boolean;
    staticDependencyEvidenceAvailable: boolean;
    mappingRationale: string;
    snapshotDigest: string;
    staticApproximationCaveat: string;
}

const STATIC_APPROXIMATION_CAVEAT =
    "Static approximation only: evidence is imported from data/repository-snapshot.json and does not scan the filesystem, execute code, mutate files, or claim complete runtime dependency knowledge.";

const FALLBACK_MAPPING: ScenarioSnapshotMapping = {
    scenarioId: "unknown",
    matchedDomain: "core-observatory",
    matchedFileFamilies: ["module"],
    exactFiles: [],
    rationale: "No explicit scenario mapping was found; the simulator falls back to an empty static-evidence surface.",
};

export const SCENARIO_SNAPSHOT_MAPPINGS: Record<string, ScenarioSnapshotMapping> = {
    "typed-evidence-export": {
        scenarioId: "typed-evidence-export",
        matchedDomain: "core-observatory",
        matchedFileFamilies: ["module", "documentation"],
        exactFiles: [
            "lib/services/export-manifest-builder.ts",
            "app/api/research/export/route.ts",
            "lib/types/research-export.ts",
            "docs/research-export-model.md",
        ],
        pathIncludes: ["research-export", "export-manifest"],
        rationale:
            "Typed evidence export maps to API, service, type, and documentation surfaces already present in the static snapshot.",
    },
    "defensive-schema-guards": {
        scenarioId: "defensive-schema-guards",
        matchedDomain: "core-observatory",
        matchedFileFamilies: ["component", "module"],
        exactFiles: [
            "components/observatory/ExportManifestPanel.tsx",
            "components/observatory/ResearchBriefPanel.tsx",
            "components/quantum/ResourceConsequenceEvidenceCard.tsx",
            "lib/services/export-manifest-builder.ts",
            "components/ui/ObsCommon.tsx",
        ],
        consequenceTargets: ["components/ui/ObsCommon.tsx"],
        rationale:
            "Defensive schema guards touch render surfaces that share observatory primitives, so consequence-bearing UI edges are included as blast-radius evidence.",
    },
    "new-static-route": {
        scenarioId: "new-static-route",
        matchedDomain: "intervention-simulator",
        matchedFileFamilies: ["route", "component", "module"],
        exactFiles: [
            "app/intervention-simulator/page.tsx",
            "components/shell/PageShell.tsx",
            "lib/interventions/intervention-scenarios.ts",
            "lib/interventions/prediction-reality-ledger.ts",
        ],
        pathPrefixes: ["components/interventions/", "lib/interventions/"],
        consequenceTargets: ["components/shell/PageShell.tsx", "components/ui/ObsCommon.tsx"],
        rationale:
            "A new static route maps to App Router entry points, simulator modules, simulator components, and the shared shell/navigation surface.",
    },
    "shared-ui-change": {
        scenarioId: "shared-ui-change",
        matchedDomain: "core-observatory",
        matchedFileFamilies: ["component"],
        exactFiles: ["components/ui/ObsCommon.tsx"],
        consequenceTargets: ["components/ui/ObsCommon.tsx"],
        rationale:
            "A shared UI primitive has low file count but high cross-route blast radius, so every consequence-bearing edge into the primitive is relevant.",
    },
    "ci-verification": {
        scenarioId: "ci-verification",
        matchedDomain: "release-governance",
        matchedFileFamilies: ["workflow", "documentation", "asset", "config"],
        exactFiles: [
            ".github/workflows/ci.yml",
            "README.md",
            "docs/release-governance.md",
            "docs/production-verification.md",
            "app/icon.svg",
            "package.json",
        ],
        pathIncludes: ["release-governance", "production-verification"],
        rationale:
            "CI verification maps to workflow, release-governance documentation, production verification documentation, package scripts, and the favicon asset.",
    },
};

function files(): SnapshotFile[] {
    return Array.isArray(repositorySnapshot.files) ? repositorySnapshot.files : [];
}

function edges(): SnapshotEdge[] {
    return Array.isArray(repositorySnapshot.edges) ? repositorySnapshot.edges : [];
}

function mappingForScenario(scenarioId: string): ScenarioSnapshotMapping {
    return SCENARIO_SNAPSHOT_MAPPINGS[scenarioId] ?? { ...FALLBACK_MAPPING, scenarioId };
}

function fileMatchesMapping(file: SnapshotFile, mapping: ScenarioSnapshotMapping): boolean {
    if (mapping.exactFiles.includes(file.path)) return true;
    if (mapping.pathPrefixes?.some((prefix) => file.path.startsWith(prefix))) return true;
    if (mapping.pathIncludes?.some((needle) => file.path.includes(needle))) return true;
    return false;
}

function uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values)).sort((first, second) => first.localeCompare(second));
}

function relevantEdges(matchedPaths: Set<string>, consequenceTargets: string[]): SnapshotEdge[] {
    const structuralEdges = edges().filter(
        (edge) => matchedPaths.has(edge.from) || matchedPaths.has(edge.to),
    );
    const consequenceEdges = consequenceBearingEdges(repositorySnapshot).filter(
        (edge) => matchedPaths.has(edge.to) || consequenceTargets.includes(edge.to),
    );
    const keyed = new Map<string, SnapshotEdge>();
    for (const edge of [...structuralEdges, ...consequenceEdges]) {
        keyed.set(`${edge.from}->${edge.to}:${edge.kind}`, edge);
    }
    return Array.from(keyed.values()).sort((first, second) =>
        `${first.kind}:${first.from}:${first.to}`.localeCompare(`${second.kind}:${second.from}:${second.to}`),
    );
}

function routeBlastRadiusFor(
    matchedFiles: SnapshotFile[],
    relevantConsequenceEdges: SnapshotEdge[],
    sharedInfrastructureTouched: boolean,
): number {
    const routeCount = graphEvidence(repositorySnapshot).routeCount;
    if (sharedInfrastructureTouched) return routeCount;
    const matchedRouteCount = matchedFiles.filter((file) => file.family === "route").length;
    if (matchedRouteCount > 0) return matchedRouteCount;
    if (relevantConsequenceEdges.length > 0) return Math.min(routeCount, relevantConsequenceEdges.length);
    return 0;
}

function hasDomain(filesToCheck: SnapshotFile[], domain: RepositoryDomain): boolean {
    return filesToCheck.some((file) => file.domain === domain);
}

function hasPathPrefix(filesToCheck: SnapshotFile[], prefix: string): boolean {
    return filesToCheck.some((file) => file.path.startsWith(prefix));
}

function hasSharedInfrastructure(filesToCheck: SnapshotFile[], relevantConsequenceEdges: SnapshotEdge[]): boolean {
    return filesToCheck.some((file) =>
        file.path === "app/layout.tsx" ||
        file.path.startsWith("components/shell/") ||
        file.path === "components/ui/ObsCommon.tsx" ||
        file.path === "components/ui/SectionHeader.tsx",
    ) || relevantConsequenceEdges.some((edge) => edge.kind === "consequence");
}

function edgeKindCount(relevantEdgesForMapping: SnapshotEdge[], kind: EdgeKind): number {
    return relevantEdgesForMapping.filter((edge) => edge.kind === kind).length;
}

export function getSnapshotEvidenceForScenario(scenarioId: string): ScenarioSnapshotEvidence {
    const mapping = mappingForScenario(scenarioId);
    const matchedFiles = files().filter((file) => fileMatchesMapping(file, mapping));
    const matchedPaths = new Set(matchedFiles.map((file) => file.path));
    const consequenceTargets = mapping.consequenceTargets ?? [];
    const edgesForMapping = relevantEdges(matchedPaths, consequenceTargets);
    const consequenceEdges = edgesForMapping.filter((edge) => edge.kind === "consequence");
    const unresolvedExposure = matchedFiles.reduce(
        (total, file) => total + (Array.isArray(file.unresolvedImports) ? file.unresolvedImports.length : 0),
        0,
    );
    const sharedInfrastructureTouched = hasSharedInfrastructure(matchedFiles, consequenceEdges);

    return {
        scenarioId,
        matchedRepositoryDomain: mapping.matchedDomain,
        matchedFileFamilies: mapping.matchedFileFamilies,
        matchedFiles: uniqueSorted(matchedFiles.map((file) => file.path)),
        relevantConsequenceBearingEdges: consequenceEdges,
        routeBlastRadius: routeBlastRadiusFor(matchedFiles, consequenceEdges, sharedInfrastructureTouched),
        staticEdgeCountInvolved: edgesForMapping.length,
        unresolvedImportCaveat:
            unresolvedExposure > 0
                ? `${unresolvedExposure} unresolved import specifier(s) appear in the matched static snapshot surface.`
                : "No unresolved imports appear in the matched static snapshot surface.",
        unresolvedImportExposure: unresolvedExposure,
        sharedInfrastructureTouched,
        governanceSurfaceTouched: hasDomain(matchedFiles, "release-governance") || hasPathPrefix(matchedFiles, ".github/"),
        simulatorSurfaceTouched: hasDomain(matchedFiles, "intervention-simulator") || hasPathPrefix(matchedFiles, "components/interventions/"),
        quantumAnnexSurfaceTouched: hasDomain(matchedFiles, "quantum-annex") || hasPathPrefix(matchedFiles, "components/quantum/"),
        staticDependencyEvidenceAvailable: matchedFiles.length > 0,
        mappingRationale: mapping.rationale,
        snapshotDigest: repositorySnapshot.digest,
        staticApproximationCaveat: STATIC_APPROXIMATION_CAVEAT,
    };
}

export function snapshotEvidenceSummary(scenarioId: string): string {
    const evidence = getSnapshotEvidenceForScenario(scenarioId);
    if (!evidence.staticDependencyEvidenceAvailable) {
        return "No static snapshot match is available for this scenario.";
    }
    const consequenceCount = evidence.relevantConsequenceBearingEdges.length;
    return `${evidence.matchedFiles.length} matched file(s), ${evidence.staticEdgeCountInvolved} static edge(s), ${consequenceCount} consequence-bearing edge(s), route blast radius ${evidence.routeBlastRadius}.`;
}

export function consequenceEdgeCountByScenario(scenarioId: string): number {
    return getSnapshotEvidenceForScenario(scenarioId).relevantConsequenceBearingEdges.length;
}

export function edgeKindExposureByScenario(scenarioId: string): Record<EdgeKind, number> {
    const evidence = getSnapshotEvidenceForScenario(scenarioId);
    const involvedPaths = new Set(evidence.matchedFiles);
    const relevant = relevantEdges(involvedPaths, evidence.relevantConsequenceBearingEdges.map((edge) => edge.to));
    return {
        structural: edgeKindCount(relevant, "structural"),
        consequence: edgeKindCount(relevant, "consequence"),
        governance: edgeKindCount(relevant, "governance"),
        research: edgeKindCount(relevant, "research"),
        simulator: edgeKindCount(relevant, "simulator"),
    };
}
