// ─── SnapshotBoundaryPanel ─────────────────────────────────────────
// Restrained governance panel asserting the read-only, static-approximation,
// advisory-only, human-reviewed boundary of the Repository Snapshot layer.

import { Shield, Lock } from "lucide-react";
import { GovernanceCaveat } from "@/components/ui/ObsCommon";

const SNAPSHOT_BOUNDARY =
    "This snapshot is a static, read-only approximation of repository structure. It does not execute code, mutate files, call GitHub write APIs, or claim complete runtime dependency knowledge.";

const GUARANTEES = [
    "The snapshot is generated locally by a read-only script — the web app never scans the filesystem.",
    "No repository files are mutated and no shell commands are executed.",
    "No GitHub (or any Git) write API is contacted and no tokens are required.",
    "Import edges are a static approximation, not bundler-accurate resolution.",
    "Human review remains the authority above any action this evidence might inform.",
];

const BADGES = [
    "No Repository Mutation",
    "Static Approximation",
    "Advisory Only",
    "Human Review Required",
];

export function SnapshotBoundaryPanel() {
    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {BADGES.map((badge, index) => (
                            <span
                                key={badge}
                                className={`badge ${index === 0 ? "badge-verified" : "badge-muted"}`}
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <Shield className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        Read-only, static, human-reviewed
                    </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    No Filesystem Scan At Request Time
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

            <GovernanceCaveat text={SNAPSHOT_BOUNDARY} />
        </article>
    );
}
