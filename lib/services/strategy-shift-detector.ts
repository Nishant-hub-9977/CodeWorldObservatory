import type { TimelineSessionRecord, TimelineStrategyShift } from "../types/research-timeline";

export class StrategyShiftDetector {
    public static detect(sessionRecords: TimelineSessionRecord[]): TimelineStrategyShift[] {
        const ordered = [...sessionRecords].sort((left, right) => {
            return new Date(left.simulatedAt).getTime() - new Date(right.simulatedAt).getTime();
        });

        const shifts: TimelineStrategyShift[] = [];

        for (let index = 1; index < ordered.length; index++) {
            const previous = ordered[index - 1];
            const current = ordered[index];

            if (
                previous.preferredStrategy === "unknown"
                || current.preferredStrategy === "unknown"
                || previous.preferredStrategy === current.preferredStrategy
            ) {
                continue;
            }

            shifts.push({
                id: `shift-${current.sessionId}`,
                sessionId: current.sessionId,
                detectedAt: current.simulatedAt,
                fromStrategy: previous.preferredStrategy,
                toStrategy: current.preferredStrategy,
                rationale: `Preferred strategy shifted from ${previous.preferredStrategy} to ${current.preferredStrategy}. Evidence state at the shift was ${current.benchmarkEvidence}.`,
            });
        }

        return shifts;
    }
}