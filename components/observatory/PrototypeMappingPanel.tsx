"use client";

import { useEffect, useState } from "react";
import { ObservatoryPanel } from "./ObservatoryPanel";
import { JepaPrototypeMapping } from "@/lib/types/se-jepa";

export function PrototypeMappingPanel() {
    const [mapping, setMapping] = useState<JepaPrototypeMapping | null>(null);

    useEffect(() => {
        fetch("/api/prototype/se-jepa")
            .then(res => res.json())
            .then(data => setMapping(data))
            .catch(err => console.error("Failed to fetch prototype mapping", err));
    }, []);

    if (!mapping) return null;

    const { currentChain } = mapping;
    const { observation, action, predictedFuture, calibration } = currentChain;

    return (
        <ObservatoryPanel
            title="SE-JEPA Prototype Mapping"
        >
            <div className="flex flex-col space-y-4 text-xs">

                {/* 1. Observation */}
                <div className="border border-border-subtle rounded p-3 bg-surface-elevated">
                    <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">State 0 : Observation</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-text-muted">Structural:</span>
                            <span className="ml-2 text-text-primary">{observation.structuralProfile.totalFiles} files</span>
                        </div>
                        <div>
                            <span className="text-text-muted">Observability:</span>
                            <span className="ml-2 text-text-primary">{observation.uncertaintyProfile.globalObservability}</span>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-text-muted">↓</div>

                {/* 2. Action */}
                <div className="border border-border-subtle rounded p-3 bg-surface-elevated">
                    <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Action Representation</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-text-muted">Strategy:</span>
                            <span className="ml-2 text-accent">{action.strategy}</span>
                        </div>
                        <div>
                            <span className="text-text-muted">Validation Burden:</span>
                            <span className="ml-2 text-text-primary">{action.verificationBurden}</span>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-text-muted">↓</div>

                {/* 3. Future */}
                <div className="border border-accent/30 rounded p-3 bg-accent-soft">
                    <div className="text-[10px] text-accent uppercase tracking-widest mb-1">State t+1 : Predicted Future</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-text-muted">Stability:</span>
                            <span className="ml-2 text-text-primary">{predictedFuture.structuralDescriptor.stabilityProfile}</span>
                        </div>
                        <div>
                            <span className="text-text-muted">Confidence:</span>
                            <span className="ml-2 text-text-primary">{(predictedFuture.confidenceScore * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                {/* 4. Calibration (Optional) */}
                {calibration && (
                    <>
                        <div className="flex justify-center text-text-muted">↓</div>
                        <div className="border border-success/30 rounded p-3 bg-success-soft">
                            <div className="text-[10px] text-success uppercase tracking-widest mb-1">Calibration Alignment</div>
                            <div className="flex justify-between">
                                <div>
                                    <span className="text-text-muted">Fidelity:</span>
                                    <span className="ml-2 text-text-primary">{(calibration.fidelityScore * 100).toFixed(0)}%</span>
                                </div>
                                <div className="text-success font-mono">
                                    {calibration.calibrationResult.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </ObservatoryPanel>
    );
}



