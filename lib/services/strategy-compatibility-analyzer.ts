// ─── Strategy Compatibility Analyzer ──────────────────────────────────
// Phase 9: Assesses which BranchStrategy classes are structurally
// compatible with the current latent repo state.
//
// This is bounded architectural reasoning — NOT a classifier or
// neural scorer. Each compatibility rating is derived from explicit
// structural conditions with auditable rationale.

import type { BranchStrategy } from "../types/intervention";
import type {
    LatentRepoState,
    StrategyCompatibilityAssessment,
    CompatibilityClass,
} from "../types/latent-state";

const ALL_STRATEGIES: BranchStrategy[] = [
    "service-first",
    "route-first",
    "ui-first",
    "minimal-touch",
    "structural-refactor",
];

export class StrategyCompatibilityAnalyzer {
    /**
     * Produces a compatibility assessment for every known BranchStrategy
     * given the current LatentRepoState.
     */
    public static analyze(
        latentState: LatentRepoState
    ): StrategyCompatibilityAssessment[] {
        return ALL_STRATEGIES.map(strategy =>
            this.assessStrategy(strategy, latentState)
        );
    }

    private static assessStrategy(
        strategy: BranchStrategy,
        state: LatentRepoState
    ): StrategyCompatibilityAssessment {
        switch (strategy) {
            case "service-first":
                return this.assessServiceFirst(state);
            case "route-first":
                return this.assessRouteFirst(state);
            case "ui-first":
                return this.assessUiFirst(state);
            case "minimal-touch":
                return this.assessMinimalTouch(state);
            case "structural-refactor":
                return this.assessStructuralRefactor(state);
            default:
                return {
                    strategy,
                    compatibility: "viable-with-review",
                    suitabilityScore: 0.5,
                    reasoning: "No specific assessment rule for this strategy class.",
                    keyFactors: [],
                };
        }
    }

    // ─── Per-Strategy Assessors ──────────────────────────────────

    private static assessServiceFirst(
        state: LatentRepoState
    ): StrategyCompatibilityAssessment {
        const factors: string[] = [];
        let score = 0.7; // baseline suitability

        // Service-first works well when dependency pressure is contained
        // and complexity is manageable
        if (state.dependencyPressure.level === "contained") {
            score += 0.15;
            factors.push("dependency-pressure: contained");
        } else if (state.dependencyPressure.level === "systemic") {
            score -= 0.25;
            factors.push("dependency-pressure: systemic (risk of propagation)");
        }

        if (state.complexity.posture === "low" || state.complexity.posture === "moderate") {
            score += 0.1;
            factors.push(`complexity: ${state.complexity.posture}`);
        } else if (state.complexity.posture === "extreme") {
            score -= 0.15;
            factors.push("complexity: extreme (service isolation harder)");
        }

        // Governance friction raises review cost for service changes
        if (state.governanceFriction.level === "gated" || state.governanceFriction.level === "blocked") {
            score -= 0.1;
            factors.push(`governance-friction: ${state.governanceFriction.level}`);
        }

        return {
            strategy: "service-first",
            compatibility: this.classifyScore(score),
            suitabilityScore: this.clamp(score),
            reasoning: "Service-first restructuring is most effective when dependency pressure is contained and module boundaries are clear. " +
                (score >= 0.65
                    ? "Current conditions favor this approach."
                    : "Current structural conditions introduce friction that may reduce effectiveness."),
            keyFactors: factors,
        };
    }

    private static assessRouteFirst(
        state: LatentRepoState
    ): StrategyCompatibilityAssessment {
        const factors: string[] = [];
        let score = 0.65;

        // Route-first benefits from lower complexity and clear API surface
        if (state.complexity.posture === "low") {
            score += 0.15;
            factors.push("complexity: low (API surface easy to isolate)");
        }

        if (state.validationBurden.level === "heavy" || state.validationBurden.level === "prohibitive") {
            score -= 0.2;
            factors.push(`validation-burden: ${state.validationBurden.level} (route changes compound verification)`)
        }

        // Evidence sufficiency matters — route changes need validation data
        if (state.evidenceSufficiency.posture === "strong") {
            score += 0.1;
            factors.push("evidence: strong (route changes well-supported)");
        } else if (state.evidenceSufficiency.posture === "insufficient") {
            score -= 0.15;
            factors.push("evidence: insufficient (route changes under-validated)");
        }

        return {
            strategy: "route-first",
            compatibility: this.classifyScore(score),
            suitabilityScore: this.clamp(score),
            reasoning: "Route-first wiring is effective when API surfaces are well-bounded and validation evidence is available. " +
                (score >= 0.65
                    ? "Conditions are supportive."
                    : "Structural signals suggest caution."),
            keyFactors: factors,
        };
    }

