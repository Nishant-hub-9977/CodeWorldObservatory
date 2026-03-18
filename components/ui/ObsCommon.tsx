import type { ReactNode } from "react";
import { Shield } from "lucide-react";

/**
 * GovernanceCaveat — institutional advisory block used across all
 * governance surfaces (brief, dossier, export, timeline, experiment).
 * Renders a visually restrained, semantically consistent caveat.
 */
export function GovernanceCaveat({ text, className = "" }: { text: string; className?: string }) {
    return (
        <div
            className={`flex items-start gap-2.5 rounded-md border border-border-subtle bg-surface-elevated px-4 py-3 ${className}`}
        >
            <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-text-muted opacity-60" />
            <p className="text-[10px] font-mono leading-relaxed text-text-muted">
                {text}
            </p>
        </div>
    );
}

/**
 * MetricCell — a single metric display used in metric rows/grids.
 * Consistent sizing, mono typography, optional trend indicator.
 */
export function MetricCell({
    label,
    value,
    detail,
    className = "",
}: {
    label: string;
    value: string | number;
    detail?: string;
    className?: string;
}) {
    return (
        <div className={`flex flex-col gap-0.5 p-3 ${className}`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                {label}
            </span>
            <span className="text-sm font-mono font-semibold text-text-primary">
                {value}
            </span>
            {detail && (
                <span className="text-[9px] font-mono text-text-muted">
                    {detail}
                </span>
            )}
        </div>
    );
}

/**
 * ObsDivider — consistent section separator across all panels.
 */
export function ObsDivider({ className = "" }: { className?: string }) {
    return <div className={`obs-divider ${className}`} />;
}

/**
 * SectionLabel — overline-style section label for panel subsections.
 */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <p className={`overline mb-2 ${className}`}>
            {children}
        </p>
    );
}

/**
 * StatusBadge — consistent badge rendering for posture/status labels.
 */
export function StatusBadge({
    label,
    variant = "muted",
}: {
    label: string;
    variant?: "signal" | "caution" | "verified" | "risk" | "muted";
}) {
    return <span className={`badge badge-${variant}`}>{label}</span>;
}

/**
 * DataRow — a single key-value data row for ledger-like displays.
 */
export function DataRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="data-row">
            <span className="data-label">{label}</span>
            <span className="data-value">{value}</span>
        </div>
    );
}

/**
 * EmptyState — consistent empty/no-data placeholder across panels.
 */
export function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center rounded-md border border-dashed border-border-muted px-4 py-6">
            <p className="text-xs font-mono text-text-muted italic">
                {message}
            </p>
        </div>
    );
}
