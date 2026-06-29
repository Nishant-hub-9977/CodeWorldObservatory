"""Resource Consequence Ledger — placeholder experiment (local-only).

Lightweight, standard-library-only. Quantum packages are optional and never
required: if Cirq/qsim/Qualtran/etc. are installed they may be detected, but
their absence does not change behavior. Produces a small Resource Consequence
Ledger style result and writes it to results/sample_result.json.

No quantum advantage is claimed. No production quantum workload runs here.
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path

RESULTS_DIR = Path(__file__).resolve().parent.parent / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def detect_optional_quantum_tools() -> list[str]:
    """Optional, safely guarded detection — never a hard dependency."""
    available: list[str] = []
    for module in ("cirq", "qsimcirq", "qualtran", "openfermion", "tensorflow_quantum"):
        try:
            __import__(module)
            available.append(module)
        except Exception:
            pass
    return available


def build_ledger() -> dict:
    run_id = f"qx-run-{int(time.time())}"
    return {
        "run_id": run_id,
        "experiment_name": "Resource Consequence Ledger — interpretation placeholder",
        "source": "quantum-lab/experiments/resource_consequence_placeholder.py",
        "assumptions": [
            "Resource accounting discipline (Qualtran-inspired) maps onto software interventions.",
            "No quantum hardware or simulator is required for this placeholder.",
        ],
        "predicted_resources": {
            "files_affected": 6,
            "dependency_zones_touched": 2,
            "test_surfaces_predicted_to_fail": 1,
        },
        "observed_result": {
            "files_affected": 6,
            "dependency_zones_touched": 2,
            "test_surfaces_failed": 0,
            "optional_quantum_tools_detected": detect_optional_quantum_tools(),
        },
        "uncertainty": "high — placeholder data, not a scientific measurement",
        "limitations": [
            "No real quantum simulation performed.",
            "No quantum advantage claimed.",
            "Not affiliated with Google.",
        ],
        "human_approval_state": "pending",
        "simulation_status": "simulated-before-write",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def main() -> None:
    ledger = build_ledger()
    out_path = RESULTS_DIR / "sample_result.json"
    out_path.write_text(json.dumps(ledger, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote Resource Consequence Ledger placeholder -> {out_path}")


if __name__ == "__main__":
    main()
