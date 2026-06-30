// ─── EvidencePackComparison ────────────────────────────────────────
// Restrained static comparison between an external evidence pack and the
// current CodeWorld repository snapshot.

import { GitCompareArrows } from "lucide-react";
import { ObsDivider, SectionLabel, StatusBadge } from "@/components/ui/ObsCommon";
import type { EvidencePackComparison as EvidencePackComparisonData } from "@/lib/evidence-pack/derived";

export function EvidencePackComparison({ comparison }: { comparison: EvidencePackComparisonData }) {
    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">External Pack vs Current CodeWorld Snapshot</span>
                        <StatusBadge
                            label={comparison.validationStatus}
                            variant={comparison.validationStatus === "VALID" ? "verified" : comparison.validationStatus === "VALID_WITH_WARNINGS" ? "caution" : "risk"}
                        />
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <GitCompareArrows className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        Static evidence comparison
                    </h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    {comparison.riskSurfaceCount} external risk surface(s)
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-border-subtle">
                            <th className="py-2 pr-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Metric</th>
                            <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">External Pack</th>
                            <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">CodeWorld Snapshot</th>
                            <th className="py-2 pl-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Interpretation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparison.rows.map((row) => (
                            <tr key={row.label} className="border-b border-border-subtle/50 align-top">
                                <td className="py-2.5 pr-3 text-xs font-medium text-text-primary">{row.label}</td>
                                <td className="py-2.5 px-3 text-xs font-mono text-text-secondary">{row.externalValue}</td>
                                <td className="py-2.5 px-3 text-xs font-mono text-text-secondary">{row.codeWorldValue}</td>
                                <td className="py-2.5 pl-3 text-xs leading-relaxed text-text-muted">{row.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ObsDivider />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <SectionLabel>Dominant external families</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {comparison.externalDominantFamilies.map((row) => (
                            <span key={row.label} className="badge badge-muted">
                                {row.label}: {row.count}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <SectionLabel>Dominant CodeWorld families</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {comparison.codeWorldDominantFamilies.map((row) => (
                            <span key={row.label} className="badge badge-muted">
                                {row.label}: {row.count}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}
