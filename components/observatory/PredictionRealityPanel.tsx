"use client";

import { useState, useEffect } from "react";
import { ObservatoryPanel } from "./ObservatoryPanel";
import type { ExecutionApiResponse, PredictionRealityComparison } from "@/lib/types/execution";

const CALIBRATION_CLASSES: Record<string, string> = {
    "aligned": "text-success",
    "partially-aligned": "text-accent",
    "divergent": "text-danger",
    "insufficient-evidence": "text-text-muted",
};

const CALIBRATION_BADGES: Record<string, string> = {
    "aligned": "badge-verified",
    "partially-aligned": "badge-signal",
    "divergent": "badge-risk",
    "insufficient-evidence": "badge-muted",
};

export function PredictionRealityPanel() {
    const [data, setData] = useState<ExecutionApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/executions", { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((body) => {
                        throw new Error(body?.error ?? `HTTP ${res.status}`);
                    });
                }
                return res.json();
            })
            .then((json: ExecutionApiResponse) => {
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
                title="Prediction vs Reality"
                subtitle="Retrieving execution records…"
                status="pending"
                badge="PVR"
            >
                <p className="text-xs font-mono animate-pulse text-text-muted">
                    Loading calibration data...
                </p>
            </ObservatoryPanel>
        );
    }

    if (error || !data) {
        return (
            <ObservatoryPanel
                title="Prediction vs Reality"
                subtitle="Data retrieval failed"
                status="error"
                badge="PVR"
            >
                <p className="text-xs font-mono text-danger">
                    {error ?? "No data available"}
                </p>
            </ObservatoryPanel>
        );
    }

    const { executions, comparisons } = data;

    return (
        <ObservatoryPanel
            title="Prediction vs Reality"
            subtitle="Model predictions compared to observed execution outcomes"
            status="active"
            badge="PVR"
        >
            {executions.length === 0 && (
                <div className="p-3 rounded text-xs mb-2 bg-warning-soft/30 border border-warning/12 text-text-secondary">
                    <span className="overline mr-2 text-[0.6rem]">Status</span>
                    No interventions have been executed yet. Prediction records accumulate here
                    after each approved intervention completes.
                </div>
            )}

            {executions.map((exec) => {
                const comparison = comparisons.find(c => c.executionRecordId === exec.id);
                if (!comparison) return null;

                return (
                    <div
                        key={exec.id}
                        className="flex flex-col gap-2 p-3 rounded-md mb-3 last:mb-0 bg-surface-hover border border-border-subtle"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-text-primary">
                                {exec.interventionTitle}
                            </p>
                            <span className={`badge ${CALIBRATION_BADGES[comparison.calibrationResult]}`}>
                                {comparison.calibrationResult}
                            </span>
                        </div>

                        {/* Predicted Outlook */}
                        <div className="p-2 rounded text-xs flex flex-col gap-1 mt-1 bg-accent-soft border border-accent/12">
                            <span className="overline text-[0.6rem] text-text-secondary">Predicted Outlook</span>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                <span className="hash-text">readiness: {comparison.expectedReadiness}</span>
                                <span className="hash-text">burden: {comparison.expectedValidationBurden}</span>
                            </div>
                            {comparison.expectedFragileZones.length > 0 && (
                                <span className="hash-text text-warning">
                                    fragile zones: {comparison.expectedFragileZones.join(", ")}
                                </span>
                            )}
                        </div>

                        {/* Actual Outcome */}
                        <div className="p-2 rounded text-xs flex flex-col gap-1 bg-surface-hover border border-border-muted">
                            <span className="overline text-[0.6rem] text-text-secondary">Actual Outcome</span>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                <span className="hash-text">readiness: {comparison.actualReadiness}</span>
                                <span className="hash-text">burden: {comparison.actualValidationBurden}</span>
                                <span className={`hash-text ${exec.actualOutcome.status === "success" ? 'text-success' : 'text-danger'}`}>
                                    status: {exec.actualOutcome.status}
                                </span>
                            </div>
                        </div>

                        {/* Alignment / Divergence Result */}
                        {(comparison.observedIssues.length > 0 || comparison.actualSurfaces.length > 0) && (
                            <div className="mt-1 flex flex-col gap-1">
                                {comparison.observedIssues.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="data-label">observed issues</span>
                                        <span className="hash-text font-semibold text-danger">
                                            {comparison.observedIssues.join(", ")}
                                        </span>
                                    </div>
                                )}
                                {comparison.actualSurfaces.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="data-label">surfaces touched</span>
                                        <span className="hash-text">{comparison.actualSurfaces.map(s => s.split("/").pop()).join(", ")}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-border-subtle">
                            <p className={`text-xs ${CALIBRATION_CLASSES[comparison.calibrationResult]}`}>
                                Calibration Note: {comparison.calibrationNote}
                            </p>
                            <p className="text-[10px] mt-1 italic text-text-muted">
                                Evidence Status: {comparison.evidenceSufficiencyNote}
                            </p>
                        </div>
                    </div>
                );
            })}
        </ObservatoryPanel>
    );
}



