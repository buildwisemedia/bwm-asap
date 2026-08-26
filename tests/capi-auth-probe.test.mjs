import assert from 'node:assert/strict';
import { test } from 'node:test';

import { onRequestGet } from '../functions/api/capi-auth-probe.ts';
import { onRequestPost } from '../functions/api/capi.ts';

function stubFetch(t, implementation) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = implementation;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
}

function probeRequest(key) {
  const headers = key === undefined ? undefined : { 'X-BWM-Internal-Key': key };
  return new Request('https://site.test/api/capi-auth-probe', { headers });
}

test('auth probe rejects a missing caller key without fetching', async (t) => {
  let fetchCalled = false;
  stubFetch(t, async () => {
    fetchCalled = true;
    return new Response(null, { status: 400 });
  });

  const response = await onRequestGet({
    request: probeRequest(),
    env: { BWM_INTERNAL_KEY: 'bound-primary-key' },
  });

  assert.equal(response.status, 401);
  assert.equal(fetchCalled, false);
});

test('auth probe rejects a wrong caller key without fetching', async (t) => {
  let fetchCalled = false;
  stubFetch(t, async () => {
    fetchCalled = true;
    return new Response(null, { status: 400 });
  });

  const response = await onRequestGet({
    request: probeRequest('wrong-key'),
    env: { BWM_INTERNAL_KEY: 'bound-primary-key' },
  });

  assert.equal(response.status, 401);
  assert.equal(fetchCalled, false);
});

test('auth probe rejects an empty primary binding without fetching', async (t) => {
  let fetchCalled = false;
  stubFetch(t, async () => {
    fetchCalled = true;
    return new Response(null, { status: 400 });
  });

  const response = await onRequestGet({
    request: probeRequest('caller-key'),
    env: {},
  });

  assert.equal(response.status, 401);
  assert.equal(fetchCalled, false);
});

test('auth probe accepts the correct caller key and maps relay 400 to 204', async (t) => {
  let captured;
  stubFetch(t, async (input, init) => {
    captured = { input, init };
    return new Response(null, { status: 400 });
  });

  const response = await onRequestGet({
    request: probeRequest('bound-primary-key'),
    env: {
      BWM_INTERNAL_KEY: 'bound-primary-key',
      CAPI_RELAY_URL: 'https://relay.test',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(captured.input, 'https://relay.test/events/invalid%2Fslug');
  assert.equal(captured.init.method, 'POST');
  assert.equal(captured.init.headers['X-BWM-Internal-Key'], 'bound-primary-key');
  assert.equal(captured.init.body, undefined);
});

test('auth probe maps relay 401 to 502', async (t) => {
  stubFetch(t, async () => new Response(null, { status: 401 }));

  const response = await onRequestGet({
    request: probeRequest('bound-primary-key'),
    env: {
      BWM_INTERNAL_KEY: 'bound-primary-key',
      CAPI_RELAY_URL: 'https://relay.test',
    },
  });

  assert.equal(response.status, 502);
});

test('auth probe maps network failures to 502', async (t) => {
  stubFetch(t, async () => {
    throw new Error('network down');
  });

  const response = await onRequestGet({
    request: probeRequest('bound-primary-key'),
    env: {
      BWM_INTERNAL_KEY: 'bound-primary-key',
      CAPI_RELAY_URL: 'https://relay.test',
    },
  });

  assert.equal(response.status, 502);
});

test('auth probe maps every other relay status to 502', async (t) => {
  stubFetch(t, async () => new Response(null, { status: 500 }));

  const response = await onRequestGet({
    request: probeRequest('bound-primary-key'),
    env: {
      BWM_INTERNAL_KEY: 'bound-primary-key',
      CAPI_RELAY_URL: 'https://relay.test',
    },
  });

  assert.equal(response.status, 502);
});

test('normal browser-event POST behavior is unchanged', async (t) => {
  let captured;
  stubFetch(t, async (input, init) => {
    captured = { input, init };
    return new Response(null, { status: 202 });
  });

  const response = await onRequestPost({
    request: new Request('https://site.test/api/capi', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': '203.0.113.7',
        'User-Agent': 'test-agent',
      },
      body: JSON.stringify({
        event_name: 'Lead',
        event_id: '123e4567-e89b-12d3-a456-426614174000',
      }),
    }),
    env: {
      CAPI_V2_ENABLED: 'true',
      CLIENT_SLUG: 'test-client',
      BWM_INTERNAL_KEY: 'bound-primary-key',
      CAPI_RELAY_URL: 'https://relay.test',
    },
  });

  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(captured.input, 'https://relay.test/events/test-client');
  assert.equal(captured.init.method, 'POST');
  assert.equal(captured.init.headers['X-BWM-Internal-Key'], 'bound-primary-key');

  const forwarded = JSON.parse(captured.init.body);
  assert.equal(forwarded.event_name, 'Lead');
  assert.equal(forwarded.user_data.client_ip_address, '203.0.113.7');
  assert.equal(forwarded.user_data.client_user_agent, 'test-agent');
});
