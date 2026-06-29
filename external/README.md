# External Quantum References

This directory is for **local study only** of external open-source quantum tools.

CodeWorld Observatory does **not** bundle, vendor, redistribute, import, or commit these
repositories. They are independent third-party projects. No affiliation, partnership, or
endorsement by Google is claimed or implied.

> This annex is a research and interpretation layer. It does not claim quantum advantage,
> does not run production quantum workloads, does not imply affiliation with Google, and
> does not modify CodeWorld's core simulation-first repository governance thesis.

## Rules

- External repos may be cloned **only** into `external/google-quantum/`.
- They must **never** be placed in `src`, `app`, `pages`, `components`, `lib`, `research`,
  `docs`, `public`, or any Vercel-served application directory.
- They must **never** be imported into the web app.
- They must **never** be committed. `external/google-quantum/` is in `.gitignore`.
- Heavy Python quantum simulation runs **locally only**, never in the Vercel runtime.

## Recommended clone block (documentation — do not run unless needed)

Prefer documenting these commands over cloning. Clone only if local inspection is genuinely
useful. After cloning, confirm `git status` shows none of these repos as tracked or staged.

```bash
mkdir -p external/google-quantum
cd external/google-quantum
git clone --depth 1 https://github.com/quantumlib/Cirq.git
git clone --depth 1 https://github.com/quantumlib/qsim.git
git clone --depth 1 https://github.com/quantumlib/qualtran.git
git clone --depth 1 https://github.com/quantumlib/OpenFermion.git
git clone --depth 1 https://github.com/tensorflow/quantum.git
```

When inspecting clones, read only README files, package metadata, or small documentation
entry points. Do not load entire repositories.

## Reference map

| Tool | Role | CodeWorld interpretation | Status | Repo |
| --- | --- | --- | --- | --- |
| Cirq | Circuit construction & simulation | Intervention composition model | reference | https://github.com/quantumlib/Cirq |
| qsim | High-performance simulation | Scaling simulation-before-write | reference | https://github.com/quantumlib/qsim |
| Qualtran | Algorithm & resource estimation | Resource Consequence Ledger discipline | reference | https://github.com/quantumlib/qualtran |
| OpenFermion | Fermionic/scientific systems | Future scientific branch | future | https://github.com/quantumlib/OpenFermion |
| TensorFlow Quantum | Hybrid quantum-classical ML | Future hybrid branch (not in app) | future | https://github.com/tensorflow/quantum |
