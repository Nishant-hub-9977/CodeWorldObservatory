# Latent State Dimensions — Evaluation Metrics

> *Phase 9 metrics for assessing descriptor stability and interpretability*

---

## Purpose

These metrics evaluate whether the five latent-state descriptors in Phase 9 produce stable, interpretable results across sessions and repo states.

---

## 1. Descriptor Stability

**Definition**: Given the same repo snapshot, does `LatentStateEncoder.encode()` produce the same descriptor each time?

**Measurement**:
- Run 3 consecutive encodings on the same snapshot
- Compare all 5 descriptor posture/level values
- Compare all numeric metrics within each descriptor

**Pass Criteria**:
- 100% determinism — identical inputs must produce identical outputs
- Any non-determinism indicates a bug (no randomness is intentional)

**Assessment Method**: Automated — call `/api/latent-state` 3x in succession, diff results.

---

## 2. Descriptor Sensitivity

**Definition**: When repo state changes meaningfully (e.g., adding 5+ new files, introducing a circular dependency), do the descriptors reflect the change?

**Measurement**:
- Baseline encoding before change
- Post-change encoding
- Compare which descriptors shifted and by how much

**Pass Criteria**:
- At least one descriptor should change when a structurally significant change occurs
- Descriptors unrelated to the change should remain stable

**Assessment Method**: Manual — requires controlled repo modifications.

---

## 3. Composite Posture Coherence

**Definition**: Does `compositePosture` accurately summarize the 5 individual descriptors?

**Measurement**:
- Extract posture scores for all 5 descriptors
- Verify composite classification matches the averaging algorithm
- Check boundary conditions (e.g., one descriptor at "extreme" doesn't get diluted)

**Pass Criteria**:
- Composite posture must be derivable from individual descriptor scores
- No descriptor should be silently ignored

**Assessment Method**: Automated — verify `computeCompositePosture()` logic against expected outputs for known inputs.

---

## 4. Rationale Completeness

**Definition**: Does every descriptor include a non-empty, meaningful `rationale` string?

**Measurement**:
- Inspect all 5 rationale fields in any `LatentRepoState`
- Check for placeholder text, empty strings, or generic messages

**Pass Criteria**:
- Every rationale must reference specific metrics that drove the classification
- No rationale should be a generic fallback

**Assessment Method**: Manual review of rationale text for specificity.

---

## 5. Cross-Phase Consistency

**Definition**: Do latent state descriptors align with the raw observations they are derived from?

**Measurement**:
- Compare `StructuralComplexityDescriptor` metrics with `RepoSnapshot` file counts
- Compare `DependencyPressureDescriptor` metrics with `DependencyReport` edge data
- Compare `GovernanceFrictionDescriptor` with actual session blocker history

**Pass Criteria**:
- No contradictions (e.g., complexity "low" when snapshot shows 500+ files)
- Descriptor thresholds should match documented derivation logic

**Assessment Method**: Manual — cross-reference API responses from Phase 6 and Phase 9 routes.

---

## Interpretation Limits

1. **Descriptors are structural, not semantic**: "High complexity" means many files and edges, not necessarily "hard to understand"
2. **Composites lose detail**: A "cautious" composite could arise from very different descriptor combinations
3. **Thresholds are heuristic**: The boundary between "moderate" and "high" is set by the encoder, not by empirical calibration
4. **No temporal smoothing**: Each encoding is independent — no EMA or windowed averaging is applied
5. **Historical data dependency**: GovernanceFriction and EvidenceSufficiency require prior sessions/benchmarks to be meaningful; on a fresh install they will default to baseline values
