import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GovernanceCaveat } from "@/components/ui/ObsCommon";
import { RepositorySnapshotSummary } from "@/components/repository-snapshot/RepositorySnapshotSummary";
import { FileFamilyBreakdown } from "@/components/repository-snapshot/FileFamilyBreakdown";
import { DependencyGraphEvidence } from "@/components/repository-snapshot/DependencyGraphEvidence";
import { ConsequenceBearingEdges } from "@/components/repository-snapshot/ConsequenceBearingEdges";
import { SnapshotBoundaryPanel } from "@/components/repository-snapshot/SnapshotBoundaryPanel";
import { repositorySnapshot } from "@/lib/repository-snapshot/snapshot";

export const metadata: Metadata = {
    title: "Repository Snapshot — CodeWorld Observatory",
    description:
        "A static, read-only snapshot of this repository's structure with static dependency-graph evidence and consequence-bearing edge classification. Generated locally, advisory-only, no repository mutation, no runtime filesystem scanning.",
};

const INTRO_BOUNDARY =
    "This is a static, read-only approximation of repository structure. The snapshot is generated locally by scripts/generate-repository-snapshot.mjs and imported as a typed artifact — the web app never scans the filesystem at request time. It does not execute code, mutate files, call GitHub write APIs, or claim complete runtime dependency knowledge.";

const SIMULATOR_RELATIONSHIP =
    "The Intervention Simulator predicts the consequences of a change before acting. This snapshot supplies the structural evidence those predictions should eventually rest on: which files exist, how they reference each other, and which shared targets carry the widest blast radius. Today the two layers are independent; a future phase can let real snapshot evidence inform intervention-risk predictions.";

const NOISE_NOTE = [
    {
        step: "01",
        label: "Curate the surface",
        body: "Scan only meaningful source families — routes, components, modules, docs, config, workflows — and ignore build output, vendored repos, and generated artifacts.",
    },
    {
        step: "02",
        label: "Resolve honestly",
        body: "Record resolved internal edges, external package imports, and unresolved specifiers in separate buckets rather than merging them into one noisy graph.",
    },
    {
        step: "03",
        label: "Rank by consequence",
        body: "Classify edges by cross-route blast radius so the few consequence-bearing dependencies stand out from hundreds of ordinary structural ones.",
    },
];

export default function RepositorySnapshotPage() {
    const snapshot = repositorySnapshot;

    return (
        <div className="animate-fade-in">
            {/* ─── Hero ───────────────────────────────────────────────── */}
            <section className="relative overflow-hidden border-b border-border-subtle">
                <div
                    className="absolute inset-0 bg-observatory-grid opacity-40 pointer-events-none"
                    aria-hidden="true"
                />
                <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
                    <div className="max-w-3xl">
                        <p className="overline mb-3">Repository-as-World</p>
                        <h1 className="mb-5 text-3xl font-semibold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl text-text-primary">
                            Repository Snapshot
                        </h1>
                        <p className="text-base leading-relaxed text-text-secondary max-w-[580px]">
                            A static, read-only capture of this repository&apos;s structure — with
                            dependency-graph evidence that ranks hidden dependencies by consequence
                            instead of drowning them in graph noise.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Boundary ───────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 pt-10">
                <GovernanceCaveat text={INTRO_BOUNDARY} />
            </section>

            {/* ─── How we avoid graph noise ───────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Approach"
                        title="Mapping dependencies without the noise"
                        description="The goal is not a complete production-grade analyzer. It is a deterministic, read-only artifact that makes the repository-as-world thesis concrete and legible."
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {NOISE_NOTE.map((item) => (
                        <div key={item.step} className="obs-panel flex flex-col gap-2">
                            <span className="text-[10px] font-mono text-accent">{item.step}</span>
                            <h3 className="text-sm font-semibold text-text-primary">{item.label}</h3>
                            <p className="text-xs leading-relaxed text-text-secondary">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Summary ────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Snapshot"
                        title="What the capture contains"
                        description="Headline metrics for the curated source surface, with a deterministic content digest that stays stable across runs on an unchanged tree."
                    />
                </div>
                <RepositorySnapshotSummary snapshot={snapshot} />
            </section>

            {/* ─── File families ──────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Composition"
                        title="File families and domains"
                        description="How the repository divides across structural families and the four observatory domains."
                    />
                </div>
                <FileFamilyBreakdown snapshot={snapshot} />
            </section>

            {/* ─── Dependency graph evidence ──────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Evidence"
                        title="Static dependency graph"
                        description="Edge classification and the most-connected files — presented as quiet tables, not a node-link canvas."
                    />
                </div>
                <DependencyGraphEvidence snapshot={snapshot} />
            </section>

            {/* ─── Consequence-bearing edges ──────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Blast Radius"
                        title="Consequence-bearing edges"
                        description="The shared dependencies reachable from multiple routes — the hidden edges a careful intervention must weigh first."
                    />
                </div>
                <ConsequenceBearingEdges snapshot={snapshot} />
            </section>

            {/* ─── Relationship to the simulator ──────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-6">
                    <SectionHeader
                        label="Direction"
                        title="Relationship to the Intervention Simulator"
                        description="How structural evidence connects to the prediction-versus-reality workflow."
                    />
                </div>
                <div className="obs-panel flex flex-col gap-4">
                    <p className="text-sm leading-relaxed text-text-secondary">{SIMULATOR_RELATIONSHIP}</p>
                    <a
                        href="/intervention-simulator"
                        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-text-primary"
                    >
                        Open the Intervention Simulator →
                    </a>
                </div>
            </section>

            {/* ─── Human review boundary ──────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14">
                <div className="mb-8">
                    <SectionHeader
                        label="Governance"
                        title="Read-only, advisory, human-reviewed"
                        description="The snapshot is evidence, not authority. Every boundary that protects the repository stays in force."
                    />
                </div>
                <SnapshotBoundaryPanel />
            </section>
        </div>
    );
}
