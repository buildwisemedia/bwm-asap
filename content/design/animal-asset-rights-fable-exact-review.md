# ASAP Animal Sales Pages — Phase 3 protected exact audit review

## Protected route proof

```text
[fable-review] subscription-only · peer-1/peer-2/peer-3/peer-4 · no Robert spill
[lane] peer-4@buildwisemedia.com · 5h 50% · weekly 38%
[lane-route] {"lane":"peer4","email":"peer-4@buildwisemedia.com","spilled":false}
```

- Reviewed commit: `c4863272afa37bb028d0112d83ce51a907296cce`
- Exact manifest: `_verification/asap-animal-rights-phase3/exact-audit-manifest.json`
- Verdict: **PASS**
- Phase 3 state recommendation: **Waiting — evidence complete, external decisions required**
- Boundary: the PASS verifies the audit, not production clearance, composed-page approval, preview/send authorization, or Phase 4 advancement.

## Verbatim reviewer receipt

# ASAP Animal Sales Pages — Phase 3 Protected Exact Audit Review Receipt

- **Route mode:** Direct local Fable 5 fresh-context review session — no subagents, no cloud dispatch, review-only. No file was edited, sent, published, deployed, or mutated; the only writes were scratch fetches to `/tmp`.
- **Spilled:** No — the full review ran in one context with no compaction or handoff.
- **HEAD verification:** PASS — `c4863272afa37bb028d0112d83ce51a907296cce` on `codex/asap-close-local-review-20260813`, re-verified clean and unchanged after review.
- **Tracked state:** PASS — `git status --porcelain` clean before and after.
- **Manifest hashes:** PASS — 9/9 SHA-256 values in `_verification/asap-animal-rights-phase3/exact-audit-manifest.json` match disk.
- **Deterministic QA:** PASS — `node qa/asap-close-qa.mjs` returned 436/436, 0 failures.

## Verdict: PASS

The Phase 3 ledger is accurate, evidence-backed, and appropriately conservative. Every checkable claim I tested reproduced exactly; where evidence is missing (Adobe ownership), the ledger says so and holds the gate open rather than inferring.

## Per-area verdicts

| Area | Verdict | Basis |
|---|---|---|
| Visual assets | **PASS** | All 12 SHA-256 values match disk. All 7 existing assets are byte-identical to their claimed blobs at base commit `b86b3bf4` (independently recomputed via `git ls-tree` + `git hash-object`). The 5 logo hashes match the preflight `asset_manifest.json` one-to-one. Enumerating every image reference (`src`/`href`/`content`/CSS `url()`) across the five pages: nothing outside the 12 bound files; the CSS uses only data-URIs; the single external image reference is each page's `og:image` absolute URL to the client's own bound `logo-orange-tagline.png` on removeasap.com. Zero generated, stock, or cross-client images. Supply is not inflated: rights are scoped to "local review use," `broader_ownership_claim: false`, `production_clear: false`. |
| Adobe license/privacy | **PASS** (one citation partially re-verified) | Kit `dmg8gvn` loads on all five pages; live removeasap.com fetched read-only today still loads `use.typekit.net/dmg8gvn.js` — continuity confirmed. No font files are copied into the repo. The privacy citation verified verbatim against the live Adobe page: no font-serving cookies; collects fonts served, Web Project ID, embed type, Account ID, hostname, and a received-but-not-stored IP — the ledger's "transient IP" wording is exact. The licensing page (`helpx.adobe.com`) was unreachable from this session by two fetch paths, so that citation is consistent-but-not-re-verified; the ledger's posture (owner unverified, production not clear) is conservative regardless and infers nothing from current site use. |
| Articles | **PASS** | Exactly 9 distinct Medium links in the five pages, IDs matching the ledger's 9 items. Sampled 4 of 9 read-only: the raccoon article (`d2efaa51319a`) contains the misplaced squirrel-services paragraph and "We assure 100% results, and we back it with a WARRANTY" — both verbatim as claimed; the rat-tunneling and bat articles carry the same warranty line; the bat article's maternity-window and NWCO claims match the hold findings. Authorship holds: the `@info_43708` article resolves to Nehemiah Ray / @ASAPwildlife, confirming the direct-or-redirect claim. No article body text is copied into the site — pages carry link cards only, and the four gap slots are explicit "Editorial gap" cards. Hold semantics are stated honestly: the links ARE present in the artifact and must not be promoted as-is. Publication was not treated as approval anywhere. |
| Review excerpts | **PASS** | Mark Carroll, Kelsey Monaghan, and Fred Perry appear exactly once each on all five pages; excerpts link to the Google Maps listing; stars are `aria-hidden`; zero `AggregateRating`/`ratingValue`/`reviewCount` markup on any page. The ledger's Bat-page weakness claim is true — the Carroll excerpt on the bats page talks about "rodents that invaded the house." |
| Intent adjacency | **PASS** | Curated page title/H1 is the general "Squirrel Removal" with self-canonical; legacy `/wildlife/flying-squirrel/` retains "Flying Squirrel Removal Atlanta" and its own canonical; `seo-intent-ownership.json` assigns the two owner phrases exactly as the ledger states. The preserve-or-consolidate decision is genuinely open and correctly held. |
| Promotion hygiene | **PASS** | Confirmed: rodent page loads `asap-close.css?v=4`, the four wildlife pages `?v=3`; one identical file on disk. The warning that aligning the version changes the exact reviewed hashes and forces re-verification is correct. |

