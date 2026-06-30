// ─── Evidence Pack Derived Views ────────────────────────────────────
// Pure comparison helpers for a static external evidence pack and the
// current CodeWorld repository snapshot.

import { repositorySnapshot } from "@/lib/repository-snapshot/snapshot";
import { consequenceBearingEdges, familyBreakdown, graphEvidence } from "@/lib/repository-snapshot/derived";
import type { EvidencePackValidationResult, ExternalEvidencePack } from "./types";

export interface CountRow {
    label: string;
    externalValue: string | number;
    codeWorldValue: string | number;
    note: string;
}

export interface NamedCountRow {
    label: string;
    count: number;
}

export interface EvidencePackComparison {
    rows: CountRow[];
    externalDominantFamilies: NamedCountRow[];
    codeWorldDominantFamilies: NamedCountRow[];
    validationStatus: EvidencePackValidationResult["status"];
    riskSurfaceCount: number;
}

function topCounts(record: Record<string, number>, limit = 4): NamedCountRow[] {
    return Object.entries(record)
        .map(([label, count]) => ({ label, count }))
        .sort((first, second) => (second.count === first.count ? first.label.localeCompare(second.label) : second.count - first.count))
        .slice(0, Math.max(0, limit));
}

function topCodeWorldFamilies(limit = 4): NamedCountRow[] {
    return familyBreakdown(repositorySnapshot)
        .map((row) => ({ label: row.family, count: row.count }))
        .slice(0, Math.max(0, limit));
}

export function evidencePackFamilyRows(pack: ExternalEvidencePack): NamedCountRow[] {
    return topCounts(pack.fileFamilies, 8);
}

export function evidencePackDomainRows(pack: ExternalEvidencePack): NamedCountRow[] {
    return topCounts(pack.domains, 8);
}

export function buildEvidencePackComparison(
    validation: EvidencePackValidationResult,
): EvidencePackComparison {
    const pack = validation.pack;
    const currentGraph = graphEvidence(repositorySnapshot);
    const currentConsequenceEdges = consequenceBearingEdges(repositorySnapshot).length;

    return {
        validationStatus: validation.status,
        riskSurfaceCount: pack.riskSurfaces.length,
        externalDominantFamilies: topCounts(pack.fileFamilies),
        codeWorldDominantFamilies: topCodeWorldFamilies(),
        rows: [
            {
                label: "File Count",
                externalValue: pack.fileCount,
                codeWorldValue: currentGraph.nodeCount,
                note: "Static pack size compared with the current CodeWorld snapshot node count.",
            },
            {
                label: "Edge Count",
                externalValue: pack.edgeCount,
                codeWorldValue: currentGraph.edgeCount,
                note: "Approximate dependency edges only; neither side claims runtime completeness.",
            },
            {
                label: "Route Count",
                externalValue: pack.routeCount,
                codeWorldValue: currentGraph.routeCount,
                note: "Route surfaces indicate how wide a UI or shell intervention might spread.",
            },
            {
                label: "Consequence-bearing Edges",
                externalValue: pack.consequenceBearingEdges.length,
                codeWorldValue: currentConsequenceEdges,
                note: "Shared targets that should receive human review before action.",
            },
            {
                label: "Unresolved Imports",
                externalValue: pack.unresolvedImportCount,
                codeWorldValue: currentGraph.unresolvedImportCount,
                note: "Unresolved import counts stay visible rather than being hidden in the graph.",
            },
            {
                label: "Risk Surfaces",
                externalValue: pack.riskSurfaces.length,
                codeWorldValue: "N/A",
                note: "External packs can summarize risk surfaces without granting execution authority.",
            },
            {
                label: "Validation Status",
                externalValue: validation.status,
                codeWorldValue: "static reference",
                note: "The imported pack is validated separately from CodeWorld's own snapshot.",
            },
        ],
    };
}

export function validationStatusDetail(validation: EvidencePackValidationResult): string {
    if (validation.status === "VALID") return "The static sample satisfies all required Q9 import-boundary fields.";
    if (validation.status === "VALID_WITH_WARNINGS") {
        return "The static sample is accepted with visible warnings for unsupported or incomplete evidence.";
    }
    return "The static sample is not accepted as importable evidence because required boundary fields failed validation.";
}
