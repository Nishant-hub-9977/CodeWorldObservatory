# AMI Strategic Context

> *Context document. Supporting reference only — not the center of this project's identity.*

---

## What AMI Labs Is

Advanced Machine Intelligence (AMI) Labs is an AI research organization founded in 2025–2026 by Turing Award-winning pioneers and former leaders of large-scale corporate AI research. Its founding thesis is a direct rejection of the autoregressive scaling doctrine: that true human-level reasoning cannot be achieved by scaling token prediction engines, and can only emerge from systems that build internal models of the world, maintain persistent memory, and reason causally about the consequences of their actions.

AMI Labs is headquartered in Paris, with research operations in New York, Montreal, and Singapore. In early 2026 it secured $1.03 billion in seed funding — the largest seed round in European history — at a pre-money valuation of ~$3.5B. Investors include Nvidia, Samsung, Temasek, Bezos Expeditions, Tim Berners-Lee, and Eric Schmidt.

---

## Why AMI Labs Is Strategically Relevant to This Project

CodeWorld Observatory is not an AMI Labs project. It is an independent research effort. But the AMI thesis is the canonical articulation of the same intellectual position that the Observatory is building toward. Two specific AMI strategic priorities create direct alignment:

### 1. FDA-Certifiable Agentic Systems

AMI Labs has an exclusive strategic partnership with Nabla, a clinical AI company, with the explicit goal of building the first FDA-certifiable agentic AI systems. This requires:

- **Deterministic reasoning**: outputs must be traceable and auditable
- **Simulation before action**: no agentic action may proceed without a validated prediction
- **Structured uncertainty**: the system must know when it does not know
- **Immutable audit trails**: every decision must be recorded with cryptographic provenance

The Observatory's architecture — simulation-before-write law, artifact ledger, hash-verified world state, confidence thresholds by risk level — is the software engineering analog of exactly these requirements. Observatory is not attempting to certify medical AI. It is demonstrating that the same principles apply to code.

### 2. Standardizing World-Model Evaluation

AMI Labs is committed to open science precisely because evaluation standards for world models do not yet exist. The current dominant metrics (SWE-bench, HumanEval, MBPP) measure token output, not causal reasoning. AMI Labs intends to shift the field.

The Observatory's calibration framework — prediction-reality deltas, uncertainty calibration scores, scope accuracy metrics — is a concrete implementation of this alternative evaluation paradigm, in a domain (software engineering) where ground truth is available, deterministic, and free.

---

## What AMI Labs Does Not Determine For This Project

This project does not derive its direction from AMI Labs' commercial roadmap. The following are AMI priorities that are deliberately **not** in scope for the Observatory:

- Healthcare or medical applications
- Physical robotics embodiment
- Multi-modal video models (V-JEPA, VL-JEPA)
- Consumer products
- Regulatory certification processes

The Observatory is narrowly focused: a software repository is the world. The world model learns that world. The agent operates in it. The benchmark measures whether the predictions were correct.

---

## The Thesis Alignment

The strongest statement of alignment between AMI Labs' thesis and this project is this passage from the source document:

> *"Software engineering serves as the perfect empirical sandbox for refining world models. Physical robotics research is frequently hampered by unpredictable sensor noise, friction, and chaotic external variables. In contrast, a software repository managed by Antigravity is an isolated, perfectly deterministic universe."*

This is the Observatory's founding premise. The software repository as deterministic causal world. The IDE as sensor array. The agent as world-model-constrained planner. The artifact ledger as certification evidence.

The Observatory is a proof of concept that the AMI thesis works — not in healthcare, not in robotics, but in the domain every software engineer lives in every day.

---

## Research Figures of Note

| Person | Role | Relevance |
|---|---|---|
| Yann LeCun | Meta FAIR Chief AI Scientist | Architect of JEPA framework; the theoretical foundation for SE-JEPA |
| Alexandre LeBrun | CEO, AMI Labs | Former Nabla CEO; leading AMI's practical deployment strategy |
| Tim Berners-Lee | AMI Labs investor | Author of the open-web thesis; philosophical ally to open-science AI |

The Observatory is not named for, funded by, or affiliated with any of these individuals or organizations. Their work provides the intellectual context within which this project operates.
