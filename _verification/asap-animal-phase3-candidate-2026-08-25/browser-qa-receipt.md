# ASAP Rodent correction — browser QA receipt

Date: 2026-08-27 Eastern. State: private local review. No external action occurred.

`qa/rodent-browser-qa.py` passed all eight required renders: 1440 DPR2; 980/768/641 DPR2; 390 DPR1/2/3; and 320 DPR2, plus a JavaScript-disabled run.

- Exactly one Rodent hero resource loaded at each size and matched `currentSrc`.
- 390 DPR1 selected the 420 px asset; 390 DPR2/3 and 320 DPR2 selected the 700 px asset; 641 px and above selected the 1,100 px asset.
- Zero horizontal overflow, broken images, console errors, failed requests, or API calls.
- Header phone, email, and menu controls were at least 44 px high at every width through 980 px.
- Keyboard navigation opened the native menu at every responsive width.
- After 1.2 seconds of smooth-scroll settlement, `#estimate` remained below the sticky header at every width.
- The review form validated locally with `passed-no-send`; without JavaScript its submit stayed disabled, its action stayed `#estimate`, and it made zero API calls.

Pixel inspection of initial-state screenshots at desktop (1440 DPR2), tablet (768 DPR2), and mobile (390 DPR3) confirmed a sharp inward-facing hero, intact responsive hierarchy, and no visible clipping or collisions. Screenshots are local QA output under `/tmp/asap-rodent-browser-qa`; they were not published.

The sitemap/indexability gate passed across generator-owned routes: no sitemap URL contains noindex, local-review state, review fixture copy, or a fixture form. `/rodent-removal/` is absent from the sitemap and remains noindex/private-review.
