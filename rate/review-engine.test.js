const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const contract = require("./review-engine-contract.js");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const rateFunction = fs.readFileSync(path.join(__dirname, "..", "functions", "rate.js"), "utf8");

test("private feedback payload contains no browser-supplied identity fields", () => {
  const payload = contract.buildResponsePayload({
    request_id: "request-001",
    rating: 2,
    action: "private_feedback",
    feedback: "Synthetic feedback",
    name: "Must be ignored",
    phone: "Must be ignored",
    label: "test-reviewengine-20260813",
    page_url: "https://removeasap.com/rate",
    submission_id: "browser-001"
  });
  assert.deepEqual(Object.keys(payload).sort(), [
    "action", "feedback", "label", "page_url", "rating", "request_id", "submission_id", "website"
  ]);
  assert.equal("name" in payload, false);
  assert.equal("phone" in payload, false);
});

test("GA4 events use the frozen privacy-safe field allowlist", () => {
  const event = contract.buildGa4Event("review_private_feedback_result", {
    score: 3,
    route: "private",
    requestBound: true,
    outcome: "accepted",
    errorCode: "",
    feedback: "must not appear",
    name: "must not appear",
    phone: "must not appear",
    request_id: "must not appear",
    monday_item_id: "must not appear"
  });
  assert.deepEqual(event, {
    event: "review_private_feedback_result",
    review_flow_version: "asap_rate_v1",
    review_score: 3,
    review_route: "private",
    review_request_bound: true,
    review_outcome: "accepted"
  });
});

test("preview mode suppresses GA4 writes", () => {
  const target = {};
  assert.equal(contract.pushGa4(target, "review_rating_selected", { score: 5, route: "google" }, true), false);
  assert.equal(target.dataLayer, undefined);
});

test("live-mode GA4 writes one structured dataLayer event", () => {
  const target = {};
  assert.equal(contract.pushGa4(target, "review_google_handoff", {
    score: 5,
    route: "google",
    requestBound: true,
    outcome: "opened"
  }, false), true);
  assert.deepEqual(target.dataLayer, [{
    event: "review_google_handoff",
    review_flow_version: "asap_rate_v1",
    review_score: 5,
    review_route: "google",
    review_request_bound: true,
    review_outcome: "opened"
  }]);
});

test("unsupported analytics names fail closed", () => {
  assert.throws(() => contract.buildGa4Event("lead", { score: 5 }), /unsupported_review_event/);
});

test("rating page preserves exact routing copy and removes identity inputs", () => {
  assert.match(html, /How could we have made your experience five stars\?/);
  assert.match(html, /already saved with your service record/);
  assert.doesNotMatch(html, /name="name"/);
  assert.doesNotMatch(html, /name="phone"/);
  assert.doesNotMatch(html, /id="rating-name"/);
  assert.doesNotMatch(html, /id="rating-phone"/);
});

test("rating page keeps public Google access and the verified five-star destination", () => {
  const destination = "https://search.google.com/local/writereview?placeid=ChIJV-ndmxkd9YgRcgzlBLBNemc";
  assert.ok(html.includes(destination));
  assert.match(html, /share your experience publicly on Google/);
  assert.ok(rateFunction.includes(destination));
  assert.match(rateFunction, /Response\.redirect\(REVIEW_URL, 302\)/);
});

test("rating page uses the verified phone, current palette, and no old values", () => {
  assert.match(html, /\(770\) 691-3636/);
  assert.doesNotMatch(html, /7704501744|\(770\) 450-1744/);
  assert.match(html, /--navy: #212936/);
  assert.match(html, /--orange: #b77537/);
  assert.match(html, /--cream: #f2eddc/);
  assert.doesNotMatch(html, /#1B2A4A|#E87A2E/);
});

test("rating page is noindex and the sitemap excludes it", () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  const sitemap = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
  assert.equal(sitemap.includes("/rate"), false);
});

test("all rating controls meet the touch-target and accessibility contract", () => {
  const buttonCount = (html.match(/class="star-button"/g) || []).length;
  assert.equal(buttonCount, 5);
  assert.equal((html.match(/aria-pressed="false"/g) || []).length, 5);
  assert.match(html, /\.star-button \{[\s\S]*?min-width: 48px;[\s\S]*?min-height: 58px;/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
});

test("all four GA4 contract events are wired on the page", () => {
  for (const eventName of contract.EVENT_NAMES) assert.ok(html.includes(`"${eventName}"`), eventName);
  assert.match(html, /review-engine-contract\.js/);
  assert.match(html, /assets\/js\/bwm-analytics\.js/);
  assert.match(html, /ga-disable-G-GQZJKG5JCK/);
  assert.match(html, /get\('preview'\)===\'1\'/);
  assert.match(html, /result\.receipt_status === "pending_reconciliation"/);
});
