// ─── EvidencePackRiskSurface ───────────────────────────────────────
// Displays consequence surfaces and limitations from a static evidence pack.

import { Radar } from "lucide-react";
import { EmptyState, ObsDivider, SectionLabel, StatusBadge } from "@/components/ui/ObsCommon";
import type { EvidencePackRiskSeverity, ExternalEvidencePack } from "@/lib/evidence-pack/types";

function severityVariant(severity: EvidencePackRiskSeverity): "signal" | "caution" | "verified" | "risk" | "muted" {
    if (severity === "HIGH") return "risk";
    if (severity === "MEDIUM") return "caution";
    return "verified";
}

export function EvidencePackRiskSurface({ pack }: { pack: ExternalEvidencePack }) {
    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Risk Surface</span>
                        <span className="badge badge-muted">Consequence Review</span>
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <Radar className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        Imported risk and consequence evidence
                    </h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    {pack.riskSurfaces.length} risk surface(s)
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {pack.riskSurfaces.map((surface) => (
                    <div key={surface.id} className="rounded-md border border-border-subtle bg-surface-elevated px-4 py-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-text-primary">{surface.label}</h4>
                            <StatusBadge label={surface.severity} variant={severityVariant(surface.severity)} />
                        </div>
                        <p className="text-xs leading-relaxed text-text-secondary">{surface.reason}</p>
                        <div className="flex flex-col gap-1">
                            {surface.files.map((file) => (
                                <span key={file} className="font-mono text-[11px] text-text-muted break-all">
                                    {file}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <ObsDivider />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <SectionLabel>Consequence-bearing edges</SectionLabel>
                    {pack.consequenceBearingEdges.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-border-subtle">
                                        <th className="py-2 pr-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Source</th>
                                        <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Target</th>
                                        <th className="py-2 pl-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pack.consequenceBearingEdges.map((edge) => (
                                        <tr key={`${edge.from}->${edge.to}`} className="border-b border-border-subtle/50 align-top">
                                            <td className="py-2 pr-3 font-mono text-[11px] text-text-secondary break-all">{edge.from}</td>
                                            <td className="py-2 px-3 font-mono text-[11px] text-text-primary break-all">{edge.to}</td>
                                            <td className="py-2 pl-3 text-xs leading-relaxed text-text-muted">{edge.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No consequence-bearing edges were included in the sample pack." />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <SectionLabel>Limitations</SectionLabel>
                    <ul className="flex flex-col gap-2">
                        {pack.limitations.map((limitation) => (
                            <li key={limitation} className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning" />
                                <span>{limitation}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </article>
    );
}
