# Implementation Notes

## 2026-08-25 - Animal-page mobile interaction closeout

- Renewed the exact five-page animal candidate after Robert authorized the build to proceed.
- Preserved the existing indexed URLs, approved phone, fallback-font path, held article links, and fixture-only form boundary.
- Increased secondary mobile link and consent-control tap areas to at least 44px without changing desktop composition.
- Advanced the five animal pages to the shared `asap-close.css?v=6` cache key so the mobile fix cannot be masked by an older cached stylesheet.
- The work remains local/review only. No preview exposure, send, deploy, redirect, provider mutation, ad change, spend, or production cutover is authorized by this pass.

## 2026-08-05 - Canonical phone and release reconciliation

- Reconciled the site against the Brain source of truth: the current number is
  `(770) 450-1744`; `(770) 691-3636` was retired on 2026-01-22.
- Updated every public phone link, visible phone string, structured-data phone,
  static inventory reference, and page-generation helper in the release branch.
- Ported the mobile hero tap-target fix onto the current production baseline,
  then applied the canonical phone so the accessibility repair cannot restore
  the retired number.
- Replaced the non-executing attribution fixture with a Node browser harness
  that loads the shipped tracker. `phone_click`, `email_click`, privacy-safe
  parameters, and the unrelated-link negative case all pass.
- The review page and GA4 stream correction are release candidates until the
  exact SHA is promoted and verified on `removeasap.com`.

## 2026-08-05 - GA4 Stream Identity Correction

- A read-only GA4 Admin API audit confirmed property `305355475` has two web streams.
- The retired-domain stream is `G-8M705Z89TE` with default URI `https://www.wildliferemovalasap.com`.
- The current-domain stream is `G-GQZJKG5JCK` with default URI `https://www.removeasap.com`.
- All production page gates and the shared analytics loader now target the current-domain stream.
- `phone_click`, `email_click`, and `form_submit` already exist as property-level key events; the site continues to emit the phone and email events without changing their payload contract.
- This remains a production candidate until the branch is deployed and the new stream is live-canary verified.

## 2026-08-04 - ASAP Review Engine Phase 1 Resume

Robert confirmed the two remaining Phase 1 inputs: sub-five feedback must ask
exactly, "How could we have made your experience five stars?", and the private
response must route directly to Nehemiah. This session resumes the approved
`/rate` direction from `feat/review-engine-rate` plus the Robert-approved visual
elevation at `design/rate-page-2026-07-17`.

- Primary module: `website_landing`; secondary module: `campaign_email_social`.
- Tier: `locked-direction-implementation`; the behavior and visual direction
  are already approved, so this pass does not reopen the design system.
- Identity: ASAP Pest & Wildlife, client + single composition. BWM, HRE, and
  cross-client visual inheritance remain forbidden.
- Current evidence boundary: the `/rate` page and both rating-path previews
  exist. Production `/rate`, job-completion automation, SMS delivery, private
  feedback delivery, and labeled end-to-end smoke are not yet claimed live.
- Preflight finding: the repo still carries a legacy plain-text marker from
  2026-05-12. It must be replaced with a valid hash-bound v4 marker before any
  HTML/CSS/JS authoring.

### 2026-08-05 review-safe Command Center mode

The Command Center will embed this exact page with `?preview=1`. That mode must
exercise the one-to-four and five-star states without sending feedback or
navigating the embedded frame away. Default `/rate` behavior remains unchanged:
five stars immediately hands off to Google and request-bound sub-five feedback
uses the production response route. Preview-only copy must state that no note is
sent and that the live route goes directly to Nehemiah.


## 2026-06-23 - Human-Approval Production Gate

Added release infrastructure so approved live client content is promoted deliberately instead of auto-published from `main`.

- Added `Promote to Production` manual workflow. It requires an exact 40-character commit SHA, runs the shared QA gate against that SHA, waits on the `client-production` environment, then moves `refs/heads/production` to the approved SHA.
- Added `Rollback Production` manual workflow. It requires an exact known-good SHA, waits on the same environment, then restores the known-good tree in a new forward rollback commit on `production`.
- Added `scripts/production-gate.sh` for read-only state checks, shared QA checks, idempotent GitHub gate setup, and confirmed Cloudflare branch flips.
- Added `PRODUCTION-GATE.md` as the supervisor runbook.

