import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const routes = [
  "peace-of-mind-from/rodents", "wildlife/mouse-rat", "wildlife/gray-squirrel", "wildlife/raccoon", "wildlife/bats",
  "wildlife-removal-canton", "wildlife-removal-woodstock", "wildlife-removal-acworth", "wildlife-removal-kennesaw", "wildlife-removal-cartersville",
  "pest-control-services"
];
const cities = ["Canton", "Woodstock", "Acworth", "Kennesaw", "Cartersville"];
const badTokens = ["#0c2340", "#a6411d", "#dc5b2a", "#8d3718", "#ffb38f", "770-450-1744", "7704501744"];
const results = [];

function check(ok, label, detail = "") {
  results.push({ ok: Boolean(ok), label, detail });
}
function count(html, pattern) { return [...html.matchAll(pattern)].length; }
function strip(url) { return url.replace("https://removeasap.com/", ""); }

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
  check(html.includes("/assets/css/asap-close.css") && html.includes("/assets/js/asap-close.js"), `${route}: shared pattern assets`);
  check(html.includes("data-asap-lead-form") && html.includes('data-integration-state="fixture-only"'), `${route}: form fixture state`);
  for (const field of ["lead_id", "source_page", "utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"]) {
    check(html.includes(`name="${field}"`), `${route}: attribution field ${field}`);
  }
  check((html.includes("Local/review fixture") && html.includes("sends nothing")) || html.includes("no external delivery"), `${route}: no-send state disclosed`);
  check(html.includes("skip-link") && html.includes('aria-live="polite"'), `${route}: skip link and live form state`);
  if (html.includes('aria-labelledby="reviews-title"')) {
    check(html.includes('id="reviews-title"'), `${route}: reviews section has an accessible name`);
    check(!html.includes("5 out of 5 stars") && html.includes('<div class="stars" aria-hidden="true">'), `${route}: review motif does not assert an unverified rating`);
  }
  check(!/<img(?![^>]*\balt=)[^>]*>/i.test(html), `${route}: every image has alt attribute`);
}

const acworth = readFileSync(join(root, "wildlife-removal-acworth/index.html"), "utf8");
check(acworth.includes("Beavers") && !acworth.includes("Mice</h3>"), "Acworth: beavers replace mice in animal grid");
for (const city of cities) {
  const slug = `wildlife-removal-${city.toLowerCase()}`;
  const html = readFileSync(join(root, slug, "index.html"), "utf8");
  check(html.includes(`Pest and Wildlife Removal in ${city}, Georgia`), `${city}: exact page title framing`);
  check(html.includes("service-map") && html.includes("Schematic service context"), `${city}: accessible held-boundary map`);
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

const rodent = readFileSync(join(root, "peace-of-mind-from/rodents/index.html"), "utf8");
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
check(articleInventory.pages.every((page) => page.slots.length === 3), "Article inventory: exactly three slots per core page");
check(articleInventory.pages.some((page) => page.slots.some((slot) => slot.status === "Editorial gap")), "Article inventory: gaps explicit");

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
for (const route of routes) check(sitemap.includes(`https://removeasap.com/${route}/`), `${route}: included in sitemap`);
const intent = JSON.parse(readFileSync(join(root, "seo-intent-ownership.json"), "utf8"));
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
check(intent.pages.length === sitemapUrls.length, "SEO intent: every sitemap URL has an owner", `${intent.pages.length}/${sitemapUrls.length}`);
check(new Set(intent.pages.map((page) => page.owner_phrase)).size === intent.pages.length, "SEO intent: owner phrases are unique");
for (const route of routes) {
  const url = `https://removeasap.com/${route}/`;
  check(intent.pages.some((page) => page.url === url && page.owner_type === "curated-exact"), `${route}: curated intent owner`);
}
const rodentDecision = intent.pages.find((page) => page.url === "https://removeasap.com/peace-of-mind-from/rodents/");
check(rodentDecision?.intent_role === "umbrella-router", "SEO intent: rodent page is an umbrella router");
check(rodentDecision?.routes_to_distinct_owners?.length === 4, "SEO intent: rodent router names four distinct owners");
check(rodentDecision?.protected_from_title_h1?.length === 4, "SEO intent: four specific phrases protected from rodent title/H1");
const rodentTitleH1 = `${rodent.match(/<title>(.*?)<\/title>/i)?.[1] || ""} ${rodent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ""}`.replace(/<[^>]+>/g, " ").toLowerCase();
for (const protectedPhrase of rodentDecision?.protected_from_title_h1 || []) {
  check(!rodentTitleH1.includes(protectedPhrase.toLowerCase()), `SEO intent: rodent title/H1 does not claim ${protectedPhrase}`);
}

const css = readFileSync(join(root, "assets/css/asap-close.css"), "utf8");
for (const token of ["#f2eddc", "#212936", "#333333", "#b77537", "#ffffff"]) check(css.includes(token), `CSS: required token ${token}`);
check(css.includes("prefers-reduced-motion"), "CSS: reduced-motion parity");
check(css.includes("min-height: 50px") && css.includes("min-height: 52px"), "CSS: touch/input targets exceed 44px");

const failures = results.filter((item) => !item.ok);
console.log(JSON.stringify({ ok: failures.length === 0, checks: results.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
