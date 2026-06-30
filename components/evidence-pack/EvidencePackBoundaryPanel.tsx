// ─── EvidencePackBoundaryPanel ─────────────────────────────────────
// Visible Q9 import-boundary guarantees for static evidence-pack samples.

import { Lock, Shield } from "lucide-react";
import { GovernanceCaveat, SectionLabel } from "@/components/ui/ObsCommon";

export const EVIDENCE_PACK_BOUNDARY =
    "This page demonstrates a static evidence-pack import boundary. It does not upload files, execute code, scan repositories at runtime, call GitHub write APIs, or mutate any repository.";

const BADGES = [
    "Static Sample",
    "No Upload Storage",
    "No Repository Mutation",
    "Advisory Only",
    "Human Review Required",
];

const GUARANTEES = [
    "The sample pack is committed static JSON, not a live upload.",
    "Validation is deterministic and defensive.",
    "Unsupported capabilities are rejected or flagged before display.",
    "No GitHub API, token, or external service is required.",
    "Human review remains above any real repository decision.",
];

export function EvidencePackBoundaryPanel() {
    return (
        <article className="obs-panel flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {BADGES.map((badge) => (
                            <span key={badge} className="badge badge-muted">
                                {badge}
                            </span>
                        ))}
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <Shield className="h-4 w-4 text-text-muted" aria-hidden="true" />
                        Human-reviewed import boundary
                    </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Read-only
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {GUARANTEES.map((guarantee) => (
                    <div key={guarantee} className="flex items-start gap-2.5 py-1.5">
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success" />
                        <span className="text-xs leading-relaxed text-text-secondary">{guarantee}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2">
                <SectionLabel>Boundary language</SectionLabel>
                <GovernanceCaveat text={EVIDENCE_PACK_BOUNDARY} />
            </div>
        </article>
    );
}
