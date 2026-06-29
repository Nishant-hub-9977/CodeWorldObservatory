# Quantum Lab (local-only)

Lightweight, offline scaffold for quantum-inspired **resource accounting** experiments.
Runs **only on a local machine**, never inside the Vercel web runtime. The web app displays
exported JSON evidence; it never executes this code.

> This annex is a research and interpretation layer. It does not claim quantum advantage,
> does not run production quantum workloads, does not imply affiliation with Google, and
> does not modify CodeWorld's core simulation-first repository governance thesis.

## Run the placeholder

```bash
python quantum-lab/experiments/resource_consequence_placeholder.py
```

This produces a small Resource Consequence Ledger style result. The committed sample lives at
`quantum-lab/results/sample_result.json`.

## Dependencies

The placeholder uses the Python standard library only. Heavy quantum packages
(Cirq, qsim, Qualtran, OpenFermion, TensorFlow Quantum) are **optional** and **never required**.
See `requirements.txt`; everything is commented out by default.

## Boundaries

- No quantum advantage is claimed.
- No production quantum workloads run here.
- External tools are references, not bundled application code.
- Results are exported as JSON evidence for optional, safe display in the app.
