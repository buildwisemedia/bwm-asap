# Rodent design-gate receipt — restored-font exact review

Command: `bwm-design-gate run content/design/rodent-design-run.json`

Date: 2026-08-17

Exit: `0`

Result:

```json
{"artifact_state": "review", "below_floor": [], "below_premium_craft_floor": [], "composite_score": 93.2, "kind": "design-run", "module": "website_landing", "ok": true, "outcome": "premium-candidate", "promotion_eligible": true, "schema_version": "bwm-design-run/1.1.0"}
```

Interpretation: the contract is mechanically valid, all common and premium-craft dimensions meet their required floors, the weighted score is `93.2`, and the restored-font exact artifact passed independent fresh-context Fable review through a verified subscription route with `spilled:false`. The machine outcome is `premium-candidate` and `promotion_eligible:true` for the local/review artifact. It is not human premium acceptance, Robert/James/client approval, preview-delivery authorization, deployment permission, production cutover, or live QA.
