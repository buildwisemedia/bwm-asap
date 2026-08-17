# Rodent mobile evidence

State: local/review. Viewport: 390 × 844 CSS px. Date: 2026-08-17.

- One H1, four intent cards, zero broken images, and zero page-level horizontal overflow.
- Each intent card recomposed to 370 px wide and 272.59375 px high.
- The three exact-excerpt review cards recomposed to 370 px wide with heights of 354.0390625, 381.234375, and 299.6484375 px; no page-level overflow or rating-value assertion appeared.
- The header call action measured 146.0625 × 46 px; the primary inspection action measured 370 × 50.390625 px.
- The header, cream texture, answer-first content, fact cards, router, FAQ, and form remained inside the viewport.
- The review section resolved its `reviews-title` accessible name after the post-review fix.
- The typography-source repair was re-inspected in an actual `390 × 844` iframe viewport against page SHA-256 `7b1b67910b637f7360075f8517e76d8190f709d2a1332ce4854aa0c8a07318ff`.
- After a real click, the established Adobe kit reported all ten `wf-urwdin-*` faces active plus `wf-active`; the H1 computed family was `urw-din, "Arial Narrow", Arial, sans-serif`.
- The recheck preserved one H1, zero broken images, zero horizontal overflow, four `370 × 272.59375px` intent cards, review-card widths of `370px`, an accessible reviews title, and no semantic rating assertion. The call control measured `165.640625 × 46px`; the primary inspection action remained `370 × 50.390625px`.

This is rendered local evidence, not an independent score, human acceptance, deployment receipt, or production QA.
