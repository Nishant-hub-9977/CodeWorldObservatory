import { SectionHeader } from "@/components/ui/SectionHeader";
import { PrincipleCard } from "@/components/ui/PrincipleCard";
import { WorldStatePanel } from "@/components/observatory/WorldStatePanel";
import { InterventionsPanel } from "@/components/observatory/InterventionsPanel";
import { FuturesPanel } from "@/components/observatory/FuturesPanel";
import { UncertaintyPanel } from "@/components/observatory/UncertaintyPanel";
import { PredictionRealityPanel } from "@/components/observatory/PredictionRealityPanel";
import { ArtifactLedgerPanel } from "@/components/observatory/ArtifactLedgerPanel";
import { PrototypeMappingPanel } from "@/components/observatory/PrototypeMappingPanel";
import { BenchmarkHarnessPanel } from "@/components/observatory/BenchmarkHarnessPanel";
import { ResearchMemoryPanel } from "@/components/observatory/ResearchMemoryPanel";
import { ResearchDossierPanel } from "@/components/observatory/ResearchDossierPanel";
import { LatentStatePanel } from "@/components/observatory/LatentStatePanel";
import { StrategyCompatibilityPanel } from "@/components/observatory/StrategyCompatibilityPanel";
import { TransitionPatternsPanel } from "@/components/observatory/TransitionPatternsPanel";
import { ResearchBriefPanel } from "@/components/observatory/ResearchBriefPanel";
import { ExportManifestPanel } from "@/components/observatory/ExportManifestPanel";
import { ResearchTimelinePanel } from "@/components/observatory/ResearchTimelinePanel";
import { ExperimentRegistryPanel } from "@/components/observatory/ExperimentRegistryPanel";
import { ScenarioLibraryPanel } from "@/components/observatory/ScenarioLibraryPanel";
import { ResearchStatisticsPanel } from "@/components/observatory/ResearchStatisticsPanel";
import { PRINCIPLES, BUILD_PHASES } from "@/lib/constants/observatory";
import {
    OBSERVATORY_ACTIVE_PHASE,
    OBSERVATORY_ACTIVE_PHASE_LABEL,
    OBSERVATORY_LIVE_DESCRIPTION,
    OBSERVATORY_OBSERVER_NOTE,
    OBSERVATORY_ROADMAP_TITLE,
    OBSERVATORY_STATUS_BADGE,
    OBSERVATORY_STATUS_VERSION,
} from "@/lib/constants/observatory-status";
import { assertUniqueKeys, buildObservatoryKey } from "@/lib/utils/observatory-key";

