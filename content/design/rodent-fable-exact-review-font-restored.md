# Fable exact-artifact re-review receipt — ASAP Rodent umbrella (Phase 2, restored licensed font)

[fable-review] subscription-only · peer-1/peer-2/peer-3/peer-4 · no Robert spill  
[lane] peer-1@buildwisemedia.com · 5h 29% · weekly 14%  
[lane-route] {"lane":"peer1","email":"peer-1@buildwisemedia.com","spilled":false}

**Route mode:** subscription (peer-1 lane, fresh-context Fable) · **Spilled:** false

**HEAD verification:** PASS — HEAD is `69fe047437393ef110a52d9201a45a6bba99c4c1` on `codex/asap-close-local-review-20260813` with a clean working tree, and it stayed clean and unchanged through the review.

**Artifact hash verification:** PASS — all **8/8** exact-artifact manifest hashes and all **23/23** review-packet manifest hashes match local bytes, including the primary page at `7b1b6791…`. Every cross-referenced evidence hash also matches: the client-supplied `rodent.png` (`c159022e…`), the four preflight records, the prior Fable receipt (`0eafc6e5…`), and one level deeper the upstream sources — Nehemiah's email (`46ccc2c8…`), the working-session transcript (`2b040ba1…`), `SITE-INVENTORY.md` (`5fb883b6…`), and the article inventory (`f716ed5f…`). No `ARTIFACT_MISMATCH`.

**Deterministic QA:** re-run live — **341/341 PASS**, including the new check requiring the established Typekit loader on all 11 generated pages. I read the QA source: it is a real gate (it enforces intent ownership, protected phrases, citations, phone, and the logo hash, and it can fail).

**Render basis:** the bound 8766 server was down, so I served the verified checkout read-only on a throwaway local port (stopped after) and rendered live in a real browser at **1440×1000** and **390×844**. First navigation hit a stray process squatting the first port I tried, answering `{"ok":true,"status":"sent"}` to any GET — that was never this artifact; I re-bound to a verified-free port and confirmed the real HTML before judging anything.

## Verdict: PASS

The one defect that held the prior receipt at `revise` — URW DIN declared but never loaded — is genuinely closed, and I reproduced the closure myself rather than trusting the recorded evidence:

- **No font request fires before interaction** (verified on a fresh mobile load: zero Typekit requests until a real tap).
- After a real click at both widths, the existing production kit `dmg8gvn` loaded and the document reported **`wf-active` plus all ten `wf-urwdin-*` faces**; the H1 computed family was `urw-din, "Arial Narrow", Arial, sans-serif` at 115.2px desktop / 62.4px mobile. The outlined "RODENT" / solid "REMOVAL" stack renders correctly in the real face.
- The only external requests on the page are the kit loader, its ten licensed faces, and Adobe's standard kit beacon. No new font file, kit, account, or provider mutation exists in the diff — commit `8dc79a0` only restores the same loader the production site already uses.
- Form fixture truth verified end-to-end: a completed submit produced **zero network requests to `/api/lead-intent`**, set `fixtureResult: passed-no-send`, moved focus to the truthful status line, and recorded `integration_state: "fixture-only"`.

## Scores (0–100)

| Dimension | Score | Dimension | Score |
|---|---:|---|---:|
| Identity / source fidelity | 94 | Storytelling / information design | 93 |
| Information architecture | 95 | Copy / proof / action | 94 |
| **Typography / hierarchy** | **92** | Motion / interaction restraint | 96 |
| Composition / spatial rhythm | 90 | **Accessibility / responsive / performance** | **92** |
| Imagery / art direction | 92 | Ownership / continuity | 95 |

**Typography ≥ 90: yes (92).** The prior 88 was scored against a fallback-only render. I observed the licensed URW DIN hierarchy actually active at both widths — heavy condensed uppercase display, outlined hero treatment, DIN nav/labels/buttons over Arial body — exactly the accepted direction's computed current-site roles. It stays short of higher because the pre-interaction window deliberately shows the Arial Narrow fallback (an accepted FOUT tradeoff, not a defect) and the hierarchy is faithful inheritance rather than further refinement.

