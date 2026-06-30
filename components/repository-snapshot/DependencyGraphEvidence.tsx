// ─── DependencyGraphEvidence ───────────────────────────────────────
// Static dependency-graph evidence rendered as quiet tables rather than a
// node-link canvas: edge-kind distribution and the most-connected files.
// Explicitly framed as a static approximation, not a runtime graph.

import { Network } from "lucide-react";
import { GovernanceCaveat, SectionLabel, StatusBadge, ObsDivider } from "@/components/ui/ObsCommon";
import {
    graphEvidence,
    mostConnectedFiles,
    EDGE_KIND_LABEL,
    FAMILY_LABEL,
    DOMAIN_LABEL,
} from "@/lib/repository-snapshot/derived";
import type { RepositorySnapshot, EdgeKind } from "@/lib/repository-snapshot/types";

type BadgeVariant = "signal" | "caution" | "verified" | "risk" | "muted";

const KIND_VARIANT: Record<EdgeKind, BadgeVariant> = {
    consequence: "caution",
    governance: "verified",
    research: "signal",
    simulator: "signal",
    structural: "muted",
};

const KIND_ORDER: EdgeKind[] = ["consequence", "simulator", "research", "governance", "structural"];

const APPROXIMATION_CAVEAT =
    "These edges are a static approximation derived from import statements and documentation links. They are not a complete runtime dependency graph and do not capture dynamic, conditional, or framework-injected wiring.";

export function DependencyGraphEvidence({ snapshot }: { snapshot: RepositorySnapshot }) {
    const evidence = graphEvidence(snapshot);
    const connected = mostConnectedFiles(snapshot, 8);
    const maxKind = Math.max(1, ...KIND_ORDER.map((kind) => evidence.edgeKinds[kind] ?? 0));

    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Dependency Graph Evidence</span>
                        <span className="badge badge-muted">Static Approximation</span>
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <Network className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        {evidence.nodeCount} nodes · {evidence.edgeCount} edges
                    </h3>
                </div>
            </div>

            {/* Edge-kind distribution */}
            <div className="flex flex-col gap-2">
                <SectionLabel>Edge Classification</SectionLabel>
                <div className="flex flex-col gap-2">
                    {KIND_ORDER.map((kind) => {
                        const count = evidence.edgeKinds[kind] ?? 0;
                        return (
                            <div key={kind} className="flex items-center gap-3">
                                <span className="w-40 flex-shrink-0">
                                    <StatusBadge label={EDGE_KIND_LABEL[kind]} variant={KIND_VARIANT[kind]} />
                                </span>
                                <div className="h-1.5 flex-1 rounded-full bg-surface-elevated overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-accent/60"
                                        style={{ width: `${Math.round((count / maxKind) * 100)}%` }}
                                    />
                                </div>
                                <span className="w-10 flex-shrink-0 text-right text-xs font-mono text-text-secondary">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ObsDivider />

            {/* Most-connected files */}
            <div className="flex flex-col gap-2">
                <SectionLabel>Most-Connected Files</SectionLabel>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border-subtle text-left">
                                <th className="py-2 pr-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                    File
                                </th>
                                <th className="hidden sm:table-cell py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                    Domain
                                </th>
                                <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted text-right">
                                    In
                                </th>
                                <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted text-right">
                                    Out
                                </th>
                                <th className="py-2 pl-3 text-[10px] font-mono uppercase tracking-wider text-text-muted text-right">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {connected.map((row) => (
                                <tr key={row.path} className="border-b border-border-subtle/50 align-middle">
                                    <td className="py-2 pr-3">
                                        <span className="block text-xs font-mono text-text-primary break-all">
                                            {row.path}
                                        </span>
                                        <span className="text-[10px] text-text-muted">
                                            {FAMILY_LABEL[row.family] ?? row.family}
                                        </span>
                                    </td>
                                    <td className="hidden sm:table-cell py-2 px-3 text-[10px] text-text-muted">
                                        {DOMAIN_LABEL[row.domain] ?? row.domain}
                                    </td>
                                    <td className="py-2 px-3 text-right text-xs font-mono text-text-secondary">
                                        {row.inDegree}
                                    </td>
                                    <td className="py-2 px-3 text-right text-xs font-mono text-text-secondary">
                                        {row.outDegree}
                                    </td>
                                    <td className="py-2 pl-3 text-right text-xs font-mono font-semibold text-text-primary">
                                        {row.total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <GovernanceCaveat text={APPROXIMATION_CAVEAT} />
        </article>
    );
}
