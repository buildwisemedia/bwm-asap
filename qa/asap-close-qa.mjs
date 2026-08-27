import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const routes = [
  "rodent-removal", "wildlife/mouse-rat", "wildlife/gray-squirrel", "wildlife/raccoon", "wildlife/bats",
  "wildlife-removal-canton", "wildlife-removal-woodstock", "wildlife-removal-acworth", "wildlife-removal-kennesaw", "wildlife-removal-cartersville",
  "pest-control-services"
];
const alignedAnimalRoutes = new Set([
  "rodent-removal", "wildlife/mouse-rat", "wildlife/gray-squirrel", "wildlife/raccoon", "wildlife/bats"
]);
const privateReviewRoutes = new Set(["rodent-removal"]);
const sitemapXml = readFileSync(join(root, "sitemap.xml"), "utf8");
const sitemapRoutes = new Set([...sitemapXml.matchAll(/<loc>https:\/\/removeasap\.com\/([^<]+)<\/loc>/g)].map((match) => match[1].replace(/\/$/, "")));
const cities = ["Canton", "Woodstock", "Acworth", "Kennesaw", "Cartersville"];
const badTokens = ["#0c2340", "#a6411d", "#dc5b2a", "#8d3718", "#ffb38f", "770-450-1744", "7704501744"];
const results = [];
const budgets = {
  "rodent-removal/index.html": 200_000,
  "assets/css/asap-animal-v2.css": 50_000,
  "assets/js/asap-close.js": 20_000,
  "assets/images/animals/hero-v2/rodent-hero-mobile.webp": 80_000,
  "assets/images/animals/hero-v2/rodent-hero-medium.webp": 160_000,
  "assets/images/animals/hero-v2/rodent-hero.webp": 320_000,
  "assets/images/page-logos/rodent.png": 100_000
};
const heroAssetBuilder = readFileSync(join(root, "tools/build-asap-hero-assets.sh"), "utf8");
check(heroAssetBuilder.includes("cwebp -quiet -q 92 -alpha_q 100 -m 6 -sharp_yuv -metadata none") && heroAssetBuilder.includes("420 700 840 1260 1400 2100"), "Hero assets: deterministic executable builder binds codec settings and widths");

function check(ok, label, detail = "") {
  results.push({ ok: Boolean(ok), label, detail });
}
function count(html, pattern) { return [...html.matchAll(pattern)].length; }
function strip(url) { return url.replace("https://removeasap.com/", ""); }
function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function plainText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

for (const [path, ceiling] of Object.entries(budgets)) {
  const size = statSync(join(root, path)).size;
  check(size <= ceiling, `Performance budget: ${path} at or below ${ceiling}B`, `${size}B`);
}

