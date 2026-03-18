"use client";

// ─── InterventionsPanel — Phase 2: Live Branch Planning ───────────
// Fetches real intervention planning data from /api/interventions.
// Renders 3 candidate branches with branch comparison table.

import { useState, useEffect } from "react";
import { ObservatoryPanel } from "./ObservatoryPanel";
import type {
    InterventionApiResponse,
    InterventionBranch,
    RiskLevel,
    ScopeClass,
    BranchStrategy,
} from "@/lib/types/intervention";
import { buildObservatoryKey } from "@/lib/utils/observatory-key";

// ─── Style helpers ────────────────────────────────────────────────

const RISK_CLASSES: Record<RiskLevel, string> = {
    low: "text-success",
    medium: "text-warning",
    high: "text-danger",
    critical: "text-danger",
};

const RISK_BADGE: Record<RiskLevel, string> = {
    low: "badge-verified",
    medium: "badge-caution",
    high: "badge-risk",
    critical: "badge-risk",
};

const SCOPE_LABELS: Record<ScopeClass, string> = {
    isolated: "Isolated",
    local: "Local",
    "cross-module": "Cross-Module",
    structural: "Structural",
};

const STRATEGY_LABELS: Record<BranchStrategy, string> = {
    "service-first": "Service-First",
    "route-first": "Route-First",
    "ui-first": "UI-First",
    "minimal-touch": "Minimal-Touch",
    "structural-refactor": "Structural-Refactor",
};

// ─── Utility ──────────────────────────────────────────────────────

function basename(p: string): string {
    return p.split("/").pop() ?? p;
}

// ─── Sub-components ───────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
    return (
        <p className="obs-text-label mt-4 mb-2">
            {children}
        </p>
    );
}

// ─── Branch card ──────────────────────────────────────────────────

