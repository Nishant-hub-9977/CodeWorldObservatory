"use client";

import { useState, useEffect } from "react";
import { ObservatoryPanel } from "./ObservatoryPanel";
import type { ArtifactLedgerResponse } from "@/lib/types/artifact";
import { assertUniqueKeys, buildObservatoryKey } from "@/lib/utils/observatory-key";

const typeStyles: Record<string, string> = {
    plan: "badge-signal",
    simulation: "badge-caution",
    prediction: "badge-muted",
    "world-snapshot": "badge-verified",
    verification: "badge-verified",
    walkthrough: "badge-muted",
    "eval-result": "badge-muted",
    constitution: "badge-signal",
    execution: "badge-caution",
    comparison: "badge-verified",
    "raw-output": "badge-muted",
};

const trustStyles: Record<string, { className: string; label: string }> = {
    high: { className: "text-success", label: "HIGH" },
    medium: { className: "text-accent", label: "MED" },
    low: { className: "text-warning", label: "LOW" },
    unverified: { className: "text-text-muted", label: "UNVERIFIED" },
};

export function ArtifactLedgerPanel() {
    const [data, setData] = useState<ArtifactLedgerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/artifacts", { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((body) => {
                        throw new Error(body?.error ?? `HTTP ${res.status}`);
                    });
                }
                return res.json();
            })
            .then((json: ArtifactLedgerResponse) => {
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

    if (loading) {
        return (
            <ObservatoryPanel
                title="Artifact Ledger"
                subtitle="Retrieving ledger entries…"
                status="pending"
                badge="ART"
            >
                <p className="text-xs font-mono animate-pulse text-text-muted">
                    Reading immutable records...
                </p>
            </ObservatoryPanel>
        );
    }

    if (error || !data) {
        return (
            <ObservatoryPanel
                title="Artifact Ledger"
                subtitle="Read failed"
                status="error"
                badge="ART"
            >
                <p className="text-xs font-mono text-danger">
                    {error ?? "No data available"}
                </p>
            </ObservatoryPanel>
        );
    }

    const { entries, totalCount } = data;

    assertUniqueKeys(
        "ArtifactLedgerPanel.entries",
        entries.map(artifact => buildObservatoryKey("artifact-ledger-entry", artifact.id))
    );

    const highTrustCount = entries.filter((a) => a.trustLevel === "high").length;
    const pendingCount = entries.filter((a) => a.trustLevel !== "high").length;

    return (
        <ObservatoryPanel
            title="Artifact Ledger"
            subtitle="Immutable trust instruments — append-only record"
            status="active"
            badge="ART"
        >
            {/* Summary */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex flex-col gap-0.5">
                    <span className="data-label">total artifacts</span>
                    <span className="text-sm font-mono font-semibold text-text-primary">
                        {totalCount}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="data-label">high trust</span>
                    <span className="text-sm font-mono font-semibold text-success">
                        {highTrustCount}
                    </span>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="data-label">pending verify</span>
                    <span className="text-sm font-mono font-semibold text-warning">
                        {pendingCount}
                    </span>
                </div>
            </div>

            {/* Ledger rows */}
            <div className="flex flex-col gap-2">
                {entries.map((artifact) => {
                    const trust = trustStyles[artifact.trustLevel];
                    const createdDate = new Date(artifact.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    });

                    return (
                        <div
                            key={buildObservatoryKey("artifact-ledger-entry", artifact.id)}
                            className="flex flex-col gap-2 p-3 rounded bg-surface-hover border border-border-subtle"
                        >
                            {/* Top row */}
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium leading-tight text-text-primary">
                                    {artifact.title}
                                </p>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <span className={`badge ${typeStyles[artifact.type] ?? "badge-muted"}`}>
                                        {artifact.type}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs leading-relaxed text-text-secondary">
                                {artifact.description}
                                {artifact.summary && (
                                    <span className="block mt-1 italic text-text-muted">
                                        {artifact.summary}
                                    </span>
                                )}
                            </p>

                            {/* Meta row */}
                            <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
                                <div className="flex items-center gap-2">
                                    <span className="hash-text">{artifact.hash.value.slice(0, 16)}…</span>
                                    <span className="hash-text">·</span>
                                    <span
                                        className={`text-xs font-mono font-semibold text-[0.6rem] ${trust.className}`}
                                    >
                                        {trust.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="hash-text">{artifact.createdBy}</span>
                                    <span className="hash-text">·</span>
                                    <span className="hash-text">{createdDate}</span>
                                </div>
                            </div>

                            {/* Tags */}
                            {artifact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {artifact.tags.map((tag) => (
                                        <span
                                            key={buildObservatoryKey("artifact-ledger-tag", artifact.id, tag)}
                                            className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-hover text-text-muted text-[0.6rem]"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </ObservatoryPanel>
    );
}