for (const route of routes) {
  const file = join(root, route, "index.html");
  check(existsSync(file), `${route}: file exists`);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  check(statSync(file).size < 200_000, `${route}: HTML budget under 200KB`, `${statSync(file).size}B`);
  check(count(html, /<h1\b/gi) === 1, `${route}: exactly one H1`, `${count(html, /<h1\b/gi)}`);
  check(html.includes(`<link rel="canonical" href="https://removeasap.com/${route}/">`), `${route}: self canonical`);
  check(html.includes('"@type":"FAQPage"'), `${route}: FAQ schema`);
  check(html.includes('"@type":"Service"'), `${route}: Service schema`);
  check(html.includes('"@type":"BreadcrumbList"'), `${route}: breadcrumb schema`);
  check(html.includes("770-691-3636") && html.includes("+17706913636"), `${route}: correct phone display and tel`);
  check(!badTokens.some((token) => html.toLowerCase().includes(token.toLowerCase())), `${route}: no rejected token or phone`);
  check((alignedAnimalRoutes.has(route) ? html.includes("/assets/css/asap-animal-v2.css?v=1") && html.includes('data-font-source="fallback"') : html.includes("/assets/css/asap-close.css")) && html.includes("/assets/js/asap-close.js"), `${route}: shared pattern assets and scoped cache alignment`);
  check(alignedAnimalRoutes.has(route)
    ? !html.includes("use.typekit.net") && !html.includes("Typekit.load")
    : html.includes("https://use.typekit.net/dmg8gvn.js") && html.includes("Typekit.load({async:true})"),
  `${route}: font source matches approved local scope`);
  const privateReview = privateReviewRoutes.has(route);
  check(privateReview === html.includes('data-build-state="local-review"'), `${route}: declared build state matches route classification`);
  check(privateReview === html.includes('<meta name="robots" content="noindex,nofollow,noarchive">'), `${route}: robots state matches route classification`);
  check(privateReview === html.includes('data-integration-state="fixture-only"'), `${route}: fixture exists only on private review`);
  check(html.includes("skip-link"), `${route}: skip link present`);
  if (privateReview) {
    for (const field of ["lead_id", "source_page", "utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"]) check(html.includes(`name="${field}"`), `${route}: attribution field ${field}`);
    check(html.includes('aria-live="polite"'), `${route}: fixture live status present`);
  }
  if (sitemapRoutes.has(route)) {
    check(!html.includes("noindex") && !html.includes('data-build-state="local-review"') && !html.includes('data-integration-state="fixture-only"') && !/review fixture|local\/review|private review/i.test(plainText(html)), `${route}: sitemap/indexable page has no review contradiction or fixture`);
  }
  if (html.includes('aria-labelledby="reviews-title"')) {
    check(html.includes('id="reviews-title"'), `${route}: reviews section has an accessible name`);
    check(!html.includes("5 out of 5 stars") && html.includes('<div class="stars" aria-hidden="true">'), `${route}: review motif does not assert an unverified rating`);
  }
  if (route === "pest-control-services" || route.startsWith("wildlife-removal-")) {
    check(html.includes('<div class="contact-copy">') && html.includes('<a class="button button--cream" href="/contact/">Request an estimate</a>'), `${route}: shared contact CTA uses the protected cream-button class`);
  }
  check(!/<img(?![^>]*\balt=)[^>]*>/i.test(html), `${route}: every image has alt attribute`);
}

const acworth = readFileSync(join(root, "wildlife-removal-acworth/index.html"), "utf8");
check(acworth.includes("Beavers") && !acworth.includes("Mice</h3>"), "Acworth: beavers replace mice in animal grid");
for (const city of cities) {
  const slug = `wildlife-removal-${city.toLowerCase()}`;
  const html = readFileSync(join(root, slug, "index.html"), "utf8");
  check(html.includes(`Pest and Wildlife Removal in ${city}, Georgia`), `${city}: exact page title framing`);
  check(html.includes("service-map") && html.includes("Schematic service-area context"), `${city}: accessible schematic map`);
  check(html.includes("Dedicated pest-control section"), `${city}: dedicated pest-control section`);
  check(html.includes("From evidence to a property-specific plan"), `${city}: flashlight inspection pattern`);
}

const bat = readFileSync(join(root, "wildlife/bats/index.html"), "utf8");
check(bat.includes("April 1 through July 31"), "Bat: client-requested maternity date window stated");
check(bat.includes("does not mean every bat-related service stops"), "Bat: maternity claim is not a blanket blackout");
check(bat.includes("current guidance") && bat.includes("Site conditions"), "Bat: current guidance and property conditions qualify timing");
check(bat.includes("guano") && bat.includes("DSV-labeled") && bat.includes("insulation"), "Bat: guano, DSV-label, and insulation scope present");

const rat = readFileSync(join(root, "wildlife/mouse-rat/index.html"), "utf8");
check(rat.includes("Recurring bait stations") && rat.includes("Do mice and rats cause any diseases?"), "Rat/mouse: recurring stations and disease FAQ");
const ratMeta = rat.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
check(ratMeta.length >= 150 && ratMeta.length <= 160, "Rat/mouse: meta description is 150–160 characters", `${ratMeta.length}`);