At initial implementation time, no live GitHub ruleset/environment changes or Cloudflare mutations were run from this worktree.

## 2026-06-23 - Round 2 GitHub Ruleset Fix

Updated the GitHub ruleset payload for the actual repository owner model: `buildwisemedia/asap-pest-wildlife` is owned by a GitHub User account, so a GitHub Actions integration bypass actor is not valid.

- Removed the GitHub Actions app bypass lookup and the `bypass_actors` payload.
- Removed the `update` rule. The ruleset now blocks only deletion and non-fast-forward pushes to `refs/heads/production`.
- Kept idempotent create-or-update behavior for `production-release-gate`.
- Kept `client-production` environment setup unchanged; it defaults to the authenticated GitHub User, and the recommended hardening is to add Robert's personal GitHub account as the required reviewer.
- Updated rollback so it can work with non-fast-forward pushes blocked: it checks out current `production`, restores the tree from the target SHA, verifies the resulting tree equals the target tree, commits `rollback: restore production to <sha>`, and pushes that new commit.

Actual enforcement after this fix:

- Primary gate: Cloudflare production deploys from `production`; `main` produces previews only.
- Ruleset: blocks force-push and deletion of `production`.
- Blessed update path: environment-gated Promote/Rollback workflows.

Residual on user-owned GitHub repositories: the ruleset cannot hard-block a deliberate direct fast-forward push to `production` without also blocking the workflow path. Future hardening options are to migrate the repository to a GitHub organization and add an Actions-bypass `update` restriction, or disable Cloudflare automatic production deployments and trigger production deploys from the promote workflow through the Cloudflare API.

## 2026-07-15 - Form Routing Parity (client-reported: inner-page forms not reaching Webflow submissions)

Client (John, 7/8 + 7/13 + 7/15) asked for every form to behave like the homepage form, whose submissions land in their Webflow submissions panel and fire their automation chain (email -> SMS -> Monday.com). Diagnosis:

