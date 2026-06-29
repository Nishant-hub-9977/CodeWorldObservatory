import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GovernanceCaveat, SectionLabel } from "@/components/ui/ObsCommon";
import { ResourceConsequenceEvidenceCard } from "@/components/quantum/ResourceConsequenceEvidenceCard";
import { sampleResult } from "@/lib/quantum/sample-result";
import quantumTools from "@/research/quantum/tools.json";

export const metadata: Metadata = {
    title: "Quantum Research Annex — CodeWorld Observatory",
    description:
        "Resource estimation, simulation-first reasoning, and evidence-preserving software intervention. A research and interpretation layer — no quantum advantage claimed, no Google affiliation implied.",
};

const BOUNDARY_TEXT =
    "This annex is a research and interpretation layer. It does not claim quantum advantage, does not run production quantum workloads, does not imply affiliation with Google, and does not modify CodeWorld's core simulation-first repository governance thesis.";

const Q2_BOUNDARY =
    "This page displays exported local research evidence only. It does not run Python, does not invoke quantum libraries, and does not perform live quantum simulation during web rendering.";

const EVIDENCE_FLOW = [
    "A local research script produces an exported JSON artifact.",
    "CodeWorld reads the exported artifact as evidence.",
    "The web app displays the evidence.",
    "Human review remains the authority layer.",
    "No live quantum simulation runs in the Vercel request path.",
];

const ANNEX_CARDS = [
    {
        title: "Research Annex",
        body: "A clean, separated interpretation layer. The repository-as-world thesis remains primary; quantum tooling is studied, not embedded.",
    },
    {
        title: "External Tool Map",
        body: "Cirq, qsim, Qualtran, OpenFermion, and TensorFlow Quantum are external open-source references — not bundled application code.",
    },
    {
        title: "Resource Consequence Ledger",
        body: "Quantum-style resource accounting mapped onto software intervention governance: files, dependencies, tests, predictions, evidence.",
    },
    {
        title: "Local Experiment Layer",
        body: "A lightweight local lab produces JSON evidence. Heavy simulation stays off the production runtime entirely.",
    },
    {
        title: "No Quantum Advantage Claimed",
        body: "No advantage, no production quantum compute, no scientific claims. Discipline borrowed, claims withheld.",
    },
    {
        title: "Evidence Export Only",
        body: "The web app may display exported JSON evidence. It never executes quantum simulation.",
    },
];

const RATIONALE = [
    {
        title: "Why quantum appears in CodeWorld",
        body: "Quantum resource estimation is one of the few disciplines that demands fully explicit accounting of cost before execution. CodeWorld borrows that posture for software interventions.",
    },
    {
        title: "Why this is a research annex",
        body: "It is intentionally separated from the core. The annex strengthens the thesis without converting CodeWorld into a quantum product or runtime.",
    },
    {
        title: "Why no quantum advantage is claimed",
        body: "No advantage, speedup, or production capability is asserted. The value is interpretive: a discipline of consequence accounting, not a performance claim.",
    },
    {
        title: "Why external repos are references",
        body: "External quantum repositories are studied locally and cited by URL. They are not vendored, imported, redistributed, or committed into CodeWorld source.",
    },
    {
        title: "How resource thinking maps to engineering",
        body: "Explicit resource estimation becomes intervention accounting: which files, dependency zones, and test surfaces a change consumes, with predicted versus actual outcomes.",
    },
    {
        title: "Repository-as-world stays primary",
        body: "The simulation-first repository governance architecture is unchanged. The annex is additive, advisory, and reversible.",
    },
];

const LEDGER_FIELDS = [
    { field: "files affected", note: "Scope of the change surface." },
    { field: "dependency zones touched", note: "Coupled regions that may propagate effects." },
    { field: "test surfaces predicted to fail", note: "Pre-execution failure hypotheses." },
    { field: "intervention hypothesis", note: "The proposed change and its intent." },
    { field: "predicted outcome", note: "Expected result before any write." },
    { field: "actual outcome", note: "Observed result after evaluation." },
    { field: "evidence hash or timestamp", note: "Tamper-evident provenance." },
    { field: "uncertainty level", note: "Explicit confidence bound." },
    { field: "human approval state", note: "Pending, approved, or rejected." },
    { field: "rollback posture", note: "Reversibility and recovery stance." },
    { field: "simulation status", note: "Whether simulation preceded the write." },
];

