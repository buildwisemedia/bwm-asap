const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function makeForm({ excluded = false } = {}) {
  const attrs = { 'data-bwm-source-form-type': 'contact-webflow-reference' };
  const listeners = {};
  const listenerEntries = {};
  const hidden = {};
  const done = { style: {} };
  const fail = { style: {} };
  const form = {
    __bwmBound: true,
    elements: [],
    listeners,
    listenerEntries,
    hidden,
    parentElement: {
      querySelector(selector) {
        if (selector === '.w-form-done') return done;
        if (selector === '.w-form-fail') return fail;
        return null;
      },
    },
    done,
    fail,
    hasAttribute(name) { return name === 'data-no-bwm-lead-flow' ? excluded : Object.hasOwn(attrs, name); },
    getAttribute(name) { return attrs[name] || null; },
    setAttribute(name, value) { attrs[name] = value; },
    addEventListener(name, listener, options) {
      if (!listeners[name]) listeners[name] = listener;
      if (!listenerEntries[name]) listenerEntries[name] = [];
      listenerEntries[name].push({ listener, capture: options === true || !!(options && options.capture) });
    },
    dispatch(name, event = {}) {
      let stopped = false;
      event.preventDefault = event.preventDefault || function () { event.defaultPrevented = true; };
      event.stopImmediatePropagation = event.stopImmediatePropagation || function () { stopped = true; };
      const ordered = (listenerEntries[name] || []).slice().sort((a, b) => Number(b.capture) - Number(a.capture));
      for (const entry of ordered) {
        entry.listener(event);
        if (stopped) break;
      }
      return event;
    },
    querySelector(selector) {
      const hiddenMatch = selector.match(/^input\[name="([^"]+)"\]$/);
      if (hiddenMatch) return hidden[hiddenMatch[1]] || null;
      return null;
    },
    appendChild(input) { hidden[input.name] = input; },
    closest(selector) { return selector === '.w-form' ? form.parentElement : null; },
  };
  return form;
}