    private static assessUiFirst(
        state: LatentRepoState
    ): StrategyCompatibilityAssessment {
        const factors: string[] = [];
        let score = 0.6;

        // UI-first works best when dependency pressure is low and
        // governance doesn't gate presentation changes
        if (state.dependencyPressure.level === "contained" || state.dependencyPressure.level === "moderate") {
            score += 0.1;
            factors.push(`dependency-pressure: ${state.dependencyPressure.level}`);
        }

        if (state.governanceFriction.level === "smooth") {
            score += 0.1;
            factors.push("governance: smooth (UI changes unblocked)");
        }

        // UI-first is risky when complexity is extreme
        if (state.complexity.posture === "extreme") {
            score -= 0.2;
            factors.push("complexity: extreme (UI integration surface unpredictable)");
        }

        return {
            strategy: "ui-first",
            compatibility: this.classifyScore(score),
            suitabilityScore: this.clamp(score),
            reasoning: "UI-first strategies accept data stubs initially and are most viable when governance is smooth and dependency pressure is low. " +
                (score >= 0.65
                    ? "Current state allows this approach."
                    : "Structural conditions suggest this path may need significant review."),
            keyFactors: factors,
        };
    }

    private static assessMinimalTouch(
        state: LatentRepoState
    ): StrategyCompatibilityAssessment {
        const factors: string[] = [];
        let score = 0.75; // minimal-touch is generally safe

        // Minimal-touch is always favorable when the system is pressured
        if (state.compositePosture === "pressured" || state.compositePosture === "fragile") {
            score += 0.15;
            factors.push(`composite-posture: ${state.compositePosture} (minimal-touch reduces blast radius)`);
        }

        // High governance friction makes minimal-touch strongly favorable
        if (state.governanceFriction.level === "gated" || state.governanceFriction.level === "blocked") {
            score += 0.1;
            factors.push(`governance: ${state.governanceFriction.level} (minimal scope avoids blockers)`);
        }

        // If evidence is thin, minimal-touch is the safest bet
        if (state.evidenceSufficiency.posture === "thin" || state.evidenceSufficiency.posture === "insufficient") {
            score += 0.05;
            factors.push(`evidence: ${state.evidenceSufficiency.posture} (scope containment preserves trust)`);
        }

        return {
            strategy: "minimal-touch",
            compatibility: this.classifyScore(score),
            suitabilityScore: this.clamp(score),
            reasoning: "Minimal-touch interventions have the smallest blast radius and lowest governance burden. " +
                "This strategy is almost always viable and becomes strongly preferred under pressure or friction.",
            keyFactors: factors,
        };
    }

    private static assessStructuralRefactor(
        state: LatentRepoState
    ): StrategyCompatibilityAssessment {
        const factors: string[] = [];
        let score = 0.5; // starts lower — refactors are high-cost

        // Structural refactor requires low governance friction and good evidence
        if (state.governanceFriction.level === "smooth") {
            score += 0.15;
            factors.push("governance: smooth (refactor path clear)");
        } else if (state.governanceFriction.level === "blocked") {
            score -= 0.25;
            factors.push("governance: blocked (refactors will hit governance gates)");
        }

        if (state.evidenceSufficiency.posture === "strong") {
            score += 0.15;
            factors.push("evidence: strong (refactor outcomes predictable)");
        } else if (state.evidenceSufficiency.posture === "insufficient") {
            score -= 0.2;
            factors.push("evidence: insufficient (refactor risk unquantifiable)");
        }

        // High complexity paradoxically makes refactors both more needed
        // and more dangerous
        if (state.complexity.posture === "high" || state.complexity.posture === "extreme") {
            factors.push(`complexity: ${state.complexity.posture} (refactor high-impact but high-risk)`);
            // No score change — it's a wash
        }

        if (state.dependencyPressure.level === "systemic") {
            score -= 0.15;
            factors.push("dependency-pressure: systemic (refactor propagation risk)");
        }

        return {
            strategy: "structural-refactor",
            compatibility: this.classifyScore(score),
            suitabilityScore: this.clamp(score),
            reasoning: "Structural refactors require clear governance, strong evidence, and manageable dependency pressure. " +
                (score >= 0.65
                    ? "Conditions support a refactor pass."
                    : "Current repo state suggests refactoring carries elevated risk — consider minimal-touch or service-first instead."),
            keyFactors: factors,
        };
    }

    // ─── Helpers ─────────────────────────────────────────────────
    // Classification thresholds: ≥0.7 = favorable (strategy fits well),
    // ≥0.45 = viable-with-review (needs oversight), <0.45 = structurally misaligned.
    // Base scores per strategy: service-first 0.7 (general-purpose), route-first 0.65
    // (API-dependent), ui-first 0.6 (presentation-layer), minimal-touch 0.75 (safest
    // default), structural-refactor 0.5 (high-cost, needs strong justification).
    // Adjustments: ±0.25 strong signal, ±0.15 moderate, ±0.10 weak, ±0.05 marginal.

    private static classifyScore(score: number): CompatibilityClass {
        if (score >= 0.7) return "favorable";
        if (score >= 0.45) return "viable-with-review";
        return "structurally-misaligned";
    }

    private static clamp(value: number): number {
        return Number(Math.max(0, Math.min(1, value)).toFixed(3));
    }
}
