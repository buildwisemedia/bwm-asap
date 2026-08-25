# ASAP animal pages — fresh browser QA receipt

Date: 2026-08-25 (Eastern)

State: private PR preview only. No client send, integration, merge, or production action was performed.

## Exact routes

- `/peace-of-mind-from/rodents/`
- `/wildlife/mouse-rat/`
- `/wildlife/gray-squirrel/`
- `/wildlife/raccoon/`
- `/wildlife/bats/`

## Fresh render sweep

The five routes were loaded from a local HTTP server in a fresh headless Google Chrome context at 1440×1000 and 390×844.

- 10/10 desktop and mobile route renders returned HTTP 200.
- 0 mobile interactive targets were below 44×44 CSS pixels.
- 0 routes had horizontal overflow.
- 0 images were broken.
- 0 browser console errors were emitted.
- 0 requests failed and 0 local responses returned an error status.
- The primary phone CTA was visible on all 10 renders.
- All five pages declared their exact source page and remained `fixture-only`.
- A local fixture form submission returned: `Review fixture passed. No email, Monday.com item, Make.com run, or customer message was created.`
- 0 outbound requests were observed during the fixture test.

The mobile tap-area fix was applied after the first sweep found sub-44px links and consent controls, then the full 10-render sweep was repeated. A later exact link audit found that the five replacement-page navigation bars pointed to the nonexistent `/commercial/` route. Those links and their generator were corrected to `/commercial-services/`; the complete candidate and lead-flow checks were rerun afterward.

## Deterministic checks

- Candidate QA: 462/462 checks passed after the navigation-link correction.
- Repository lead-flow audit: 38 public form pages, 11 local-review fixtures, and zero unsupported forms, missing handlers, missing attribution, bad phone links, placeholder emails, broken static links, or fetched-link failures.
- Design gate: 93.2, `premium-candidate`.

## Promotion boundary

The five-page candidate is green within its exact scope. Repository-wide promotion remains held because the inherited production homepage has separate performance/validation/CTA gate failures, and the repo-wide pre-ship scan has inherited Webflow-color and vendor-name findings outside this five-page change.
