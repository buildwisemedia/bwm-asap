# ASAP Animal Sales Pages — plain-English Phase 3 choice

State: local/review only. Nothing here authorizes a preview, a client send, a deployment, a provider change, spending, or production.

## QA result first

The five-page website candidate passed current-byte QA before this choice was rewritten:

- all 16 exact candidate files match their recorded SHA-256 hashes;
- all 12 visual assets match their rights/provenance records;
- deterministic QA passes 436/436;
- all five local form fixtures validate without sending an email, creating a CRM item, running Make.com, or contacting a customer;
- all 25 unique local links/assets referenced by the five pages return successfully;
- the protected Fable review passed the exact website candidate with no high or medium findings.

The website pages are not being changed by this packet. The four items below are launch-risk choices, not code failures.

## What the four items mean

### 1. The heading font

The pages use a font delivered from an Adobe account. We have not proved whose Adobe account it is or whether that account covers `removeasap.com`.

Safest choice if the owner is unknown: remove the Adobe connection from these five pages and use the built-in fallback font. The headings will look a little different, but the site will no longer depend on an unverified account or Adobe font delivery.

### 2. The nine article links

Nine `Read more` links go to old Medium articles. The audit found overpromising warranty language, one raccoon/squirrel copy error, and bat health/licensing/timing claims that need current sources.

Safest choice: hide all nine links until the articles are corrected and approved. No article text was copied into these pages.

### 3. The customer reviews

The same three real Google review excerpts are repeated across all five animal pages. They were verified on Google, but none is specifically about a bat job.

Safest choice: keep the verified excerpts on Rodent, Rat + Mouse, Squirrel, and Raccoon, but show an honest proof gap on Bat until a bat-specific review is approved.

### 4. The two squirrel pages

The existing site has a flying-squirrel page. The new candidate also has a broader squirrel page that mentions gray and flying squirrels. Redirecting one page into the other could affect search traffic.

Safest choice: leave both pages separate for now. Do not redirect or merge anything until production planning is separately approved.

## The one decision requested

Reply with one line:

```text
YES — apply the four safest local/review choices
```

or:

```text
NO — leave the five website pages unchanged
```

`YES` authorizes only these local/review changes: remove the Adobe loader from the five candidate pages, hide the nine Medium links, hold Bat-specific proof, and preserve both squirrel URLs. Afterward BWM must rerun deterministic QA, desktop/mobile rendering, performance checks, exact hashes, and protected independent review.

It does not authorize preview exposure, sending anything to James or the client, deployment, redirects, provider/account changes, spending, or production.
