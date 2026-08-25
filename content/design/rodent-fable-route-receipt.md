# Rodent restored-font protected-review route receipt

State: protected review unavailable. Date: 2026-08-17.

## Exact candidate

- Branch: `codex/asap-close-local-review-20260813`
- Licensed-font implementation commit: `8dc79a0829c92588e406f51fa4bfecad6d8d6764`
- Provider/rendered-evidence commit and attempted HEAD: `d926010917ee70c304ac54c32fb391cfa18eb712`
- Rodent page SHA-256: `7b1b67910b637f7360075f8517e76d8190f709d2a1332ce4854aa0c8a07318ff`
- Exact-artifact hashes before route: `8/8` PASS
- Review-packet hashes before route: `23/23` PASS

## Protected route result

`bwm-fable-review --print --effort high --permission-mode dontAsk --allowedTools Read Bash` returned:

```text
[fable-review] subscription-only · peer-1/peer-2/peer-3/peer-4 · no Robert spill
bwm-claude-lane: all lanes capped/broken/unverified/leased (peer-1 29% · peer-2 35% (stale) · peer-3 33%/F5 61% (resets 2d5h) · peer-4 16%/F5 30% · unverified: peer1, peer2, peer3, peer4) — exit 75
```

Exit: `75`. Spilled: `false`.

The protected reviewer did not inspect or score the restored-font artifact. The earlier Fable PASS and dimension scores remain evidence for the earlier page hash only. They are not a verdict, score, design-gate input, or promotion receipt for the current hash. No self-score substituted for the unavailable lane.
