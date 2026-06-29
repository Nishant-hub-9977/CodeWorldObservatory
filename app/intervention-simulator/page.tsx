import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GovernanceCaveat } from "@/components/ui/ObsCommon";
import { RepositoryStateCard } from "@/components/interventions/RepositoryStateCard";
import { InterventionSimulator } from "@/components/interventions/InterventionSimulator";
import { HumanAuthorityPanel } from "@/components/interventions/HumanAuthorityPanel";
import { MOCK_REPOSITORY_STATE } from "@/lib/interventions/mock-repository-state";

export const metadata: Metadata = {
    title: "Repository Intervention Simulator — CodeWorld Observatory",
    description:
        "A simulation-first workflow: observe a repository world, propose an intervention, predict its consequences before acting, then compare the prediction against an observed outcome. Advisory-only, deterministic mock data, no repository mutation.",
};

const INTRO_BOUNDARY =
    "This is a simulation-first, advisory-only workflow over deterministic mock data. CodeWorld is not a trained world model and does not perform real machine learning here. The simulator observes a mock repository world, predicts intervention consequences before action, and compares prediction with a mock observed reality. It does not write to a repository, run shell commands, contact a Git API, or trigger a deployment.";

const WORLD_MODEL_NOTE =
    "Inspired by broader world-model research: before acting in a complex environment, a system should represent the world, imagine future states, estimate the cost of intervention, compare prediction with reality, and remain accountable when its prediction fails. In CodeWorld terms, the environment is the repository, future-state prediction is intervention-consequence prediction, and cost is files, dependency zones, tests, rollback risk, and uncertainty.";

const FLOW_STEPS = [
    { step: "01", label: "Observe", body: "Read a mock repository world: build status, fragile zones, dependency graph, history, and risk." },
    { step: "02", label: "Propose", body: "Select a predefined intervention with intent, scope, benefit, failure modes, and rollback posture." },
    { step: "03", label: "Predict", body: "Show a deterministic prediction before action: files, zones, tests, build, lint, runtime, confidence." },
    { step: "04", label: "Observe Reality", body: "Reveal a mock observed outcome: actual files, tests, build, lint, runtime, and console status." },
    { step: "05", label: "Reconcile", body: "Compare prediction with reality, surface mismatches, preserve evidence, and record the human review state." },
];

export default function InterventionSimulatorPage() {
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
                        <p className="overline mb-3">Prediction-versus-Reality</p>
                        <h1 className="mb-5 text-3xl font-semibold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl text-text-primary">
                            Repository Intervention Simulator
                        </h1>
                        <p className="text-base leading-relaxed text-text-secondary max-w-[560px]">
                            Observe a repository world, predict an intervention&apos;s consequences
                            before acting, then hold that prediction against an observed reality.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Boundary ───────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 pt-10">
                <GovernanceCaveat text={INTRO_BOUNDARY} />
            </section>

            {/* ─── Workflow ───────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Workflow"
                        title="Simulate before write"
                        description="Five steps turn the repository-as-world thesis into a concrete, reviewable workflow — none of which mutate a real system."
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {FLOW_STEPS.map((item) => (
                        <div key={item.step} className="obs-panel flex flex-col gap-2">
                            <span className="text-[10px] font-mono text-accent">{item.step}</span>
                            <h3 className="text-sm font-semibold text-text-primary">{item.label}</h3>
                            <p className="text-xs leading-relaxed text-text-secondary">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Repository World ───────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Step 01 — Observe"
                        title="The repository world"
                        description="A static, typed snapshot of a repository-like environment. Mock data only — not a live capture."
                    />
                </div>
                <RepositoryStateCard state={MOCK_REPOSITORY_STATE} />
            </section>

            {/* ─── Simulator ──────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Steps 02–05 — Propose · Predict · Reconcile"
                        title="Intervention simulator"
                        description="Select a predefined intervention. The prediction is shown before action; the observed reality and the prediction-versus-reality ledger follow."
                    />
                </div>
                <InterventionSimulator />
            </section>

            {/* ─── Human Authority ────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14 border-b border-border-subtle">
                <div className="mb-8">
                    <SectionHeader
                        label="Governance"
                        title="Human authority layer"
                        description="The simulator models consequences; it never bypasses review. Human approval sits above any real intervention."
                    />
                </div>
                <HumanAuthorityPanel />
            </section>

            {/* ─── World-model note ───────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 py-14">
                <div className="mb-6">
                    <SectionHeader
                        label="Direction"
                        title="Repository-as-world thinking"
                        description="Why a prediction-versus-reality ledger belongs at the centre of agentic software engineering."
                    />
                </div>
                <GovernanceCaveat text={WORLD_MODEL_NOTE} />
            </section>
        </div>
    );
}
