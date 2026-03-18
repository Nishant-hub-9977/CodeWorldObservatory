// ─── Latent State Encoder ──────────────────────────────────────────────
// Phase 9: Derives a typed LatentRepoState from the current world state,
// dependency graph, experiment memory signals, and governance patterns.
//
// This is a deterministic structural encoder — NOT a neural embedding.
// Every factor is computed from observable signals with bounded logic.

import fs from "fs";
import path from "path";
import type { RepoSnapshot, DependencyReport } from "../types/world-state";
import type {
    LatentRepoState,
    StructuralComplexityDescriptor,
    DependencyPressureDescriptor,
    ValidationBurdenDescriptor,
    GovernanceFrictionDescriptor,
    EvidenceSufficiencyDescriptor,
    ComplexityPosture,
    PressureLevel,
    BurdenLevel,
    FrictionLevel,
    SufficiencyPosture,
} from "../types/latent-state";
import type { SimulationSession, BenchmarkHarnessRun } from "../types/simulation";

const SIM_DIR = path.join(process.cwd(), "artifacts", "simulations");

export class LatentStateEncoder {
    /**
     * Derives a complete LatentRepoState from live repo signals and
     * historical experiment data. Fully deterministic.
     */
    public static encode(
        snapshot: RepoSnapshot,
        dependencies: DependencyReport
    ): LatentRepoState {
        const complexity = this.deriveComplexity(snapshot, dependencies);
        const dependencyPressure = this.deriveDependencyPressure(dependencies);
        const validationBurden = this.deriveValidationBurden(snapshot);
        const governanceFriction = this.deriveGovernanceFriction();
        const evidenceSufficiency = this.deriveEvidenceSufficiency();

        const compositePosture = this.computeCompositePosture(
            complexity, dependencyPressure, validationBurden,
            governanceFriction, evidenceSufficiency
        );

        return {
            id: `latent-${Date.now().toString(36)}`,
            derivedAt: new Date().toISOString(),
            sourceWorldStateId: `snap-${snapshot.capturedAt}`,
            complexity,
            dependencyPressure,
            validationBurden,
            governanceFriction,
            evidenceSufficiency,
            compositePosture: compositePosture.posture,
            compositeRationale: compositePosture.rationale,
        };
    }

    // ─── Structural Complexity ─────────────────────────────────────

    private static deriveComplexity(
        snapshot: RepoSnapshot,
        deps: DependencyReport
    ): StructuralComplexityDescriptor {
        const totalFiles = snapshot.totalFiles;
        const modules = new Set<string>();
        snapshot.nodes.forEach(n => {
            if (n.kind === "file") {
                const parts = n.path.split("/");
                if (parts.length > 1) modules.add(parts[0]);
            }
        });
        const moduleBoundaryCount = modules.size;
        const avgEdges = deps.analyzedFileCount > 0
            ? deps.edges.length / deps.analyzedFileCount
            : 0;

        const deepNesting = snapshot.nodes.filter(
            n => n.kind === "file" && n.path.split("/").length > 4
        ).length;

        // Thresholds: 40/100/200 files correspond to small/medium/large TS projects.
        // avgEdges 1/2/3 reflect sparse/moderate/dense import graphs.
        // deepNesting 5/15/30 map to shallow/moderate/deep directory trees.
        let posture: ComplexityPosture = "low";
        if (totalFiles > 200 || avgEdges > 3 || deepNesting > 30) posture = "extreme";
        else if (totalFiles > 100 || avgEdges > 2 || deepNesting > 15) posture = "high";
        else if (totalFiles > 40 || avgEdges > 1 || deepNesting > 5) posture = "moderate";

        return {
            posture,
            totalFiles,
            moduleBoundaryCount,
            averageEdgesPerFile: Number(avgEdges.toFixed(2)),
            deepNestingPaths: deepNesting,
            rationale: `${totalFiles} files across ${moduleBoundaryCount} module boundaries with ${avgEdges.toFixed(1)} avg edges/file. ${deepNesting} files at >3 directory depth.`,
        };
    }

    // ─── Dependency Pressure ───────────────────────────────────────

