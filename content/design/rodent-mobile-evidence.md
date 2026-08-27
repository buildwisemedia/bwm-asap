# Rodent responsive evidence

State: local/private review. Artifact SHA-256: `6630558cda0e4cca81ee54095103bddd2e4f45c3c0c21151465c531f8c5f713f`.

The enforced browser matrix is 1440 DPR2; 980/768/641 DPR2; 390 DPR1/2/3; and 320 DPR2. At every size the gate checks horizontal overflow, browser/console errors, broken images, keyboard-openable navigation, 44 px header contact targets through 980 px, settled anchor position below the sticky header, and zero `/api/` requests. A separate JavaScript-disabled run confirms the private fixture remains disabled and inert.

Responsive hero selection is explicit and sharp:

- 390 DPR1 → 420 px mobile WebP (54,638 bytes).
- 390 DPR2/3 → 700 px medium WebP (138,774 bytes); DPR3 uses the sharpest available non-upscaled mobile candidate.
- 641 px and above → 1,100 px full WebP (288,540 bytes).
- Exactly one matching hero resource may load per run.

The page uses local `"Arial Narrow", Arial, sans-serif` display fallbacks and Arial/Helvetica body copy, with no remote font request. This file records rendered prelaunch evidence, not field performance, deployment, or human approval.

Client input hold: Mark Carroll’s quote and name remain, but the broken portrait is intentionally omitted on the Rodent page until the client supplies or approves a valid replacement portrait. No asset was fabricated or edited.
