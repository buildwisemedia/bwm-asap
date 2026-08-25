# Rodent prelaunch performance budget

State: local/review static budget, not Lighthouse or field-performance proof.

| Resource | Measured bytes | Budget | Result |
|---|---:|---:|---|
| Rodent HTML | 20,725 | 200,000 | PASS |
| Shared close CSS | 17,146 | 50,000 | PASS |
| Shared close JavaScript | 3,882 | 20,000 | PASS |
| Hero animal WebP (`assets/images/animals/rat-navy-optimized.webp`) | 124,920 | 200,000 | PASS |
| Rodent page logo PNG (`assets/images/page-logos/rodent.png`) | 25,730 | 100,000 | PASS |

- Images declare width and height.
- The page has no client framework, scroll-reveal dependency, autoplay media, or externally loaded webfont.
- Reduced-motion parity is present in the shared stylesheet.
- No Lighthouse binary was available in the local environment, so no Lighthouse score or real-user performance claim is made.
