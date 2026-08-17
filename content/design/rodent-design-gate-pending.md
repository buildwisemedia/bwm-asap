# Rodent design-gate receipt

Command: `bwm-design-gate run content/design/rodent-design-run.pending.json`

Date: 2026-08-17

Exit: `2`

Result:

```json
{"error": "copy evidence requires a passing independent source identity review", "kind": "policy", "ok": false}
```

Interpretation: all evidence resolved before the protected source-identity step was inspectable and hash-valid. The receipt intentionally remains non-promotable because the Fable source-identity review, binding score, and open-ended defect verdict do not exist. This is not a failed artifact verdict, human rejection, or production result.
