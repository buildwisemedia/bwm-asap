#!/usr/bin/env python3
"""Static acceptance checks for the August 6 ASAP client-preview surface."""

import json
import re
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CURRENT_PHONE = "7704501744"
OLD_PHONE = "7706913636"
CURRENT_GA4 = "G-GQZJKG5JCK"
OLD_GA4 = "G-8M705Z89TE"

CITY_PAGES = {
    "Acworth": ROOT / "wildlife-removal-acworth/index.html",
    "Canton": ROOT / "wildlife-removal-canton/index.html",
    "Cartersville": ROOT / "wildlife-removal-cartersville/index.html",
    "Kennesaw": ROOT / "wildlife-removal-kennesaw/index.html",
    "Woodstock": ROOT / "wildlife-removal-woodstock/index.html",
}
ANIMAL_PAGES = {
    "Raccoon Removal in Atlanta, GA": ROOT / "wildlife/raccoon/index.html",
    "Bat Removal in Atlanta, GA": ROOT / "wildlife/bats/index.html",
    "Squirrel Removal in Atlanta, GA": ROOT / "wildlife/gray-squirrel/index.html",
    "Rat & Mouse Removal in Atlanta, GA": ROOT / "wildlife/mouse-rat/index.html",
}


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1s = []
        self._in_h1 = False
        self._h1_parts = []
        self.jsonld = []
        self._in_jsonld = False
        self._jsonld_parts = []
        self.visible_parts = []
        self._hidden_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self._in_h1 = True
            self._h1_parts = []
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._jsonld_parts = []
        if tag in {"script", "style", "template"}:
            self._hidden_depth += 1

    def handle_endtag(self, tag):
        if tag == "h1" and self._in_h1:
            self.h1s.append(" ".join("".join(self._h1_parts).split()))
            self._in_h1 = False
        if tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._jsonld_parts))
            self._in_jsonld = False
        if tag in {"script", "style", "template"} and self._hidden_depth:
            self._hidden_depth -= 1

    def handle_data(self, data):
        if self._in_h1:
            self._h1_parts.append(data)
        if self._in_jsonld:
            self._jsonld_parts.append(data)
        if not self._hidden_depth:
            self.visible_parts.append(data)


def parse_page(path):
    html = path.read_text()
    parser = PageParser()
    parser.feed(html)
    for block in parser.jsonld:
        json.loads(block)
    return html, parser


def shingles(text, size=5):
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {tuple(words[index : index + size]) for index in range(len(words) - size + 1)}


city_shingles = {}
for city, path in CITY_PAGES.items():
    html, parsed = parse_page(path)
    assert parsed.h1s == [f"Wildlife Removal in {city}, GA"], (path, parsed.h1s)
    assert CURRENT_PHONE in html and CURRENT_GA4 in html
    assert OLD_PHONE not in html and OLD_GA4 not in html and "intellimize" not in html.lower()
    assert "/ aria-label=" not in html
    city_shingles[city] = shingles(" ".join(parsed.visible_parts))

for left_index, left in enumerate(CITY_PAGES):
    for right in list(CITY_PAGES)[left_index + 1 :]:
        union = city_shingles[left] | city_shingles[right]
        similarity = len(city_shingles[left] & city_shingles[right]) / len(union)
        assert similarity < 0.70, f"City-page similarity too high: {left}/{right}={similarity:.1%}"

for h1, path in ANIMAL_PAGES.items():
    html, parsed = parse_page(path)
    assert parsed.h1s == [h1], (path, parsed.h1s)
    assert CURRENT_PHONE in html and CURRENT_GA4 in html
    assert OLD_PHONE not in html and OLD_GA4 not in html
    assert "/ aria-label=" not in html

rate_html, rate_page = parse_page(ROOT / "rate/index.html")
assert rate_page.h1s == ["How did we do?"]
assert "How could we have made your experience five stars?" in rate_html
assert 'data-rating="1"' in rate_html and 'data-rating="5"' in rate_html
assert 'name="robots" content="noindex,nofollow"' in rate_html
assert "/rate/" not in (ROOT / "sitemap.xml").read_text()

hub_html, hub_page = parse_page(ROOT / "client-preview/nehemiah/index.html")
assert hub_page.h1s == ["ASAP’s next growth layer, ready to review."]
assert "PRIVATE DEVELOPMENT PREVIEW" in hub_html
assert all(str(path.relative_to(ROOT).parent) in hub_html for path in CITY_PAGES.values())
assert all(str(path.relative_to(ROOT).parent) in hub_html for path in ANIMAL_PAGES.values())

headers = (ROOT / "_headers").read_text()
assert "X-Robots-Tag: noindex, nofollow" in headers
assert "Strict-Transport-Security" in headers

bats = (ROOT / "wildlife/bats/index.html").read_text()
assert "April 1" in bats and "July 31" in bats and "Georgia DNR" in bats

print("PASS: 5 city pages, 4 animal pages, review demo, hub, schema, and dev-only headers")
