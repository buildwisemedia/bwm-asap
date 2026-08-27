# Rodent prelaunch performance budget

State: local/private review. Enforced static limits plus rendered resource-selection QA; not field-performance proof.

| Resource | Current bytes | Enforced ceiling |
|---|---:|---:|
| Rodent HTML | 21,150 | 200,000 |
| Animal CSS | 20,302 | 50,000 |
| Form JavaScript | 4,097 | 20,000 |
| Hero mobile (420 px) | 54,638 | 80,000 |
| Hero medium (700 px) | 138,774 | 160,000 |
| Hero full (1,100 px) | 288,540 | 320,000 |
| Rodent logo | 25,730 | 100,000 |

- The browser gate enforces exactly one Rodent hero resource at 390 DPR 1/2/3 and verifies `currentSrc`; no competing preload is emitted.
- The full 1,100 px art remains available from 641 px upward so the animal facing the copy stays sharp; no asset was degraded or upscaled.
- Pages use the local fallback stack `"Arial Narrow", Arial, sans-serif` for display and Arial/Helvetica for body copy. No remote font request is made by animal pages.
- Current artifact hashes: HTML `6630558c…f713f`, CSS `cb13278d…7616`, JavaScript `e4901a3c…d750`.
- Every ceiling in the table is executable in `qa/asap-close-qa.mjs`; Lighthouse and field data are not claimed.
