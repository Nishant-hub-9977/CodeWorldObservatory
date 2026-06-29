// ─── InterventionScenarioCard ──────────────────────────────────────
// Presentational rendering of a single intervention proposal, its
// deterministic mock prediction ("Prediction Before Action"), and its
// deterministic mock observed outcome ("Observed Reality").
//
// BOUNDARY: deterministic mock data — not an AI model call, not a
// trained world model. Nothing here executes a change.

import {
    GovernanceCaveat,
    MetricCell,
    ObsDivider,
    SectionLabel,
    StatusBadge,
} from "@/components/ui/ObsCommon";
import {
    formatConfidence,
    type InterventionScenario,
    type RollbackPosture,
} from "@/lib/interventions/intervention-scenarios";

type BadgeVariant = "signal" | "caution" | "verified" | "risk" | "muted";

const PREDICTION_BOUNDARY =
    "Prediction Before Action — a deterministic mock estimate shown prior to any change. CodeWorld is not a trained world model; this illustrates simulate-before-write discipline, not a learned prediction.";

function rollbackVariant(posture: RollbackPosture): BadgeVariant {
    switch (posture) {
        case "trivial":
            return "verified";
        case "straightforward":
            return "signal";
        case "involved":
            return "caution";
        default:
            return "risk";
    }
}

function buildResultVariant(result: string): BadgeVariant {
    return result === "pass" ? "verified" : "risk";
}

function lintResultVariant(result: string): BadgeVariant {
    if (result === "pass") return "verified";
    if (result === "fail") return "risk";
    return "caution";
}

function runtimeResultVariant(result: string): BadgeVariant {
    if (result === "clean") return "verified";
    if (result === "crash") return "risk";
    return "caution";
}

function Bullets({ items, dot = "bg-text-muted" }: { items: string[]; dot?: string }) {
    return (
        <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                    <span aria-hidden="true" className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${dot}`} />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function InterventionScenarioCard({ scenario }: { scenario: InterventionScenario }) {
    const p = scenario.prediction;
    const o = scenario.observed;

    return (
        <article className="obs-panel flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Intervention Proposal</span>
                        <span className="badge badge-muted">{scenario.interventionType}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{scenario.title}</h3>
                    <p className="text-xs leading-relaxed text-text-secondary max-w-prose">{scenario.intent}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Rollback Posture
                    </span>
                    <StatusBadge label={scenario.rollbackPosture} variant={rollbackVariant(scenario.rollbackPosture)} />
                    {scenario.humanApprovalRequired && (
                        <span className="badge badge-caution mt-1">Human Approval Required</span>
                    )}
                </div>
            </div>

            <ObsDivider />

            {/* Proposal detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <SectionLabel>Affected Files</SectionLabel>
                    <ul className="flex flex-col gap-1">
                        {scenario.affectedFiles.map((file) => (
                            <li key={file} className="font-mono text-[11px] text-text-secondary break-all">
                                {file}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col gap-2">
                    <SectionLabel>Affected Dependency Zones</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {scenario.affectedDependencyZones.map((zone) => (
                            <span key={zone} className="badge badge-muted">
                                {zone}
                            </span>
                        ))}
                    </div>
                    <SectionLabel className="mt-3 !mb-1">Expected Benefit</SectionLabel>
                    <p className="text-xs leading-relaxed text-text-secondary">{scenario.expectedBenefit}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <SectionLabel>Possible Failure Modes</SectionLabel>
                <Bullets items={scenario.possibleFailureModes} dot="bg-warning" />
            </div>

            <ObsDivider />

            {/* Prediction Before Action */}
            <div className="rounded-md border border-border-subtle bg-surface-elevated p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <SectionLabel className="!mb-0">Prediction Before Action</SectionLabel>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                            Confidence
                        </span>
                        <span className="badge badge-signal">{formatConfidence(p.confidence)}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    <MetricCell label="Files Touched" value={p.predictedFilesTouched} />
                    <MetricCell label="Dep Zones" value={p.predictedDependencyZones.length} />
                    <MetricCell label="Tests Likely Fail" value={p.testsLikelyToFail} />
                    <MetricCell label="Build" value={p.expectedBuildImpact} />
                    <MetricCell label="Lint" value={p.expectedLintImpact} />
                    <MetricCell label="Runtime Risk" value={p.expectedRuntimeRisk} />
                </div>
                <div className="flex flex-col gap-1">
                    <SectionLabel className="!mb-1">Uncertainty</SectionLabel>
                    <p className="text-xs leading-relaxed text-text-secondary">{p.uncertainty}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <SectionLabel className="!mb-1">Recommended Verification</SectionLabel>
                    <div className="flex flex-col gap-1">
                        {p.recommendedVerification.map((cmd) => (
                            <code
                                key={cmd}
                                className="font-mono text-[11px] text-text-secondary bg-surface-hover rounded px-2 py-1"
                            >
                                {cmd}
                            </code>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Human Approval
                    </span>
                    <StatusBadge
                        label={p.humanApprovalRequired ? "required" : "not required"}
                        variant={p.humanApprovalRequired ? "caution" : "muted"}
                    />
                </div>
                <GovernanceCaveat text={PREDICTION_BOUNDARY} />
            </div>

            {/* Observed Reality */}
            <div className="rounded-md border border-border-subtle bg-surface-elevated p-4 flex flex-col gap-4">
                <SectionLabel className="!mb-0">Observed Reality</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    <MetricCell label="Files Touched" value={o.actualFilesTouched} />
                    <MetricCell label="Tests Failed" value={o.actualFailingTests} />
                    <MetricCell label="Console" value={o.consoleStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Build</span>
                    <StatusBadge label={o.actualBuildResult} variant={buildResultVariant(o.actualBuildResult)} />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Lint</span>
                    <StatusBadge label={o.actualLintResult} variant={lintResultVariant(o.actualLintResult)} />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Runtime</span>
                    <StatusBadge label={o.actualRuntimeResult} variant={runtimeResultVariant(o.actualRuntimeResult)} />
                </div>
                <div className="flex flex-col gap-1">
                    <SectionLabel className="!mb-1">Deployment</SectionLabel>
                    <p className="text-xs leading-relaxed text-text-secondary">{o.deploymentStatus}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <SectionLabel className="!mb-1">Notes</SectionLabel>
                    <p className="text-xs leading-relaxed text-text-secondary">{o.notes}</p>
                </div>
            </div>
        </article>
    );
}