export default function ObservatoryHomePage() {
    const thesisSidebarItems = [
        { label: "Thesis", value: "Software as a causal world model" },
        { label: "Constraint", value: "Simulation precedes every write" },
        { label: "Model", value: "SE-JEPA inspired prediction" },
        { label: "Interface", value: "Observatory for future state" },
    ];
    const thesisCards = [
        {
            title: "Autoregressive write-first is insufficient",
            body: "Systems that generate code by predicting the next token cannot reason about causal consequences. They write first and discover problems later.",
        },
        {
            title: "Repositories are observable worlds",
            body: "A codebase is a deterministic, stateful world with defined laws (types, tests, contracts). It can be modeled, simulated, and reasoned over before any action.",
        },
        {
            title: "Agentic IDEs are the substrate",
            body: "Modern agentic environments provide state capture, tool access, artifact production, and execution verification - perfect conditions for a simulation control plane.",
        },
        {
            title: "MCP bridges prediction to action",
            body: "Model Context Protocol will serve as the bridge between the observatory's predictive intelligence and the tools that execute real interventions.",
        },
    ];
    const phaseEntries = Object.entries(BUILD_PHASES);

    assertUniqueKeys(
        "ObservatoryHomePage.sidebar",
        thesisSidebarItems.map(item => buildObservatoryKey("home-sidebar-item", item.label, item.value))
    );
    assertUniqueKeys(
        "ObservatoryHomePage.thesis-cards",
        thesisCards.map(item => buildObservatoryKey("home-thesis-card", item.title))
    );
    assertUniqueKeys(
        "ObservatoryHomePage.roadmap",
        phaseEntries.map(([phaseNum]) => buildObservatoryKey("home-roadmap-phase", phaseNum))
    );

    return (
        <div className="animate-fade-in">
            {/* ─── Hero Section ───────────────────────────────────────── */}
            <section
                className="relative overflow-hidden border-b border-border-subtle"
                style={{
                    background: "linear-gradient(to bottom, rgb(var(--accent) / 0.04) 0%, transparent 60%)",
                }}
            >
                {/* Grid background */}
                <div
                    className="absolute inset-0 bg-observatory-grid opacity-40 pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative max-w-7xl mx-auto px-6 py-28 sm:py-36">
                    <div className="max-w-3xl">
                        {/* System metadata — two-level block */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                                <span>{OBSERVATORY_STATUS_BADGE}</span>
                                <span aria-hidden="true">·</span>
                                <span>v{OBSERVATORY_STATUS_VERSION}</span>
                                <span aria-hidden="true">·</span>
                                <span className="text-accent">Release Candidate</span>
                            </div>
                            <div className="mt-1.5 text-xs text-text-muted">
                                {OBSERVATORY_ACTIVE_PHASE_LABEL}
                            </div>
                        </div>

                        {/* Project name */}
                        <h1 className="mb-6 text-4xl font-semibold tracking-tight leading-[1.08] sm:text-5xl lg:text-6xl">
                            <span className="text-text-primary">CodeWorld</span>
                            <span className="block text-accent/80">
                                Observatory
                            </span>
                        </h1>

                        {/* Mission */}
                        <p className="mb-4 text-lg leading-relaxed text-text-secondary max-w-[520px]">
                            A simulation-first control plane for agentic software engineering.
                            Software agents should imagine code futures before acting.
                        </p>

                        {/* Thesis statement */}
                        <p className="text-sm leading-relaxed text-text-muted max-w-[480px]">
                            Treating software repositories as dynamic causal worlds — not static text —
                            enables counterfactual planning, branch evaluation, and
                            prediction-before-write workflows that autoregressive approaches cannot achieve.
                        </p>

                        {/* CTA row */}
                        <div className="flex flex-wrap items-center gap-4 mt-10">
                            <a
                                href="#observatory"
                                className="obs-cta-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 bg-accent-soft border border-accent/20 text-accent-strong"
                            >
                                Open Observatory
                            </a>
                            <a
                                href="#principles"
                                className="obs-cta-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border border-border-subtle/80 text-text-muted hover:text-text-primary"
                            >
                                Read Principles
                            </a>
                            <a
                                href="/quantum-annex"
                                className="inline-flex items-center gap-1.5 px-2 py-2.5 text-sm font-medium text-text-muted hover:text-accent transition-colors duration-200"
                            >
                                Quantum Annex
                                <span aria-hidden="true" className="text-xs">→</span>
                            </a>
                        </div>
                    </div>

                    {/* Thesis summary sidebar */}
                    <div
                        className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 w-72"
                    >
                        {thesisSidebarItems.map((item) => (
                            <div
                                key={buildObservatoryKey("home-sidebar-item", item.label, item.value)}
                                className="obs-panel py-3 px-4"
                            >
                                <p className="overline mb-1 text-[0.6rem]">{item.label}</p>
                                <p className="text-xs font-medium text-text-primary">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Observatory Thesis Summary ─────────────────────────── */}
            <section
                id="thesis"
                className="max-w-7xl mx-auto px-6 py-16 border-b border-border-subtle"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <SectionHeader
                            label="Observatory Thesis"
                            title="Software is a world. Agents must learn to navigate it."
                        />
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {thesisCards.map((item) => (
                            <div key={buildObservatoryKey("home-thesis-card", item.title)} className="obs-panel flex flex-col gap-2">
                                <h3 className="text-sm font-semibold text-text-primary">
                                    {item.title}
                                </h3>
                                <p className="text-xs leading-relaxed text-text-secondary">
                                    {item.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Observatory Dashboard ───────────────────────────────── */}
            <section
                id="observatory"
                className="max-w-7xl mx-auto px-6 py-16 border-b border-border-subtle"
            >
                <div className="mb-10">
                    <SectionHeader
                        label="Live Observatory"
                        title="Research control surface"
                        description={OBSERVATORY_LIVE_DESCRIPTION}
                    />
                </div>

                {/* Foundational panel grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <WorldStatePanel />
                    <InterventionsPanel />
                    <FuturesPanel />
                    <UncertaintyPanel />
                    <PredictionRealityPanel />
                    <ArtifactLedgerPanel />
                </div>

                {/* Full-width research panels */}
                <div className="flex flex-col gap-4 mt-4">
                    <PrototypeMappingPanel />
                    <BenchmarkHarnessPanel />
                    <ResearchMemoryPanel />
                    <ResearchDossierPanel />
                    <LatentStatePanel />
                    <StrategyCompatibilityPanel />
                    <TransitionPatternsPanel />
                    <ResearchBriefPanel />
                    <ExportManifestPanel />
                    <ResearchTimelinePanel />
                    <ExperimentRegistryPanel />
                    <ScenarioLibraryPanel />
                    <ResearchStatisticsPanel />
                </div>

                {/* Observer note */}
                <div className="mt-6 rounded-md border border-border-subtle bg-surface-elevated px-4 py-3">
                    <span className="overline mr-2 text-[0.6rem]">{OBSERVATORY_STATUS_BADGE} Active</span>
                    <span className="text-xs text-text-muted">{OBSERVATORY_OBSERVER_NOTE}</span>
                </div>
            </section>

            {/* ─── Principles Section ─────────────────────────────────── */}
            <section
                id="principles"
                className="max-w-7xl mx-auto px-6 py-16 border-b border-border-subtle"
            >
                <div className="mb-10 text-center">
                    <SectionHeader
                        label="Operating Principles"
                        title="Four laws of the Observatory"
                        description="These are not guidelines. They are invariants. Any system claiming to implement CodeWorld Observatory must satisfy all four."
                        align="center"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PRINCIPLES.map((principle, i) => (
                        <PrincipleCard
                            key={principle.id}
                            icon={principle.icon}
                            title={principle.title}
                            description={principle.description}
                            index={i}
                        />
                    ))}
                </div>
            </section>

            {/* ─── Build Phases ────────────────────────────────────────── */}
            <section
                id="docs"
                className="max-w-7xl mx-auto px-6 py-16"
            >
                <div className="mb-10">
                    <SectionHeader
                        label="Roadmap"
                        title={OBSERVATORY_ROADMAP_TITLE}
                        description="Each phase is gated on the completion and verification of the preceding phase. No phase skipping."
                    />
                </div>

                <div className="flex flex-col">
                    {phaseEntries.map(([phaseNum, phaseName], i) => {
                        const phaseNumber = Number(phaseNum);
                        const isActive = phaseNumber === OBSERVATORY_ACTIVE_PHASE;
                        const isCompleted = phaseNumber < OBSERVATORY_ACTIVE_PHASE;
                        return (
                            <div
                                key={buildObservatoryKey("home-roadmap-phase", phaseNum)}
                                className={`flex items-start gap-6 py-4 ${
                                    i < phaseEntries.length - 1 ? "border-b border-border-subtle" : ""
                                }`}
                            >
                                {/* Phase number */}
                                <div className="flex-shrink-0 w-6">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border ${
                                            isActive
                                                ? "bg-accent-soft border-accent/35 text-accent-strong"
                                                : isCompleted
                                                    ? "bg-success-soft border-success/20 text-success"
                                                    : "bg-surface-hover border-border-subtle text-text-muted"
                                        }`}
                                    >
                                        {isCompleted ? "✓" : phaseNum}
                                    </div>
                                </div>

                                {/* Phase info */}
                                <div className="flex flex-col gap-0.5 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className={`text-sm font-semibold ${
                                            isCompleted ? "text-text-muted" : "text-text-primary"
                                        }`}>
                                            {phaseName}
                                        </h3>
                                        {isActive && (
                                            <span className="badge badge-signal">Current</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
