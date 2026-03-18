import { ScopeImpact, InterventionBranch } from "../types/intervention";
import { UncertaintySignal, UncertaintyLevel } from "../types/future-state";
import { buildDerivedItemKey } from "../utils/observatory-key";

/**
 * Uncertainty Analyzer
 * Derives first-pass uncertainty signals from intervention structural constraints
 * such as scope class, cross-cutting files, and routing elements.
 */
export class UncertaintyAnalyzer {

    private static buildSignal(
        branch: InterventionBranch,
        semanticId: string,
        signal: Omit<UncertaintySignal, "signalId">
    ): UncertaintySignal {
        return {
            signalId: buildDerivedItemKey(
                "uncertainty-signal",
                branch.id,
                semanticId,
                signal.level,
                signal.limitationSource
            ),
            ...signal,
        };
    }

    /**
     * Generate an array of uncertainty signals for a given branch based on its scope impact.
     * Uses deterministic heuristics rather than LLM inference.
     */
    public static analyzeBranch(branch: InterventionBranch): UncertaintySignal[] {
        const signals: UncertaintySignal[] = [];
        const impact = branch.scopeImpact;

        // 1. Analyze scope class
        if (impact.scopeClass === "structural") {
            signals.push(this.buildSignal(branch, "scope-structural", {
                level: "high",
                rationale: "Structural changes affect app shell or shared types which can have extreme cascading effects.",
                affectedSurfaces: impact.touchedSurfaces,
                limitationSource: "cross-cutting"
            }));
        } else if (impact.scopeClass === "cross-module") {
            signals.push(this.buildSignal(branch, "scope-cross-module", {
                level: "medium",
                rationale: "Modifying multiple distinct modules limits confidence in runtime execution due to border complexities.",
                affectedSurfaces: impact.touchedSurfaces,
                limitationSource: "observability-gap"
            }));
        }

        // 2. Dependency coverage depth proxies (based on file radius vs direct targets)
        const radiusRatio = impact.estimatedFileRadius / (impact.directTargets.length || 1);
        if (radiusRatio > 4) {
            signals.push(this.buildSignal(branch, "radius-high-fanout", {
                level: "high",
                rationale: `High fan-out detected. ${impact.directTargets.length} explicit targets implicate ${impact.estimatedFileRadius} connected files. First-order graph limits apply.`,
                affectedSurfaces: ["Transitive Dependencies"],
                limitationSource: "scope-depth"
            }));
        } else if (radiusRatio > 2) {
            signals.push(this.buildSignal(branch, "radius-broad-dependency", {
                level: "medium",
                rationale: "Broad dependency graph. Alias-resolution gaps may obscure true cascade.",
                affectedSurfaces: ["Direct Dependencies"],
                limitationSource: "alias-resolution"
            }));
        }

        // 3. Routing/Shared services involvement
        const sharedServices = impact.connectedFiles.filter(f =>
            f.includes("lib/services") || f.includes("app/api") || f.includes("components/shell")
        );
        if (sharedServices.length > 0) {
            signals.push(this.buildSignal(branch, "shared-infrastructure", {
                level: "high",
                rationale: "Involves shared infrastructure or API routes lacking total observability.",
                affectedSurfaces: sharedServices,
                limitationSource: "structural-complexity"
            }));
        }

        // If very clean and isolated
        if (signals.length === 0 && impact.scopeClass === "isolated") {
            signals.push(this.buildSignal(branch, "isolated-clean-change", {
                level: "low",
                rationale: "Change is strictly isolated. Prediction confidence is high.",
                affectedSurfaces: impact.directTargets,
                limitationSource: "observability-gap"
            }));
        }

        return signals;
    }
}
