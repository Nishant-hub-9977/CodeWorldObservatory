import fs from "fs";
import path from "path";
import type { SimulationSession, BenchmarkHarnessRun, SimulationOutcomeClass } from "../types/simulation";
import type {
    ExperimentSessionRecord,
    ExperimentSessionSummary,
    SessionComparison,
    GovernanceConstraintPattern,
    BranchTrendRecord,
    CalibrationTrendRecord,
    ResearchMemoryResponse
} from "../types/research-memory";
import { CalibrationTracker } from "./calibration-tracker";

// ─── Experiment Memory Store ─────────────────────────────────────
// Reads all historical simulation and benchmark artifacts to synthesize
// a longitudinal experiment memory snapshot. All trend data is derived
// from persisted records — no hardcoded placeholder values.

const STORE_DIR = path.join(process.cwd(), "artifacts", "simulations");

export class ExperimentMemoryStore {
    /**
     * Reads all historical simulation and benchmark data to synthesize
     * the current Experiment Memory snapshot.
     */
    public static compileMemory(): ExperimentSessionRecord {
        const files = fs.existsSync(STORE_DIR) ? fs.readdirSync(STORE_DIR) : [];
        const sessionFiles = files.filter(f => f.startsWith("session-"));
        const benchmarkFiles = files.filter(f => f.startsWith("benchmark-"));

        const sessions: SimulationSession[] = sessionFiles.map(f => {
            return JSON.parse(fs.readFileSync(path.join(STORE_DIR, f), "utf-8"));
        });

        const benchmarks: BenchmarkHarnessRun[] = benchmarkFiles.map(f => {
            return JSON.parse(fs.readFileSync(path.join(STORE_DIR, f), "utf-8"));
        });

        // Sort by timestamp descending to get recent ones easily
        sessions.sort((a, b) => new Date(b.simulatedAt).getTime() - new Date(a.simulatedAt).getTime());

        const totalBenchmarkRuns = benchmarks.length;
        const totalSimulationSessions = sessions.length;

        const recentSessions: ExperimentSessionSummary[] = sessions.slice(0, 5).map(s => ({
            sessionId: s.id,
            timestamp: s.simulatedAt,
            objective: s.objective.objective,
            simulatedBranches: s.branchResults.length,
            outcome: s.branchResults.find(b => b.outcomeClass === "structurally-favorable" || b.outcomeClass === "review-heavy") ? "Executable" : "Blocked"
        }));

        // ─── Evidence Coverage Summary ────────────────────────────
        let strong = 0; let adequate = 0; let insufficient = 0;
        benchmarks.forEach(b => {
            if (b.overallEvidenceSufficiency === "strong") strong++;
            else if (b.overallEvidenceSufficiency === "adequate") adequate++;
            else insufficient++;
        });

        // ─── Governance Constraint Patterns ───────────────────────
        const blockerMap: Record<string, { count: number; objectives: Set<string> }> = {};
        sessions.forEach(s => {
            s.branchResults.forEach(br => {
                if (br.outcomeClass === "blocked-by-evidence" || br.outcomeClass === "governance-constrained") {
                    br.governanceBlockers.forEach(blocker => {
                        if (!blockerMap[blocker]) blockerMap[blocker] = { count: 0, objectives: new Set() };
                        blockerMap[blocker].count++;
                        blockerMap[blocker].objectives.add(s.objective.objective);
                    });
                }
            });
        });
        const governanceConstraintPatterns: GovernanceConstraintPattern[] = Object.entries(blockerMap).map(([cat, data]) => ({
            category: cat,
            occurrences: data.count,
            affectedObjectives: Array.from(data.objectives).slice(0, 3)
        })).sort((a, b) => b.occurrences - a.occurrences);

        // ─── Preferred Branch Strategy Trends (data-derived) ──────
        const strategyTrends = this.deriveStrategyTrends(sessions, benchmarks);

        // ─── Comparative Sessions (grouped by objective) ──────────
        const comparativeSessions = this.deriveComparativeSessions(sessions, governanceConstraintPatterns);

        // ─── Calibration Trend (from prediction-reality ledger) ───
        const calibrationTrend = CalibrationTracker.deriveFromLedger();

        return {
            lastUpdatedAt: new Date().toISOString(),
            totalSimulationSessions,
            totalBenchmarkRuns,
            recentSessions,
            evidenceCoverage: {
                totalSessions: totalBenchmarkRuns,
                strongEvidenceCount: strong,
                adequateEvidenceCount: adequate,
                insufficientEvidenceCount: insufficient
            },
            preferredStrategyTrends: strategyTrends,
            governanceConstraintPatterns,
            calibrationTrend,
            comparativeSessions
        };
    }

