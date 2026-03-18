// ─── Transition Pattern Analyzer ──────────────────────────────────────
// Phase 9: Examines historical experiment memory to detect recurring
// patterns linking latent repo conditions to strategy preferences,
// blocker recurrence, and calibration burden.
//
// Moves from "branch X won in session Y" toward "under latent state
// conditions A+B+C, strategy class S tends to dominate."
//
// All pattern detection is deterministic structural analysis —
// no statistical inference or learned models are used.

import fs from "fs";
import path from "path";
import type { SimulationSession, BenchmarkHarnessRun } from "../types/simulation";
import type { BranchStrategy } from "../types/intervention";
import type {
    TransitionPatternRecord,
    ComplexityPosture,
    PressureLevel,
    FrictionLevel,
} from "../types/latent-state";

const SIM_DIR = path.join(process.cwd(), "artifacts", "simulations");

interface SessionFingerprint {
    complexityPosture: ComplexityPosture;
    pressureLevel: PressureLevel;
    frictionLevel: FrictionLevel;
    dominantStrategy: BranchStrategy | "mixed";
    dominantOutcome: string;
}

export class TransitionPatternAnalyzer {
    /**
     * Analyzes all historical sessions and benchmarks to detect
     * recurring transition motifs.
     */
    public static analyze(): {
        patterns: TransitionPatternRecord[];
        totalSessionsAnalyzed: number;
    } {
        const sessions = this.loadSessions();
        const benchmarks = this.loadBenchmarks();

        if (sessions.length === 0) {
            return { patterns: [], totalSessionsAnalyzed: 0 };
        }

        // 1. Fingerprint each session by approximating latent conditions
        const fingerprints = sessions.map(s =>
            this.fingerprintSession(s, benchmarks)
        );

        // 2. Group by condition pattern and detect recurring motifs
        const patterns = this.detectPatterns(fingerprints);

        // 3. Detect blocker recurrence motifs
        const blockerPatterns = this.detectBlockerRecurrence(sessions);

        // 4. Detect calibration burden motifs
        const calibrationPatterns = this.detectCalibrationBurden(sessions, benchmarks);

        return {
            patterns: [...patterns, ...blockerPatterns, ...calibrationPatterns]
                .sort((a, b) => b.occurrences - a.occurrences),
            totalSessionsAnalyzed: sessions.length,
        };
    }

    // ─── Session Fingerprinting ────────────────────────────────────

    private static fingerprintSession(
        session: SimulationSession,
        benchmarks: BenchmarkHarnessRun[]
    ): SessionFingerprint {
        // Approximate structural complexity from branch result count
        const branchCount = session.branchResults.length;
        let complexityPosture: ComplexityPosture = "moderate";
        if (branchCount >= 5) complexityPosture = "high";
        else if (branchCount <= 2) complexityPosture = "low";

        // Approximate pressure from governance blocker density
        const totalBlockers = session.branchResults.reduce(
            (s, br) => s + br.governanceBlockers.length, 0
        );
        let pressureLevel: PressureLevel = "contained";
        if (totalBlockers > 6) pressureLevel = "systemic";
        else if (totalBlockers > 3) pressureLevel = "concentrated";
        else if (totalBlockers > 1) pressureLevel = "moderate";

        // Friction from governance-constrained outcomes
        const constrainedCount = session.branchResults.filter(
            br => br.outcomeClass === "governance-constrained" || br.outcomeClass === "blocked-by-evidence"
        ).length;
        let frictionLevel: FrictionLevel = "smooth";
        if (constrainedCount >= 3) frictionLevel = "blocked";
        else if (constrainedCount >= 2) frictionLevel = "gated";
        else if (constrainedCount >= 1) frictionLevel = "cautious";

        // Find the dominant strategy from the winning branch
        const matchingBenchmark = benchmarks.find(b => b.sessionId === session.id);
        let dominantStrategy: BranchStrategy | "mixed" = "mixed";
        if (matchingBenchmark?.strongestCandidateId) {
            const topRanking = matchingBenchmark.rankings.find(
                r => r.branchId === matchingBenchmark.strongestCandidateId
            );
            if (topRanking?.strategyClass) {
                dominantStrategy = topRanking.strategyClass as BranchStrategy;
            }
        }

        // Dominant outcome from the session
        const outcomeCount: Record<string, number> = {};
        session.branchResults.forEach(br => {
            outcomeCount[br.outcomeClass] = (outcomeCount[br.outcomeClass] || 0) + 1;
        });
        const dominantOutcome = Object.entries(outcomeCount)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

        return {
            complexityPosture,
            pressureLevel,
            frictionLevel,
            dominantStrategy,
            dominantOutcome,
        };
    }

    // ─── Pattern Detection ─────────────────────────────────────────

