# Rodent design-gate receipt — post-fix independent review

Command: `bwm-design-gate run content/design/rodent-design-run.json`

Date: 2026-08-17

Exit: `0`

Result:

```json
{"artifact_state": "review", "below_floor": [], "below_premium_craft_floor": ["typography_hierarchy"], "composite_score": 92.4, "kind": "design-run", "module": "website_landing", "ok": true, "outcome": "revise", "promotion_eligible": false, "schema_version": "bwm-design-run/1.1.0"}
```

Interpretation: the contract is mechanically valid, all common dimensions meet their ordinary floors, the weighted score is 92.4, and independent Fable review passed. Promotion remains correctly false because typography scored 88, below the noncompensatory premium-craft floor of 90: the licensed URW DIN kit is absent and the local artifact renders the fallback. Outcome `revise` is a truthful local-review quality state, not a failed artifact verdict, human rejection, deployment receipt, or production result.
