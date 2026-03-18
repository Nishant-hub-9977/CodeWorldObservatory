# Research Timeline Model

> Phase 11 model for deterministic comparative timeline playback.

---

## Objective

Phase 11 adds a comparative timeline layer that turns accumulated simulation history into a readable research logbook.

The goal is not to invent narrative. The goal is to replay recorded structural evidence in chronological order so an operator can inspect how strategy preference, governance blockers, and calibration posture evolve over time.

---

## Timeline Inputs

The timeline builder synthesizes from persisted observatory records:

- simulation sessions in `artifacts/simulations/session-*.json`
- benchmark runs in `artifacts/simulations/benchmark-*.json`
- prediction-reality comparisons in `data/executions.json`
- current latent posture and compatibility state derived from the live repository

The timeline does not fabricate missing history. If historical world-state diffs were not persisted for a session, the model records only the baseline world-state reference that was actually captured at the time.

---

## Core Structures

Phase 11 introduces:

- `TimelineSessionRecord` - one chronological research session with objective, preferred strategy, blocker set, evidence state, and world-state reference
- `TimelineStrategyShift` - a deterministic transition when the preferred strategy changes between adjacent sessions
- `TimelineBlockerPattern` - recurring governance blockers with first-seen and last-seen timestamps
- `TimelineCalibrationTrajectory` - cumulative calibration movement across recorded prediction-reality comparisons
- `TimelineNarrativeEvent` - a readable playback event derived from real timeline state

These structures are intentionally restrained. They summarize sequence and recurrence without implying causal certainty beyond the stored evidence.

---

## Deterministic Rules

### Session Ordering

Sessions are ordered by `simulatedAt` ascending.

### Preferred Strategy

Preferred strategy is resolved in this order:

1. benchmark winner strategy class, if available
2. most common favorable branch strategy in the session
3. `mixed` on a tie
4. `unknown` when no stable winner is available

### Strategy Shift Detection

A shift is recorded only when two adjacent sessions have different known preferred strategies.

### Blocker Recurrence

Blockers are aggregated across unique session appearances, not per repeated branch mention inside the same session.

### Calibration Trajectory

Calibration points are derived from cumulative prediction-reality comparisons in chronological order. Trend labels are inherited from the existing calibration tracker, preserving the same honesty thresholds.

---

## Narrative Playback

Narrative playback is derived from four event classes:

- session recorded
- strategy shift detected
- recurring governance blocker observed
- calibration trajectory updated

These events are replay surfaces, not literary summaries. Every narrative statement must be reducible to stored records or deterministic aggregation rules.

---

## Known Limits

- Historical world-state references are available, but full historical world-state diffs are not yet persisted.
- Calibration trajectory is only as dense as the execution comparison ledger.
- Strategy shift detection reflects benchmark preference movement, not causal proof of architectural superiority.

Phase 11 therefore behaves as a research logbook, not a causal simulator.