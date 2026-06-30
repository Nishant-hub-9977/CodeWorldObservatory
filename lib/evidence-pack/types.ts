// ─── External Evidence Pack Types ───────────────────────────────────
// Shape for static external evidence-pack samples. Packs are imported as
// committed JSON evidence only; the web app never uploads, scans, or
// executes repository content.

export type EvidencePackSourceType = "external_static_sample";
export type EvidencePackValidationStatus = "VALID" | "VALID_WITH_WARNINGS" | "INVALID_STATIC_SAMPLE";
export type EvidencePackRiskSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface EvidencePackEdge {
    from: string;
    to: string;
    reason: string;
}

export interface EvidencePackRiskSurface {
    id: string;
    label: string;
    severity: EvidencePackRiskSeverity;
    files: string[];
    reason: string;
}

export interface UnsupportedEvidenceField {
    field: string;
    status: "rejected" | "unsupported";
    reason: string;
}

export interface ExternalEvidencePackRaw {
    pack_id?: unknown;
    source_type?: unknown;
    repository_label?: unknown;
    generated_by?: unknown;
    schema_version?: unknown;
    file_count?: unknown;
    edge_count?: unknown;
    route_count?: unknown;
    component_count?: unknown;
    data_module_count?: unknown;
    docs_count?: unknown;
    unresolved_import_count?: unknown;
    consequence_bearing_edges?: unknown;
    file_families?: unknown;
    domains?: unknown;
    risk_surfaces?: unknown;
    limitations?: unknown;
    unsupported_fields?: unknown;
    human_review_required?: unknown;
    advisory_only?: unknown;
    no_repository_mutation?: unknown;
}

export interface ExternalEvidencePack {
    packId: string;
    sourceType: EvidencePackSourceType;
    repositoryLabel: string;
    generatedBy: string;
    schemaVersion: string;
    fileCount: number;
    edgeCount: number;
    routeCount: number;
    componentCount: number;
    dataModuleCount: number;
    docsCount: number;
    unresolvedImportCount: number;
    consequenceBearingEdges: EvidencePackEdge[];
    fileFamilies: Record<string, number>;
    domains: Record<string, number>;
    riskSurfaces: EvidencePackRiskSurface[];
    limitations: string[];
    unsupportedFields: UnsupportedEvidenceField[];
    humanReviewRequired: boolean;
    advisoryOnly: boolean;
    noRepositoryMutation: boolean;
}

export interface EvidencePackValidationIssue {
    level: "error" | "warning";
    field: string;
    message: string;
}

export interface EvidencePackValidationResult {
    status: EvidencePackValidationStatus;
    pack: ExternalEvidencePack;
    issues: EvidencePackValidationIssue[];
    requiredFieldsPresent: boolean;
    unsupportedFieldCount: number;
    boundaryCaveat: string;
}
