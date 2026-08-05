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

function click(href) {
  const anchor = {
    getAttribute: (name) => name === 'href' ? href : null,
    closest: (selector) => selector === 'a[href]' ? anchor : null
  };
  listeners.click({ target: anchor });
}

function reset() {
  window.dataLayer = [];
  window.gtagCalls = [];
  window.gtag = function () { window.gtagCalls.push(Array.from(arguments)); };
}

test('phone_click event includes privacy-safe required fields', function () {
  reset();
  click('tel:7704501744');
  const event = window.dataLayer.find((entry) => entry.event === 'phone_click');
  assert(event, 'phone_click event should be in dataLayer');
  assert(event.phone_number_redacted === '1744', 'only the last four digits should be stored');
  assert(event.page_path === '/services/', 'page_path should be present');
  assert(event.page_referrer === 'https://www.google.com/', 'page_referrer should be present');
  assert(window.gtagCalls[0][0] === 'event' && window.gtagCalls[0][1] === 'phone_click');
});

test('email_click event includes domain and required fields', function () {
  reset();
  click('mailto:info@removeasap.com?subject=Question');
  const event = window.dataLayer.find((entry) => entry.event === 'email_click');
  assert(event, 'email_click event should be in dataLayer');
  assert(event.email_domain === 'removeasap.com', 'email domain should be extracted');
  assert(event.page_path === '/services/', 'page_path should be present');
  assert(window.gtagCalls[0][0] === 'event' && window.gtagCalls[0][1] === 'email_click');
});

test('unrelated links do not create conversion events', function () {
  reset();
  click('/contact/');
  assert(window.dataLayer.length === 0, 'ordinary links should not emit phone or email events');
  assert(window.gtagCalls.length === 0, 'ordinary links should not call gtag');
});

console.log(`=== Attribution tracking: ${passed} passed, ${failed} failed ===`);
if (failed) process.exitCode = 1;
