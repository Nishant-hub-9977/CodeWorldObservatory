// ─── Evidence Pack Validation (deterministic · defensive) ───────────
// Normalizes a static JSON evidence pack and flags invalid or unsupported
// capabilities. No filesystem, network, randomness, or mutation.

import type {
    EvidencePackEdge,
    EvidencePackRiskSeverity,
    EvidencePackRiskSurface,
    EvidencePackValidationIssue,
    EvidencePackValidationResult,
    ExternalEvidencePack,
    ExternalEvidencePackRaw,
    UnsupportedEvidenceField,
} from "./types";

const BOUNDARY_CAVEAT =
    "Static evidence-pack import only: no upload storage, no runtime repository scan, no code execution, no GitHub write API, and no repository mutation.";

const REQUIRED_FIELDS: Array<keyof ExternalEvidencePackRaw> = [
    "pack_id",
    "source_type",
    "repository_label",
    "generated_by",
    "schema_version",
    "file_count",
    "edge_count",
    "route_count",
    "component_count",
    "data_module_count",
    "docs_count",
    "unresolved_import_count",
    "consequence_bearing_edges",
    "file_families",
    "domains",
    "risk_surfaces",
    "limitations",
    "human_review_required",
    "advisory_only",
    "no_repository_mutation",
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "unknown"): string {
    return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function asBoolean(value: unknown): boolean {
    return value === true;
}

function asStringArray(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
}

function asCountRecord(value: unknown): Record<string, number> {
    if (!isRecord(value)) return {};
    const entries = Object.entries(value)
        .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] >= 0)
        .sort(([first], [second]) => first.localeCompare(second));
    return Object.fromEntries(entries);
}

function asEdges(value: unknown): EvidencePackEdge[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter(isRecord)
        .map((edge) => ({
            from: asString(edge.from, "unknown-source"),
            to: asString(edge.to, "unknown-target"),
            reason: asString(edge.reason, "No reason supplied."),
        }))
        .sort((first, second) => `${first.from}:${first.to}`.localeCompare(`${second.from}:${second.to}`));
}

function asSeverity(value: unknown): EvidencePackRiskSeverity {
    return value === "HIGH" || value === "MEDIUM" || value === "LOW" ? value : "LOW";
}

function asRiskSurfaces(value: unknown): EvidencePackRiskSurface[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter(isRecord)
        .map((surface) => ({
            id: asString(surface.id, "unknown-risk-surface"),
            label: asString(surface.label, "Unknown risk surface"),
            severity: asSeverity(surface.severity),
            files: asStringArray(surface.files),
            reason: asString(surface.reason, "No reason supplied."),
        }))
        .sort((first, second) => first.id.localeCompare(second.id));
}

function asUnsupportedFields(value: unknown): UnsupportedEvidenceField[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter(isRecord)
        .map((field) => {
            const status: UnsupportedEvidenceField["status"] =
                field.status === "unsupported" ? "unsupported" : "rejected";
            return {
                field: asString(field.field, "unknown_field"),
                status,
                reason: asString(field.reason, "Unsupported capability was not accepted."),
            };
        })
        .sort((first, second) => first.field.localeCompare(second.field));
}

function missingRequiredFields(raw: ExternalEvidencePackRaw): string[] {
    return REQUIRED_FIELDS.filter((field) => raw[field] === undefined).map(String);
}

function normalizePack(raw: ExternalEvidencePackRaw): ExternalEvidencePack {
    return {
        packId: asString(raw.pack_id, "invalid-pack"),
        sourceType: raw.source_type === "external_static_sample" ? "external_static_sample" : "external_static_sample",
        repositoryLabel: asString(raw.repository_label, "Unknown external repository"),
        generatedBy: asString(raw.generated_by, "unknown-generator"),
        schemaVersion: asString(raw.schema_version, "unknown-schema"),
        fileCount: asNumber(raw.file_count),
        edgeCount: asNumber(raw.edge_count),
        routeCount: asNumber(raw.route_count),
        componentCount: asNumber(raw.component_count),
        dataModuleCount: asNumber(raw.data_module_count),
        docsCount: asNumber(raw.docs_count),
        unresolvedImportCount: asNumber(raw.unresolved_import_count),
        consequenceBearingEdges: asEdges(raw.consequence_bearing_edges),
        fileFamilies: asCountRecord(raw.file_families),
        domains: asCountRecord(raw.domains),
        riskSurfaces: asRiskSurfaces(raw.risk_surfaces),
        limitations: asStringArray(raw.limitations),
        unsupportedFields: asUnsupportedFields(raw.unsupported_fields),
        humanReviewRequired: asBoolean(raw.human_review_required),
        advisoryOnly: asBoolean(raw.advisory_only),
        noRepositoryMutation: asBoolean(raw.no_repository_mutation),
    };
}

export function validateEvidencePack(rawInput: unknown): EvidencePackValidationResult {
    const raw = isRecord(rawInput) ? (rawInput as ExternalEvidencePackRaw) : {};
    const issues: EvidencePackValidationIssue[] = [];
    const missing = missingRequiredFields(raw);

    for (const field of missing) {
        issues.push({ level: "error", field, message: "Required top-level evidence-pack field is missing." });
    }
    if (raw.source_type !== "external_static_sample") {
        issues.push({ level: "error", field: "source_type", message: "Only external_static_sample packs are accepted in Q9." });
    }
    if (raw.human_review_required !== true) {
        issues.push({ level: "error", field: "human_review_required", message: "Evidence packs must require human review." });
    }
    if (raw.advisory_only !== true) {
        issues.push({ level: "error", field: "advisory_only", message: "Evidence packs must remain advisory-only." });
    }
    if (raw.no_repository_mutation !== true) {
        issues.push({ level: "error", field: "no_repository_mutation", message: "Evidence packs must declare no repository mutation." });
    }

    const pack = normalizePack(raw);
    for (const unsupported of pack.unsupportedFields) {
        issues.push({
            level: "warning",
            field: unsupported.field,
            message: `Unsupported capability ${unsupported.status}: ${unsupported.reason}`,
        });
    }
    if (pack.unresolvedImportCount > 0) {
        issues.push({
            level: "warning",
            field: "unresolved_import_count",
            message: `${pack.unresolvedImportCount} unresolved import(s) are reported by the static sample.`,
        });
    }

    const hasErrors = issues.some((issue) => issue.level === "error");
    const hasWarnings = issues.some((issue) => issue.level === "warning");

    return {
        status: hasErrors ? "INVALID_STATIC_SAMPLE" : hasWarnings ? "VALID_WITH_WARNINGS" : "VALID",
        pack,
        issues,
        requiredFieldsPresent: missing.length === 0,
        unsupportedFieldCount: pack.unsupportedFields.length,
        boundaryCaveat: BOUNDARY_CAVEAT,
    };
}
