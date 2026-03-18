// ─── Recommendation Governance ───────────────────────────────────────
// Phase 20: Wraps prioritization recommendations with explicit
// governance context so that no recommendation is mistaken for
// execution authority, directive language, or causal proof.
//
// Every governed recommendation must contain: text, supporting
// evidence classes, missing evidence classes, confidence limitation,
// advisory boundary, and non-execution caveat.

import type { ResearchPrioritizationContext, ResearchPrioritySignal } from "../types/research-prioritization";
import type {
    GovernedRecommendation,
    RecommendationGovernanceContext,
} from "../types/research-priority-drift";

import { GOVERNANCE_CAVEAT_RECOMMENDATION as GOVERNANCE_CAVEAT } from "../constants/governance";

export class RecommendationGovernance {
    /**
     * Wraps prioritization signals into governed recommendations
     * with explicit advisory constraints.
     */
    public static govern(
        prioritizationContext: ResearchPrioritizationContext
    ): RecommendationGovernanceContext {
        const governed = prioritizationContext.topPriorities.map(signal =>
            this.governSignal(signal)
        );

        return {
            generatedAt: prioritizationContext.generatedAt,
            governedRecommendations: governed,
            governanceSummary: this.synthesizeSummary(governed),
            governanceCaveat: GOVERNANCE_CAVEAT,
        };
    }

    /**
     * Converts a single priority signal into a governed recommendation,
     * adding explicit advisory constraints.
     */
    public static governSignal(signal: ResearchPrioritySignal): GovernedRecommendation {
        return {
            text: this.softenLanguage(signal.recommendedFocus),
            supportingEvidenceClasses: this.deriveSupportingEvidence(signal),
            missingEvidenceClasses: signal.evidenceGaps,
            confidenceLimitation: this.deriveConfidenceLimitation(signal),
            advisoryBoundary: this.deriveAdvisoryBoundary(signal),
            nonExecutionCaveat: `This recommendation is advisory only. It reflects a structural gap interpretation for '${signal.priorityClass}' and does not authorize, require, or imply any specific action.`,
        };
    }

    /**
     * Softens imperative language into conditional/advisory phrasing.
     * "Capture X" → "Consider capturing X"
     * "Add Y" → "Consider adding Y"
     * "Strengthen Z" → "Consider strengthening Z"
     * "Prefer X over Y" → "It may be more informative to explore X rather than Y"
     * "Increase X" → "Consider increasing X"
     */
    public static softenLanguage(text: string): string {
        let softened = text;

        // "Prefer X over Y" → "It may be more informative to explore X rather than Y"
        softened = softened.replace(
            /^Prefer\s+(.+?)\s+over\s+(.+)$/i,
            "It may be more informative to explore $1 rather than $2"
        );

        // Leading imperative verbs → "Consider [verb]ing"
        const imperatives: Array<[RegExp, string]> = [
            [/^Capture\s/i, "Consider capturing "],
            [/^Add\s/i, "Consider adding "],
            [/^Strengthen\s/i, "Consider strengthening "],
            [/^Increase\s/i, "Consider increasing "],
            [/^Expand\s/i, "Consider expanding "],
            [/^Focus\s/i, "Consider focusing "],
            [/^Prioritize\s/i, "Consider prioritizing "],
            [/^Execute\s/i, "Consider executing "],
            [/^Implement\s/i, "Consider implementing "],
            [/^Build\s/i, "Consider building "],
        ];

        for (const [pattern, replacement] of imperatives) {
            if (pattern.test(softened)) {
                softened = softened.replace(pattern, replacement);
                break;
            }
        }

        return softened;
    }

    private static deriveSupportingEvidence(signal: ResearchPrioritySignal): string[] {
        const classes: string[] = [];

        if (signal.priorityClass === "evidence-deficient-but-promising") {
            classes.push("comparative-weight", "lineage-status");
        } else if (signal.priorityClass === "replay-mature-but-empirically-shallow") {
            classes.push("replay-semantics", "lineage-completeness");
        } else if (signal.priorityClass === "empirically-strong-but-calibration-limited") {
            classes.push("empirical-depth", "benchmark-coverage");
        } else if (signal.priorityClass === "comparison-limited") {
            classes.push("portfolio-composition", "comparison-coverage");
        } else if (signal.priorityClass === "saturation-emerging") {
            classes.push("replay-completeness", "empirical-depth", "calibration-depth", "comparative-weight");
        }

        return classes;
    }

    private static deriveConfidenceLimitation(signal: ResearchPrioritySignal): string {
        if (signal.advisoryLevel === "high" || signal.advisoryLevel === "critical") {
            return "Advisory level is elevated, but confidence remains bounded by the available evidence classes and snapshot scope. High advisory level reflects gap magnitude, not certainty about the recommended path.";
        }
        if (signal.advisoryLevel === "medium") {
            return "Advisory level is moderate. The gap is observable but not yet strongly prioritized relative to other signals. Additional evidence may change this ranking.";
        }
        return "Advisory level is low. The signal is present but does not currently represent a significant structural gap relative to other priorities.";
    }

    private static deriveAdvisoryBoundary(signal: ResearchPrioritySignal): string {
        return `This recommendation applies only within the scope of the '${signal.priorityClass}' priority class, bounded by evidence available at generation time. It should be revisited when new experiment data, evaluation snapshots, or replay artifacts become available.`;
    }

    private static synthesizeSummary(governed: GovernedRecommendation[]): string {
        if (governed.length === 0) {
            return "No active priority signals require governance wrapping. The research posture is either balanced or evidence is absent.";
        }

        return `${governed.length} recommendation(s) have been wrapped with explicit governance constraints. Each recommendation includes supporting evidence classes, missing evidence classes, confidence limitations, advisory boundaries, and a non-execution caveat. All recommendations remain advisory interpretations, not directives.`;
    }
}
