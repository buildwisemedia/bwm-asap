/**
 * Node smoke tests for the delegated phone_click + email_click tracker.
 * Loads the production script into a minimal browser-like harness so the
 * assertions exercise the shipped implementation, not a duplicate fixture.
 */
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = {};
global.window = global;
global.location = {
  href: 'https://www.removeasap.com/services/',
  hostname: 'www.removeasap.com',
  pathname: '/services/',
  protocol: 'https:',
  search: ''
};
global.document = {
  cookie: '',
  referrer: 'https://www.google.com/',
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: (name, listener) => { listeners[name] = listener; }
};
global.__BWM_CAPI_V2 = { enabled: false };

vm.runInThisContext(fs.readFileSync(require.resolve('./attribution.js'), 'utf8'), {
  filename: 'attribution.js'
});

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('✓ ' + name);
    passed += 1;
  } catch (error) {
    console.error('✗ ' + name);
    console.error('  ' + error.message);
    failed += 1;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function click(href, isTrusted = true) {
  const anchor = {
    getAttribute: (name) => name === 'href' ? href : null,
    closest: (selector) => selector === 'a[href]' ? anchor : null
  };
  listeners.click({ target: anchor, isTrusted });
}

function reset() {
  window.dataLayer = [];
  window.gtagCalls = [];
  window.gtag = function () { window.gtagCalls.push(Array.from(arguments)); };
  window.__asapGa4CanaryContext = null;
  window.__asapGa4CanaryIntent = false;
  window.__asapGa4CanaryPending = false;
  location.pathname = '/services/';
  location.search = '';
  document.referrer = 'https://www.google.com/';
}

test('phone_click event includes privacy-safe required fields', function () {
  reset();
  click('tel:7706913636');
  const event = window.dataLayer.find((entry) => entry.event === 'phone_click');
  assert(event, 'phone_click event should be in dataLayer');
  assert(event.phone_number_redacted === '3636', 'only the canonical last four digits should be stored');
  assert(event.event_schema_version === 'asap_ga4_1', 'schema version should be present');
  assert(typeof event.event_id === 'string' && event.event_id.length > 0, 'random event_id should be present');
  assert(event.traffic_class === 'production', 'ordinary traffic should be labeled production');
  assert(event.source_surface === 'website', 'source surface should be allowlisted');
  assert(event.page_path === '/services/', 'page_path should be present');
  assert(event.page_referrer_origin === 'https://www.google.com', 'only the referrer origin should be present');
  assert(!('page_referrer' in event), 'full referrer must not be emitted');
  assert(window.gtagCalls[0][0] === 'event' && window.gtagCalls[0][1] === 'phone_click');
  assert(!JSON.stringify(window.gtagCalls[0]).includes('7706913636'), 'full phone must not reach GA4');
});

test('email_click event includes domain and required fields', function () {
  reset();
  click('mailto:info@removeasap.com?subject=Question');
  const event = window.dataLayer.find((entry) => entry.event === 'email_click');
  assert(event, 'email_click event should be in dataLayer');
  assert(event.email_domain === 'removeasap.com', 'email domain should be extracted');
  assert(event.page_path === '/services/', 'page_path should be present');
  assert(event.traffic_class === 'production', 'pre-existing email event remains production');
  assert(!('bwm_canary_id' in event), 'email event must not join the frozen canary chain');
  assert(!('source_submission_id' in event), 'email event payload must not gain lead identity');
  assert(window.gtagCalls[0][0] === 'event' && window.gtagCalls[0][1] === 'email_click');
});

test('delegated conversion clicks require a trusted browser event', function () {
  reset();
  click('tel:7706913636', false);
  click('mailto:info@removeasap.com', false);
  assert(window.dataLayer.length === 0, 'programmatic click must not emit phone_click');
  assert(window.gtagCalls.length === 0, 'programmatic click must not call gtag');
});

test('phone_click joins only a validated shared canary identity and never emits a bridge token', function () {
  reset();
  const sourceId = '6e0f9394-607e-4273-b70b-07158b47c3ca';
  window.__asapGa4CanaryIntent = true;
  window.__asapGa4CanaryContext = {
    traffic_class: 'bwm_canary',
    bwm_canary_id: 'ASAP-GA4-CANARY-20260809T170000-0400-A1B2',
    source_submission_id: sourceId,
  };
  click('tel:7706913636');
  const event = window.dataLayer.find((entry) => entry.event === 'phone_click');
  assert(event.event_id === sourceId, 'event id must reuse authenticated source identity');
  assert(event.source_submission_id === sourceId, 'source identity must join the browser chain');
  assert(event.traffic_class === 'bwm_canary');
  assert(!JSON.stringify(window.dataLayer).includes('bridge-token'), 'bridge token must not reach dataLayer');
  assert(!JSON.stringify(window.gtagCalls).includes('bridge-token'), 'bridge token must not reach GA4');
});

test('invalid or consumed canary intent never falls back to production click analytics', function () {
  reset();
  window.__asapGa4CanaryIntent = true;
  window.__asapGa4CanaryContext = null;
  click('tel:7706913636');
  click('mailto:info@removeasap.com');
  assert(window.dataLayer.length === 0, 'canary-intent clicks without active claims must be suppressed');
  assert(window.gtagCalls.length === 0, 'canary-intent clicks must not become business GA4 events');
});

test('public query forgery stays production and unknown paths collapse before GA4', function () {
  reset();
  location.search = '?bwm_ga4_canary=ASAP-GA4-CANARY-20260809T170000-0400-A1B2';
  location.pathname = '/jane@example.com';
  click('tel:7706913636');
  const event = window.dataLayer.find((entry) => entry.event === 'phone_click');
  assert(event.traffic_class === 'production', 'query string cannot authorize canary traffic');
  assert(event.page_path === '/unknown', 'arbitrary path must collapse');
  assert(!JSON.stringify(event).includes('jane@example.com'), 'PII-like path must not reach event');
});

test('non-DDL referrer origins collapse to empty', function () {
  reset();
  document.referrer = 'https://[2001:db8::1]/private';
  click('tel:7706913636');
  const event = window.dataLayer.find((entry) => entry.event === 'phone_click');
  assert(event.page_referrer_origin === '', 'IPv6 origin must fail closed to empty');
});

test('unrelated links do not create conversion events', function () {
  reset();
  click('/contact/');
  assert(window.dataLayer.length === 0, 'ordinary links should not emit phone or email events');
  assert(window.gtagCalls.length === 0, 'ordinary links should not call gtag');
});

console.log(`=== Attribution tracking: ${passed} passed, ${failed} failed ===`);
if (failed) process.exitCode = 1;
