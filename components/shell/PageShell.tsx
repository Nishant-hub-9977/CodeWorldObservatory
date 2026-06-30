"use client";

import { type ReactNode } from "react";
import { OBSERVATORY_VERSION } from "@/lib/constants/observatory";
import { OBSERVATORY_ACTIVE_PHASE, OBSERVATORY_ACTIVE_PHASE_LABEL } from "@/lib/constants/observatory-status";
import { useTheme } from "@/lib/theme/theme-provider";

interface PageShellProps {
    children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
    const { theme, setTheme } = useTheme();

    const themeOptions = [
        { value: "light" as const, label: "Light", icon: "L" },
        { value: "system" as const, label: "System", icon: "A" },
        { value: "dark" as const, label: "Dark", icon: "D" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header
                className="sticky top-0 z-50 border-b border-border-subtle bg-background/85 backdrop-blur-[12px]"
            >
                <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-7 w-7 items-center justify-center rounded border border-border-subtle bg-surface-elevated text-sm font-bold text-text-muted"
                        >
                            ◈
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-text-primary">
                            CodeWorld Observatory
                        </span>
                        <span className="hidden sm:inline-flex text-xs text-text-muted border border-border-subtle px-2 py-0.5 rounded font-mono">
                            v{OBSERVATORY_VERSION}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        {[
                            { label: "Observatory", href: "/#observatory" },
                            { label: "Principles", href: "/#principles" },
                            { label: "Docs", href: "/#docs" },
                            { label: "Simulator", href: "/intervention-simulator" },
                            { label: "Snapshot", href: "/repository-snapshot" },
                            { label: "Quantum Annex", href: "/quantum-annex" },
                        ].map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-xs font-medium text-text-muted transition-colors duration-150 hover:text-text-primary"
                            >
                                {item.label}
                            </a>
                        ))}
                        <div className="flex items-center gap-2 border-l border-border-subtle pl-4">
                            <div className="flex items-center gap-1.5" title="MCP Interface Active: Governance Mode">
                                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                <span className="text-xs text-text-muted bg-surface-hover px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                                    MCP Live
                                </span>
                            </div>
                            <span className="text-xs text-text-muted bg-surface-hover px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                                Advisory Only
                            </span>
                        </div>
                        <div className="inline-flex items-center rounded-lg border border-border-subtle bg-surface-elevated p-0.5 opacity-70 hover:opacity-100 transition">
                            {themeOptions.map((option) => {
                                const isActive = theme === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setTheme(option.value)}
                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-all duration-150 ${
                                            isActive
                                                ? "bg-surface text-text-primary shadow-sm"
                                                : "text-text-muted hover:text-text-secondary"
                                        }`}
                                        aria-pressed={isActive}
                                        title={`Switch to ${option.label.toLowerCase()} theme`}
                                    >
                                        <span className="text-[9px]">{option.icon}</span>
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </nav>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-border-subtle">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-mono text-text-muted">
                        CodeWorld Observatory · v{OBSERVATORY_VERSION} · Phase {OBSERVATORY_ACTIVE_PHASE}: {OBSERVATORY_ACTIVE_PHASE_LABEL}
                    </p>
                    <p className="text-xs text-text-muted">
                        Simulation-first agentic software engineering
                    </p>
                </div>
            </footer>
        </div>
    );
}
