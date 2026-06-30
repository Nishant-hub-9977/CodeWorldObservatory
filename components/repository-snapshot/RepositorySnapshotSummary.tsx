// ─── RepositorySnapshotSummary ─────────────────────────────────────
// Headline metric cards derived from the read-only repository snapshot.
// Presentational only — consumes the typed artifact and derived counts.

import { Boxes, GitBranch, Hash } from "lucide-react";
import { MetricCell, ObsDivider, SectionLabel } from "@/components/ui/ObsCommon";
import { graphEvidence, formatBytes } from "@/lib/repository-snapshot/derived";
import type { RepositorySnapshot } from "@/lib/repository-snapshot/types";

export function RepositorySnapshotSummary({ snapshot }: { snapshot: RepositorySnapshot }) {
    const evidence = graphEvidence(snapshot);
    const summary = snapshot.summary;

    const metrics = [
        { label: "Files", value: evidence.nodeCount, detail: "curated source surface" },
        { label: "Lines", value: (summary?.totalLines ?? 0).toLocaleString(), detail: "approximate" },
        { label: "Size", value: formatBytes(summary?.totalBytes ?? 0), detail: "approximate" },
        { label: "Edges", value: evidence.edgeCount, detail: "internal references" },
        { label: "Routes", value: evidence.routeCount, detail: "app routes" },
        { label: "Components", value: evidence.componentCount, detail: "components/" },
        { label: "Modules", value: evidence.moduleCount, detail: "lib + app modules" },
        { label: "Docs", value: evidence.docCount, detail: "markdown" },
        { label: "Config + Workflow", value: evidence.configWorkflowCount, detail: "config + CI" },
        { label: "External Imports", value: evidence.externalImportCount, detail: "package specifiers" },
        { label: "Unresolved Imports", value: evidence.unresolvedImportCount, detail: "static approximation" },
    ];

    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Snapshot Summary</span>
                        <span className="badge badge-muted">Read-Only Capture</span>
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <GitBranch className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        {snapshot.repositoryName}
                    </h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        <Boxes className="h-3 w-3" aria-hidden="true" />
                        schema v{snapshot.schemaVersion}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">{snapshot.generator}</span>
                </div>
            </div>

            <ObsDivider />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="rounded-md border border-border-subtle bg-surface-elevated"
                    >
                        <MetricCell label={metric.label} value={metric.value} detail={metric.detail} />
                    </div>
                ))}
            </div>

            <div className="flex items-start gap-2 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                <Hash className="mt-0.5 h-3 w-3 flex-shrink-0 text-text-muted opacity-70" aria-hidden="true" />
                <div className="flex flex-col gap-0.5 min-w-0">
                    <SectionLabel className="!mb-0">Deterministic Content Digest</SectionLabel>
                    <span className="break-all text-[10px] font-mono text-text-secondary">{snapshot.digest}</span>
                </div>
            </div>
        </article>
    );
}
