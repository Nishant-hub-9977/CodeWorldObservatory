# Export Lineage Integrity Metrics

> *Phase 10 evaluation dimensions for the export manifest and evidence lineage chain.*

---

## Overview

The export manifest is the Observatory's auditable proof of what was exported, when, and from what evidence. Lineage integrity ensures that every claim can be traced from the briefing surface back to its source data.

---

## Evaluation Dimensions

### 1. Artifact Hash Reproducibility

**Definition**: Every SHA-256 hash recorded in the manifest must be independently reproducible.

**Measurement**:
```
For each artifact in manifest.artifacts:
    content = read_file(artifact.filePath)
    computed_hash = sha256(content)
    assert computed_hash === artifact.sha256
```

**Target**: 100% match rate. Any divergence indicates post-export artifact mutation.

---

### 2. Evidence Reference Tracability

**Definition**: Every evidence reference in the brief must point to a real, identifiable data source.

**Measurement**: For each `BriefEvidenceReference`:
- `sourceType` must be one of the 7 valid types
- `sourceId` must be non-empty and follow the project's ID conventions
- `derivedAt` must be a valid ISO 8601 timestamp

**Target**: Zero dangling references.

---

### 3. Lineage Deduplication

**Definition**: The evidence lineage in the manifest should contain no duplicate entries.

**Measurement**: Count unique `(sourceType, sourceId)` pairs vs. total entries.

**Target**: Unique pairs = total entries (no duplicates).

---

### 4. Artifact Coverage

**Definition**: The manifest should include all relevant persisted artifacts, not just a subset.

**Measurement**: Compare manifest artifact count to actual files in scanned directories:
- `artifacts/research/briefings/*.json`
- `artifacts/research/dossier-*.json`
- `artifacts/simulations/session-*.json`
- `artifacts/simulations/benchmark-*.json`

**Target**: manifest.totalArtifacts ≥ actual file count in scanned directories.

---

### 5. Manifest Self-Consistency

**Definition**: The manifest's summary fields must match its detail records.

**Measurement**:
- `totalArtifacts` must equal `artifacts.length`
- `totalSizeBytes` must equal `sum(artifacts[*].sizeBytes)`
- `briefId` must match the ID of the associated brief

**Target**: All three checks pass.

---

### 6. Temporal Ordering

**Definition**: The manifest's `exportedAt` timestamp must be after all artifact `generatedAt` timestamps.

**Measurement**: For each artifact, verify `artifact.generatedAt <= manifest.exportedAt`.

**Target**: No temporal inversions.

---

### 7. Cross-Export Consistency

**Definition**: When multiple exports are performed, each manifest should be independently complete.

**Measurement**: Load two sequential manifests. Verify:
- Each manifest is self-consistent (dimension 5)
- Artifact hashes for the same file should match if the file hasn't changed
- Later manifests should include artifacts from the earlier export

**Target**: No phantom artifacts (present in manifest but missing on disk).

---

## Integrity Red Flags

| Flag | Condition | Severity |
|---|---|---|
| Hash mismatch | `computed_hash !== recorded_hash` | Critical — artifact may have been tampered with |
| Dangling reference | Evidence ref points to nonexistent source | High — breach of lineage contract |
| Phantom artifact | Manifest lists file that doesn't exist on disk | High — export corruption |
| Missing artifact | File exists on disk but isn't in manifest | Medium — incomplete scan |
| Duplicate lineage | Same `(sourceType, sourceId)` appears twice | Low — data quality issue |
| Temporal inversion | Artifact `generatedAt` > manifest `exportedAt` | Low — clock skew or ordering bug |

---

## Relationship to Observatory Principles

The export manifest directly implements the **Auditable Artifacts** principle (Article V, Constitution): "Every plan, simulation, and outcome is recorded as an immutable, hashed artifact. The system can always trace the chain from intention to consequence."

The evidence lineage extends this to briefings: every synthesized claim traces back to the data that produced it.
