## Verdict: Both findings verified resolved. No new concrete defect. ACCEPT as an independent source verification of the fix — no design/client acceptance or deployment approval implied.

**Finding 1 (generator drift onto city pages) — resolved, and I verified the mechanism directly.** The fix took the "scope to animal pages" option. In `tools/build-asap-close.mjs:438` the card link is now `page?.kind === "animal" ? (individualReviewUrls[name] || destination) : destination`. I checked every call site of `reviews()` in the file — there are exactly three:

- `tools/build-asap-close.mjs:483` and `:489` (both branches of `renderAnimal`) pass `page`, and all 5 entries in the `animals` array carry `kind: "animal"` (lines 35, 105, 135, 165, 195). Only these get exact links.
- `tools/build-asap-close.mjs:534` (`renderCity`) calls `reviews()` with no argument. Optional chaining makes this safe: `page` is `undefined`, so `page?.kind === "animal"` is false and `page?.key === "rodent"` is false — no crash, and every city card gets `destination`, which resolves to the original generic `reviewUrl` (line 15). The avatar branch (`page?.key === "rodent"`) also stays off.
- Legacy mode (lines 591–593) writes only city pages, `renderPest()` (which contains no reviews section at all), and the legacy rodent fixture repair (pure string surgery on existing HTML, no `reviews()` call). So the next legacy rebuild cannot propagate individual links outside the reviewed animal scope.

The `|| destination` fallback also fails safe: if a card name ever went missing from the ledger, it degrades to the generic listing URL rather than a broken or invented link.

**Finding 2 (ambiguous excerpt flag) — resolved.** The ledger replaces the lone `"excerpt": true` with `captured_text_is_excerpt` set explicitly on all five entries (false on the four full captures, true on Yashica Marshall), plus an `excerpt_note` defining the semantics: the flag marks a partial capture of the source review text, and website cards may retain shorter existing excerpts. That directly covers the Benjamin Olmstead case the first review flagged — his capture is full (`false`) even though the homepage card shortens it. The convention is now internally consistent. The rename is inert to the build: the generator reads only `name` and `url` from the ledger (line 17).

**Independent hash verification (the gap in the first review):** I recomputed SHA-256 for all three changed files with my own shell. All three match `HASHES.json` exactly, and the manifest's internal pins for `build-asap-close.mjs` (`6ff918…`) and `google-review-permalinks.json` (`ac8d30…`) match my recomputed values. The `FIX.diff` after-state matches the actual file contents. The `index.html` pin in the manifest is unchanged by this diff, consistent with the claim that rendered HTML is untouched.

**Holds preserved:** `production_clear`, `preview_authorized`, `send_authorized` all remain false in the manifest; Charlie Cichetti stays in `unresolved` with no invented URL; the manifest state string still says pending independent review of this exact scope.

**Limits of this verification:** the snapshot contains no HTML files and no QA script, so I could not re-run the 12-file roundtrip or the 602-check QA myself (rebuilding would also violate the no-mutation constraint). Those claims rest on the provided `site-roundtrip.json` (12/12 true, including all five city pages, pest, and the legacy fixture) and `site-qa.json` (602/602), which share provenance with the author — but the generator logic I verified is exactly what would make the city/legacy roundtrip pass, so the evidence is mechanically consistent. Only one of the three manifests referenced in the first review is present here; I verified the one provided.

✅ SCOPE COMPLETE
