import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GovernanceCaveat } from "@/components/ui/ObsCommon";
import { EvidencePackSummary } from "@/components/evidence-pack/EvidencePackSummary";
import { EvidencePackValidationPanel } from "@/components/evidence-pack/EvidencePackValidationPanel";
import { EvidencePackRiskSurface } from "@/components/evidence-pack/EvidencePackRiskSurface";
import { EvidencePackComparison } from "@/components/evidence-pack/EvidencePackComparison";
import { EvidencePackBoundaryPanel, EVIDENCE_PACK_BOUNDARY } from "@/components/evidence-pack/EvidencePackBoundaryPanel";
import { externalEvidencePack, externalEvidencePackValidation } from "@/lib/evidence-pack/evidence-pack";
import { buildEvidencePackComparison } from "@/lib/evidence-pack/derived";

export const metadata: Metadata = {
    title: "External Evidence Pack — CodeWorld Observatory",
    description:
        "A static, read-only external repository evidence-pack import boundary. No upload storage, no runtime filesystem scanning, no GitHub writes, no repository mutation.",
};

const INTRO_BOUNDARY =
    "This route demonstrates how CodeWorld could accept repository evidence from another project while preserving safety, determinism, and human review. The sample pack is static JSON committed with the app. It does not connect to GitHub APIs, require tokens, upload files, scan repositories at runtime, execute code, or mutate any repository.";

const IMPORT_STEPS = [
    {
        step: "01",
        label: "Static sample",
        body: "Use committed sample evidence only. No live upload, no external service, no token, and no private repository data.",
    },
    {
        step: "02",
        label: "Validate defensively",
        body: "Normalize required fields, flag unsupported capabilities, and fail unsafe boundary claims before display.",
    },
    {
        step: "03",
        label: "Compare read-only",
        body: "Place the external pack beside the current CodeWorld snapshot without granting either artifact execution authority.",
    },
];

export default function EvidencePackPage() {
    const comparison = buildEvidencePackComparison(externalEvidencePackValidation);

    return (
        <div className="animate-fade-in">
            <section className="relative overflow-hidden border-b border-border-subtle">
                <div
                    className="absolute inset-0 bg-observatory-grid opacity-40 pointer-events-none"
                    aria-hidden="true"
                />
                <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
                    <div className="max-w-3xl">
                        <p className="overline mb-3">External Repository Evidence</p>
                        <h1 className="mb-5 text-3xl font-semibold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl text-text-primary">
                            Evidence Pack
                        </h1>
                        <p className="text-base leading-relaxed text-text-secondary max-w-[620px]">
                            A static import boundary for hypothetical external repository evidence,
                            validated and compared without upload storage, runtime scanning, GitHub
                            access, code execution, or repository mutation.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 pt-10">
                <GovernanceCaveat text={INTRO_BOUNDARY} />
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Import Boundary"
                        title="How external evidence stays safe"
                        description="The page models an evidence-pack boundary, not a repository connection or upload workflow. Everything is static, deterministic, and reviewable."
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {IMPORT_STEPS.map((item) => (
                        <div key={item.step} className="obs-panel flex flex-col gap-2">
                            <span className="text-[10px] font-mono text-accent">{item.step}</span>
                            <h3 className="text-sm font-semibold text-text-primary">{item.label}</h3>
                            <p className="text-xs leading-relaxed text-text-secondary">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Sample Pack"
                        title="Static external repository evidence"
                        description="A hypothetical repository snapshot sample, intentionally limited to safe evidence fields and visible limitations."
                    />
                </div>
                <EvidencePackSummary pack={externalEvidencePack} />
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Validation"
                        title="Schema validation and unsupported fields"
                        description="Required fields are normalized; unsupported capabilities are rejected or flagged before the pack is treated as evidence."
                    />
                </div>
                <EvidencePackValidationPanel validation={externalEvidencePackValidation} />
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Risk"
                        title="Risk and consequence surface"
                        description="Risk surfaces and consequence-bearing edges are displayed as review evidence, not as authorization to act."
                    />
                </div>
                <EvidencePackRiskSurface pack={externalEvidencePack} />
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Comparison"
                        title="External Pack vs Current CodeWorld Snapshot"
                        description="A static side-by-side comparison of imported evidence against CodeWorld's own read-only repository snapshot."
                    />
                </div>
                <EvidencePackComparison comparison={comparison} />
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Related Evidence"
                        title="Read-only evidence surfaces"
                        description="The external pack boundary connects to the existing snapshot and simulator evidence pages without changing their behavior."
                    />
                </div>
                <div className="obs-panel flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm leading-relaxed text-text-secondary max-w-2xl">
                        External pack evidence can be reviewed beside CodeWorld's repository snapshot and
                        the Intervention Simulator, but Q9 does not import it into simulator predictions.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a href="/repository-snapshot" className="text-xs font-medium text-accent transition-colors hover:text-text-primary">
                            View repository snapshot evidence.
                        </a>
                        <a href="/intervention-simulator" className="text-xs font-medium text-accent transition-colors hover:text-text-primary">
                            Open the Intervention Simulator.
                        </a>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-14">
                <div className="mb-8">
                    <SectionHeader
                        label="Governance"
                        title="Static, advisory, human-reviewed"
                        description="The evidence pack is an import boundary demonstration. It is evidence for review, not authority to execute."
                    />
                </div>
                <EvidencePackBoundaryPanel />
                <GovernanceCaveat text={EVIDENCE_PACK_BOUNDARY} className="mt-4" />
            </section>
        </div>
    );
}
