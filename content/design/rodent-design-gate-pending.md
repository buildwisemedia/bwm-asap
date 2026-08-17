# Rodent design-gate receipt

Command: `bwm-design-gate run content/design/rodent-design-run.pending.json`

Date: 2026-08-17

Exit: `2`

Result:

```json
{"error": "scorer receipt is missing or hash-mismatched", "kind": "policy", "ok": false}
```

Interpretation: the protected Fable source-identity review is now present and passes for all five evidence units. The receipt intentionally remains non-promotable because the post-fix binding score and open-ended defect verdict do not yet exist for page SHA-256 `25c823dd9adedb1188d44894cd029f6cfb3a77555cfcadc0e8933a96283b4c67`. This is not a failed artifact verdict, human rejection, or production result.
