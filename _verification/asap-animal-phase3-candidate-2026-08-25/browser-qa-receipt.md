# ASAP animal-page correction — browser QA receipt

Date: 2026-08-27 Eastern. State: mixed private review and local indexable correction candidate. No external action occurred.

`qa/rodent-browser-qa.py` passed 40 rendered runs: all five animal routes at 1440 DPR2; 980/768/641 DPR2; 390 DPR1/2/3; and 320 DPR2, plus a JavaScript-disabled Rodent run.

- Each route loaded exactly one hero resource at every matrix cell; no responsive source contained `undefined`.
- Raccoon selected its 420 px mobile asset at 390 DPR1 and its sharp full asset at 390 DPR2/3 and 320 DPR2.
- Zero horizontal overflow, broken images, contrast failures, console errors, failed requests, or API calls.
- Enabled form and navigation controls measured at least 44 × 44 px through 980 px.
- Every ARIA ID reference resolved; there were zero duplicate IDs and zero unnamed interactive controls.
- After animation-frame settlement, the two-sided assertion held `headerBottom - 3px <= #estimate top <= headerBottom + 3px` in every render. Observed anchor tops ranged from 133.59 px to 183.73 px.
- The Rodent fixture validated locally with `passed-no-send`; without JavaScript its submit stayed disabled, its action stayed `#estimate`, and it made zero API calls.

Pixel inspection of every route at desktop 1440 DPR2 and mobile 390 DPR3 confirmed intact ASAP composition, sharp hero rendering, no clipping or collisions, and all five animals facing inward toward the copy. Screenshots remain local QA output under `/tmp/asap-animal-browser-qa`; they were not published.

The sitemap/indexability gate covers every generator-owned route: sitemap URLs contain no noindex state, local-review state, review fixture copy, or fixture form. `/rodent-removal/` remains absent from the sitemap, noindex, private-review, and fixture-only.