- Homepage inline handler used `preventDefault()` only, so the Webflow runtime's own submit still ran -> dual delivery (BWM worker + Webflow). That was the only correct page.
- about/blog/contact/services/warranty-assurance inline handlers added `stopImmediatePropagation()` (+ capture), which killed Webflow's handler -> leads reached only the BWM worker.
- wildlife/* and peace-of-mind-from/* used a third, document-level handler that never set `__bwmBound`, so `assets/js/asap-lead-flow.js` (fallback, also capture+stopProp) bound too and blocked Webflow.
- commercial-services / pest-control-services / wildlife index had no inline handler; the fallback blocked Webflow there as well.
- Visual mismatch the client screenshotted: the homepage hides `Others_Input` ("Type other") until Issue=Other via a homepage-only Webflow interaction chunk; all other pages showed the field naked.

Changes:
- Removed `stopImmediatePropagation` + capture flag from the 5 divergent inline handlers (now byte-equivalent to the homepage contract, per-page `source_form_type` labels kept).
- Replaced the document-level variant on 24 wildlife/peace pages with the homepage-pattern handler; binds at parse time and respects `__asapLeadFlowBound` so the fallback can never double-post.
- `assets/js/asap-lead-flow.js`: dropped stopProp/capture (Webflow must run); added a site-wide `Others_Input` toggle replicating the homepage show/hide on every page.
- lead-flow/ LP untouched (own gated form, `data-no-bwm-lead-flow` opt-out).

Verified locally (iframe harness, fetch/XHR instrumented): every page class = exactly 1 BWM worker post + 1 Webflow post, done-message shown, `Others_Input` hidden until Other. Real e2e test submission from /about/ accepted by the Webflow API (their panel + automation). Client's own 7/15 13:43 test appears in lead_submissions with `about-webflow-reference`, confirming the worker leg was never the gap.
# 2026-07-15 — Whole-site speed remediation

- Removed the retired personalization experiment and its four-second page-hiding behavior from every exported page.
- Kept Webflow navigation, sliders, lead capture, and brand typography while moving their non-critical downloads out of the first visible render.
- Replaced the heaviest Webflow-hosted artwork with pixel-equivalent local WebP assets and responsive background variants.
- Migrated the affected client asset locks to those approved WebP derivatives and retained original-asset provenance in the markup; all 1,086 perceptual locks pass.
- Removed the stale same-origin tracking request that produced repeated 404s. Canonical BWM analytics and attribution remain in place.
- Scope is isolated in `codex/asap-performance-2026-07-15` for full-page verification before release.

## 2026-08-13 - ASAP Close Local/Review Page Build

This pass implements the accepted August 11 email and August 12 call direction
as a local/review build only. It started from repository HEAD
`b86b3bf4b5d8e911f80e2d860ec5106917abf3cc` in an isolated worktree and did
not change the user's existing checkout.

- Added five core animal sales pages: rodent umbrella, rat and mouse, squirrel,
  raccoon, and bat/guano.
- Added five mixed-service city pages for Canton, Woodstock, Acworth, Kennesaw,
  and Cartersville. Acworth uses beavers in place of mice as directed.
- Rebuilt the pest-control hub and added a shared pest-control section pattern
  to every city page.
- Used the exact review-build identity tokens: cream `#f2eddc`, navy `#212936`,
  body `#333333`, orange `#b77537`, white, and phone `770-691-3636` with
  `tel:+17706913636`.
- Used the supplied page logos from the August 11 email asset packet. Article
  gaps are explicitly labeled and are not represented as published.
- Bat maternity-season copy states the April 1-July 31 guidance window while
  making clear that inspection, emergency response, containment, cleanup
  planning, and otherwise permitted work do not automatically stop. Current
  guidance and property conditions control the actual plan.
- Forms are local fixtures. They capture source page, service/city, lead ID,
  UTM values, `gclid`, `fbclid`, consent, start, submit, and phone-click hooks,
  but they cannot send email, create a Monday.com item, run Make.com, or contact
  a customer.
- Added self canonicals, one H1 per page, LocalBusiness/Service/FAQ/Breadcrumb
  schema, sitemap coverage, an intent-ownership manifest, an article inventory,
  and deterministic page generation/QA.
- Corrected the retired phone number across the repository because the August
  evidence names `770-691-3636` as authoritative. No endpoint, deployment,
  DNS, provider, tenant, or production state changed.

### Verification and held gates

- Preflight v4: hash-backed and valid with four bindings.
- Scope QA: 293/293 checks pass.
- Lead/attribution QA: 606 internal links resolve, all 167 phone links use the
  correct number, 11 fixture pages are recognized as non-live, and attribution
  tracker tests pass 3/3.
- Pixel QA: all 11 routes inspected at desktop, 390px mobile, and 320px narrow
  widths; no horizontal overflow. Focus, validation error, no-send success,
  FAQ-open, and reduced-motion states were checked.
- Representative mobile Lighthouse: bat and Canton each score 99 performance,
  100 accessibility, 100 best practices, and 100 SEO. FCP is 0.9s, LCP is 2.1s,
  TBT is 0ms, and CLS is 0.007 or lower.
- Repository-wide `bwm-preship-gate` remains blocked by legacy Webflow/source
  findings outside the new page slice, including existing banned-token scans,
  legacy duplicated assets, the already-committed root notes location, and an
  internal lead-flow QA page. The scoped Kennesaw duplicate introduced during
  this pass was fixed before closeout.
- The canonical `bwm-design-gate run` cannot truthfully pass until the required
  independent fresh-context opposite-family scorer and defect receipts exist.
  Per coordination, Fable/Claude invocation is intentionally held during the
  provider cooldown. No client/HIL acceptance is claimed.

### Morning decisions and assumptions

- The source says "six pages" but names five core animal pages. This build
  implements the five named pages; armadillo, beaver, birds, bees/wasps/hornets,
  coyote, flying squirrel, fox, geese, gopher, mole, opossum, otter, rabbit,
  snake, turtle, vole, and wild hog remain a held business-priority backlog.
- City maps are accessible schematic service-context graphics, not legal or
  guaranteed service boundaries. County/boundary approval is held.
- Supplied review evidence provides the Google listing destination, not stable
  individual-review deep links. Review cards therefore link to the listing.
- Missing article sources, production form destinations, attribution vendor
  wiring, spam controls, GTM/Meta/Clarity production activation, and real
  Monday/Make mappings remain external gates. Credentials or existing code do
  not authorize those changes.
- No merge, tag, deploy, DNS/sharing change, production mutation, email, Slack,
  or client communication occurred.