function BranchCard({ branch }: { branch: InterventionBranch }) {
    const [expanded, setExpanded] = useState(false);
    const isPreferred = branch.preferred;

    return (
        <div
            className={`flex flex-col gap-2 p-3 rounded-md border ${
                isPreferred
                    ? "bg-accent-soft border-accent/18"
                    : "bg-surface-hover border-border-subtle"
            }`}
        >
            {/* Branch header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span
                        className={`font-mono font-bold text-xs flex-shrink-0 flex items-center justify-center w-5 h-5 rounded border ${
                            isPreferred
                                ? "bg-accent/18 text-accent border-accent/30"
                                : "bg-surface-active text-text-muted border-border-muted"
                        }`}
                    >
                        {branch.label}
                    </span>
                    <div className="flex flex-col gap-0.5">
                        <p
                            className={`text-xs font-semibold leading-tight ${isPreferred ? 'text-accent' : 'text-text-primary'}`}
                        >
                            {STRATEGY_LABELS[branch.strategy]}
                            {isPreferred && (
                                <span className="ml-2 font-mono font-normal text-accent text-[0.6rem]">
                                    preferred
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`badge ${RISK_BADGE[branch.riskLevel]}`}>
                        {branch.riskLevel}
                    </span>
                    <span className="badge badge-muted text-[0.6rem]">
                        {SCOPE_LABELS[branch.scopeImpact.scopeClass]}
                    </span>
                </div>
            </div>

            {/* Summary */}
            <p className="text-xs leading-relaxed text-text-secondary">
                {branch.summary}
            </p>

            {/* Target files chips */}
            {branch.targetFiles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {branch.targetFiles.slice(0, 4).map((f) => (
                        <span
                            key={f}
                            className="hash-text px-1.5 py-0.5 rounded bg-surface-hover"
                            title={f}
                        >
                            {basename(f)}
                        </span>
                    ))}
                    {branch.targetFiles.length > 4 && (
                        <span className="hash-text px-1.5 py-0.5 rounded bg-surface-hover">
                            +{branch.targetFiles.length - 4}
                        </span>
                    )}
                </div>
            )}

            {/* Expand/collapse toggle */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="text-left text-text-muted text-[0.65rem] bg-transparent border-none cursor-pointer p-0 font-mono"
            >
                {expanded ? "▲ collapse" : "▼ rationale + limits"}
            </button>

            {/* Expanded detail */}
            {expanded && (
                <div className="flex flex-col gap-2 mt-1">
                    {/* Rationale */}
                    <div className="p-2 rounded text-xs bg-surface-hover border border-surface-active text-text-secondary leading-relaxed">
                        <span className="overline block mb-1 text-[0.58rem] text-text-muted">
                            Rationale
                        </span>
                        {branch.rationale}
                    </div>

                    {/* Risk rationale */}
                    {branch.scopeImpact.riskRationale && (
                        <p className={`text-xs leading-normal ${RISK_CLASSES[branch.riskLevel]}`}>
                            <span className="opacity-60">Risk signal: </span>
                            {branch.scopeImpact.riskRationale}
                        </p>
                    )}

                    {/* Limitations */}
                    <div
                        className="p-2 rounded-md border border-warning/10 bg-warning-soft/30 text-xs"
                    >
                        <span className="overline block mb-1 text-[0.58rem] text-text-muted">
                            Observability Limits
                        </span>
                        {branch.limitations.map((lim) => (
                            <p
                                key={buildObservatoryKey("intervention-limitation", branch.id, lim)}
                                className="mb-1 text-text-muted leading-normal"
                            >
                                · {lim}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Branch comparison table ──────────────────────────────────────

function BranchComparisonTable({ branches }: { branches: InterventionBranch[] }) {
    return (
        <div className="rounded-md overflow-hidden border border-border-subtle">
            {/* Header */}
            <div
                className="grid bg-surface-hover border-b border-border-subtle"
                style={{ gridTemplateColumns: "80px repeat(3, 1fr)" }}
            >
                <div className="p-2" />
                {branches.map((b) => (
                    <div
                        key={b.id}
                        className={`p-2 text-center border-l border-border-subtle text-[0.65rem] font-mono ${b.preferred ? 'text-accent' : 'text-text-muted'}`}
                    >
                        Branch {b.label}
                        {b.preferred && (
                            <span className="block text-[0.55rem] text-accent">
                                ★ preferred
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Rows */}
            {[
                {
                    label: "Strategy",
                    getValue: (b: InterventionBranch) => STRATEGY_LABELS[b.strategy],
                },
                {
                    label: "Scope",
                    getValue: (b: InterventionBranch) => SCOPE_LABELS[b.scopeImpact.scopeClass],
                },
                {
                    label: "Risk",
                    getValue: (b: InterventionBranch) => b.riskLevel,
                    getClassName: (b: InterventionBranch) => RISK_CLASSES[b.riskLevel],
                },
                {
                    label: "File Radius",
                    getValue: (b: InterventionBranch) => String(b.scopeImpact.estimatedFileRadius),
                },
                {
                    label: "Limits",
                    getValue: (b: InterventionBranch) => `${b.limitations.length} noted`,
                },
            ].map((row, rowIdx) => (
                <div
                    key={row.label}
                    className={`grid ${rowIdx < 4 ? 'border-b border-surface-hover' : ''}`}
                    style={{ gridTemplateColumns: "80px repeat(3, 1fr)" }}
                >
                    <div className="p-2 text-text-muted text-[0.62rem] flex items-center">
                        {row.label}
                    </div>
                    {branches.map((b) => (
                        <div
                            key={b.id}
                            className={`p-2 text-center border-l border-surface-hover text-[0.65rem] font-mono ${
                                row.getClassName ? row.getClassName(b) : 'text-text-secondary'
                            }`}
                        >
                            {row.getValue(b)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Loading state ────────────────────────────────────────────────

function LoadingState() {
    return (
        <ObservatoryPanel
            title="Candidate Interventions"
            subtitle="Generating branch plans…"
            status="pending"
            badge="INT"
        >
            <div className="flex flex-col gap-2 text-text-muted text-xs">
                {["Reading repo signals…", "Analyzing scope…", "Building candidate branches…"].map(
                    (line) => (
                        <p key={line} className="font-mono animate-pulse">
                            {line}
                        </p>
                    ),
                )}
            </div>
        </ObservatoryPanel>
    );
}

// ─── Error state ──────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
    return (
        <ObservatoryPanel
            title="Candidate Interventions"
            subtitle="Branch planning failed"
            status="error"
            badge="INT"
        >
            <p className="text-xs font-mono mt-1 text-danger">
                {message}
            </p>
        </ObservatoryPanel>
    );
}

// ─── Main panel ───────────────────────────────────────────────────

export function InterventionsPanel() {
    const [data, setData] = useState<InterventionApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/interventions", { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((body) => {
                        throw new Error(body?.error ?? `HTTP ${res.status}`);
                    });
                }
                return res.json();
            })
            .then((json: InterventionApiResponse) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                if ((err as Error).name === "AbortError") return;
                setError((err as Error).message ?? "Unknown error");
                setLoading(false);
            });

        return () => controller.abort();
    }, []);

    if (loading) return <LoadingState />;
    if (error || !data) return <ErrorState message={error ?? "No data returned"} />;

    const { comparison, repoSignals, planningNote } = data;
    const preferred = comparison.branches.find((b) => b.preferred);

    return (
        <ObservatoryPanel
            title="Candidate Interventions"
            subtitle="Branch-based intervention planning — simulation precedes every write"
            status="active"
            badge="INT"
        >
            {/* ─── Intervention Objective ─────────────────────── */}
            <SectionLabel>Intervention Objective</SectionLabel>
            <p className="text-xs leading-relaxed p-2 rounded text-text-primary bg-surface-hover border border-border-subtle">
                {comparison.objective.objective}
            </p>
            <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-muted text-[0.6rem]">
                    {comparison.objective.type}
                </span>
                <span className="hash-text text-[0.6rem]">
                    {repoSignals.totalFiles} files · {repoSignals.tsFileCount} TS · {repoSignals.edgeCount} edges
                </span>
            </div>

            {/* ─── Candidate Branches ──────────────────────────── */}
            <SectionLabel>Candidate Branches</SectionLabel>
            <div className="flex flex-col gap-2">
                {comparison.branches.map((branch) => (
                    <BranchCard key={branch.id} branch={branch} />
                ))}
            </div>

            {/* ─── Branch Comparison ───────────────────────────── */}
            <SectionLabel>Branch Comparison</SectionLabel>
            <BranchComparisonTable branches={Array.from(comparison.branches)} />

            {/* Preferred path note */}
            {preferred && (
                <div className="mt-2 p-2 rounded text-xs bg-accent-soft border border-accent/12 text-text-secondary leading-relaxed">
                    <span className="overline block mb-1 text-[0.58rem] text-accent">
                        Preferred Path
                    </span>
                    {comparison.comparisonNotes}
                </div>
            )}

            {/* ─── Counterfactual Notes ────────────────────────── */}
            <SectionLabel>Counterfactual Notes</SectionLabel>
            <p className="text-xs leading-relaxed text-text-muted">
                {planningNote}
            </p>
        </ObservatoryPanel>
    );
}



