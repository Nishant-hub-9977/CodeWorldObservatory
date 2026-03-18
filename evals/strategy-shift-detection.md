# Strategy Shift Detection

> Phase 11 evaluation criteria for preferred-strategy shift detection.

---

## Purpose

Assess whether preferred-strategy transitions are derived consistently from benchmark and session evidence.

---

## Evaluation Dimensions

1. Winner fidelity
When a benchmark winner exists, the detected preferred strategy should match the winning branch's strategy class.

2. Fallback honesty
When no benchmark winner exists, fallback inference should only use recorded favorable branch outcomes.

3. Tie handling
Sessions with no dominant preferred strategy should be labeled `mixed`, not forced into a false winner.

4. Unknown-state handling
Sessions without enough evidence should remain `unknown`.

5. Shift precision
Shifts should only be emitted when adjacent sessions differ on known preferred strategies.

6. Narrative usefulness
Shift explanations should be concise, evidence-linked, and operationally readable.