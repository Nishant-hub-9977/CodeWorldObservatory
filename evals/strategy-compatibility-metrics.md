# Strategy Compatibility Metrics — Evaluation Framework

> *Phase 9 metrics for assessing strategy-state alignment quality and transition pattern reliability*

---

## Purpose

These metrics evaluate whether the `StrategyCompatibilityAnalyzer` produces meaningful compatibility assessments and whether the `TransitionPatternAnalyzer` detects reliable recurring motifs.

---

## 1. Strategy-State Alignment Accuracy

**Definition**: Does the compatibility rating for a given strategy match the historical outcomes when that strategy was used under similar conditions?

**Measurement**:
- For each historical session, derive the latent state at session start
- Get the strategy that was selected and the outcome (blocker count, drift score)
- Compare with what `StrategyCompatibilityAnalyzer` would rate that strategy under those conditions
- Check if strategies rated "favorable" actually produced better outcomes than those rated "structurally-misaligned"

**Pass Criteria**:
- Strategies rated `favorable` should have demonstrably fewer governance blockers on average
- Strategies rated `structurally-misaligned` should correlate with higher blocker counts or drift scores
- At minimum: no case where a `structurally-misaligned` strategy outperforms a `favorable` one with ≥3 data points

**Assessment Method**: Manual — requires ≥5 historical sessions with varied strategies. Not assessable on fresh installs.

---

## 2. Compatibility Reasoning Quality

**Definition**: Does the `reasoning` field for each compatibility assessment explain the rating in terms of specific latent state dimensions?

**Measurement**:
- Inspect all 5 strategy assessments from a single API call
- Check that reasoning references specific descriptors (complexity, pressure, friction, etc.)
- Verify that key_factors list is non-empty and relevant

**Pass Criteria**:
- Every assessment must have non-empty `reasoning` that references at least one latent descriptor
- `keyFactors` must contain at least 1 identifiable descriptor category
- No generic fallback text like "generally suitable"

**Assessment Method**: Manual review of `/api/strategy-compatibility` response.

---

## 3. Suitability Score Discrimination

**Definition**: Do the 5 strategy suitability scores actually discriminate between strategies, or do they all converge to similar values?

**Measurement**:
- Call `/api/strategy-compatibility` and extract all 5 suitability scores
- Compute the spread: max(scores) - min(scores)
- Compute standard deviation

**Pass Criteria**:
- Score spread should be ≥ 0.15 (strategies should not all score within 0.15 of each other)
- At least 2 different compatibility classes should appear among the 5 strategies
- If all 5 are `favorable`, the latent state is likely benign — verify this is consistent

**Assessment Method**: Automated — call route, compute spread.

---

## 4. Transition Motif Reliability

**Definition**: Do the patterns detected by `TransitionPatternAnalyzer` represent genuine recurring relationships, not noise?

**Measurement**:
- Call `/api/transition-patterns` and inspect returned patterns
- For each pattern with `occurrences ≥ 3`, verify that the latent condition triple actually recurs
- Check that `dominantStrategy` matches the most-used strategy under those conditions
- Verify `dominantOutcome` is consistent with actual session outcomes

**Pass Criteria**:
- Patterns with `occurrences < 2` should not be reported (minimum threshold)
- `sessionIds` count must match `occurrences`
- `dominantStrategy` must be the actual mode (most frequent) among those sessions
- Confidence percentage must be mathematically correct: (strategy count / total) * 100

**Assessment Method**: Manual — cross-reference pattern data with actual session files in `artifacts/simulations/`.

---

## 5. Empty State Handling

**Definition**: Do the analyzers behave correctly when no historical data exists?

**Measurement**:
- Clear all session files from `artifacts/simulations/`
- Call `/api/strategy-compatibility` — should still return 5 assessments using baseline latent state
- Call `/api/transition-patterns` — should return empty patterns array with `totalSessionsAnalyzed: 0`

**Pass Criteria**:
- No crashes or 500 errors
- Compatibility assessments use default/baseline scoring
- Pattern analysis returns empty but valid response

**Assessment Method**: Automated — clear data, call routes, verify response structure.

---

## 6. Backward Consistency

**Definition**: Do Phase 9 additions break any Phase 1–8 behavior?

**Measurement**:
- Run all existing API routes after Phase 9 deployment
- Verify `ObservatoryPanel`, `WorldStatePanel`, `BenchmarkHarnessPanel` still function
- Check that `SimulationResult.strategyClass` (Phase 8 fix) is still propagated

**Pass Criteria**:
- All 14 existing routes return valid responses
- No TypeScript type errors across the codebase
- Build succeeds with 0 errors

**Assessment Method**: Automated — `npx tsc --noEmit` + `npx next build` + route smoke tests.

---

## Interpretation Limits

1. **Compatibility is structural, not predictive**: "Favorable" means the strategy fits the current structure, not that it will succeed
2. **Patterns require volume**: With fewer than 5 sessions, pattern detection is noise-prone
3. **No causal claims**: A pattern showing "under high complexity, service-first dominates" is correlational, not causal
4. **Score precision is false precision**: Suitability scores to 2 decimal places do not imply 1% accuracy — they are bounded heuristic outputs
5. **Strategy taxonomy is fixed**: The analyzer only knows the 5 defined `BranchStrategy` values; novel strategies are not discoverable
