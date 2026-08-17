# ASAP Animal Sales Pages — protected exact-set review

## Protected route proof

```text
[fable-review] subscription-only · peer-1/peer-2/peer-3/peer-4 · no Robert spill
[lane] peer-3@buildwisemedia.com · 5h 5% · weekly 61%
[lane-route] {"lane":"peer3","email":"peer-3@buildwisemedia.com","spilled":false}
```

- Reviewer lane: protected Fable 5 subscription, peer-3
- Wrapper spill: `false`
- Review target: commit `f6fbc519c62d3d396991111948340b256eb7e80d`
- Exact manifest: `_verification/asap-animal-lineup-phase2/exact-artifact-manifest.json`
- Verdict: **PASS**
- Scope boundary: local/review exact-set acceptance only; not Robert, James, or client approval; not preview/send authorization; not deployment/cutover; not production form, redirect, or live-QA proof.

## Verbatim reviewer receipt

# ASAP Animal Sales Pages — Phase 2 Protected Exact-Set Review Receipt

- **Route mode:** Direct local Fable 5 fresh-context review session (no subagents, no cloud dispatch, review-only — no files edited, nothing sent or deployed).
- **Spilled:** No — the full review ran in one context with no compaction or handoff.
- **HEAD verification:** PASS — `f6fbc519c62d3d396991111948340b256eb7e80d` on `codex/asap-close-local-review-20260813`, exactly as expected.
- **Tracked state:** PASS — `git status --porcelain` clean before review; re-verified clean after review teardown (scratch screenshots removed, server stopped).
- **Artifact hash verification:** PASS — 17/17 SHA256 hashes in `_verification/asap-animal-lineup-phase2/exact-artifact-manifest.json` match the files on disk, including all five pages and all five client-supplied page logos.
- **Deterministic QA:** PASS — `node qa/asap-close-qa.mjs` returned 399/399, 0 failures. I read the QA source: it is a genuinely failable gate (exact page hashes, exact titles/H1s, protected-phrase exclusion, compliance phrase checks), not a ratchet.

## Verdict: PASS

**Named set verified: 5.** The unresolved six-versus-five source discrepancy was **preserved, not invented away**: the August 11 correction note says "six pages" but enumerates five identities with five logos, and both `content/design/animal-lineup-manifest.json` (the `ambiguity_boundary` field) and the exact manifest carry that boundary forward explicitly. No sixth page exists in the set, and none was fabricated or implied resolved.

## Page-by-page

| Page | Intent owner | Factual/compliance boundary | Attribution/form | Responsive (1440 + 390) | Verdict |
|---|---|---|---|---|---|
| Rodent (umbrella) | `rodent removal Metro ATL`; router role explicit; title/H1 claim none of the 4 protected phrases | UGA noise-routing, CDC no-sweep/vacuum, Georgia DNR bat guidance all cited and bounded; Raccoon and Bat cards correctly labeled "Not a rodent" | `/peace-of-mind-from/rodents/` · Rodent Removal · fixture-only, 7 hidden attribution fields | No overflow, no broken images, 1 H1 | PASS |
| Rat + Mouse | `rat and mouse removal Metro ATL` | House mouse / roof rat / Norway rat distinguished; bait stations recurring and label-qualified; exclusion "scoped separately from trapping or baiting"; disease FAQ exposure-qualified ("Risk varies by species, exposure, and site conditions") | `/wildlife/mouse-rat/` · Rat and Mouse Removal · fixture-only | Clean both widths | PASS |
| Squirrel | `squirrel removal Metro ATL` | Gray vs flying distinction throughout; dependent-young timing present; repair "only after the active-animal plan is clear"; identification hedged to inspection | `/wildlife/gray-squirrel/` · Squirrel Removal · fixture-only | Clean both widths | PASS |
| Raccoon | `raccoon removal Metro ATL` | Adults/possible-young sequencing; FAQ explicitly refuses immediate sealing ("Not until the active-animal and possible-young situation is understood"); inspection-led repair; cleanup evidence-based | `/wildlife/raccoon/` · Raccoon Removal · fixture-only; **live submit test: `passed-no-send`, 0 network requests** | Clean both widths | PASS |
| Bat | `bat removal Metro ATL` | April 1–July 31 maternity window stated with "does not mean every bat-related service stops"; current-guidance and site-condition qualifiers; guano/insulation scoped to affected area; DSV language label- and site-qualified, "not a blanket health guarantee" | `/wildlife/bats/` · Bat and Guano Removal · fixture-only | Clean both widths | PASS |