## Phase 3 state recommendation

**Waiting — evidence complete, external decisions required.**

Reasons: every claim in the ledger that can be verified from the repo, git history, live site, or the cited sources checks out; nothing needs remediation in the audit itself. But every `production_clear: false` is backed by a real, still-open external dependency (Adobe owner identity, nine editorial dispositions, excerpt acceptance, squirrel-intent decision, cache-buster alignment, Robert/James/client approvals). "Done" would misstate those as resolved; "Fail" would be wrong because no blocking inaccuracy exists.

## Blocking inaccuracies in the audit

None.

## Genuine production gates that remain open

All eight listed in the ledger's `open_gates` are real. I independently confirmed two of them: the site's privacy policy contains zero Adobe/Typekit disclosure today (so the disclosure-refresh gate is not hypothetical), and the CSS version drift exists exactly as described.

## Non-blocking findings

1. **Stale citation URL** — `content/design/animal-asset-rights-ledger.json:37` cites `https://helpx.adobe.com/fonts/using/webfont-licensing.html`, which now 301-redirects to `/fonts/web/font-licensing/webfont-licensing.html`. Update the reference next time the ledger is touched.
2. **`og:image` uses production absolute URLs** — e.g. `wildlife/bats/index.html` references `https://removeasap.com/assets/images/logos/logo-orange-tagline.png`. Same bound asset, but social previews of the local-review artifact depend on the production host serving it. Fine for review; worth knowing at cutover.
3. **Legacy-domain promotion inside a held article** — the rat-tunneling article (`11c3bf8a4e03`) also promotes the legacy `Wildliferemovalasap.com` domain, which the ledger's finding for that item doesn't mention (it does flag outdated destination language on `d51cb888c843`). Immaterial since the article is already on hold, but it strengthens the case for remediation before any link promotion.
4. **Positive confirmation worth recording:** the phone on all five pages is 770-691-3636, matching the Robert-confirmed canonical from the 2026-08-08 correction — the earlier scraped-NAP wrong-phone burn is not reproduced here.

## Scope boundary

This audit PASS verifies the accuracy of the Phase 3 rights audit itself and nothing more. It does **not** clear production, approve the composed pages, authorize preview exposure or any send, satisfy Robert/James/client approval, or advance Phase 4 by itself. All eight open gates stand.
