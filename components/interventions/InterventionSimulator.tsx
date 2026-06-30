"use client";

// ─── InterventionSimulator ─────────────────────────────────────────
// Client orchestrator for the Repository Intervention Simulator. Holds
// the selected-scenario state and composes the scenario proposal card
// with the prediction-versus-reality ledger.
//
// The only interactivity is local selection state. No data is fetched,
// nothing is written, and no eff(side) action is performed.

import { useState } from "react";
import { INTERVENTION_SCENARIOS } from "@/lib/interventions/intervention-scenarios";
import { getSnapshotEvidenceForScenario } from "@/lib/interventions/snapshot-bridge";
import { deriveSnapshotRisk } from "@/lib/interventions/snapshot-risk";
import { InterventionScenarioCard } from "./InterventionScenarioCard";
import { PredictionRealityLedger } from "./PredictionRealityLedger";
import { SnapshotEvidencePanel } from "./SnapshotEvidencePanel";

export function InterventionSimulator() {
    const [selectedId, setSelectedId] = useState<string>(INTERVENTION_SCENARIOS[0].id);
    const selected =
        INTERVENTION_SCENARIOS.find((scenario) => scenario.id === selectedId) ??
        INTERVENTION_SCENARIOS[0];
    const snapshotEvidence = getSnapshotEvidenceForScenario(selected.id);
    const snapshotRisk = deriveSnapshotRisk(snapshotEvidence);

    return (
        <div className="flex flex-col gap-6">
            {/* Scenario selector */}
            <div
                role="tablist"
                aria-label="Intervention scenarios"
                className="flex flex-wrap gap-2"
            >
                {INTERVENTION_SCENARIOS.map((scenario) => {
                    const isActive = scenario.id === selected.id;
                    return (
                        <button
                            key={scenario.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setSelectedId(scenario.id)}
                            className={`rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors duration-150 ${
                                isActive
                                    ? "border-accent/50 bg-accent-soft text-text-primary"
                                    : "border-border-subtle bg-surface-elevated text-text-muted hover:text-text-secondary hover:border-border-muted"
                            }`}
                        >
                            {scenario.title}
                        </button>
                    );
                })}
            </div>

            {/* Selected scenario detail */}
            <InterventionScenarioCard scenario={selected} snapshotRisk={snapshotRisk} />

            {/* Static snapshot evidence bridge */}
            <SnapshotEvidencePanel evidence={snapshotEvidence} risk={snapshotRisk} />

            {/* Prediction-versus-Reality ledger */}
            <PredictionRealityLedger scenario={selected} />
        </div>
    );
}
