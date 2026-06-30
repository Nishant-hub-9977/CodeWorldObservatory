// ─── ConsequenceBearingEdges ───────────────────────────────────────
// The headline "hidden dependency" evidence: edges into shared infrastructure
// reachable across multiple routes, where a single change carries the widest
// blast radius. Also surfaces feature-domain edge groupings and the
// unresolved-import caveat that keeps the approximation honest.

import { Radar, AlertTriangle } from "lucide-react";
import { GovernanceCaveat, SectionLabel, StatusBadge, ObsDivider, EmptyState } from "@/components/ui/ObsCommon";
import { consequenceBearingEdges, edgesOfKind, graphEvidence } from "@/lib/repository-snapshot/derived";
import type { RepositorySnapshot } from "@/lib/repository-snapshot/types";

const CONSEQUENCE_NOTE =
    "A consequence-bearing edge points into shared infrastructure (shell, layout, or shared UI/modules) that is reachable from more than one route. Changing such a target has the widest blast radius — the dependency a careful intervention must weigh first.";

const UNRESOLVED_CAVEAT =
    "Unresolved and external imports are recorded separately and never silently merged into the graph. This keeps the static approximation honest: edges shown are resolved internal references only.";

export function ConsequenceBearingEdges({ snapshot }: { snapshot: RepositorySnapshot }) {
    const consequence = consequenceBearingEdges(snapshot);
    const evidence = graphEvidence(snapshot);

    const groups = [
        { label: "Simulator", kind: "simulator" as const, variant: "signal" as const },
        { label: "Research", kind: "research" as const, variant: "signal" as const },
        { label: "Governance", kind: "governance" as const, variant: "verified" as const },
    ];

    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-caution">Consequence-Bearing Edges</span>
                        <span className="badge badge-muted">{consequence.length} edges</span>
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <Radar className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        Widest blast radius first
                    </h3>
                </div>
            </div>

            <p className="text-xs leading-relaxed text-text-secondary">{CONSEQUENCE_NOTE}</p>

            {/* Consequence-bearing edge table */}
            {consequence.length === 0 ? (
                <EmptyState message="No consequence-bearing edges detected in this snapshot." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border-subtle text-left">
                                <th className="py-2 pr-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                    Source
                                </th>
                                <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                    Shared Target
                                </th>
                                <th className="py-2 pl-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                    Class
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {consequence.map((edge) => (
                                <tr
                                    key={`${edge.from}->${edge.to}`}
                                    className="border-b border-border-subtle/50 align-middle"
                                >
                                    <td className="py-2 pr-3 text-[11px] font-mono text-text-secondary break-all">
                                        {edge.from}
                                    </td>
                                    <td className="py-2 px-3 text-[11px] font-mono text-text-primary break-all">
                                        {edge.to}
                                    </td>
                                    <td className="py-2 pl-3">
                                        <StatusBadge label="consequence" variant="caution" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ObsDivider />

            {/* Feature-domain edge groupings */}
            <div className="flex flex-col gap-2">
                <SectionLabel>Feature-Domain Edges</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {groups.map((group) => {
                        const count = edgesOfKind(snapshot, group.kind).length;
                        return (
                            <div
                                key={group.kind}
                                className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2.5"
                            >
                                <StatusBadge label={group.label} variant={group.variant} />
                                <span className="text-sm font-mono font-semibold text-text-primary">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Unresolved import context */}
            <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2.5">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-warning opacity-80" aria-hidden="true" />
                <span className="text-xs text-text-secondary">
                    {evidence.unresolvedImportCount} unresolved · {evidence.externalImportCount} external package imports
                </span>
            </div>

            <GovernanceCaveat text={UNRESOLVED_CAVEAT} />
        </article>
    );
}
