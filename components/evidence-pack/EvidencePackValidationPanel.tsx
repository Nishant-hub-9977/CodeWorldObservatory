// ─── EvidencePackValidationPanel ───────────────────────────────────
// Shows deterministic validation status, warnings, and rejected fields.

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { EmptyState, GovernanceCaveat, ObsDivider, SectionLabel, StatusBadge } from "@/components/ui/ObsCommon";
import { validationStatusDetail } from "@/lib/evidence-pack/derived";
import type { EvidencePackValidationResult, EvidencePackValidationStatus } from "@/lib/evidence-pack/types";

function statusVariant(status: EvidencePackValidationStatus): "signal" | "caution" | "verified" | "risk" | "muted" {
    if (status === "VALID") return "verified";
    if (status === "VALID_WITH_WARNINGS") return "caution";
    return "risk";
}

export function EvidencePackValidationPanel({ validation }: { validation: EvidencePackValidationResult }) {
    const warnings = validation.issues.filter((issue) => issue.level === "warning");
    const errors = validation.issues.filter((issue) => issue.level === "error");

    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Schema Validation</span>
                        <StatusBadge label={validation.status} variant={statusVariant(validation.status)} />
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <CheckCircle2 className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        Static sample validation result
                    </h3>
                    <p className="text-xs leading-relaxed text-text-secondary">{validationStatusDetail(validation)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Required Fields</span>
                    <StatusBadge label={validation.requiredFieldsPresent ? "present" : "missing"} variant={validation.requiredFieldsPresent ? "verified" : "risk"} />
                    <span className="text-[10px] font-mono text-text-muted">{validation.unsupportedFieldCount} rejected field(s)</span>
                </div>
            </div>

            <ObsDivider />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <SectionLabel>
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldAlert className="h-3 w-3" aria-hidden="true" /> Warnings
                        </span>
                    </SectionLabel>
                    {warnings.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {warnings.map((issue) => (
                                <div key={`${issue.field}:${issue.message}`} className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-warning">{issue.field}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{issue.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No validation warnings." />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <SectionLabel>Errors</SectionLabel>
                    {errors.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {errors.map((issue) => (
                                <div key={`${issue.field}:${issue.message}`} className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                                    <p className="text-[10px] font-mono uppercase tracking-wider text-warning">{issue.field}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{issue.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No validation errors." />
                    )}
                </div>
            </div>

            <GovernanceCaveat text={validation.boundaryCaveat} />
        </article>
    );
}
