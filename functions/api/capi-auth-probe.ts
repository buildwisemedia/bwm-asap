interface Env {
  BWM_INTERNAL_KEY?: string;
  CAPI_RELAY_URL?: string;
}

const DEFAULT_RELAY = 'https://bwm-capi-relay.robert-ba0.workers.dev';
const AUTH_PROBE_PATH = '/events/invalid%2Fslug';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const callerKey = request.headers.get('X-BWM-Internal-Key') ?? '';
  if (!callerKey || !env.BWM_INTERNAL_KEY || callerKey !== env.BWM_INTERNAL_KEY) {
    return new Response(null, { status: 401 });
  }

  const relay = env.CAPI_RELAY_URL ?? DEFAULT_RELAY;
  try {
    const relayRes = await fetch(`${relay}${AUTH_PROBE_PATH}`, {
      method: 'POST',
      headers: {
        'X-BWM-Internal-Key': env.BWM_INTERNAL_KEY,
      },
    });
    return new Response(null, { status: relayRes.status === 400 ? 204 : 502 });
  } catch {
    return new Response(null, { status: 502 });
  }
};