    private static deriveDependencyPressure(
        deps: DependencyReport
    ): DependencyPressureDescriptor {
        const maxInbound = deps.mostConnected.length > 0
            ? Math.max(...deps.mostConnected.map(c => c.inbound))
            : 0;
        const orphanCount = deps.orphanCandidates.length;
        const totalEdges = deps.edges.length;

        // Concentration: share of total edges held by top 5 most-connected
        const topEdges = deps.mostConnected.reduce((s, c) => s + c.total, 0);
        const concentrationRatio = totalEdges > 0
            ? Number((topEdges / totalEdges).toFixed(3))
            : 0;

        const hotspots = deps.mostConnected.slice(0, 3).map(c => c.path);

        // Thresholds: concentration >0.6 means top-5 files hold majority of edges (systemic coupling).
        // maxInbound >15 means a single file is imported by 15+ others (hub risk).
        // Lower tiers reflect progressively less concentrated graphs.
        let level: PressureLevel = "contained";
        if (concentrationRatio > 0.6 || maxInbound > 15) level = "systemic";
        else if (concentrationRatio > 0.4 || maxInbound > 8) level = "concentrated";
        else if (concentrationRatio > 0.2 || maxInbound > 4) level = "moderate";

        return {
            level,
            maxInboundEdges: maxInbound,
            orphanFileCount: orphanCount,
            concentrationRatio,
            hotspotPaths: hotspots,
            rationale: `Top-5 files hold ${(concentrationRatio * 100).toFixed(0)}% of edge traffic. Max inbound: ${maxInbound}. ${orphanCount} orphan files detected.`,
        };
    }

    // ─── Validation Burden ─────────────────────────────────────────

    private static deriveValidationBurden(
        snapshot: RepoSnapshot
    ): ValidationBurdenDescriptor {
        // Count recently modified files as a mutation-rate proxy
        const recentMutations = snapshot.recentlyModified.length;

        // Open problems from the workspace (type/lint errors)
        // We approximate from the snapshot; in a full system this would
        // come from a live diagnostics feed.
        const openProblems = 0; // Default — no error feed in snapshot

        // Thresholds: >4 recent mutations = moderate churn; >8 = verification-heavy.
        // These map to observable file-modification frequency in the snapshot window.
        let level: BurdenLevel = "low";
        if (recentMutations > 8) level = "heavy";
        else if (recentMutations > 4) level = "moderate";

        return {
            level,
            openProblemsCount: openProblems,
            testCoverage: null, // Not available in current system
            recentMutationRate: recentMutations,
            rationale: `${recentMutations} recently modified files. ${openProblems} open problems. Test coverage: unavailable.`,
        };
    }

    // ─── Governance Friction ───────────────────────────────────────

