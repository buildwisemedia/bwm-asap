import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(https:\/\/removeasap\.com\/[^<]*)<\/loc>/g)].map((match) => match[1]);
const curated = {
  "/": { phrase: "pest and wildlife removal Metro Atlanta", role: "site-category-owner" },
  "/rodent-removal/": {
    phrase: "rodent removal Metro ATL",
    role: "umbrella-router",
    routes_to_distinct_owners: [
      "/wildlife/mouse-rat/",
      "/wildlife/gray-squirrel/",
      "/wildlife/raccoon/",
      "/wildlife/bats/"
    ],
    protected_from_title_h1: [
      "rat and mouse removal Metro ATL",
      "squirrel removal Metro ATL",
      "raccoon removal Metro ATL",
      "bat removal Metro ATL"
    ]
  },
  "/wildlife/mouse-rat/": { phrase: "rat and mouse removal Metro ATL", role: "specific-service-owner" },
  "/wildlife/gray-squirrel/": { phrase: "squirrel removal Metro ATL", role: "specific-service-owner" },
  "/wildlife/raccoon/": { phrase: "raccoon removal Metro ATL", role: "specific-service-owner" },
  "/wildlife/bats/": { phrase: "bat removal Metro ATL", role: "specific-service-owner" },
  "/pest-control-services/": { phrase: "pest control services Metro Atlanta", role: "site-category-owner" },
  "/wildlife-removal-canton/": { phrase: "pest and wildlife removal Canton Georgia", role: "mixed-service-city-owner" },
  "/wildlife-removal-woodstock/": { phrase: "pest and wildlife removal Woodstock Georgia", role: "mixed-service-city-owner" },
  "/wildlife-removal-acworth/": { phrase: "pest and wildlife removal Acworth Georgia", role: "mixed-service-city-owner" },
  "/wildlife-removal-kennesaw/": { phrase: "pest and wildlife removal Kennesaw Georgia", role: "mixed-service-city-owner" },
  "/wildlife-removal-cartersville/": { phrase: "pest and wildlife removal Cartersville Georgia", role: "mixed-service-city-owner" }
};

function localPath(url) {
  const path = new URL(url).pathname;
  return path === "/" ? "index.html" : `${path.replace(/^\//, "")}index.html`;
}

function textTitle(html, fallback) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return (match?.[1] || fallback).replace(/&amp;/g, "&").replace(/\s*[|–-]\s*ASAP.*$/i, "").trim();
}

const pages = urls.map((url) => {
  const path = new URL(url).pathname;
  const file = localPath(url);
  const decision = curated[path];
  let title = path;
  try { title = textTitle(readFileSync(join(root, file), "utf8"), path); } catch { /* audited separately */ }
  return {
    url,
    local_file: file,
    owner_phrase: decision?.phrase || title.toLowerCase(),
    owner_type: decision ? "curated-exact" : "legacy-title-derived",
    intent_role: decision?.role || "legacy-page-owner",
    ...(decision?.routes_to_distinct_owners ? { routes_to_distinct_owners: decision.routes_to_distinct_owners } : {}),
    ...(decision?.protected_from_title_h1 ? { protected_from_title_h1: decision.protected_from_title_h1 } : {}),
    canonical_required: url,
    h1_required: 1,
    state: decision ? "active-local-review-scope" : "legacy-inventory"
  };
});

const manifest = {
  schema_version: "bwm-seo-intent-ownership/1.0.0-local",
  generated_at: "2026-08-13",
  site: "https://removeasap.com",
  release_state: "local-review",
  policy: "One owner per phrase. City mixed-service intent stays on city pages; animal category intent stays on animal pages; city-by-animal multiplication is prohibited.",
  pages
};

writeFileSync(join(root, "seo-intent-ownership.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, pages: pages.length, curated: Object.keys(curated).length }));
