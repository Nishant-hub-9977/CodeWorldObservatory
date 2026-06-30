// ─── FileFamilyBreakdown ───────────────────────────────────────────
// Table-based breakdown of the snapshot by file family and by domain.
// No node-link canvas — evidence is presented as quiet, scannable rows.

import { SectionLabel, ObsDivider } from "@/components/ui/ObsCommon";
import {
    familyBreakdown,
    domainBreakdown,
    formatBytes,
    FAMILY_LABEL,
    DOMAIN_LABEL,
} from "@/lib/repository-snapshot/derived";
import type { RepositorySnapshot } from "@/lib/repository-snapshot/types";

export function FileFamilyBreakdown({ snapshot }: { snapshot: RepositorySnapshot }) {
    const families = familyBreakdown(snapshot);
    const domains = domainBreakdown(snapshot);
    const maxCount = families.reduce((max, row) => Math.max(max, row.count), 0) || 1;
    const totalFiles = families.reduce((sum, row) => sum + row.count, 0) || 1;

    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-signal">File Families</span>
                <span className="badge badge-muted">{families.length} families</span>
            </div>

            {/* Family table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-border-subtle text-left">
                            <th className="py-2 pr-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                Family
                            </th>
                            <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                Files
                            </th>
                            <th className="hidden sm:table-cell py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                Lines
                            </th>
                            <th className="hidden sm:table-cell py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                Size
                            </th>
                            <th className="py-2 pl-3 text-[10px] font-mono uppercase tracking-wider text-text-muted w-1/3">
                                Share
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {families.map((row) => (
                            <tr key={row.family} className="border-b border-border-subtle/50 align-middle">
                                <td className="py-2 pr-3 text-xs font-medium text-text-primary">
                                    {FAMILY_LABEL[row.family] ?? row.family}
                                </td>
                                <td className="py-2 px-3 text-xs font-mono text-text-secondary">{row.count}</td>
                                <td className="hidden sm:table-cell py-2 px-3 text-xs font-mono text-text-muted">
                                    {row.lines.toLocaleString()}
                                </td>
                                <td className="hidden sm:table-cell py-2 px-3 text-xs font-mono text-text-muted">
                                    {formatBytes(row.bytes)}
                                </td>
                                <td className="py-2 pl-3">
                                    <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-accent/60"
                                            style={{ width: `${Math.round((row.count / maxCount) * 100)}%` }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ObsDivider />

            {/* Domain breakdown */}
            <div className="flex flex-col gap-2">
                <SectionLabel>Domain Distribution</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {domains.map((row) => (
                        <div
                            key={row.domain}
                            className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2"
                        >
                            <span className="text-xs text-text-secondary">
                                {DOMAIN_LABEL[row.domain] ?? row.domain}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-text-muted">
                                    {Math.round((row.count / totalFiles) * 100)}%
                                </span>
                                <span className="badge badge-muted">{row.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
}