    private static detectPatterns(
        fingerprints: SessionFingerprint[]
    ): TransitionPatternRecord[] {
        // Group fingerprints by (complexity, pressure, friction) triple
        const groups: Record<string, SessionFingerprint[]> = {};
        fingerprints.forEach(fp => {
            const key = `${fp.complexityPosture}|${fp.pressureLevel}|${fp.frictionLevel}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(fp);
        });

        const patterns: TransitionPatternRecord[] = [];
        let counter = 0;

        for (const [key, group] of Object.entries(groups)) {
            if (group.length < 1) continue; // Even single occurrences are worth recording
            counter++;

            const [complexity, pressure, friction] = key.split("|") as [ComplexityPosture, PressureLevel, FrictionLevel];

            // Find the most common strategy in this group
            const stratCounts: Record<string, number> = {};
            group.forEach(fp => {
                stratCounts[fp.dominantStrategy] = (stratCounts[fp.dominantStrategy] || 0) + 1;
            });
            const topStrategy = Object.entries(stratCounts)
                .sort((a, b) => b[1] - a[1])[0];

            // Most common outcome
            const outcomeCounts: Record<string, number> = {};
            group.forEach(fp => {
                outcomeCounts[fp.dominantOutcome] = (outcomeCounts[fp.dominantOutcome] || 0) + 1;
            });
            const topOutcome = Object.entries(outcomeCounts)
                .sort((a, b) => b[1] - a[1])[0];

            patterns.push({
                patternId: `tp-${counter.toString().padStart(3, "0")}`,
                description: `Under ${complexity} complexity, ${pressure} pressure, and ${friction} friction, strategy "${topStrategy?.[0] || "mixed"}" tends to dominate with "${topOutcome?.[0] || "unknown"}" outcomes.`,
                occurrences: group.length,
                latentConditions: {
                    complexityPosture: complexity,
                    pressureLevel: pressure,
                    frictionLevel: friction,
                },
                dominantStrategy: (topStrategy?.[0] || "mixed") as BranchStrategy | "mixed",
                dominantOutcome: topOutcome?.[0] || "unknown",
                confidence: group.length >= 5 ? "high" : group.length >= 2 ? "medium" : "low",
            });
        }

        return patterns;
    }

    // ─── Blocker Recurrence Motifs ─────────────────────────────────

    private static detectBlockerRecurrence(
        sessions: SimulationSession[]
    ): TransitionPatternRecord[] {
        const blockerSessions: Record<string, number> = {};
        sessions.forEach(s => {
            s.branchResults.forEach(br => {
                br.governanceBlockers.forEach(b => {
                    blockerSessions[b] = (blockerSessions[b] || 0) + 1;
                });
            });
        });

        return Object.entries(blockerSessions)
            .filter(([, count]) => count >= 2) // Only recurring blockers
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([blocker, count], i) => ({
                patternId: `tp-blocker-${(i + 1).toString().padStart(2, "0")}`,
                description: `Governance blocker "${blocker}" recurs across ${count} session branch results, indicating a systemic constraint.`,
                occurrences: count,
                latentConditions: {
                    complexityPosture: "moderate" as ComplexityPosture,
                    pressureLevel: "moderate" as PressureLevel,
                    frictionLevel: "gated" as FrictionLevel,
                },
                dominantStrategy: "mixed" as const,
                dominantOutcome: "governance-constrained",
                confidence: count >= 5 ? "high" as const : "medium" as const,
            }));
    }

    // ─── Calibration Burden Motifs ─────────────────────────────────

    private static detectCalibrationBurden(
        sessions: SimulationSession[],
        benchmarks: BenchmarkHarnessRun[]
    ): TransitionPatternRecord[] {
        // Sessions with calibration-weak outcomes
        const weakSessions = sessions.filter(s =>
            s.branchResults.some(br => br.outcomeClass === "calibration-weak")
        );

        if (weakSessions.length === 0) return [];

        // Check if calibration weakness concentrates in sessions
        // with insufficient evidence
        const weakWithInsufficientEvidence = weakSessions.filter(s => {
            const benchmark = benchmarks.find(b => b.sessionId === s.id);
            return benchmark?.overallEvidenceSufficiency === "insufficient";
        });

        const patterns: TransitionPatternRecord[] = [];

        if (weakSessions.length >= 1) {
            patterns.push({
                patternId: "tp-calibration-01",
                description: `${weakSessions.length} sessions produced calibration-weak outcomes. ${weakWithInsufficientEvidence.length} of these also had insufficient evidence, suggesting calibration burden concentrates where evidence is thin.`,
                occurrences: weakSessions.length,
                latentConditions: {
                    complexityPosture: "moderate",
                    pressureLevel: "moderate",
                    frictionLevel: "cautious",
                },
                dominantStrategy: "mixed",
                dominantOutcome: "calibration-weak",
                confidence: weakSessions.length >= 3 ? "high" : "low",
            });
        }

        return patterns;
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
