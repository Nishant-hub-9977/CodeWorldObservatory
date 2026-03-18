# Research Brief Quality Metrics

> *Phase 10 evaluation dimensions for synthesized Observatory briefings.*

---

## Overview

The research brief is the Observatory's primary output artifact for communicating accumulated structural intelligence. Evaluating brief quality requires dimensions beyond correctness — it must assess honesty, completeness, and auditability.

---

## Evaluation Dimensions

### 1. Source Coverage Completeness

**Definition**: The fraction of available data sources consulted during brief generation.

**Measurement**: Count of data sources actually queried vs. total available sources (world state, benchmarks, memory, dossier, latent state, compatibility, transition patterns).

**Target**: 100% — the brief must synthesize from all sources. A brief that ignores any available source is structurally incomplete.

**Current Implementation**: The `ResearchBriefGenerator` explicitly invokes all seven source services.

---

### 2. Evidence Lineage Integrity

**Definition**: Every claim in the brief must trace back to at least one concrete evidence reference.

**Measurement**: For each `BriefSection`, verify that `evidenceRefs.length > 0`. For each `ExecutiveFinding`, verify that `supportingEvidence.length > 0`.

**Target**: Zero orphan claims — no section or finding without at least one evidence reference.

**Validation Approach**: Programmatic audit of the brief structure.

---

### 3. Constraint Register Accuracy

**Definition**: The constraint register must truthfully bound what the system can and cannot claim.

**Measurement**: Manual review by the principal architect. Each constraint is rated:
- **Accurate**: Constraint correctly bounds a real system limitation
- **Overclaiming**: System claims capability it doesn't have
- **Underclaiming**: Constraint is too conservative, masking real capability

**Target**: All constraints rated "Accurate". Zero overclaims.

---

### 4. Finding Severity Calibration

**Definition**: The severity classification of findings should align with actual structural risk.

**Measurement**: Compare finding severity to the underlying structural data:
- **Critical** findings should correspond to zero-session or fragile-posture conditions
- **Important** findings should correspond to pressured posture or strategy misalignment
- **Informational** findings should correspond to active-but-healthy system states

**Target**: ≥ 90% severity-to-condition alignment.

---

### 5. Summary Card Trend Accuracy

**Definition**: The trend indicators on summary cards should reflect actual directional movement.

**Measurement**: Compare the `trend` field to the underlying data:
- "up" should indicate increasing values or improving conditions
- "down" should indicate decreasing values or degrading conditions
- "stable" should indicate no significant change
- "unknown" should be used when insufficient data exists

**Target**: No misleading trend indicators. "Unknown" is preferred over a guess.

---

### 6. Export Manifest Hash Validity

**Definition**: Every SHA-256 hash in the export manifest must be reproducible from the actual file content.

**Measurement**: For each `ExportArtifactRecord`, re-read the file and recompute SHA-256. Compare to recorded hash.

**Target**: 100% hash match. Any divergence indicates artifact mutation or export corruption.

---

### 7. Recommended Step Relevance

**Definition**: Recommended next steps should be derived from current system state, not generic advice.

**Measurement**: Each step should reference a specific data condition that triggered it:
- "No simulation sessions" → recommends first simulation
- "Insufficient calibration evidence" → recommends recording comparisons
- Fragile/pressured posture → recommends structural remediation

**Target**: Zero generic recommendations. All steps should be conditional on observed data.

---

### 8. Longitudinal Drift Detection

**Definition**: Sequential briefings should show detectable evolution when system state changes.

**Measurement**: Compare two briefings generated before and after a significant system event (e.g., running a simulation session). The later briefing should reflect the new data.

**Target**: All sections that depend on changed data should produce different content.

---

## Anti-Patterns

| Anti-Pattern | Description | Detection |
|---|---|---|
| Stale synthesis | Brief references outdated data | Check `generatedAt` against source timestamps |
| Evidence theatre | Evidence refs present but meaningless | Verify refs point to real, retrievable sources |
| Severity inflation | Critical findings for non-critical conditions | Cross-reference severity with structural data |
| Constraint erosion | Constraint register loses entries over time | Diff sequential manifests |
| Hash divergence | Artifact hashes don't match actual content | Re-hash and compare |

---

## Relationship to SE-JEPA

The brief quality evaluation maps to the JEPA energy function: it measures the **compatibility** between the system's internal representations and its external communication. A high-quality brief has low "energy" — its claims are tightly aligned with its evidence. A poor brief has high energy — claims diverge from what the system actually knows.
