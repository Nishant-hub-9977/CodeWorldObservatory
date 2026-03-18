# Research Export Model

> *Phase 10: How the Observatory synthesizes and exports its accumulated structural intelligence.*

---

## Purpose

The Research Export layer transforms the Observatory's multi-source structural intelligence into a single, auditable briefing surface. It is the final stage of the observe → encode → predict → evaluate → report pipeline.

---

## Architecture

```
All Data Sources
    │
    ├── World State (Phase 1)
    ├── Benchmarks & Simulations (Phase 7)
    ├── Experiment Memory (Phase 8)
    ├── Research Dossiers (Phase 8)
    ├── Latent State (Phase 9)
    ├── Strategy Compatibility (Phase 9)
    └── Transition Patterns (Phase 9)
    │
    ▼
Research Brief Generator
    │
    ▼
ObservatoryBrief
    ├── Executive Summary
    ├── Summary Cards (posture, sessions, evidence, calibration)
    ├── Sections (system state, coverage, strategies, patterns, calibration)
    ├── Executive Findings (severity-classified)
    ├── Constraint Register (system boundaries)
    ├── Recommended Next Steps (priority-ordered)
    └── Known Limitations
    │
    ▼
Briefing Snapshot Writer  ──►  artifacts/research/briefings/*.json
    │
    ▼
Export Manifest Builder
    ├── Scans all artifact directories
    ├── Computes SHA-256 hashes
    ├── Extracts evidence lineage from brief
    └── Persists manifest to artifacts/research/manifests/
    │
    ▼
ExportManifest
    ├── Artifact inventory with hashes
    ├── Evidence lineage (deduplicated)
    ├── Integrity note
    └── Total size and count
```

---

## Data Sources

The brief generator consumes data from every preceding phase:

| Source | Phase | Data Used |
|---|---|---|
| `captureWorldState()` | 1 | File count, directory count, structure |
| `analyzeDependencies()` | 1 | Connectivity metrics |
| `ExperimentMemoryStore.compileMemory()` | 8 | Session count, evidence coverage, strategy trends, calibration, governance |
| `DossierGenerator.getLatestDossier()` | 8 | Session coverage metadata |
| `LatentStateEncoder.encode()` | 9 | Complexity, pressure, burden, friction, sufficiency, composite posture |
| `StrategyCompatibilityAnalyzer.assessAll()` | 9 | Per-strategy compatibility classification |
| `TransitionPatternAnalyzer.analyzePatterns()` | 9 | Recurring transition motifs |

---

## Brief Structure

### Executive Summary

A single-paragraph synthesis covering: active phase, composite posture, session count, favorable strategy count, and dossier coverage.

### Summary Cards

Five key metrics displayed as trend-aware cards:
1. **Composite Posture** — derived from latent state
2. **Simulation Sessions** — from experiment memory
3. **Total Files** — from world state
4. **Evidence Strength** — benchmark coverage
5. **Calibration Alignment** — prediction-reality trend

### Sections

Five data-driven sections, each with confidence labels and evidence references:
- System State Overview
- Experiment Coverage
- Strategy Landscape
- Transition Pattern Memory
- Calibration State

### Findings

Severity-classified observations derived from data:
- **Critical**: No simulation sessions, fragile posture
- **Important**: Pressured posture, misaligned strategies
- **Informational**: Active calibration, governance patterns

### Constraint Register

Four permanent constraints bounding system claims:
1. No learned probabilistic model active
2. Calibration requires executed interventions
3. Static analysis misses runtime coupling
4. Strategy compatibility is threshold-gated, not empirically validated

### Recommended Next Steps

Priority-ordered actions derived from current system state.

### Known Limitations

Five explicit limitation statements.

---

## Export Manifest

The manifest provides a deterministic, auditable record of everything exported:

- **Artifact scanning**: Iterates `artifacts/research/briefings/`, `artifacts/research/`, `artifacts/simulations/`
- **Hashing**: SHA-256 content digest for every `.json` artifact
- **Lineage**: Deduplicated evidence references from the brief's sections and findings
- **Persistence**: Manifests saved to `artifacts/research/manifests/`
- **Integrity note**: Human-readable summary of artifact count and total size

---

## Honesty Constraints

1. All briefing content is deterministically derived from observable structural signals
2. Confidence labels reflect signal coverage, not probabilistic certainty
3. No learned or trained model participates in briefing synthesis
4. The constraint register documents all known system boundaries
5. Evidence lineage provides full traceability from finding to source data
