// ─── HumanAuthorityPanel ───────────────────────────────────────────
// Restrained governance panel asserting the advisory-only, human-above-
// automation boundary of the Repository Intervention Simulator.

import { Shield, Lock } from "lucide-react";
import { GovernanceCaveat, SectionLabel } from "@/components/ui/ObsCommon";

const AUTHORITY_BOUNDARY =
    "The simulator exists to model consequences, not to bypass review. Human approval is the authority layer above every proposed intervention.";

const GUARANTEES = [
    "The simulator does not write to a repository.",
    "No shell commands are executed.",
    "No production deployment is triggered.",
    "No real Git, broker, or financial API is contacted.",
    "Human approval is required before any real intervention.",
];

export function HumanAuthorityPanel() {
    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-signal">Human Authority Layer</span>
                        <span className="badge badge-muted">Advisory Only</span>
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <Shield className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        Human review sits above automation
                    </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    No Repository Mutation
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {GUARANTEES.map((guarantee) => (
                    <div key={guarantee} className="flex items-start gap-2.5 py-1.5">
                        <span
                            aria-hidden="true"
                            className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success"
                        />
                        <span className="text-xs leading-relaxed text-text-secondary">{guarantee}</span>
                    </div>
                ))}
            </div>

            <GovernanceCaveat text={AUTHORITY_BOUNDARY} />
        </article>
    );
}