## Cross-set findings

- **Brand fidelity:** One shared system on all five — ASAP cream/navy/orange tokens, licensed URW DIN Adobe kit (`dmg8gvn.js`) with delayed load, Arial body, client-supplied per-page logo lockups (hash-bound to the rights manifest), correct phone everywhere, warm/humane voice. The shared skeleton does not flatten species: fact lists, plan grids, and FAQs are genuinely species-specific per page.
- **Intent separation:** Clean inside the set. Unique titles, H1s, self-canonicals, Service schema, and owner phrases; the Rodent umbrella routes to all four owners and its title/H1 avoid all four protected phrases (QA-enforced).
- **Article truth:** Each page shows exactly three slots that match `content/asap-article-inventory.json` one-to-one. Existing Medium links are real links; the four gap cards use a visually distinct dashed style, carry an "Editorial gap" chip and "not silently treated as published" text, and have no link. No gap is implied published.
- **Accessibility:** One H1 per page, skip link, alt text on every image, labeled form fields, `aria-live` status region, `aria-hidden` decorative stars, keyboard-visible focus styles, reduced-motion and forced-colors media queries, ≥46px touch targets.
- **Security/privacy/performance:** No credentials in any reviewed file. No AggregateRating schema or rating claim (stars are decorative excerpts linked to the source Google listing). Adobe Typekit request is deferred until first interaction or 15 seconds. HTML is well under budget; zero console errors or warnings across all five pages.
- **Attribution:** All five forms are `data-integration-state="fixture-only"` posting nowhere in local-review state; hidden `lead_id`/`source_page`/UTM/`gclid`/`fbclid` fields populate client-side only. Verified live on the raccoon page: submit intercepted, `passed-no-send`, zero API requests, correct page-specific payload.

## Blocking findings

None.

## Non-blocking findings

1. **CSS cache-buster drift (low, cosmetic locally):** the Rodent page loads `/assets/css/asap-close.css?v=4` (`peace-of-mind-from/rodents/index.html:12`) while the four wildlife pages load `?v=3` (e.g. `wildlife/mouse-rat/index.html:12`). Same file on disk, so rendering is identical in local review — but at any future cutover behind a CDN, the four `v=3` pages could pin a stale cached stylesheet. Align the version before promotion.
2. **Mobile/tablet navigation omission (known, held):** `assets/css/asap-close.css:231` hides the main nav below 980px with no hamburger replacement; only the logo and call pill remain. Verified rendered at 390px: pages remain usable for their conversion purpose (call + form), so this stays non-blocking, and it is already listed as awaiting human direction in the lineup manifest.
3. **Adobe telemetry coverage (known, held):** the deferred Typekit loader will eventually make an external request from a local-review page (after interaction or 15s). The lineup manifest already holds "Adobe kit telemetry coverage must be confirmed before cutover" as a human gate; behavior matches the receipt's description.
4. **Set-vs-legacy flying-squirrel adjacency (low):** the curated Squirrel page claims gray *and* flying squirrel intent (eyebrow, meta description) while legacy `/wildlife/flying-squirrel/` still owns "flying squirrel removal atlanta" in `seo-intent-ownership.json`. Owner phrases stay distinct and the curated title/H1 make no flying-squirrel claim, so the five-page set itself does not cannibalize — but this legacy overlap should be resolved in production intent planning.

## Unlisted defect review

I looked beyond the checklist: schema-vs-visible FAQ parity (matches), review-excerpt truthfulness (real excerpts, linked to the source Google listing, no invented rating), hidden-field hygiene, wrong-phone tokens (absent; QA greps for the old 770-450-1744 number), sitemap/intent registry coverage (40 URLs, all owned, owner phrases unique), and hero/logo asset existence. Two observations only, neither a defect: the contact email `info@removeasap.com` renders as plain text rather than a `mailto:` link on all five pages, and the review excerpts on the Bat page are rodent/general-service quotes rather than bat-specific ones — truthful but less matched to the page.

## Boundary statement

This PASS is an independent exact-set review outcome only. It is **not**: Robert, James, or client approval; authorization to expose a preview or send anything; deployment or cutover authorization; proof of production form delivery; proof of redirects; or live QA. Form delivery remains fixture-only, the set remains local/review, and every human and release gate in the lineup manifest remains open.
