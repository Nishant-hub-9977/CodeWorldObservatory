// ─── ResourceConsequenceEvidenceCard ──────────────────────────────
// Premium, institutional rendering of an exported Resource Consequence
// Ledger JSON artifact. Pure presentational server component — it displays
// exported evidence only and performs no live quantum simulation.

import {
    GovernanceCaveat,
    MetricCell,
    ObsDivider,
    SectionLabel,
    StatusBadge,
} from "@/components/ui/ObsCommon";
import type { ResourceConsequenceEvidence } from "@/lib/quantum/sample-result";

const EVIDENCE_BOUNDARY =
    "Exported JSON evidence only — not live quantum compute. This artifact is produced by a local research script. No Python runs and no quantum library is invoked during web rendering.";

type BadgeVariant = "signal" | "caution" | "verified" | "risk" | "muted";

function approvalVariant(state: string | undefined | null): BadgeVariant {
    switch ((state ?? "").trim().toLowerCase()) {
        case "approved":
            return "verified";
        case "rejected":
            return "risk";
        case "pending":
            return "caution";
        default:
            // Unknown / missing approval states fall back to a neutral,
            // non-alarming institutional style rather than crashing.
            return "muted";
    }
}

function formatTimestamp(iso: string | undefined | null): string {
    if (!iso) return "\u2014";
    try {
        return new Date(iso).toISOString().replace("T", " ").replace(/\.\d+Z$/, "Z");
    } catch {
        return iso;
    }
}

function MetaBlock({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">{label}</span>
            <span className={`text-xs text-text-primary break-words ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    );
}

function EvidenceList({ label, items }: { label: string; items: string[] }) {
    return (
        <div className="flex flex-col gap-2">
            <SectionLabel>{label}</SectionLabel>
            <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                        <span aria-hidden="true" className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-text-muted" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function ResourceConsequenceEvidenceCard({
    evidence,
}: {
    evidence: ResourceConsequenceEvidence;
}) {
    const pr = evidence.predicted_resources;
    const ob = evidence.observed_result;
    const toolsDetected = ob?.optional_quantum_tools_detected ?? [];
    const approvalLabel = evidence.human_approval_state?.trim() || "unknown";
    const assumptions = evidence.assumptions ?? [];
    const limitations = evidence.limitations ?? [];

    return (
        <article className="obs-panel flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Evidence Artifact</span>
                        <span className="badge badge-muted">Exported JSON Result</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{evidence.experiment_name}</h3>
                    <p className="text-[10px] font-mono text-text-muted">run · {evidence.run_id}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Human Approval State
                    </span>
                    <StatusBadge
                        label={approvalLabel}
                        variant={approvalVariant(approvalLabel)}
                    />
                </div>
            </div>

            <ObsDivider />

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetaBlock label="Source" value={evidence.source} mono />
                <MetaBlock label="Simulation Status" value={evidence.simulation_status ?? "—"} />
                <MetaBlock label="Timestamp" value={formatTimestamp(evidence.timestamp)} mono />
            </div>

            {/* Predicted vs Observed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-md border border-border-subtle bg-surface-elevated p-1">
                    <SectionLabel className="px-3 pt-2">Predicted Resources</SectionLabel>
                    <div className="grid grid-cols-3 gap-1">
                        <MetricCell label="Files" value={pr?.files_affected ?? "\u2014"} />
                        <MetricCell label="Dep Zones" value={pr?.dependency_zones_touched ?? "\u2014"} />
                        <MetricCell label="Test Fails" value={pr?.test_surfaces_predicted_to_fail ?? "\u2014"} />
                    </div>
                </div>
                <div className="rounded-md border border-border-subtle bg-surface-elevated p-1">
                    <SectionLabel className="px-3 pt-2">Observed Result</SectionLabel>
                    <div className="grid grid-cols-3 gap-1">
                        <MetricCell label="Files" value={ob?.files_affected ?? "\u2014"} />
                        <MetricCell label="Dep Zones" value={ob?.dependency_zones_touched ?? "\u2014"} />
                        <MetricCell label="Test Fails" value={ob?.test_surfaces_failed ?? "\u2014"} />
                    </div>
                    <p className="px-3 pb-2 text-[10px] font-mono text-text-muted">
                        Optional quantum tools detected:{" "}
                        {toolsDetected.length > 0 ? toolsDetected.join(", ") : "none"}
                    </p>
                </div>
            </div>

            {/* Uncertainty */}
            <div className="rounded-md border border-border-subtle bg-surface-elevated px-4 py-3">
                <SectionLabel className="!mb-1">Uncertainty</SectionLabel>
                <p className="text-xs leading-relaxed text-text-secondary">{evidence.uncertainty ?? "\u2014"}</p>
            </div>

            {/* Assumptions & Limitations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <EvidenceList label="Assumptions" items={assumptions} />
                <EvidenceList label="Limitations" items={limitations} />
            </div>

            <ObsDivider />

            {/* Boundary */}
            <div className="flex flex-col gap-3">
                <span className="badge badge-muted self-start">No Production Quantum Workload</span>
                <GovernanceCaveat text={EVIDENCE_BOUNDARY} />
            </div>
        </article>
    );
}
