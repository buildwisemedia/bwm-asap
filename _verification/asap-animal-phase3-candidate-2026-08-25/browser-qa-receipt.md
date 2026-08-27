# ASAP animal-page final correction — browser QA receipt

Date: 2026-08-27 Eastern. State: mixed private-review and local indexable correction candidate. No push, deploy, publish, email, or Brain write occurred.

`qa/rodent-browser-qa.py` passed three consecutive expanded runs after the correction. Each run retained the original 40 rendered animal cells: all five approved animal routes at 1440 DPR2; 980/768/641 DPR2; 390 DPR1/2/3; and 320 DPR2, plus the JavaScript-disabled Rodent run.

- Before every contrast sample, the pointer moved away from the clicked CTA and the gate waited 250 ms, exceeding the 180 ms CTA transition, then re-verified layout settlement.
- The strict two-sided assertion remained unchanged: `headerBottom - 3px <= #estimate top <= headerBottom + 3px` in all 40 original animal cells.
- Each original animal cell loaded exactly one responsive hero resource, with zero overflow, broken images, contrast failures, console errors, failed requests, API calls, ARIA-reference defects, duplicate IDs, unnamed controls, or sub-44px enabled controls through 980 px.
- The Rodent fixture remained `passed-no-send`; without JavaScript its submit remained disabled, action remained `#estimate`, and it made zero API calls.

Each expanded run also covered:

- `pest-control-services` and all five `wildlife-removal-*` location pages at 1440 DPR2 and 390 DPR2 (12 rendered cells per run). Every shared `.contact-copy .button--cream` computed to navy text `rgb(33, 41, 54)` on cream `rgb(242, 237, 220)`.
- `/peace-of-mind-from/rodents/` at 768, 641, 390, and 320 px (DPR2). Its page-specific offsets aligned `#estimate` to the taller retained header within the same two-sided ±3 px bound at every width.

Static QA passed 447/447 checks. Animal and `legacy-review` generator modes each reproduced byte-for-byte across two consecutive generations, including all five animal pages plus inventory and all six shared indexable pages respectively.

Screenshots remain local QA output under `/tmp/asap-animal-browser-qa`; they were not published. `/rodent-removal/` remains absent from the sitemap, noindex, private-review, and fixture-only. The sitemap, redirects, copy, indexability boundary, hero direction, hero assets, and five approved animal designs were not changed.
