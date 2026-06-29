// ─── PredictionRealityLedger ───────────────────────────────────────
// Presentational rendering of the deterministic prediction-versus-reality
// comparison for a selected scenario. Displays the mismatch surface,
// preserved evidence, human review state, and the advisory-only /
// no-mutation boundary.

import { GovernanceCaveat, ObsDivider, SectionLabel, StatusBadge } from "@/components/ui/ObsCommon";
import {
    buildPredictionRealityLedger,
    type MismatchSeverity,
    type PredictionQuality,
} from "@/lib/interventions/prediction-reality-ledger";
import type {
    HumanDecisionState,
    InterventionScenario,
} from "@/lib/interventions/intervention-scenarios";

type BadgeVariant = "signal" | "caution" | "verified" | "risk" | "muted";

const LEDGER_BOUNDARY =
    "Evidence preserved · advisory only · no repository mutation. This ledger records a simulated prediction against a mock observed outcome. It does not write to any repository, run shell commands, or trigger a deployment.";

function mismatchVariant(severity: MismatchSeverity): BadgeVariant {
    switch (severity) {
        case "none":
            return "verified";
        case "minor":
            return "caution";
        default:
            return "risk";
    }
}

function mismatchLabel(severity: MismatchSeverity): string {
    switch (severity) {
        case "none":
            return "aligned";
        case "minor":
            return "minor";
        default:
            return "notable";
    }
}

function qualityVariant(quality: PredictionQuality): BadgeVariant {
    switch (quality) {
        case "accurate":
            return "verified";
        case "divergent":
            return "risk";
        default:
            return "caution";
    }
}

function decisionVariant(state: HumanDecisionState): BadgeVariant {
    switch (state) {
        case "reviewed-approved-not-executed":
            return "signal";
        case "reviewed-held-for-revision":
            return "caution";
        default:
            return "muted";
    }
}

function decisionLabel(state: HumanDecisionState): string {
    switch (state) {
        case "reviewed-approved-not-executed":
            return "reviewed · approved · not executed";
        case "reviewed-held-for-revision":
            return "reviewed · held for revision";
        default:
            return "pending review";
    }
}

export function PredictionRealityLedger({ scenario }: { scenario: InterventionScenario }) {
    const ledger = buildPredictionRealityLedger(scenario);

    return (
        <article className="obs-panel flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Prediction-vs-Reality Ledger</span>
                        <span className="badge badge-muted">Evidence Preserved</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{ledger.scenarioTitle}</h3>
                    <p className="text-[10px] font-mono text-text-muted">evidence · {ledger.evidenceRef}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Prediction Quality
                    </span>
                    <StatusBadge label={ledger.predictionQuality} variant={qualityVariant(ledger.predictionQuality)} />
                </div>
            </div>

            <ObsDivider />

            {/* Comparison table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-border-subtle">
                            <th className="py-2 pr-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                Dimension
                            </th>
                            <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                Prediction Before Action
                            </th>
                            <th className="py-2 px-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                Observed Reality
                            </th>
                            <th className="py-2 pl-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                                Mismatch Surface
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.rows.map((row) => (
                            <tr key={row.dimension} className="border-b border-border-subtle/50 align-top">
                                <td className="py-2.5 pr-3 text-xs font-medium text-text-primary">{row.dimension}</td>
                                <td className="py-2.5 px-3 text-xs font-mono text-text-secondary">{row.predicted}</td>
                                <td className="py-2.5 px-3 text-xs font-mono text-text-secondary">{row.observed}</td>
                                <td className="py-2.5 pl-3">
                                    <div className="flex flex-col gap-1">
                                        <StatusBadge label={mismatchLabel(row.mismatch)} variant={mismatchVariant(row.mismatch)} />
                                        <span className="text-[10px] leading-relaxed text-text-muted">{row.note}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Unresolved uncertainty */}
            <div className="rounded-md border border-border-subtle bg-surface-elevated px-4 py-3">
                <SectionLabel className="!mb-1">Unresolved Uncertainty</SectionLabel>
                <p className="text-xs leading-relaxed text-text-secondary">{ledger.unresolvedUncertainty}</p>
            </div>

            {/* Governance state row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Human Review State
                    </span>
                    <StatusBadge label={decisionLabel(ledger.humanDecisionState)} variant={decisionVariant(ledger.humanDecisionState)} />
                </div>
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Posture</span>
                    <span className="badge badge-muted self-start">Advisory Only</span>
                </div>
                <div className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Repository Mutation
                    </span>
                    <span className="badge badge-verified self-start">None</span>
                </div>
            </div>

            <GovernanceCaveat text={LEDGER_BOUNDARY} />
        </article>
    );
}
