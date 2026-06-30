// ─── SnapshotEvidencePanel ─────────────────────────────────────────
// Detailed static snapshot evidence used by the selected simulator
// scenario. Table-based, advisory-only, no graph canvas.

import { Network, ShieldCheck } from "lucide-react";
import { EmptyState, GovernanceCaveat, ObsDivider, SectionLabel, StatusBadge } from "@/components/ui/ObsCommon";
import type { ScenarioSnapshotEvidence } from "@/lib/interventions/snapshot-bridge";
import type { SnapshotRiskSummary } from "@/lib/interventions/snapshot-risk";

function booleanLabel(value: boolean): string {
    return value ? "yes" : "no";
}

function limitedRows(values: string[], limit: number): string[] {
    return values.slice(0, Math.max(0, limit));
}

export function SnapshotEvidencePanel({
    evidence,
    risk,
}: {
    evidence: ScenarioSnapshotEvidence;
    risk: SnapshotRiskSummary;
}) {
    const matchedFiles = limitedRows(evidence.matchedFiles, 8);
    const consequenceEdges = evidence.relevantConsequenceBearingEdges.slice(0, 6);

    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Snapshot Evidence</span>
                        <span className="badge badge-muted">Static Graph Alignment</span>
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <Network className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        Real static repository evidence informs the prediction
                    </h3>
                    <p className="text-xs leading-relaxed text-text-secondary max-w-prose">
                        {evidence.mappingRationale}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Snapshot Risk
                    </span>
                    <StatusBadge
                        label={risk.snapshotRiskTier}
                        variant={risk.snapshotRiskTier === "HIGH" ? "risk" : risk.snapshotRiskTier === "MEDIUM" ? "caution" : "verified"}
                    />
                    <span className="text-[10px] font-mono text-text-muted">{risk.evidenceConfidence} confidence</span>
                </div>
            </div>

            <ObsDivider />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <SectionLabel>Snapshot-matched files</SectionLabel>
                    {matchedFiles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-border-subtle">
                                        <th className="py-2 pr-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                            File
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchedFiles.map((file) => (
                                        <tr key={file} className="border-b border-border-subtle/50">
                                            <td className="py-2 pr-3 font-mono text-[11px] text-text-secondary break-all">
                                                {file}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {evidence.matchedFiles.length > matchedFiles.length && (
                                <p className="mt-2 text-[10px] text-text-muted">
                                    +{evidence.matchedFiles.length - matchedFiles.length} additional matched file(s) retained in static evidence.
                                </p>
                            )}
                        </div>
                    ) : (
                        <EmptyState message="No static snapshot files matched this scenario." />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <SectionLabel>Consequence-bearing edges</SectionLabel>
                    {consequenceEdges.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-border-subtle">
                                        <th className="py-2 pr-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                            Source
                                        </th>
                                        <th className="py-2 pl-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                            Shared Target
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consequenceEdges.map((edge) => (
                                        <tr key={`${edge.from}->${edge.to}`} className="border-b border-border-subtle/50 align-top">
                                            <td className="py-2 pr-3 font-mono text-[11px] text-text-secondary break-all">
                                                {edge.from}
                                            </td>
                                            <td className="py-2 pl-3 font-mono text-[11px] text-text-primary break-all">
                                                {edge.to}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {evidence.relevantConsequenceBearingEdges.length > consequenceEdges.length && (
                                <p className="mt-2 text-[10px] text-text-muted">
                                    +{evidence.relevantConsequenceBearingEdges.length - consequenceEdges.length} additional consequence edge(s) retained in static evidence.
                                </p>
                            )}
                        </div>
                    ) : (
                        <EmptyState message="No consequence-bearing edge is attached to this scenario mapping." />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Route Blast Radius</span>
                    <span className="text-sm font-semibold text-text-primary">{evidence.routeBlastRadius}</span>
                </div>
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Shared Infra</span>
                    <StatusBadge label={booleanLabel(evidence.sharedInfrastructureTouched)} variant={evidence.sharedInfrastructureTouched ? "risk" : "verified"} />
                </div>
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Governance</span>
                    <StatusBadge label={booleanLabel(evidence.governanceSurfaceTouched)} variant={evidence.governanceSurfaceTouched ? "caution" : "muted"} />
                </div>
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Static Edges</span>
                    <span className="text-sm font-semibold text-text-primary">{evidence.staticEdgeCountInvolved}</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md border border-border-subtle bg-surface-elevated px-4 py-3">
                <div className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-text-muted" aria-hidden="true" />
                    <p className="text-xs leading-relaxed text-text-secondary">
                        {evidence.unresolvedImportCaveat} Snapshot digest: {evidence.snapshotDigest.slice(0, 19)}...
                    </p>
                </div>
                <a
                    href="/repository-snapshot"
                    className="inline-flex flex-shrink-0 text-xs font-medium text-accent transition-colors hover:text-text-primary"
                >
                    View repository snapshot evidence.
                </a>
            </div>

            <GovernanceCaveat text={evidence.staticApproximationCaveat} />
        </article>
    );
}
