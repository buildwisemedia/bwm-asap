(function (root, factory) {
  "use strict";
  var contract = factory();
  if (typeof module === "object" && module.exports) module.exports = contract;
  if (root) root.AsapReviewContract = contract;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var FLOW_VERSION = "asap_rate_v1";
  var EVENT_NAMES = Object.freeze([
    "review_rating_selected",
    "review_google_handoff",
    "review_private_feedback_submit",
    "review_private_feedback_result"
  ]);
  var ROUTES = Object.freeze(["google", "private"]);
  var OUTCOMES = Object.freeze([
    "opened",
    "started",
    "accepted",
    "accepted_audit_pending",
    "rejected"
  ]);

  function boundedText(value, max) {
    return String(value == null ? "" : value).trim().slice(0, max);
  }

  function buildResponsePayload(input) {
    return {
      request_id: boundedText(input.request_id, 160),
      rating: Number(input.rating),
      action: boundedText(input.action, 80),
      feedback: boundedText(input.feedback, 4000),
      website: boundedText(input.website, 120),
      label: boundedText(input.label, 160),
      page_url: boundedText(input.page_url, 1000),
      submission_id: boundedText(input.submission_id, 160)
    };
  }

  function buildGa4Event(eventName, values) {
    if (EVENT_NAMES.indexOf(eventName) === -1) throw new Error("unsupported_review_event");
    var score = Number(values && values.score);
    var route = boundedText(values && values.route, 20);
    var outcome = boundedText(values && values.outcome, 40);
    var errorCode = boundedText(values && values.errorCode, 80).replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    var event = {
      event: eventName,
      review_flow_version: FLOW_VERSION,
      review_score: Number.isInteger(score) && score >= 1 && score <= 5 ? score : undefined,
      review_route: ROUTES.indexOf(route) >= 0 ? route : undefined,
      review_request_bound: Boolean(values && values.requestBound)
    };
    if (OUTCOMES.indexOf(outcome) >= 0) event.review_outcome = outcome;
    if (errorCode) event.review_error_code = errorCode;
    Object.keys(event).forEach(function (key) {
      if (event[key] === undefined) delete event[key];
    });
    return event;
  }

  function pushGa4(target, eventName, values, previewMode) {
    if (previewMode) return false;
    var event = buildGa4Event(eventName, values || {});
    target.dataLayer = target.dataLayer || [];
    target.dataLayer.push(event);
    return true;
  }

  return Object.freeze({
    FLOW_VERSION: FLOW_VERSION,
    EVENT_NAMES: EVENT_NAMES,
    buildResponsePayload: buildResponsePayload,
    buildGa4Event: buildGa4Event,
    pushGa4: pushGa4
  });
});