    /**
     * Derives preferred strategy trends from actual simulation and benchmark
     * data using first-class strategyClass metadata from SimulationResult.
     * Falls back to branch-ID heuristics only for legacy data without strategy metadata.
     */
    private static deriveStrategyTrends(
        sessions: SimulationSession[],
        benchmarks: BenchmarkHarnessRun[]
    ): BranchTrendRecord[] {
        type StrategyKey = BranchTrendRecord["strategyClass"];

        // If no data, return explicit empty
        if (sessions.length === 0 && benchmarks.length === 0) {
            return [{
                strategyClass: "unknown",
                selectionRate: 0,
                context: "No simulation sessions recorded. Strategy preferences cannot be derived."
            }];
        }

        const strategyWins: Record<StrategyKey, number> = {
            "service-first": 0,
            "route-first": 0,
            "minimal-touch": 0,
            "structural-refactor": 0,
            "ui-first": 0,
            "unknown": 0,
        };

        // Helper: resolve strategy from first-class metadata or legacy fallback
        const resolveStrategy = (strategyClass?: string, branchId?: string): StrategyKey => {
            // Prefer first-class metadata
            if (strategyClass && strategyClass in strategyWins) {
                return strategyClass as StrategyKey;
            }
            // Legacy fallback: heuristic branch-ID mapping
            if (branchId) {
                const id = branchId.toLowerCase();
                if (id.includes("minimal")) return "minimal-touch";
                if (id.includes("refactor") || id.includes("structural")) return "structural-refactor";
                if (id.includes("service")) return "service-first";
                if (id.includes("route")) return "route-first";
                if (id.includes("ui")) return "ui-first";
            }
            return "unknown";
        };

        // Use benchmark strongest candidate to derive strategy preference
        benchmarks.forEach(b => {
            if (!b.strongestCandidateId) return;
            const topRanking = b.rankings.find(r => r.branchId === b.strongestCandidateId);
            if (!topRanking) return;
            strategyWins[resolveStrategy(topRanking.strategyClass, topRanking.branchId)]++;
        });

        // If no benchmark data, infer from session outcome patterns
        if (benchmarks.length === 0) {
            sessions.forEach(s => {
                const favorable = s.branchResults.filter(
                    br => br.outcomeClass === "structurally-favorable"
                );
                favorable.forEach(br => {
                    strategyWins[resolveStrategy(br.strategyClass, br.branchId)]++;
                });
            });
        }

        const totalWins = Object.values(strategyWins).reduce((s, v) => s + v, 0);

        const contextMap: Record<StrategyKey, string> = {
            "service-first": "System frequently selects service-first restructuring as the preferred path.",
            "route-first": "Route-first branches are selected when API surface changes drive the intervention.",
            "minimal-touch": "System prefers contained structural edits to limit scope contamination.",
            "structural-refactor": "Structural refactor branches are selected for deep architectural realignment.",
            "ui-first": "UI-first strategies are chosen when presentation layer is the primary concern.",
            "unknown": "Strategy class was not recorded — legacy data without first-class strategy metadata.",
        };

        return (Object.entries(strategyWins) as [StrategyKey, number][])
            .filter(([, wins]) => wins > 0 || totalWins === 0)
            .map(([strategy, wins]) => ({
                strategyClass: strategy,
                selectionRate: totalWins > 0 ? Number((wins / totalWins).toFixed(3)) : 0,
                context: totalWins > 0 ? contextMap[strategy] : "Insufficient empirical data to determine strategy preference."
            }))
            .sort((a, b) => b.selectionRate - a.selectionRate)
            .slice(0, 6);
    }

    /**
     * Groups sessions by objective and derives comparative session records.
     * When fewer than 2 sessions exist for an objective, they are aggregated
     * into a single group.
     */
    private static deriveComparativeSessions(
        sessions: SimulationSession[],
        governancePatterns: GovernanceConstraintPattern[]
    ): SessionComparison[] {
        if (sessions.length === 0) return [];

        // Group sessions by normalized objective text
        const objectiveGroups: Record<string, SimulationSession[]> = {};
        sessions.forEach(s => {
            const key = s.objective.objective.toLowerCase().trim();
            if (!objectiveGroups[key]) objectiveGroups[key] = [];
            objectiveGroups[key].push(s);
        });

        const comparisons: SessionComparison[] = [];

        for (const [key, group] of Object.entries(objectiveGroups)) {
            const aggregatedOutcomes: Partial<Record<SimulationOutcomeClass, number>> = {};
            const dominantBlockerSet = new Set<string>();

            group.forEach(s => {
                s.branchResults.forEach(br => {
                    aggregatedOutcomes[br.outcomeClass] = (aggregatedOutcomes[br.outcomeClass] || 0) + 1;
                    if (br.outcomeClass === "blocked-by-evidence" || br.outcomeClass === "governance-constrained") {
                        br.governanceBlockers.forEach(b => dominantBlockerSet.add(b));
                    }
                });
            });

            comparisons.push({
                objectiveHash: `obj-${Buffer.from(key).toString("base64url").slice(0, 12)}`,
                objectiveSample: group[0].objective.objective,
                sessionCount: group.length,
                preferredOutcomes: aggregatedOutcomes,
                dominantBlockers: Array.from(dominantBlockerSet).slice(0, 3)
            });
        }

        return comparisons.sort((a, b) => b.sessionCount - a.sessionCount);
    }
}