export default function QuantumAnnexPage() {
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
                        <p className="overline mb-3">Research Annex</p>
                        <h1 className="mb-5 text-3xl font-semibold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl text-text-primary">
                            Quantum Research Annex
                        </h1>
                        <p className="text-base leading-relaxed text-text-secondary max-w-[560px]">
                            Resource estimation, simulation-first reasoning, and
                            evidence-preserving software intervention.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Boundary ───────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 pt-10">
                <GovernanceCaveat text={BOUNDARY_TEXT} />
            </section>

            {/* ─── Card grid ──────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Overview"
                        title="A separated interpretation layer"
                        description="Six surfaces define the annex. Each is additive and advisory — none alter CodeWorld's repository-as-world core."
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ANNEX_CARDS.map((card) => (
                        <div key={card.title} className="obs-panel flex flex-col gap-2">
                            <h3 className="text-sm font-semibold text-text-primary">{card.title}</h3>
                            <p className="text-xs leading-relaxed text-text-secondary">{card.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Rationale ──────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Rationale"
                        title="Why quantum, and why an annex"
                        description="Disciplined resource accounting strengthens simulation-first software governance — without product or performance claims."
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RATIONALE.map((item) => (
                        <div key={item.title} className="obs-panel flex flex-col gap-2">
                            <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                            <p className="text-xs leading-relaxed text-text-secondary">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── External Tool Map ──────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="External Tool Map"
                        title="References, not bundled code"
                        description="External open-source projects studied for their resource-estimation and simulation discipline. None are imported into the app."
                    />
                </div>
                <div className="flex flex-col gap-3">
                    {quantumTools.tools.map((tool) => (
                        <div key={tool.name} className="obs-panel flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <h3 className="text-sm font-semibold text-text-primary">{tool.name}</h3>
                                <span
                                    className={`badge ${tool.usage_status === "reference" ? "badge-signal" : "badge-muted"}`}
                                >
                                    {tool.usage_status}
                                </span>
                            </div>
                            <p className="text-xs leading-relaxed text-text-secondary">
                                {tool.codeworld_interpretation}
                            </p>
                            <p className="text-[10px] font-mono text-text-muted">{tool.boundary_note}</p>
                            <a
                                href={tool.official_repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent hover:underline font-mono"
                            >
                                {tool.official_repo_url}
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Resource Consequence Ledger ────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Resource Consequence Ledger"
                        title="Intervention accounting for repositories"
                        description="Inspired by explicit resource accounting, applied to software repositories as technical worlds — a natural extension of CodeWorld Observatory, not quantum marketing."
                    />
                </div>
                <div className="obs-panel overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="text-text-muted">
                                <th className="py-2 pr-4 font-mono uppercase tracking-wider text-[10px]">Field</th>
                                <th className="py-2 font-mono uppercase tracking-wider text-[10px]">Meaning</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LEDGER_FIELDS.map((row) => (
                                <tr key={row.field} className="border-t border-border-subtle">
                                    <td className="py-2 pr-4 font-mono text-text-primary">{row.field}</td>
                                    <td className="py-2 text-text-secondary">{row.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ─── Local Experiment Layer · Evidence Artifact ─────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14">
                <div className="mb-8">
                    <SectionHeader
                        label="Local Experiment Layer"
                        title="Exported evidence artifact"
                        description="A lightweight local lab generates a Resource Consequence Ledger JSON artifact. The production app displays this exported evidence — it never runs heavy quantum simulation."
                    />
                </div>

                {/* Generation command */}
                <div className="obs-panel mb-4">
                    <p className="text-xs leading-relaxed text-text-secondary mb-2">
                        Generate the evidence artifact locally:
                    </p>
                    <pre className="text-xs font-mono text-text-primary overflow-x-auto">
                        python quantum-lab/experiments/resource_consequence_placeholder.py
                    </pre>
                    <p className="text-[10px] font-mono text-text-muted mt-3">
                        Output: quantum-lab/results/sample_result.json
                    </p>
                </div>

                {/* Evidence card */}
                <ResourceConsequenceEvidenceCard evidence={sampleResult} />

                {/* How this evidence flows */}
                <div className="mt-10 obs-panel">
                    <SectionLabel>How this evidence flows</SectionLabel>
                    <ol className="flex flex-col gap-2 mt-3">
                        {EVIDENCE_FLOW.map((step, i) => (
                            <li key={step} className="flex items-start gap-3">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-hover text-[10px] font-mono text-text-muted">
                                    {i + 1}
                                </span>
                                <span className="text-xs leading-relaxed text-text-secondary">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Q2 Boundary */}
                <div className="mt-6">
                    <GovernanceCaveat text={Q2_BOUNDARY} />
                </div>
            </section>
        </div>
    );
}