**Accessibility/responsive/performance ≥ 90: yes (92).** The prior 89 was held down by unresolved rendered-typography evidence. I verified directly: one H1; working skip link to `#main`; keyboard-focusable native FAQ semantics; form labels bound by `for`/`id`; `role="status"` live region that receives focus on submit; decorative stars `aria-hidden` with no rating assertion in DOM or JSON-LD; `reviews-title` accessible name resolves; zero horizontal overflow and zero broken images at both widths; touch targets 46–50px; reduced-motion and forced-colors parity in CSS; 5/5 exact FAQ JSON-LD↔visible parity (programmatic); and a performance posture of one stylesheet, one deferred local script, dimensioned images, and a font request deferred until intent. The visible font swap on first interaction and the hidden mobile nav (below) keep it at 92, not higher.

## Blocking findings

None.

## Non-blocking findings

1. **Minor — mobile/tablet nav is hidden with no toggle.** `assets/css/asap-close.css:231` (`.header-inner nav { display: none }` under 980px) removes Wildlife/Pest control/Services/About with no hamburger. Conversion paths (call pill, form, router cards) all remain, and this mirrors the close-to-current-site direction, but site-level navigation on mobile depends on the router and footer. Worth a deliberate decision at the human gate.
2. **Minor — the delayed external request includes Adobe's kit telemetry beacon.** `peace-of-mind-from/rodents/index.html:14` — once loaded, the kit fires `p.typekit.net/p.gif` (observed live). This is inherent to the existing production kit, not a new provider action, but the privacy page should already cover it before any cutover.
3. **Info — the 15-second fallback timer loads the font without a user gesture** on an idle open page (`index.html:14`). By design and disclosed in the evidence; noted so "after user intent" is not read as "only after intent."
4. **Info — Fred Perry excerpt differs from the inventory row by one apostrophe.** `index.html:38` uses `I’d` where `SITE-INVENTORY.md:283` records `I'd`; words are identical, and the provider verification resolved the live Google entry containing the page's text. Typographic normalization only.

## Unlisted defect review

Nothing blocking found beyond the named list. Checked and clean: zero external requests of any kind before interaction; no `fetch`/XHR/beacon in `asap-close.js` (now correctly pinned in the exact manifest, closing the prior receipt's gap); no secrets or credential-shaped strings; no cross-client or BWM identity on the page; no vendor names in visible copy (the truthful fixture status naming Monday.com/Make.com is boundary disclosure inside a review-only fixture, never shipped copy as-is); JSON-LD carries no `AggregateRating`/`ratingValue`; `data-build-state="local-review"`, the hero art-note, the review-mode chip, and the submit status all state the local-review boundary truthfully; the hero eyebrow lists only true rodents; "Not a rodent" appears exactly twice (Raccoon, Bat); the stray fixture endpoint found on my first port belongs to some other process on this machine, not to this artifact or its assets.

## Required judgment

The exact Rodent umbrella **is** a strong, brand-faithful representative pattern that supports rather than cannibalizes the four owners. Title and H1 claim only "Rodent Removal in Metro ATL"; the four protected phrases are absent from title/H1 and machine-gated; I verified live that all four sibling pages keep distinct titles/H1s and none carries the umbrella's router copy. Clues-not-diagnosis is stated with UGA, CDC, and Georgia DNR linked beside the exact bounded statements; Raccoon and Bat are labeled non-rodents; warranty, availability, and health language stays inspection-qualified; the editorial gap is visibly unpublished. Client hexes, the locked phone in display/tel/JSON-LD, the rights-tracked logo, and the now-actually-rendering URW DIN hierarchy from the client's own production kit hold ASAP fidelity end to end.

## Source identity review: PASS

All five evidence units checked — `client-corrections`, `client-working-session`, `official-guidance`, `customer-reviews`, `article-inventory`: every local snapshot hash-matches the packet manifest, every cited upstream source hash-matches its recorded fingerprint on disk, the five are genuinely distinct sources, and each bounded finding is supported (the email carries the phone/hex/typography/umbrella instructions; the transcript carries the cannibalization warning and stay-close direction; two of three review excerpts are exact inventory substrings and the third differs only by an apostrophe). The new provider evidence also checks out independently: the kit identity, the ten active faces, and the rendered family were reproduced live in this session, and the logo remains byte-identical to the supplied attachment.

---

**This PASS is independent local-review acceptance only.** It is not Robert, James, or client approval; not preview-delivery or send authorization; not deployment, production cutover, or production proof. Human acceptance of the composed page, Robert's explicit delivery/deploy word, and live QA remain separate, ungranted gates. Same-site font/license continuity verified here does not substitute for any of them. The reviewer changed nothing in the repository; the tree remained clean at `69fe047`.