function harness({ excluded = false, search = '', pathname = '/contact/', bridgeToken = '', bridgeValid = true } = {}) {
  const form = makeForm({ excluded });
  const fetchCalls = [];
  const sourceId = '6e0f9394-607e-4273-b70b-07158b47c3ca';
  const canaryId = 'ASAP-GA4-CANARY-20260809T170000-0400-A1B2';
  global.window = global;
  global.location = {
    pathname,
    search,
    href: `https://removeasap.com${pathname}${search}`,
  };
  const storage = new Map(bridgeToken ? [['bwm_asap_ga4_canary_bridge', bridgeToken]] : []);
  global.sessionStorage = {
    getItem: (key) => storage.get(key) || null,
    removeItem: (key) => storage.delete(key),
  };
  global.__asapGa4CanaryContext = null;
  global.__asapGa4CanaryIntent = false;
  global.fetch = async (input, init = {}) => {
    const url = String(input);
    fetchCalls.push({ url, init, body: String(init.body || '') });
    if (url.includes('/asap/ga4-canary/bridge')) {
      if (!bridgeValid) return Response.json({ ok: false }, { status: 401 });
      return Response.json({
        ok: true,
        synthetic_canary: true,
        traffic_class: 'bwm_canary',
        source_submission_id: sourceId,
        bwm_canary_id: canaryId,
      });
    }
    if (url.endsWith('/submit')) {
      return Response.json({
        ok: true,
        test_mode: true,
        synthetic_canary: true,
        traffic_class: 'bwm_canary',
        capi_event_id: sourceId,
        source_submission_id: sourceId,
        bwm_canary_id: canaryId,
      });
    }
    throw new Error(`unexpected fetch ${url}`);
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
  return { form, fetchCalls, storage, sourceId, canaryId, ready: global.__asapGa4CanaryReady };
}

let passed = 0;
let failed = 0;
function test(name, fn) {
  tests.push({ name, fn });
}
const tests = [];

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

test('public query canary forgery is ignored and never becomes a hidden handler field', () => {
  const canary = 'ASAP-GA4-CANARY-20260809T170000-0400-A1B2';
  const { form } = harness({ search: `?bwm_ga4_canary=${canary}` });
  form.listeners.input({ isTrusted: true });
  const start = dataLayer.find((entry) => entry.event === 'form_start');
  assert(start.traffic_class === 'production');
  assert(!('bwm_canary_id' in start));
  assert(!form.hidden.bwm_ga4_canary_id, 'public canary data must not create a hidden field');
  assert(form.hidden.landing_page.value === '/contact/', 'only pathname should be posted as landing page');
  assert(form.hidden.page_referrer_origin.value === 'https://www.google.com', 'only referrer origin should be posted');
});

test('validated bridge drives one isolated browser submit and a shared synthetic chain', async () => {
  const token = 'server-signed-bridge-token';
  const { form, fetchCalls, storage, sourceId, canaryId, ready } = harness({ bridgeToken: token });
  await ready;
  assert(!storage.has('bwm_asap_ga4_canary_bridge'), 'session token must be removed after validation');
  form.listeners.input({ isTrusted: true });
  const start = dataLayer.find((entry) => entry.event === 'form_start');
  assert(start.event_id === sourceId && start.source_submission_id === sourceId, 'form_start must use server source id');
  assert(start.bwm_canary_id === canaryId);

  let legacyRuns = 0;
  form.addEventListener('submit', () => { legacyRuns += 1; });
  const event = form.dispatch('submit', { isTrusted: true });
  await form.__asapGa4CanarySubmitTask;
  assert(event.defaultPrevented === true, 'canary submit must prevent the native/Webflow path');
  assert(legacyRuns === 0, 'legacy business submit handler must never run');
  assert(fetchCalls.length === 2, 'one validation and one isolated submit are required');
  const submit = fetchCalls.find((call) => call.url.endsWith('/submit'));
  const posted = JSON.parse(submit.body);
  assert(Object.keys(posted).sort().join(',') === 'asap_ga4_canary_bridge_token,client_slug,formType', 'isolated submit must contain only routing plus token');
  assert(posted.asap_ga4_canary_bridge_token === token);
  assert(submit.init.referrerPolicy === 'no-referrer' && submit.init.credentials === 'omit');
  assert(!form.hidden.asap_ga4_canary_bridge_token, 'token must never become a hidden field');

  const lead = dataLayer.find((entry) => entry.event === 'generate_lead');
  assert(lead.event_id === sourceId && lead.source_submission_id === sourceId, 'generate_lead must reuse server source id');
  assert(lead.form_instance_id === start.form_instance_id, 'browser form events must share form instance');
  assert(!JSON.stringify(dataLayer).includes(token), 'token must not reach dataLayer');
  assert(!JSON.stringify(gtagCalls).includes(token), 'token must not reach GA4');
  assert(fbqCalls.length === 0, 'synthetic canary must not emit a Meta Lead');
  assert(global.__asapGa4CanaryContext === null, 'validated identity must clear after accepted generate_lead');
  assert(form.done.style.display === 'block', 'isolated canary success should be visible');
});

test('invalid bridge intent blocks the ordinary business path without a submit request', async () => {
  const { form, fetchCalls, ready } = harness({ bridgeToken: 'invalid-token', bridgeValid: false });
  await ready;
  let legacyRuns = 0;
  form.addEventListener('submit', () => { legacyRuns += 1; });
  const event = form.dispatch('submit', { isTrusted: true });
  await Promise.resolve();
  assert(event.defaultPrevented === true, 'invalid canary intent must remain blocked');
  assert(legacyRuns === 0, 'invalid canary must not fall through to legacy business submit');
  assert(fetchCalls.length === 1 && fetchCalls[0].url.includes('/asap/ga4-canary/bridge'), 'only validation may be attempted');
  assert(!dataLayer.some((entry) => entry.event === 'generate_lead'), 'invalid token must not emit a lead event');
  assert(form.fail.style.display === 'block', 'invalid bridge should show failure');
});

test('unknown and PII-like browser paths collapse to the safe fallback', () => {
  const { form } = harness({ pathname: '/jane@example.com' });
  form.listeners.input({ isTrusted: true });
  const start = dataLayer.find((entry) => entry.event === 'form_start');
  assert(start.page_path === '/unknown');
  assert(form.hidden.landing_page.value === '/unknown');
  assert(!JSON.stringify(start).includes('jane@example.com'));
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
  assert(!leadFlow.includes("addEventListener('formdata'"), 'bridge token must never be injected into FormData');
  assert(!leadFlow.includes("ensureHidden('asap_ga4_canary_bridge_token'"), 'bridge token must never be persisted as a hidden input');
});

(async function run() {
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed += 1;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}`);
      failed += 1;
    }
  }
  console.log(`=== ASAP GA4 form events: ${passed} passed, ${failed} failed ===`);
  if (failed) process.exitCode = 1;
})();