    private static deriveGovernanceFriction(): GovernanceFrictionDescriptor {
        const sessions = this.loadSessions();
        if (sessions.length === 0) {
            return {
                level: "smooth",
                activeBlockerCount: 0,
                recurringBlockerCategories: [],
                governanceConstrainedSessionRate: 0,
                rationale: "No historical sessions — governance friction not yet measurable.",
            };
        }

        const blockerMap: Record<string, number> = {};
        let constrainedSessions = 0;

        sessions.forEach(s => {
            let sessionConstrained = false;
            s.branchResults.forEach(br => {
                if (br.outcomeClass === "governance-constrained" || br.outcomeClass === "blocked-by-evidence") {
                    sessionConstrained = true;
                    br.governanceBlockers.forEach(b => {
                        blockerMap[b] = (blockerMap[b] || 0) + 1;
                    });
                }
            });
            if (sessionConstrained) constrainedSessions++;
        });

        const rate = constrainedSessions / sessions.length;
        const totalBlockers = Object.values(blockerMap).reduce((s, v) => s + v, 0);
        const recurring = Object.entries(blockerMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat]) => cat);

        // Thresholds: >60% constrained sessions or >10 blocker instances = systemically blocked.
        // >30% / >5 = gated (frequent review needed). >10% / >2 = cautious.
        let level: FrictionLevel = "smooth";
        if (rate > 0.6 || totalBlockers > 10) level = "blocked";
        else if (rate > 0.3 || totalBlockers > 5) level = "gated";
        else if (rate > 0.1 || totalBlockers > 2) level = "cautious";

        return {
            level,
            activeBlockerCount: totalBlockers,
            recurringBlockerCategories: recurring,
            governanceConstrainedSessionRate: Number(rate.toFixed(3)),
            rationale: `${(rate * 100).toFixed(0)}% of sessions hit governance constraints. ${totalBlockers} total blocker instances across ${recurring.length} categories.`,
        };
    }

    // ─── Evidence Sufficiency ──────────────────────────────────────

    private static deriveEvidenceSufficiency(): EvidenceSufficiencyDescriptor {
        const benchmarks = this.loadBenchmarks();
        if (benchmarks.length === 0) {
            return {
                posture: "insufficient",
                strongEvidenceRate: 0,
                insufficientEvidenceRate: 0,
                totalBenchmarkRuns: 0,
                rationale: "No benchmark runs available — evidence posture indeterminate.",
            };
        }

        let strong = 0;
        let insufficient = 0;
        benchmarks.forEach(b => {
            if (b.overallEvidenceSufficiency === "strong") strong++;
            else if (b.overallEvidenceSufficiency === "insufficient") insufficient++;
        });

        const strongRate = strong / benchmarks.length;
        const insufficientRate = insufficient / benchmarks.length;

        // Thresholds: >60% strong benchmarks = confident evidence. >40% insufficient = unreliable.
        // <20% strong AND <30% insufficient = thin (evidence exists but isn't robust).
        let posture: SufficiencyPosture = "adequate";
        if (strongRate > 0.6) posture = "strong";
        else if (insufficientRate > 0.4) posture = "insufficient";
        else if (strongRate < 0.2 && insufficientRate < 0.3) posture = "thin";

        return {
            posture,
            strongEvidenceRate: Number(strongRate.toFixed(3)),
            insufficientEvidenceRate: Number(insufficientRate.toFixed(3)),
            totalBenchmarkRuns: benchmarks.length,
            rationale: `${benchmarks.length} benchmark runs: ${(strongRate * 100).toFixed(0)}% strong, ${(insufficientRate * 100).toFixed(0)}% insufficient.`,
        };
    }

    // ─── Composite Posture ─────────────────────────────────────────

    private static computeCompositePosture(
        complexity: StructuralComplexityDescriptor,
        pressure: DependencyPressureDescriptor,
        burden: ValidationBurdenDescriptor,
        friction: GovernanceFrictionDescriptor,
        evidence: EvidenceSufficiencyDescriptor
    ): { posture: LatentRepoState["compositePosture"]; rationale: string } {
        // Score each dimension: 0 = best, 3 = worst
        const scores: number[] = [];

        const complexityScore = { low: 0, moderate: 1, high: 2, extreme: 3 }[complexity.posture];
        const pressureScore = { contained: 0, moderate: 1, concentrated: 2, systemic: 3 }[pressure.level];
        const burdenScore = { low: 0, moderate: 1, heavy: 2, prohibitive: 3 }[burden.level];
        const frictionScore = { smooth: 0, cautious: 1, gated: 2, blocked: 3 }[friction.level];
        const evidenceScore = { strong: 0, adequate: 1, thin: 2, insufficient: 3 }[evidence.posture];

        scores.push(complexityScore, pressureScore, burdenScore, frictionScore, evidenceScore);
        const avg = scores.reduce((s, v) => s + v, 0) / scores.length;

        // Composite thresholds: each dimension scored 0-3, averaged across 5.
        // >2.2 avg = most dimensions at upper severity (fragile). >1.5 = multiple elevated (pressured).
        // >0.8 = at least one dimension above baseline (cautious). ≤0.8 = all normal (stable).
        let posture: LatentRepoState["compositePosture"] = "stable";
        if (avg > 2.2) posture = "fragile";
        else if (avg > 1.5) posture = "pressured";
        else if (avg > 0.8) posture = "cautious";

        const parts: string[] = [];
        if (complexityScore >= 2) parts.push(`complexity is ${complexity.posture}`);
        if (pressureScore >= 2) parts.push(`dependency pressure is ${pressure.level}`);
        if (frictionScore >= 2) parts.push(`governance friction is ${friction.level}`);
        if (evidenceScore >= 2) parts.push(`evidence is ${evidence.posture}`);

        const rationale = parts.length > 0
            ? `Composite posture is ${posture}: ${parts.join("; ")}.`
            : `Composite posture is ${posture}. All structural dimensions within normal bounds.`;

        return { posture, rationale };
    }

    // ─── Data Loaders ──────────────────────────────────────────────

    private static loadSessions(): SimulationSession[] {
        if (!fs.existsSync(SIM_DIR)) return [];
        return fs.readdirSync(SIM_DIR)
            .filter(f => f.startsWith("session-"))
            .map(f => JSON.parse(fs.readFileSync(path.join(SIM_DIR, f), "utf-8")));
    }

    private static loadBenchmarks(): BenchmarkHarnessRun[] {
        if (!fs.existsSync(SIM_DIR)) return [];
        return fs.readdirSync(SIM_DIR)
            .filter(f => f.startsWith("benchmark-"))
            .map(f => JSON.parse(fs.readFileSync(path.join(SIM_DIR, f), "utf-8")));
    }
}
