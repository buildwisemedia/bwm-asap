# Rodent typography, proof, and source verification

State: local/review provider verification. Verified: 2026-08-17T09:52:50-04:00.

## Existing licensed brand font route

- The current production Rodent URL and the repository's established ASAP pages load `https://use.typekit.net/dmg8gvn.js` after user intent while fallback text remains visible.
- The Adobe response identifies the Typekit service, links ten URW DIN font-license records, and configures the `urw-din` family. This is the same kit already used by the existing ASAP site on `removeasap.com`; no new font file, kit, account, charge, or provider mutation was introduced.
- Implementation commit `8dc79a0829c92588e406f51fa4bfecad6d8d6764` restores that exact loader to all 11 pages emitted by `tools/build-asap-close.mjs` and adds deterministic coverage against future omission.
- `node qa/asap-close-qa.mjs`: `341/341` PASS, including the loader on all 11 generated pages.

## Rendered typography and layout

- Desktop browser, `1280 × 720`: after a real click, the document reported all ten `wf-urwdin-*` faces active plus `wf-active`; H1 computed family remained `urw-din, "Arial Narrow", Arial, sans-serif`; one H1, zero broken images, zero horizontal overflow, four equal intent cards, and three equal review cards.
- Mobile iframe viewport, `390 × 844`: after a real click, the document reported all ten URW DIN faces active plus `wf-active`; H1 computed family remained `urw-din, "Arial Narrow", Arial, sans-serif`; one H1, zero broken images, zero horizontal overflow, four `370px`-wide intent cards, an accessible reviews title, and no semantic rating assertion.
- The mobile call control measured `165.640625 × 46px`; the primary inspection action measured `370 × 50.390625px`.

The active Typekit classes, exact current-site kit identity, and visible URW DIN hierarchy replace the earlier fallback-only evidence. This verifies local rendering and same-site source continuity; it is not human design acceptance or deployment authorization.

## Current provider/source checks

- CDC browser check: `https://www.cdc.gov/healthy-pets/rodent-control/clean-up.html` rendered successfully with H1 `How to Clean Up After Rodents` and the current safe-cleanup guidance.
- Google Maps browser check: the ASAP Pest & Wildlife Removal listing rendered at `5.0` with `553 reviews`. Unique-text review searches resolved the exact current entries for Mark Carroll, Kelsey Monaghan, and Fred Perry; each named entry displayed five stars and contained the excerpt used on the local page.
- The page still does not assert an aggregate rating or review count. Its five-star marks remain decorative (`aria-hidden="true"`), and each excerpt links to the provider listing.

These are read-only provider observations, not a ratings guarantee, client acceptance, or permission to send/publish/deploy.

## Logo provenance and intended use

- Nehemiah Ray supplied the five exact animal-page logo attachments by email on 2026-08-11.
- His correction record directs the website pages to use the white-tagline logo on dark backgrounds and assigns per-page ASAP branding for Rodent, Rat & Mouse, Squirrel, Raccoon, and Bat.
- The Rodent logo remains byte-identical to the supplied attachment: SHA-256 `c159022ecec17adfa01f45b266be5ac20b1515355a7163785bda589ed7f06358`.

This proves client supply and intended website-page use of the exact logo. It does not prove approval of the composed page, authorize preview delivery, or waive the separate human launch decision.
