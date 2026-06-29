// ─── Resource Consequence Ledger — exported evidence (typed) ───────
// Statically imports the locally produced JSON artifact and exposes it as a
// typed constant. No Python runs and no quantum library is invoked at build
// or request time — this is exported evidence only.

import sampleResultJson from "@/quantum-lab/results/sample_result.json";

export interface ResourceConsequenceEvidence {
    run_id: string;
    experiment_name: string;
    source: string;
    assumptions: string[];
    predicted_resources: {
        files_affected: number;
        dependency_zones_touched: number;
        test_surfaces_predicted_to_fail: number;
    };
    observed_result: {
        files_affected: number;
        dependency_zones_touched: number;
        test_surfaces_failed: number;
        optional_quantum_tools_detected: string[];
    };
    uncertainty: string;
    limitations: string[];
    human_approval_state: string;
    simulation_status?: string;
    timestamp: string;
}

export const sampleResult = sampleResultJson as ResourceConsequenceEvidence;
