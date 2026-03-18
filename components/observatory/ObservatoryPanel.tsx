import { type ReactNode } from "react";

interface ObservatoryPanelProps {
    title: string;
    subtitle?: string;
    status?: "active" | "pending" | "idle" | "caution" | "error";
    badge?: string;
    children: ReactNode;
    className?: string;
}

const statusConfig = {
    active: { dotClass: "status-dot-active", label: "Active" },
    pending: { dotClass: "status-dot-pending", label: "Pending" },
    idle: { dotClass: "status-dot-idle", label: "Idle" },
    caution: { dotClass: "status-dot-pending", label: "Caution" },
    error: { dotClass: "status-dot-pending", label: "Error" },
};

export function ObservatoryPanel({
    title,
    subtitle,
    status,
    badge,
    children,
    className = "",
}: ObservatoryPanelProps) {
    const sc = status ? statusConfig[status] : null;

    return (
        <section className={`obs-panel flex flex-col gap-4 ${className}`}>
            {/* Panel header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold leading-tight text-text-primary">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-text-muted">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {badge && (
                        <span className="badge badge-signal text-accent">{badge}</span>
                    )}
                    {sc && (
                        <div className="flex items-center gap-1.5">
                            <span className={`status-dot ${sc.dotClass}`} />
                            <span className="text-xs font-mono text-text-muted">
                                {sc.label}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border-subtle" />

            {/* Panel body */}
            <div className="flex flex-col gap-2">{children}</div>
        </section>
    );
}



