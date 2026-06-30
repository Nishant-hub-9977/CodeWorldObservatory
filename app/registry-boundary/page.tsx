import type { Metadata } from "next";
import { Database, Lock, Shield } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GovernanceCaveat, MetricCell, ObsDivider, SectionLabel, StatusBadge } from "@/components/ui/ObsCommon";
import { getRegistryHealth } from "@/lib/registry/health";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Registry Boundary - CodeWorld Observatory",
    description:
        "A server-only Neon reserved registry boundary and read-only database connection preflight. No writes, no persistence, no upload storage, no public credentials.",
};

const REGISTRY_BOUNDARY =
    "This page demonstrates a server-only reserved registry preflight. It does not write to a database, create tables, run migrations, store evidence packs, expose credentials, enable auth, provide upload storage, or mutate any repository.";

const BADGES = [
    "Server Only",
    "No Writes",
    "No Persistence Yet",
    "No Upload Storage",
    "Advisory Only",
    "Human Review Required",
];

const BOUNDARY_POINTS = [
    "Neon is reserved infrastructure, not an enabled product registry.",
    "Database configuration is read only from server-side process.env and is never rendered.",
    "Missing database configuration returns a safe unconfigured status so local builds and CI pass.",
    "If configured, the only preflight is a harmless read-only SELECT 1 check.",
    "No evidence packs are stored, uploaded, or persisted in Q10.",
    "No user accounts, auth system, Neon Auth, migrations, or table creation exist yet.",
];

function statusVariant(ok: boolean, configured: boolean): "signal" | "caution" | "verified" | "risk" | "muted" {
    if (!configured) return "muted";
    return ok ? "verified" : "risk";
}

function statusLabel(ok: boolean, configured: boolean, connected: boolean): string {
    if (!configured) return "not configured";
    if (ok && connected) return "connected";
    return "preflight failed";
}

export default async function RegistryBoundaryPage() {
    const health = await getRegistryHealth();

    return (
        <div className="animate-fade-in">
            <section className="relative overflow-hidden border-b border-border-subtle">
                <div
                    className="absolute inset-0 bg-observatory-grid opacity-40 pointer-events-none"
                    aria-hidden="true"
                />
                <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
                    <div className="max-w-3xl">
                        <p className="overline mb-3">Reserved Registry</p>
                        <h1 className="mb-5 text-3xl font-semibold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl text-text-primary">
                            Registry Boundary
                        </h1>
                        <p className="text-base leading-relaxed text-text-secondary max-w-[620px]">
                            A server-only database connection preflight for reserved Neon infrastructure -
                            not a write-enabled registry, not persistence, and not an upload surface.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 pt-10">
                <GovernanceCaveat text={REGISTRY_BOUNDARY} />
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Preflight"
                        title="Server-only database recognition"
                        description="The app can recognize whether reserved registry infrastructure is configured without requiring it during build, CI, or static evidence review."
                    />
                </div>
                <article className="obs-panel flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="badge badge-signal">Registry Preflight</span>
                                <StatusBadge label={statusLabel(health.ok, health.configured, health.connected)} variant={statusVariant(health.ok, health.configured)} />
                            </div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                                <Database className="h-4 w-4 text-text-muted" aria-hidden="true" />
                                Neon reserved infrastructure
                            </h3>
                            <p className="text-xs leading-relaxed text-text-secondary max-w-prose">
                                This panel shows only safe health metadata. It never renders a host, username,
                                password, raw connection string, or raw database error.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                            <Lock className="h-3 w-3" aria-hidden="true" />
                            secret visible: no
                        </span>
                    </div>

                    <ObsDivider />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                        <MetricCell label="Configured" value={health.configured ? "yes" : "no"} />
                        <MetricCell label="Connected" value={health.connected ? "yes" : "no"} />
                        <MetricCell label="Provider" value={health.provider} />
                        <MetricCell label="Mode" value={health.mode} />
                        <MetricCell label="Latency" value={health.latencyMs === null ? "n/a" : `${health.latencyMs}ms`} />
                        <MetricCell label="Checked" value={health.checkedAtIso === null ? "n/a" : "server-side"} />
                        <MetricCell label="Error Category" value={health.errorCategory ?? "none"} />
                        <MetricCell label="Registry Mode" value={health.registryMode} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Writes Enabled</span>
                            <StatusBadge label="false" variant="verified" />
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Persistence Enabled</span>
                            <StatusBadge label="false" variant="verified" />
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Advisory Only</span>
                            <StatusBadge label="true" variant="muted" />
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Secret Visible</span>
                            <StatusBadge label="false" variant="verified" />
                        </div>
                    </div>
                </article>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Boundary"
                        title="Reserved, not write-enabled"
                        description="Q10 creates a recognition boundary only. It does not turn CodeWorld into a registry product or SaaS surface."
                    />
                </div>
                <article className="obs-panel flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {BADGES.map((badge) => (
                                    <span key={badge} className="badge badge-muted">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                                <Shield className="h-4 w-4 text-text-muted" aria-hidden="true" />
                                Human-reviewed registry boundary
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        {BOUNDARY_POINTS.map((point) => (
                            <div key={point} className="flex items-start gap-2.5 py-1.5">
                                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success" />
                                <span className="text-xs leading-relaxed text-text-secondary">{point}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <SectionLabel>What this does not enable</SectionLabel>
                        <p className="text-xs leading-relaxed text-text-secondary">
                            No writes, no migrations, no table creation, no evidence-pack persistence,
                            no upload storage, no GitHub API calls, no frontend database variable,
                            no auth system, no Neon Auth, and no production registry readiness claim.
                        </p>
                    </div>
                </article>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14">
                <div className="mb-8">
                    <SectionHeader
                        label="Direction"
                        title="Future schema, not yet active"
                        description="Q11 can propose a reviewed evidence registry schema and migration plan. Q10 intentionally stops at server-only preflight."
                    />
                </div>
                <GovernanceCaveat text={REGISTRY_BOUNDARY} />
            </section>
        </div>
    );
}
