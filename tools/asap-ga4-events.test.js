const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function makeForm({ excluded = false } = {}) {
  const attrs = { 'data-bwm-source-form-type': 'contact-webflow-reference' };
  const listeners = {};
  const hidden = {};
  return {
    __bwmBound: true,
    elements: [],
    listeners,
    hidden,
    hasAttribute(name) { return name === 'data-no-bwm-lead-flow' ? excluded : Object.hasOwn(attrs, name); },
    getAttribute(name) { return attrs[name] || null; },
    setAttribute(name, value) { attrs[name] = value; },
    addEventListener(name, listener) { listeners[name] = listener; },
    querySelector(selector) {
      const hiddenMatch = selector.match(/^input\[name="([^"]+)"\]$/);
      if (hiddenMatch) return hidden[hiddenMatch[1]] || null;
      return null;
    },
    appendChild(input) { hidden[input.name] = input; },
  };
}

function harness({ excluded = false, search = '' } = {}) {
  const form = makeForm({ excluded });
  global.window = global;
  global.location = {
    pathname: '/contact/',
    search,
    href: `https://removeasap.com/contact/${search}`,
  };
  global.document = {
    readyState: 'complete',
    referrer: 'https://www.google.com/search?q=wildlife&customer=test',
    querySelectorAll: () => [form],
    addEventListener: () => {},
    createElement: () => ({ type: '', name: '', value: '' }),
  };
  global.dataLayer = [];
  global.gtagCalls = [];
  global.gtag = function () { global.gtagCalls.push(Array.from(arguments)); };
  global.fbqCalls = [];
  global.fbq = function () { global.fbqCalls.push(Array.from(arguments)); };
  global.__bwmLoadAnalytics = () => {};
  vm.runInThisContext(fs.readFileSync(require.resolve('../assets/js/asap-lead-flow.js'), 'utf8'), {
    filename: 'assets/js/asap-lead-flow.js',
  });
  return { form };
}

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed += 1;
  }
}

test('form_start requires the first trusted interaction and fires once per form instance', () => {
  const { form } = harness();
  form.listeners.input({ isTrusted: false });
  assert(!dataLayer.some((entry) => entry.event === 'form_start'), 'programmatic input must not start the form');
  form.listeners.input({ isTrusted: true });
  form.listeners.change({ isTrusted: true });
  const starts = dataLayer.filter((entry) => entry.event === 'form_start');
  assert(starts.length === 1, 'trusted input/change must emit one form_start');
  assert(starts[0].form_key === 'contact-webflow-reference', 'form key must be allowlisted and stable');
  assert(starts[0].page_referrer_origin === 'https://www.google.com', 'full referrer must be reduced to origin');
  assert(!JSON.stringify(starts[0]).includes('customer=test'), 'query data must not reach GA4');
});

test('accepted generate_lead reuses the form instance and returned correlation identity exactly once', () => {
  const { form } = harness();
  form.listeners.input({ isTrusted: true });
  const start = dataLayer.find((entry) => entry.event === 'form_start');
  const result = {
    ok: true,
    capi_event_id: '6e0f9394-607e-4273-b70b-07158b47c3ca',
    source_submission_id: '6e0f9394-607e-4273-b70b-07158b47c3ca',
  };
  assert(__asapGa4LeadAccepted(form, result, 'contact-webflow-reference') === true, 'first accepted response should emit');
  assert(__asapGa4LeadAccepted(form, result, 'contact-webflow-reference') === false, 'retry must deduplicate');
  const leads = dataLayer.filter((entry) => entry.event === 'generate_lead');
  assert(leads.length === 1, 'one accepted submission must emit one generate_lead');
  assert(leads[0].form_instance_id === start.form_instance_id, 'form_start and generate_lead must share form_instance_id');
  assert(leads[0].source_submission_id === result.capi_event_id, 'returned correlation identity must be reused');
  assert(gtagCalls.filter((call) => call[0] === 'event' && call[1] === 'generate_lead').length === 1, 'one direct GA4 beacon');
  const metaLeads = fbqCalls.filter((call) => call[0] === 'track' && call[1] === 'Lead');
  assert(metaLeads.length === 1, 'existing Meta Lead event must remain exactly once');
  assert(metaLeads[0][3].eventID === result.capi_event_id, 'Meta Lead must preserve the CAPI dedup identity');
});

