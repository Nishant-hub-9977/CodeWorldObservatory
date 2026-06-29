// ─── RepositoryStateCard ───────────────────────────────────────────
// Presentational rendering of the mock repository "world" state.
// Pure component — displays static typed data only. No repository is
// read, no Git API is contacted, nothing mutates.

import { GitBranch, Boxes, History, ShieldAlert } from "lucide-react";
import { ObsDivider, SectionLabel, StatusBadge } from "@/components/ui/ObsCommon";
import type {
    RepositoryState,
    BuildStatus,
    CouplingLevel,
    RepoRiskLevel,
} from "@/lib/interventions/mock-repository-state";

type BadgeVariant = "signal" | "caution" | "verified" | "risk" | "muted";

function buildVariant(status: BuildStatus): BadgeVariant {
    switch (status) {
        case "passing":
            return "verified";
        case "failing":
            return "risk";
        default:
            return "muted";
    }
}

function couplingVariant(coupling: CouplingLevel): BadgeVariant {
    switch (coupling) {
        case "tight":
            return "caution";
        case "moderate":
            return "signal";
        default:
            return "muted";
    }
}

function riskVariant(level: RepoRiskLevel): BadgeVariant {
    switch (level) {
        case "high":
            return "risk";
        case "elevated":
            return "caution";
        case "moderate":
            return "signal";
        default:
            return "verified";
    }
}

export function RepositoryStateCard({ state }: { state: RepositoryState }) {
    return (
        <article className="obs-panel flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Repository World</span>
                        <span className="badge badge-muted">Mock State</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{state.repositoryName}</h3>
                    <p className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                        <GitBranch className="h-3 w-3" aria-hidden="true" />
                        {state.branch}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Build Status
                    </span>
                    <StatusBadge label={state.buildStatus} variant={buildVariant(state.buildStatus)} />
                    <span className="text-[10px] font-mono text-text-muted">
                        {state.testSurfaceCount} verification surfaces (mock)
                    </span>
                </div>
            </div>

            <ObsDivider />

            {/* Dependency graph */}
            <div className="flex flex-col gap-2">
                <SectionLabel>
                    <span className="inline-flex items-center gap-1.5">
                        <Boxes className="h-3 w-3" aria-hidden="true" /> Dependency Graph Summary
                    </span>
                </SectionLabel>
                <div className="flex flex-col gap-2">
                    {state.dependencyGraph.map((zone) => (
                        <div
                            key={zone.zone}
                            className="flex items-start justify-between gap-3 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-mono text-text-primary">{zone.zone}</span>
                                <span className="text-[10px] leading-relaxed text-text-muted">{zone.note}</span>
                            </div>
                            <div className="flex flex-shrink-0 flex-col items-end gap-1">
                                <span className="badge badge-muted">{zone.modules} modules</span>
                                <StatusBadge label={zone.coupling} variant={couplingVariant(zone.coupling)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fragile zones + Risk zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <SectionLabel>
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldAlert className="h-3 w-3" aria-hidden="true" /> Fragile Zones
                        </span>
                    </SectionLabel>
                    <ul className="flex flex-col gap-1.5">
                        {state.fragileZones.map((zone) => (
                            <li
                                key={zone}
                                className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-warning"
                                />
                                <span>{zone}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col gap-2">
                    <SectionLabel>Risk Zones</SectionLabel>
                    <div className="flex flex-col gap-2">
                        {state.riskZones.map((zone) => (
                            <div key={zone.zone} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-mono text-text-primary">{zone.zone}</span>
                                    <StatusBadge label={zone.level} variant={riskVariant(zone.level)} />
                                </div>
                                <span className="text-[10px] leading-relaxed text-text-muted">{zone.note}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ObsDivider />

            {/* Recent change history */}
            <div className="flex flex-col gap-2">
                <SectionLabel>
                    <span className="inline-flex items-center gap-1.5">
                        <History className="h-3 w-3" aria-hidden="true" /> Recent Change History
                    </span>
                </SectionLabel>
                <div className="flex flex-col gap-1.5">
                    {state.recentChangeHistory.map((entry) => (
                        <div key={entry.ref} className="flex items-start gap-3 text-xs">
                            <span className="font-mono text-accent">{entry.ref}</span>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-text-secondary leading-relaxed">{entry.summary}</span>
                                <span className="text-[10px] font-mono text-text-muted">{entry.surface}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Open assumptions */}
            <div className="flex flex-col gap-2">
                <SectionLabel>Open Assumptions</SectionLabel>
                <ul className="flex flex-col gap-1.5">
                    {state.openAssumptions.map((assumption) => (
                        <li
                            key={assumption}
                            className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary"
                        >
                            <span
                                aria-hidden="true"
                                className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-text-muted"
                            />
                            <span>{assumption}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}
