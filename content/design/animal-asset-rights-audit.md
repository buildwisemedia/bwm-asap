# ASAP animal set — Phase 3 asset and rights audit

State: local/review candidate; **not production-cleared**. Re-verified 2026-08-24.

## What the client actually requested

On the 2026-07-15 call, Nehemiah asked for landing-page-style pages for ASAP's top animals so the company could push specific searches organically and later use the pages for ads. The recorded Wave 1 is raccoon, bat and guano, squirrel and flying squirrel, and rats and mice, on `removeasap.com`.

The same record preserves Robert's promise to send Nehemiah the plan before building and Nehemiah's statement that he had thoughts. No formal plan-approval receipt has been proven in this phase. These files therefore remain local and unsent.

## What is cleared locally

- Five page-logo files match Nehemiah Ray's 2026-08-11 email attachments.
- Seven other visuals are byte-identical to the pre-existing ASAP base commit `b86b3bf4b5d8e911f80e2d860ec5106917abf3cc`.
- No generated, new-stock, or cross-client image was introduced.
- The source says six pages but explicitly names and supplies assets for five; no sixth page was invented.
- The five pages use the same stylesheet key, `asap-close.css?v=5`.
- The five-page forms remain local no-send fixtures.

## Robert-authorized local changes — 2026-08-24

1. **Adobe Fonts removed from the five candidate pages.** The `dmg8gvn` loader is absent, and the pages explicitly select the existing Arial Narrow/Arial fallback stack. The five pages no longer create the Adobe font-delivery data flow.
2. **Nine old Medium links withheld.** The source URLs remain traceable in the internal inventory and ledger, but no Medium link is published on any of the five pages. Each affected card says that the link is held pending editorial approval.

Why the old links were a problem: the articles are client-authored history, but several contain blanket `100% results` or warranty claims, the raccoon post includes an incorrect squirrel-service paragraph, and the bat posts include health, licensing, or timing claims that need current sources. Linking to those posts from a new sales page would make the new page endorse them. Hiding the links avoids that implication without deleting the client's articles.

## Still open, but not silently decided

1. **Review excerpts.** The three Google excerpts are real and provider-verified, but the same set repeats across the pages and Bat has no bat-specific proof.
2. **Squirrel URL strategy.** The new Squirrel page discusses gray and flying squirrels while the legacy `/wildlife/flying-squirrel/` URL still exists. No redirect, canonical change, or merge is authorized.
3. **Client plan approval.** The exact finished pages have not been shown or approved in this phase.
4. **Release gates.** Preview exposure, sending, deployment, redirects, provider changes, spend, attribution tests, and production QA remain separately gated.

No provider was mutated; no article, preview, or page was sent or published.