const rodent = readFileSync(join(root, "rodent-removal/index.html"), "utf8");
const rodentSubmitButtons = [...rodent.matchAll(/<button\b[^>]*type="submit"[^>]*>([\s\S]*?)<\/button>/gi)].map((match) => plainText(match[1]));
const rodentVisibleText = plainText(rodent.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, ""));
const rodentSchema = JSON.parse(rodent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1] || "{}");
const rodentServiceSchema = rodentSchema["@graph"]?.find((item) => item["@type"] === "Service");
const rodentBreadcrumbSchema = rodentSchema["@graph"]?.find((item) => item["@type"] === "BreadcrumbList");
const homepageReviewUrl = "https://www.google.com/maps?cid=7456357551456980082";
check(rodentSubmitButtons.length === 1 && rodentSubmitButtons[0] === "SUBMIT", "Rodent: submit button text is exactly SUBMIT", rodentSubmitButtons.join(", "));
check(rodent.includes("<title>Rodent Removal in Metro Atlanta | ASAP Pest &amp; Wildlife</title>"), "Rodent: title uses the brand once in a natural SEO title");
check(rodentServiceSchema?.name === "Rodent Removal" && rodentBreadcrumbSchema?.itemListElement?.at(-1)?.name === "Rodent Removal", "Rodent: Service and Breadcrumb schema use clean human names");
check(rodent.includes('<p class="kicker">Helpful answers about rodent removal</p>') && !rodent.includes("Rodent Removal | Mice, Rats &amp; Squirrels | ASAP FAQ"), "Rodent: visible FAQ kicker is natural client copy");
check(!rodent.includes("Answer first") && rodent.includes("Not sure what is in your home?"), "Rodent: homeowner language replaces architecture labels");
check(rodent.includes("What animals does this rodent page cover?") && rodent.includes("Which service page should I use?") && rodent.includes("What should I note before the inspection?"), "Rodent: umbrella FAQs identify and route without duplicating rat/mouse service FAQs");
check(!rodent.includes("Is trapping enough?") && !rodent.includes("Can bait stations be part of a rodent plan?"), "Rodent: trapping and bait FAQ ownership stays on the rat/mouse page");
check(count(rodent, new RegExp(homepageReviewUrl.replace(/[?]/g, "\\?"), "g")) === 4 && !rodent.includes("/maps/place/"), "Rodent: every review link reuses the homepage Google review destination");
check(![/local\/review/i, /private review/i, /review fixture/i, /held for review/i, /editorial gap/i, /internal scaffolding/i].some((pattern) => pattern.test(rodentVisibleText)), "Rodent: no client-visible internal or review scaffolding");
check(!rodent.includes('class="flashlight"') && !/flashlight placeholder/i.test(rodentVisibleText), "Rodent: no flashlight placeholder");
check(!/droppings[- ]photo placeholder/i.test(rodentVisibleText) && !/data-placeholder=["']droppings-photo["']/i.test(rodent), "Rodent: no droppings-photo placeholder");
check(rodent.includes('data-integration-state="fixture-only"') && rodent.includes('<meta name="robots" content="noindex,nofollow,noarchive">'), "Rodent: fixture-only machine behavior and noindex are preserved");
const closeJs = readFileSync(join(root, "assets/js/asap-close.js"), "utf8");
check(closeJs.includes("No request was sent and no customer record was created.") && !/Monday\.com|Make\.com/i.test(closeJs), "Animal forms: local submission message is client-safe, vendor-neutral, and explicitly no-send");
check(rodent.includes('action="#estimate"') && rodent.includes("disabled data-fixture-submit") && rodent.includes("<noscript><p class=\"form-status\">Online requests are turned off"), "Rodent: fixture has an inert no-JS fallback and no API action");
check(!rodent.includes("/api/lead-intent"), "Rodent: fixture HTML has no nonexistent API endpoint");
check(rodent.includes('class="mobile-nav"') && rodent.includes('aria-label="Mobile navigation"') && rodent.includes("<summary>Menu</summary>"), "Rodent: native keyboard-accessible mobile navigation is present");
check(!rodent.includes('<link rel="preload" as="image"'), "Rodent: no conflicting hero preload duplicates picture selection");
check(rodent.includes('rodent-hero-420.webp 420w') && rodent.includes('rodent-hero-840.webp 840w') && rodent.includes('rodent-hero-1260.webp 1260w') && rodent.includes('rodent-hero-2100.webp 2100w'), "Rodent: responsive hero exposes physical-pixel-safe width candidates");
const raccoonResponsiveHtml = readFileSync(join(root, "wildlife/raccoon/index.html"), "utf8");
check(!raccoonResponsiveHtml.includes("undefined") && raccoonResponsiveHtml.includes('raccoon-hero-1260.webp 1260w') && raccoonResponsiveHtml.includes('raccoon-hero-2100.webp 2100w'), "Raccoon: responsive hero exposes physical-pixel-safe width candidates");
const rodentIntentTargets = [
  ["rat-mouse", "/wildlife/mouse-rat/"],
  ["squirrel", "/wildlife/gray-squirrel/"],
  ["raccoon", "/wildlife/raccoon/"],
  ["bat", "/wildlife/bats/"]
];
check(rodent.includes('data-intent-role="umbrella-support"'), "Rodent: explicit umbrella-support role");
for (const [target, href] of rodentIntentTargets) {
  check(rodent.includes(`data-intent-target="${target}"`) && rodent.includes(`href="${href}"`), `Rodent: routes ${target} to distinct owner`);
}
check((rodent.match(/Not a rodent/g) || []).length === 2, "Rodent: raccoon and bat are labeled non-rodent lookalikes");
check(rodent.includes("CDC says not to sweep or vacuum dry rodent waste") && rodent.includes("www.cdc.gov/healthy-pets/rodent-control/clean-up.html"), "Rodent: safe-cleanup language cites CDC");
check(rodent.includes("UGA Extension notes that attic noise can come from mice, bats, squirrels, raccoons") && rodent.includes("extension.uga.edu/publications/detail.html?number=B1248"), "Rodent: symptom routing cites UGA");
check(rodent.includes("Georgia DNR bat guidance") && rodent.includes("georgiawildlife.com/index.php/ExcludingBatsFromYourHouse"), "Rodent: bat routing cites current Georgia DNR guidance");

const rodentLogo = readFileSync(join(root, "assets/images/page-logos/rodent.png"));
check(createHash("sha256").update(rodentLogo).digest("hex") === "c159022ecec17adfa01f45b266be5ac20b1515355a7163785bda589ed7f06358", "Rodent: client-supplied logo hash matches rights manifest");

const home = readFileSync(join(root, "index.html"), "utf8");
check(home.includes("/assets/images/wildlife-grid/gray-squirrel.png"), "Homepage: gray squirrel image matches page pattern");
check(home.includes("770-691-3636") && !home.includes("770-450-1744") && !home.includes("7704501744"), "Homepage: correct phone present and wrong phone removed");

const articleInventory = JSON.parse(readFileSync(join(root, "content/asap-article-inventory.json"), "utf8"));
check(articleInventory.pages.length === 5, "Article inventory: five core pages");
check(articleInventory.pages.every((page) => page.service === "Rodent Removal" ? page.slots.length === 2 : page.slots.length === 3), "Article inventory: Rodent has two approved links and sibling pages retain three slots");
check(articleInventory.pages.some((page) => page.slots.some((slot) => slot.status === "Editorial gap")), "Article inventory: gaps explicit");
const heldArticleSlots = articleInventory.pages.flatMap((page) => page.slots).filter((slot) => slot.url);
check(new Set(heldArticleSlots.map((slot) => slot.url)).size === 9, "Article inventory: nine distinct held Medium sources remain traceable internally");
check(heldArticleSlots.every((slot) => slot.status === "Held for review"), "Article inventory: every existing Medium source is marked held for review");

const lineup = JSON.parse(readFileSync(join(root, "content/design/animal-lineup-manifest.json"), "utf8"));
const namedPaths = [
  "rodent-removal/index.html",
  "wildlife/mouse-rat/index.html",
  "wildlife/gray-squirrel/index.html",
  "wildlife/raccoon/index.html",
  "wildlife/bats/index.html"
];
check(lineup.schema_version === "asap-animal-lineup/1.0.0", "Animal lineup: schema version is explicit");
check(lineup.lineup_source?.named_pages === 5 && lineup.pages?.length === 5, "Animal lineup: five explicit named pages, not an invented sixth");
check(lineup.lineup_source?.ambiguity_boundary?.includes("says 'six pages'") && lineup.lineup_source?.ambiguity_boundary?.includes("does not invent"), "Animal lineup: six-versus-five source ambiguity is preserved");
check(namedPaths.every((path) => lineup.pages.some((page) => page.path === path)), "Animal lineup: all five approved named paths are bound");
check(new Set(lineup.pages.map((page) => page.path)).size === 5, "Animal lineup: page paths are unique");
check(new Set(lineup.pages.map((page) => page.owner_phrase)).size === 5, "Animal lineup: owner phrases are unique");

for (const page of lineup.pages) {
  const htmlBuffer = readFileSync(join(root, page.path));
  const html = htmlBuffer.toString("utf8");
  const title = plainText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  const h1 = plainText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
  const logoBuffer = readFileSync(join(root, page.logo_path));
  check(sha256(htmlBuffer) === page.page_sha256, `Animal lineup: ${page.path} exact artifact hash`);
  check(sha256(logoBuffer) === page.logo_sha256, `Animal lineup: ${page.path} logo rights hash`);
  check(title === page.title, `Animal lineup: ${page.path} exact title`, title);
  check(h1 === page.h1, `Animal lineup: ${page.path} exact visible H1`, h1);
  check(html.includes(`src="/${page.logo_path}"`), `Animal lineup: ${page.path} uses its bound page logo`);
  const isReviewPage = page.url_path === "/rodent-removal/";
  check(isReviewPage ? html.includes(`data-source-page="${page.url_path}"`) : !html.includes("data-asap-lead-form"), `Animal lineup: ${page.path} form state matches review/indexable classification`);
  check(!html.includes("AggregateRating") && !html.includes("ratingValue"), `Animal lineup: ${page.path} does not publish an aggregate-rating claim`);
  check(count(html, /class="article-card(?:\s|\")/g) === (page.role === "umbrella-router" ? 2 : 0), `Animal lineup: ${page.path} exposes articles only on the private-review router`);
  check(page.role === "umbrella-router" ? count(html, /medium\.com\//g) === 2 : !html.includes("medium.com/"), `Animal lineup: ${page.path} publishes only authorized article links`);
}

const ratLineup = lineup.pages.find((page) => page.url_path === "/wildlife/mouse-rat/");
check(ratLineup && rat.includes("species-aware") && rat.includes("Recurring bait stations") && rat.includes("scoped separately from trapping or baiting") && rat.includes("Risk varies by species, exposure, and site conditions"), "Animal lineup: rat/mouse proof stays species-, control-, exclusion-, and exposure-qualified");
const squirrel = readFileSync(join(root, "wildlife/gray-squirrel/index.html"), "utf8");
check(squirrel.includes("Gray and Flying Squirrel Control") && squirrel.includes("Dependent young can change") && squirrel.includes("only after the active-animal plan is clear"), "Animal lineup: squirrel proof preserves species and dependent-young timing");
const raccoon = readFileSync(join(root, "wildlife/raccoon/index.html"), "utf8");
check(raccoon.includes("possible young") && raccoon.includes("Not until the active-animal and possible-young situation is understood") && raccoon.includes("Evaluate droppings, nesting material, odor, and insulation before specifying cleanup"), "Animal lineup: raccoon proof blocks premature sealing and invented cleanup scope");
check(bat.includes("April 1 through July 31") && bat.includes("does not mean every bat-related service stops") && bat.includes("Guano and insulation") && bat.includes("DSV-labeled"), "Animal lineup: bat proof preserves season, service, cleanup, and label boundaries");
check(rodentIntentTargets.every(([target, href]) => rodent.includes(`data-intent-target="${target}"`) && rodent.includes(`href="${href}"`)), "Animal lineup: umbrella routes to all four protected owners");
check(lineup.pages.every((page) => {
  const inventoryPage = articleInventory.pages.find((item) => item.page === page.url_path || item.page_path === page.url_path || item.path === page.url_path || item.url === page.url_path);
  return inventoryPage ? inventoryPage.slots.length === (page.role === "umbrella-router" ? 2 : 3) : false;
}), "Animal lineup: every named page has its authorized inventory record");
check(lineup.shared_contract?.missing_articles_must_remain_explicit_gaps === true && lineup.human_and_release_gates?.some((gate) => gate.includes("not published articles")), "Animal lineup: editorial gaps stay explicit and unpublished");

const rightsLedger = JSON.parse(readFileSync(join(root, "content/design/animal-asset-rights-ledger.json"), "utf8"));
const rightsAssets = [...rightsLedger.client_supplied_page_logos, ...rightsLedger.existing_client_site_assets];
check(rightsLedger.schema_version === "asap-animal-asset-rights/1.0.0", "Asset rights: schema version is explicit");
check(rightsLedger.phase === 3 && rightsLedger.local_review_clear === true && rightsLedger.production_clear === false, "Asset rights: local-review clearance stays distinct from production clearance");
check(rightsLedger.client_supplied_page_logos.length === 5, "Asset rights: five client-supplied page logos are bound");
check(rightsLedger.existing_client_site_assets.length === 48, "Asset rights: original, responsive, optimized, and permitted homepage review assets are bound");
const derivativeSourceDimensions = rightsLedger.derivative_source_dimensions || {};
for (const [sourcePath, recorded] of Object.entries(derivativeSourceDimensions)) {
  const metadata = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", join(root, sourcePath)], { encoding: "utf8" });
  const width = Number(metadata.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(metadata.match(/pixelHeight:\s*(\d+)/)?.[1]);
  check(width === recorded.width && height === recorded.height, `Asset provenance: ${sourcePath} native dimensions are truthful`, `${width}x${height}`);
}
const rasterDerivatives = rightsLedger.existing_client_site_assets.filter((asset) => /\/hero-v2\/[^/]+-(?:420|700|840|1260|1400|2100)\.webp$/.test(asset.path));
check(rasterDerivatives.length === 24 && rasterDerivatives.every((asset) => derivativeSourceDimensions[asset.derivative_source]), "Asset provenance: every raster hero derivative resolves to a measured native source");
check(rasterDerivatives.every((asset) => !/recover(?:ed|s)? detail|enhanc(?:ed|es)? detail/i.test(asset.transformation || "")), "Asset provenance: no resize claims recovered source detail");
for (const asset of rightsAssets) {
  const assetBuffer = readFileSync(join(root, asset.path));
  check(sha256(assetBuffer) === asset.sha256, `Asset rights: ${asset.path} SHA-256 matches ledger`);
}
for (const page of lineup.pages) {
  const html = readFileSync(join(root, page.path), "utf8");
  const imagePaths = [
    ...html.matchAll(/<img[^>]+src="\/([^"?#]+)[^"]*"/gi),
    ...html.matchAll(/(?:srcset)="([^"]+)"/gi)
  ].flatMap((match) => match[0].startsWith("srcset")
    ? match[1].split(",").map((candidate) => candidate.trim().split(/\s+/)[0].replace(/^\//, ""))
    : [match[1]]);
  check(imagePaths.every((path) => rightsAssets.some((asset) => asset.path === path)), `Asset rights: ${page.path} uses only bound visual assets`, imagePaths.join(", "));
  const faviconPath = html.match(/<link[^>]+rel="icon"[^>]+href="\/([^"?#]+)[^"]*"/i)?.[1];
  check(faviconPath && rightsAssets.some((asset) => asset.path === faviconPath), `Asset rights: ${page.path} favicon is bound`, faviconPath || "missing");
}
check(rightsLedger.visual_asset_boundary?.ai_generated_assets === 0 && rightsLedger.visual_asset_boundary?.new_stock_assets === 0 && rightsLedger.visual_asset_boundary?.cross_client_assets === 0, "Asset rights: no generated, new-stock, or cross-client visual is introduced");
check(rightsLedger.adobe_fonts?.loader_removed_from_candidate_pages === true && rightsLedger.adobe_fonts?.production_clear === true, "Asset rights: five-page candidate no longer depends on Adobe Fonts");
check(rightsLedger.medium_articles?.distinct_existing_links === 9 && rightsLedger.medium_articles?.items?.length === 9, "Asset rights: nine distinct existing Medium links are inventoried");
check(rightsLedger.medium_articles?.items?.every((item) => item.status === "hold"), "Asset rights: every Medium link remains on editorial hold");
check(rightsLedger.medium_articles?.hold_semantics?.includes("withheld from all five") && rightsLedger.medium_articles?.hold_semantics?.includes("traceable"), "Asset rights: Medium hold semantics match the exact artifact");
check(rightsLedger.medium_articles?.body_content_copied_into_site === false, "Asset rights: no Medium body content is copied into the site");
check(rightsLedger.page_proof?.production_clear === false && rightsLedger.page_proof?.named_google_review_excerpts === 3, "Asset rights: three verified review excerpts remain human-approval gated");
check(rightsLedger.intent_adjacency?.five_page_set_cannibalization === false && rightsLedger.intent_adjacency?.production_clear === false, "Asset rights: five-page intent passes while legacy adjacency remains open");
check(rightsLedger.promotion_hygiene?.css_cache_buster_aligned === true && rightsLedger.promotion_hygiene?.artifact_change_warning?.includes("successor candidate manifest"), "Asset rights: cache-buster is aligned and bound to successor verification");
check(rightsLedger.tagline_color_reconciliation?.includes("CreamTagline") && rightsLedger.tagline_color_reconciliation?.includes("white-tagline"), "Asset rights: cream-versus-white tagline wording is reconciled");
check(rightsLedger.open_gates?.length === 4, "Asset rights: four remaining human/release gates are explicit");

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
for (const route of routes.filter((route) => route !== "rodent-removal")) check(sitemap.includes(`https://removeasap.com/${route}/`), `${route}: included in sitemap`);
check(!sitemap.includes("https://removeasap.com/rodent-removal/"), "Rodent: clean review primary is not prematurely added to production sitemap");
check(sitemap.includes("https://removeasap.com/peace-of-mind-from/rodents/"), "Rodent: current production URL remains in sitemap until authorized launch migration");
const intent = JSON.parse(readFileSync(join(root, "seo-intent-ownership.json"), "utf8"));
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
check(intent.pages.length === sitemapUrls.length, "SEO intent: private review owner replaces current production owner one-for-one", `${intent.pages.length}/${sitemapUrls.length}`);
check(new Set(intent.pages.map((page) => page.owner_phrase)).size === intent.pages.length, "SEO intent: owner phrases are unique");
for (const route of routes) {
  const url = `https://removeasap.com/${route}/`;
  check(intent.pages.some((page) => page.url === url && page.owner_type === "curated-exact"), `${route}: curated intent owner`);
}
const rodentDecision = intent.pages.find((page) => page.url === "https://removeasap.com/rodent-removal/");
check(rodentDecision?.intent_role === "umbrella-router", "SEO intent: rodent page is an umbrella router");
check(rodentDecision?.routes_to_distinct_owners?.length === 4, "SEO intent: rodent router names four distinct owners");
check(rodentDecision?.protected_from_title_h1?.length === 4, "SEO intent: four specific phrases protected from rodent title/H1");
const rodentTitleH1 = `${rodent.match(/<title>(.*?)<\/title>/i)?.[1] || ""} ${rodent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""}`.replace(/<[^>]+>/g, " ").toLowerCase();
for (const protectedPhrase of rodentDecision?.protected_from_title_h1 || []) {
  check(!rodentTitleH1.includes(protectedPhrase.toLowerCase()), `SEO intent: rodent title/H1 does not claim ${protectedPhrase}`);
}

const closeCss = readFileSync(join(root, "assets/css/asap-close.css"), "utf8");
const animalCss = readFileSync(join(root, "assets/css/asap-animal-v2.css"), "utf8");
const css = `${closeCss}\n${animalCss}`;
for (const token of ["#f2eddc", "#212936", "#333333", "#b77537", "#ffffff"]) check(css.includes(token), `CSS: required token ${token}`);
check(css.includes("prefers-reduced-motion"), "CSS: reduced-motion parity");
check(css.includes("min-height: 50px") && css.includes("min-height: 52px"), "CSS: touch/input targets exceed 44px");
check(css.includes(".header-contact a { display: inline-flex; min-width: 44px; min-height: 44px") && css.includes(".mobile-nav summary"), "CSS: mobile contact and menu targets meet 44px preference");
check(!css.includes("#estimate, #reviews-title, #faq-title, #bait-station-title { scroll-margin-top"), "CSS: anchor offset is applied once through scroll padding");
check(css.includes("--sticky-offset: 164px;") && css.includes(".rodent-page { --sticky-offset: 184px; }") && css.includes(":root { --sticky-offset: 152px; }") && css.includes(".rodent-page { --sticky-offset: 152px; }") && css.includes(":root { --sticky-offset: 134px; }") && css.includes(".rodent-page { --sticky-offset: 134px; }"), "CSS: page-specific and responsive sticky offsets clear the measured header heights");
check(css.includes(".contact-copy a:not(.button) { color: var(--cream); }") && css.includes(".contact-copy .button--cream { color: var(--navy); }"), "CSS: cream CTA retains navy text inside contact copy");
const legacyRodent = readFileSync(join(root, "peace-of-mind-from/rodents/index.html"), "utf8");
check(legacyRodent.includes('class="animal-page legacy-rodent-page"') && css.includes(".legacy-rodent-page { --sticky-offset: 164px; }") && css.includes(".legacy-rodent-page { --sticky-offset: 182px; }") && css.includes(".legacy-rodent-page { --sticky-offset: 215px; }"), "Legacy Rodent: page-specific responsive anchor offsets cover the taller retained header");
const closeNavRule = closeCss.match(/\.nav-list a\s*\{([^}]+)\}/)?.[1] || "";
check(closeNavRule.includes("color: var(--orange-dark)") && !closeNavRule.includes("color: var(--orange);"), "CSS: shared small cream-canvas navigation uses dark orange in the correct stylesheet rule");
check(!closeCss.match(/\.nav-list a\s*\{[^}]*color:\s*var\(--orange\);/), "CSS: shared navigation cannot regress to the 3.19:1 orange token");
const legacyFixture = readFileSync(join(root, "peace-of-mind-from/rodents/index.html"), "utf8");
check(legacyFixture.includes('action="#estimate"') && legacyFixture.includes("disabled data-fixture-submit") && legacyFixture.includes("<noscript><p class=\"form-status\">Online requests are turned off"), "Legacy Rodent: no-JS form is inert and visibly disabled");
check(!legacyFixture.includes("/api/lead-intent"), "Legacy Rodent: fixture HTML contains zero API action targets");

const headers = readFileSync(join(root, "_headers"), "utf8");
check(headers.includes("/rodent-removal/*") && headers.includes("X-Robots-Tag: noindex, nofollow, noarchive") && headers.includes("coordinated production"), "Headers: private Rodent route has a documented noindex backstop");

const failures = results.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failures.length === 0, checks: results.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
