// ─── Canonical Governance Language ──────────────────────────────
// Single source of truth for all governance caveats, boundary
// statements, and advisory vocabulary. No service should define
// its own caveat string — import from here.

// ─── Master Governance Caveat ───────────────────────────────────
export const GOVERNANCE_CAVEAT_SYNTHESIS =
  "This governance synthesis integrates current prioritization, drift, historical patterns, snapshot comparisons, and recommendation governance into one unified descriptive assessment. " +
  "All classifications are advisory and non-causal. Persistent signals reflect structural recurrence, not validated truth. " +
  "No signal category implies execution authority, causal proof, certainty, or hidden write-side decision-making.";

export const GOVERNANCE_CAVEAT_PRIORITIZATION =
  "Research prioritization ranks structural evidence, replay, calibration, and comparison gaps. " +
  "It is advisory, not causal proof, certainty, or a hidden write-side decision system.";

export const GOVERNANCE_CAVEAT_DRIFT =
  "Priority drift is descriptive only. It records observable changes in priority posture between snapshots. " +
  "It does not imply causal proof, trend certainty, or hidden recommendation authority.";

export const GOVERNANCE_CAVEAT_HISTORY =
  "Priority history analysis is descriptive only. It summarizes how advisory posture changed across persisted snapshots. " +
  "It does not infer hidden causes, validate recommendations through repetition, or imply that persistent priorities are more correct than transient ones. " +
  "Chronicity reflects structural recurrence, not truth confirmation.";

export const GOVERNANCE_CAVEAT_COMPARISON =
  "Snapshot comparisons describe structural changes between persisted advisory snapshots. " +
  "They do not imply causal relationships, validate research direction, or confirm that persistent signals are more correct than transient ones.";

export const GOVERNANCE_CAVEAT_RECOMMENDATION =
  "All recommendations are advisory interpretations of structural evidence gaps. " +
  "They do not constitute execution authority, causal proof, or validated research direction. " +
  "Priority rankings remain bounded by snapshot evidence and should not be treated as decision mandates.";

// ─── Canonical Boundary Statements ──────────────────────────────
export const BOUNDARY_STATEMENTS = {
  advisoryOnly:
    "All governance outputs are advisory interpretations of structural evidence gaps. They do not constitute directives, execution authority, or decision mandates.",
  noExecutionAuthority:
    "No governance signal authorizes, requires, or implies any specific research action. Governance is observational.",
  noCausalProof:
    "Governance synthesis describes observable patterns across advisory snapshots. It does not infer hidden causes, prove causal relationships, or validate hypotheses.",
  noCertaintyInflation:
    "Repeated appearance of a priority signal indicates structural recurrence, not certainty or truth confirmation. Persistence does not equal correctness.",
  noTruthFromRepetition:
    "Chronicity and stability describe how often a signal appears, not whether its underlying assessment is accurate. Historical presence is structural observation, not validation.",
  driftBoundary:
    "Priority drift records observable changes between prioritization snapshots. Drift is descriptive, not evidence of trajectory certainty or directed research mandate.",
  historyBoundary:
    "Priority history analysis summarizes how advisory posture changed across persisted snapshots. It does not infer hidden causes or validate recommendations through repetition.",
  comparisonBoundary:
    "Snapshot comparisons describe structural advisory-posture changes between consecutive snapshots. They do not imply research progress, regression, or causal direction.",
  recommendationBoundary:
    "All recommendations are governed with explicit advisory boundaries, confidence limitations, and non-execution caveats. Priority rankings remain bounded by snapshot evidence.",
} as const;

// ─── Canonical Advisory Vocabulary ──────────────────────────────
// Use these labels consistently across all surfaces.

export const POSTURE_LABELS: Record<string, string> = {
  "persistent-stable": "Persistent · Stable",
  "persistent-escalating": "Persistent · Escalating",
  "persistent-de-escalating": "Persistent · De-escalating",
  "persistent-oscillating": "Persistent · Oscillating",
  "recent": "Recent",
  "weakening": "Weakening",
  "intermittent": "Intermittent",
  "single-observation": "Single Observation",
  "current-only": "Current Only",
};

export const EVIDENCE_SUFFICIENCY_LABELS: Record<string, string> = {
  "strong": "Strong",
  "adequate": "Adequate",
  "insufficient": "Insufficient",
  "thin": "Thin",
  "unavailable": "Unavailable",
};

export const ADVISORY_LEVEL_LABELS: Record<string, string> = {
  "critical": "Critical",
  "high": "High",
  "medium": "Medium",
  "low": "Low",
};

// ─── Route-Level Caveats ────────────────────────────────────────
// Short-form caveats for API route payloads.

export const ROUTE_CAVEAT_REPRODUCIBILITY =
  "Replay posture remains bounded by persisted artifacts and does not guarantee full historical reconstruction.";

export const ROUTE_CAVEAT_ADVISORY =
  "All outputs are advisory only. No response constitutes execution authority or causal proof.";
