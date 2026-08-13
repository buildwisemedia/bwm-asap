import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(https:\/\/removeasap\.com\/[^<]*)<\/loc>/g)].map((match) => match[1]);
const curated = {
  "/": "pest and wildlife removal Metro Atlanta",
  "/peace-of-mind-from/rodents/": "rodent removal Metro ATL",
  "/wildlife/mouse-rat/": "rat and mouse removal Metro ATL",
  "/wildlife/gray-squirrel/": "squirrel removal Metro ATL",
  "/wildlife/raccoon/": "raccoon removal Metro ATL",
  "/wildlife/bats/": "bat removal Metro ATL",
  "/pest-control-services/": "pest control services Metro Atlanta",
  "/wildlife-removal-canton/": "pest and wildlife removal Canton Georgia",
  "/wildlife-removal-woodstock/": "pest and wildlife removal Woodstock Georgia",
  "/wildlife-removal-acworth/": "pest and wildlife removal Acworth Georgia",
  "/wildlife-removal-kennesaw/": "pest and wildlife removal Kennesaw Georgia",
  "/wildlife-removal-cartersville/": "pest and wildlife removal Cartersville Georgia"
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
  let title = path;
  try { title = textTitle(readFileSync(join(root, file), "utf8"), path); } catch { /* audited separately */ }
  return {
    url,
    local_file: file,
    owner_phrase: curated[path] || title.toLowerCase(),
    owner_type: curated[path] ? "curated-exact" : "legacy-title-derived",
    canonical_required: url,
    h1_required: 1,
    state: curated[path] ? "active-local-review-scope" : "legacy-inventory"
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
