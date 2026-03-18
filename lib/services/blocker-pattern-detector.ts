import type { SimulationSession } from "../types/simulation";
import type { TimelineBlockerPattern } from "../types/research-timeline";

export class BlockerPatternDetector {
    public static detect(sessions: SimulationSession[]): TimelineBlockerPattern[] {
        const patternMap = new Map<string, TimelineBlockerPattern>();

        for (const session of sessions) {
            const uniqueBlockers = new Set(session.branchResults.flatMap(result => result.governanceBlockers));

            for (const blocker of uniqueBlockers) {
                const existing = patternMap.get(blocker);
                if (!existing) {
                    patternMap.set(blocker, {
                        blocker,
                        occurrences: 1,
                        firstSeenAt: session.simulatedAt,
                        lastSeenAt: session.simulatedAt,
                        affectedSessionIds: [session.id],
                        affectedObjectives: [session.objective.objective],
                    });
                    continue;
                }

                existing.occurrences += 1;
                existing.lastSeenAt = session.simulatedAt;
                if (!existing.affectedSessionIds.includes(session.id)) {
                    existing.affectedSessionIds.push(session.id);
                }
                if (!existing.affectedObjectives.includes(session.objective.objective)) {
                    existing.affectedObjectives.push(session.objective.objective);
                }
            }
        }

        return Array.from(patternMap.values())
            .sort((left, right) => right.occurrences - left.occurrences);
    }
}