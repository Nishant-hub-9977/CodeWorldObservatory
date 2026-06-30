// ─── SnapshotRiskSummary ───────────────────────────────────────────
// Compact display of deterministic, snapshot-informed risk enrichment
// for the selected intervention scenario.

import { GitBranch, ShieldAlert } from "lucide-react";
import { GovernanceCaveat, MetricCell, SectionLabel, StatusBadge } from "@/components/ui/ObsCommon";
import type { SnapshotRiskSummary as SnapshotRiskSummaryData, SnapshotRiskTier } from "@/lib/interventions/snapshot-risk";

type BadgeVariant = "signal" | "caution" | "verified" | "risk" | "muted";

function riskVariant(tier: SnapshotRiskTier): BadgeVariant {
    switch (tier) {
        case "HIGH":
            return "risk";
        case "MEDIUM":
            return "caution";
        default:
            return "verified";
    }
}

function booleanLabel(value: boolean): string {
    return value ? "yes" : "no";
}

export function SnapshotRiskSummary({ risk }: { risk: SnapshotRiskSummaryData }) {
    return (
        <div className="rounded-md border border-border-subtle bg-surface-elevated p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <SectionLabel className="!mb-0">
                    <span className="inline-flex items-center gap-1.5">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" /> Snapshot Risk Summary
                    </span>
                </SectionLabel>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Risk Tier</span>
                    <StatusBadge label={risk.snapshotRiskTier} variant={riskVariant(risk.snapshotRiskTier)} />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCell label="Route Blast Radius" value={risk.routeBlastRadius} />
                <MetricCell label="Consequence Edges" value={risk.consequenceEdgeCount} />
                <MetricCell label="Static Edges" value={risk.staticEdgeCountInvolved} />
                <MetricCell label="Evidence Confidence" value={risk.evidenceConfidence} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Shared Infrastructure
                    </span>
                    <StatusBadge
                        label={booleanLabel(risk.sharedInfrastructureTouched)}
                        variant={risk.sharedInfrastructureTouched ? "risk" : "verified"}
                    />
                </div>
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Governance Surface
                    </span>
                    <StatusBadge
                        label={booleanLabel(risk.governanceSurfaceTouched)}
                        variant={risk.governanceSurfaceTouched ? "caution" : "muted"}
                    />
                </div>
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Unresolved Imports
                    </span>
                    <StatusBadge
                        label={String(risk.unresolvedImportExposure)}
                        variant={risk.unresolvedImportExposure > 0 ? "caution" : "verified"}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <SectionLabel className="!mb-1">
                    <span className="inline-flex items-center gap-1.5">
                        <GitBranch className="h-3 w-3" aria-hidden="true" /> Risk Rationale
                    </span>
                </SectionLabel>
                <p className="text-xs leading-relaxed text-text-secondary">{risk.rationale}</p>
            </div>

            <GovernanceCaveat text={risk.staticApproximationCaveat} />
        </div>
    );
}