test('error, filtered, and mismatched responses never emit generate_lead', () => {
  const { form } = harness();
  assert(__asapGa4LeadAccepted(form, { ok: false }, 'contact') === false);
  assert(__asapGa4LeadAccepted(form, { ok: true, filtered: true }, 'contact') === false);
  assert(__asapGa4LeadAccepted(form, {
    ok: true,
    capi_event_id: 'one',
    source_submission_id: 'two',
  }, 'contact') === false);
  assert(!dataLayer.some((entry) => entry.event === 'generate_lead'), 'no false-positive lead event');
});

test('a successful submission rotates the ephemeral form instance for the next user interaction', () => {
  const { form } = harness();
  form.listeners.input({ isTrusted: true });
  const first = dataLayer.find((entry) => entry.event === 'form_start').form_instance_id;
  __asapGa4LeadAccepted(form, {
    ok: true,
    capi_event_id: '6e0f9394-607e-4273-b70b-07158b47c3ca',
    source_submission_id: '6e0f9394-607e-4273-b70b-07158b47c3ca',
  }, 'contact-webflow-reference');
  form.listeners.change({ isTrusted: true });
  const starts = dataLayer.filter((entry) => entry.event === 'form_start');
  assert(starts.length === 2, 'second form instance should have its own start');
  assert(starts[1].form_instance_id !== first, 'form instance id must rotate after success');
});

test('validated canary identity is labeled and injected for the handler; ordinary IDs are ignored', () => {
  const canary = 'ASAP-GA4-CANARY-20260809T170000-0400-A1B2';
  const { form } = harness({ search: `?bwm_ga4_canary=${canary}` });
  form.listeners.input({ isTrusted: true });
  const start = dataLayer.find((entry) => entry.event === 'form_start');
  assert(start.traffic_class === 'bwm_canary');
  assert(start.bwm_canary_id === canary);
  assert(form.hidden.bwm_ga4_canary_id.value === canary, 'handler should receive the same label');
  assert(form.hidden.landing_page.value === '/contact/', 'only pathname should be posted as landing page');
  assert(form.hidden.page_referrer_origin.value === 'https://www.google.com', 'only referrer origin should be posted');
});

test('data-no-bwm-lead-flow excludes the private review surface', () => {
  const { form } = harness({ excluded: true });
  assert(Object.keys(form.listeners).length === 0, 'excluded form must not receive lead telemetry listeners');
  assert(__asapGa4LeadAccepted(form, {
    ok: true,
    capi_event_id: '6e0f9394-607e-4273-b70b-07158b47c3ca',
    source_submission_id: '6e0f9394-607e-4273-b70b-07158b47c3ca',
  }, 'review') === false, 'excluded form must reject accepted helper calls');
});

test('inline pages and main.js route accepted responses through the sole generate_lead producer', () => {
  function walk(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '_audit') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
    }
    return out;
  }

  const inlinePages = walk(process.cwd()).filter((file) => {
    const text = fs.readFileSync(file, 'utf8');
    return text.includes('bwm-form-handler.robert-ba0.workers.dev/submit') && text.includes('__asapGa4LeadAccepted(form,result');
  });
  assert(inlinePages.length === 30, `expected 30 routed inline pages, found ${inlinePages.length}`);
  for (const file of inlinePages) {
    const text = fs.readFileSync(file, 'utf8');
    assert(!text.includes("event:'lead_form_submit'"), `${file} retains the legacy dataLayer producer`);
    assert(!/gtag\(['"]event['"],\s*['"]generate_lead/.test(text), `${file} retains a direct generate_lead call`);
    assert((text.match(/__asapGa4LeadAccepted\(form,result/g) || []).length === 1, `${file} must route once`);
    assert(text.includes('result.ok===true&&!result.filtered'), `${file} must reject non-success responses`);
  }

  const main = fs.readFileSync(require.resolve('../assets/js/main.js'), 'utf8');
  assert(main.includes("window.__asapGa4LeadAccepted(form, result, 'contact')"), 'main.js must route through the shared helper');
  assert(!/gtag\(['"]event['"],\s*['"]generate_lead/.test(main), 'main.js must not send generate_lead directly');
  assert(!main.includes("event: 'lead_form_submit'"), 'main.js must not retain the legacy dataLayer producer');
  assert(main.includes('result.ok === true && result.filtered !== true'), 'main.js must reject failed/filtered responses');

  const leadFlow = fs.readFileSync(require.resolve('../assets/js/asap-lead-flow.js'), 'utf8');
  const directProducerCount = (leadFlow.match(/directGa4Event\('generate_lead'/g) || []).length;
  assert(directProducerCount === 1, 'shared lead flow must contain exactly one direct generate_lead producer');
});

console.log(`=== ASAP GA4 form events: ${passed} passed, ${failed} failed ===`);
if (failed) process.exitCode = 1;
