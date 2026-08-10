/**
 * ASAP lead-flow fallback handler.
 *
 * The Webflow-source pages mostly bind their own BWM submit handler. This file
 * catches any remaining Webflow-style forms so every ASAP form uses the same
 * supported bwm-form-handler contract: client_slug=asap-pest-wildlife and
 * formType=contact.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://bwm-form-handler.robert-ba0.workers.dev/submit';
  var CLIENT_SLUG = 'asap-pest-wildlife';
  var EVENT_SCHEMA_VERSION = 'asap_ga4_1';
  var CANARY_ID_RE = /^ASAP-GA4-CANARY-\d{8}T\d{6}[+-]\d{4}-[A-Z0-9]{4}$/;
  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  var REFERRER_ORIGIN_RE = /^https?:\/\/[A-Za-z0-9.-]+(?::[0-9]{1,5})?$/;
  var BRIDGE_STORAGE_KEY = 'bwm_asap_ga4_canary_bridge';
  var BRIDGE_ENDPOINT = 'https://bwm-form-handler.robert-ba0.workers.dev/asap/ga4-canary/bridge';
  var SAFE_PAGE_PATHS = {
    '/': 1, '/about/': 1, '/blog/': 1, '/commercial-services/': 1,
    '/contact/': 1, '/peace-of-mind-from/beavers/': 1,
    '/peace-of-mind-from/bees-wasps-and-hornets/': 1,
    '/peace-of-mind-from/rodents/': 1, '/pest-control-services/': 1,
    '/privacy-policy/': 1, '/services/': 1, '/terms-of-service/': 1,
    '/unknown': 1, '/warranty-assurance/': 1, '/wildlife/': 1,
    '/wildlife/armadillo/': 1, '/wildlife/bats/': 1, '/wildlife/beaver/': 1,
    '/wildlife/bees-wasp-hornets/': 1, '/wildlife/bird/': 1,
    '/wildlife/coyote/': 1, '/wildlife/flying-squirrel/': 1,
    '/wildlife/fox/': 1, '/wildlife/geese/': 1, '/wildlife/gopher/': 1,
    '/wildlife/gray-squirrel/': 1, '/wildlife/mole/': 1,
    '/wildlife/mouse-rat/': 1, '/wildlife/opossum/': 1,
    '/wildlife/otters/': 1, '/wildlife/rabbit/': 1,
    '/wildlife/raccoon/': 1, '/wildlife/snake/': 1,
    '/wildlife/turtle/': 1, '/wildlife/vole/': 1,
    '/wildlife/wild-hogs/': 1
  };
  var formStates = typeof WeakMap === 'function' ? new WeakMap() : null;
  var acceptedSubmissionIds = {};
  var validatedBridgeToken = '';
  var bridgeIntent = false;
  var bridgeCompleted = false;

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function safePagePath(value) {
    var path = String(value || '');
    return SAFE_PAGE_PATHS[path] ? path : '/unknown';
  }

  function activeCanaryContext() {
    var context = window.__asapGa4CanaryContext;
    if (!context || context.traffic_class !== 'bwm_canary') return null;
    if (!CANARY_ID_RE.test(String(context.bwm_canary_id || ''))) return null;
    if (!UUID_RE.test(String(context.source_submission_id || ''))) return null;
    return context;
  }

  function referrerOrigin() {
    if (!document.referrer) return '';
    try {
      var origin = new URL(document.referrer).origin;
      return REFERRER_ORIGIN_RE.test(origin) ? origin : '';
    } catch (_) { return ''; }
  }

  function initializeCanaryBridge() {
    var token = '';
    try { token = window.sessionStorage && window.sessionStorage.getItem(BRIDGE_STORAGE_KEY) || ''; } catch (_) {}
    bridgeIntent = !!token;
    window.__asapGa4CanaryIntent = bridgeIntent;
    window.__asapGa4CanaryPending = !!token;
    if (!token) {
      window.__asapGa4CanaryReady = Promise.resolve(null);
      return;
    }
    window.__asapGa4CanaryReady = fetch(BRIDGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ token: token })
    }).then(function (response) {
      if (!response.ok) throw new Error('invalid canary bridge');
      return response.json();
    }).then(function (result) {
      if (!result || result.ok !== true || result.synthetic_canary !== true ||
          result.traffic_class !== 'bwm_canary' ||
          !CANARY_ID_RE.test(String(result.bwm_canary_id || '')) ||
          !UUID_RE.test(String(result.source_submission_id || ''))) {
        throw new Error('invalid canary bridge');
      }
      validatedBridgeToken = token;
      window.__asapGa4CanaryContext = {
        traffic_class: 'bwm_canary',
        bwm_canary_id: result.bwm_canary_id,
        source_submission_id: result.source_submission_id
      };
      return window.__asapGa4CanaryContext;
    }).catch(function () {
      validatedBridgeToken = '';
      bridgeIntent = false;
      window.__asapGa4CanaryIntent = false;
      window.__asapGa4CanaryContext = null;
      return null;
    }).finally(function () {
      try { window.sessionStorage.removeItem(BRIDGE_STORAGE_KEY); } catch (_) {}
      window.__asapGa4CanaryPending = false;
    });
  }

  initializeCanaryBridge();

  function normalizedFormKey(value) {
    var key = String(value || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '_').slice(0, 64);
    return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(key) ? key : 'contact';
  }

  function newFormState() {
    return { formInstanceId: randomId(), started: false };
  }

  function formState(form) {
    if (!formStates) {
      if (!form.__asapGa4State) form.__asapGa4State = newFormState();
      return form.__asapGa4State;
    }
    var state = formStates.get(form);
    if (!state) {
      state = newFormState();
      formStates.set(form, state);
    }
    return state;
  }

  function replaceFormState(form) {
    var state = newFormState();
    if (formStates) formStates.set(form, state);
    else form.__asapGa4State = state;
  }

  function commonEventFields() {
    var canary = activeCanaryContext();
    var common = {
      event_schema_version: EVENT_SCHEMA_VERSION,
      event_id: canary ? canary.source_submission_id : randomId(),
      traffic_class: canary ? 'bwm_canary' : 'production',
      source_surface: 'website',
      page_path: safePagePath(location.pathname),
      page_referrer_origin: referrerOrigin()
    };
    if (canary) {
      common.bwm_canary_id = canary.bwm_canary_id;
      common.source_submission_id = canary.source_submission_id;
    }
    return common;
  }

  function directGa4Event(eventName, params) {
    window.dataLayer = window.dataLayer || [];
    var dataLayerEvent = { event: eventName };
    Object.keys(params).forEach(function (key) { dataLayerEvent[key] = params[key]; });
    window.dataLayer.push(dataLayerEvent);

    if (typeof window.__bwmLoadAnalytics === 'function') {
      try { window.__bwmLoadAnalytics(); } catch (_) {}
    }
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', eventName, params); } catch (_) {}
    }
  }

  function bindGa4FormTelemetry(form) {
    if (!form || form.hasAttribute('data-no-bwm-lead-flow') || form.__asapGa4TelemetryBound) return;
    form.__asapGa4TelemetryBound = true;
    formState(form);

    function onFirstUserInteraction(event) {
      if (!event || event.isTrusted !== true) return;
      if (bridgeIntent && window.__asapGa4CanaryPending) {
        window.__asapGa4CanaryReady.then(function () { onFirstUserInteraction(event); });
        return;
      }
      if (bridgeIntent && !activeCanaryContext()) return;
      var state = formState(form);
      if (state.started) return;
      state.started = true;
      var fields = commonEventFields();
      fields.form_instance_id = state.formInstanceId;
      fields.form_key = normalizedFormKey(form.getAttribute('data-bwm-source-form-type') || 'contact');
      directGa4Event('form_start', fields);
    }

    form.addEventListener('input', onFirstUserInteraction);
    form.addEventListener('change', onFirstUserInteraction);

    // A canary-intent page can never fall through to Webflow or an ordinary
    // lead handler. The dedicated request below carries no customer fields.
    form.addEventListener('submit', function (event) {
      if (!bridgeIntent) return;
      event.preventDefault();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      if (bridgeCompleted || form.__asapGa4CanarySubmitPending) return;
      if (window.__asapGa4CanaryPending) {
        window.__asapGa4CanaryReady.then(function () {
          if (activeCanaryContext()) form.__asapGa4CanarySubmitTask = submitCanaryForm(form);
          else setVisible(closestFormWrap(form) && closestFormWrap(form).querySelector('.w-form-fail'), true);
        });
        return;
      }
      if (activeCanaryContext()) form.__asapGa4CanarySubmitTask = submitCanaryForm(form);
      else setVisible(closestFormWrap(form) && closestFormWrap(form).querySelector('.w-form-fail'), true);
    }, true);

    function ensureHidden(name, value) {
      var existing = form.querySelector('input[name="' + name + '"]');
      if (existing) {
        if (!existing.value) existing.value = value;
        return;
      }
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    ensureHidden('landing_page', safePagePath(location.pathname));
    ensureHidden('page_referrer_origin', referrerOrigin());
  }

  function serialize(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements || [], function (el) {
      if (!el.name || el.disabled) return;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      data[el.name] = el.value;
    });
    return data;
  }

  function closestFormWrap(form) {
    return typeof form.closest === 'function' ? form.closest('.w-form') : form.parentElement;
  }

  function setVisible(el, visible) {
    if (!el) return;
    el.style.display = visible ? 'block' : 'none';
  }

  async function submitCanaryForm(form) {
    if (!validatedBridgeToken || !activeCanaryContext() || form.__asapGa4CanarySubmitPending || bridgeCompleted) return false;
    form.__asapGa4CanarySubmitPending = true;
    var wrap = closestFormWrap(form);
    var done = wrap && wrap.querySelector('.w-form-done');
    var fail = wrap && wrap.querySelector('.w-form-fail');
    setVisible(done, false);
    setVisible(fail, false);
    try {
      var response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
          client_slug: CLIENT_SLUG,
          formType: 'contact',
          asap_ga4_canary_bridge_token: validatedBridgeToken
        })
      });
      var result = {};
      try { result = await response.json(); } catch (_) {}
      if (!response.ok || result.ok !== true || result.synthetic_canary !== true ||
          !fireLeadEvents(form, result, form.getAttribute('data-bwm-source-form-type') || 'contact')) {
        throw new Error('canary submit failed');
      }
      bridgeCompleted = true;
      validatedBridgeToken = '';
      window.__asapGa4CanaryContext = null;
      setVisible(done, true);
      return true;
    } catch (_) {
      setVisible(fail, true);
      return false;
    } finally {
      form.__asapGa4CanarySubmitPending = false;
    }
  }

  function fireLeadEvents(form, result, sourceFormType) {
    var sourceSubmissionId = result && typeof result.source_submission_id === 'string'
      ? result.source_submission_id : '';
    var capiEventId = result && typeof result.capi_event_id === 'string'
      ? result.capi_event_id : '';
    if (!sourceSubmissionId || sourceSubmissionId !== capiEventId || acceptedSubmissionIds[sourceSubmissionId]) return false;
    var canary = activeCanaryContext();
    if (canary && (result.synthetic_canary !== true || sourceSubmissionId !== canary.source_submission_id)) return false;
    if (!canary && result.synthetic_canary === true) return false;
    acceptedSubmissionIds[sourceSubmissionId] = true;

    var state = formState(form);
    var fields = commonEventFields();
    fields.form_instance_id = state.formInstanceId;
    fields.source_submission_id = sourceSubmissionId;
    fields.form_key = normalizedFormKey(sourceFormType || 'contact');
    directGa4Event('generate_lead', fields);

    if (result.synthetic_canary !== true && typeof window.fbq === 'function') {
      try {
        var options = result && result.capi_event_id ? { eventID: result.capi_event_id } : undefined;
        window.fbq('track', 'Lead', {
          content_name: sourceFormType || 'contact_form',
          client_slug: CLIENT_SLUG
        }, options);
      } catch (_) {}
    }

    replaceFormState(form);
    return true;
  }

  window.__asapGa4LeadAccepted = function (form, result, sourceFormType) {
    if (!form || form.hasAttribute('data-no-bwm-lead-flow') || !result || result.ok !== true || result.filtered === true) return false;
    return fireLeadEvents(form, result, sourceFormType);
  };

  function bindForm(form) {
    if (!form || form.__bwmBound || form.__asapLeadFlowBound) return;
    if (form.hasAttribute('data-no-bwm-lead-flow')) return;
    form.__asapLeadFlowBound = true;

    form.addEventListener('submit', async function (event) {
      // preventDefault only — Webflow's own submit handler must still run so
      // the lead also lands in the client's Webflow submissions (their
      // automation chain hangs off it). Same contract as the per-page
      // homepage-reference scripts.
      event.preventDefault();

      var submit = form.querySelector('[type="submit"]');
      var wrap = closestFormWrap(form);
      var done = wrap && wrap.querySelector('.w-form-done');
      var fail = wrap && wrap.querySelector('.w-form-fail');

      setVisible(done, false);
      setVisible(fail, false);
      if (submit) submit.disabled = true;

      var payload = serialize(form);
      if (payload.website || payload.company_url) {
        form.reset();
        if (submit) submit.disabled = false;
        return;
      }

      var sourceFormType = payload.formType || form.getAttribute('data-bwm-source-form-type') || location.pathname;
      payload.client_slug = CLIENT_SLUG;
      payload.source_form_type = sourceFormType;
      payload.formType = 'contact';
      payload.formSource = 'asap-lead-flow-fallback';
      payload.referrer = payload.referrer || document.referrer || '';
      payload.landing_page = payload.landing_page || location.href;

      try {
        var response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        var result = {};
        try { result = await response.json(); } catch (_) {}

        if (!response.ok || result.ok !== true || result.filtered === true) throw new Error('Form submit failed');
        fireLeadEvents(form, result, sourceFormType);
        setVisible(done, true);
        form.reset();
      } catch (_) {
        setVisible(fail, true);
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  // Homepage hides the "Type other" input until the Issue dropdown is set to
  // "Other" (a homepage-only Webflow interaction). Replicate that behavior on
  // every page so all forms look and act like the homepage form.
  function bindOthersToggle(form) {
    var sel = form.querySelector('select[name="Issue"]');
    var other = form.querySelector('input[name="Others_Input"]');
    if (!sel || !other || form.__bwmOthersBound) return;
    form.__bwmOthersBound = true;
    var sync = function () {
      other.style.display = /^other$/i.test(sel.value) ? 'block' : 'none';
    };
    sel.addEventListener('change', sync);
    sync();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('form'), function (form) {
      bindGa4FormTelemetry(form);
      bindForm(form);
      bindOthersToggle(form);
    });
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
