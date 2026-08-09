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
  var formStates = typeof WeakMap === 'function' ? new WeakMap() : null;
  var acceptedSubmissionIds = {};

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function canaryIdentity() {
    var value = '';
    try { value = new URLSearchParams(location.search).get('bwm_ga4_canary') || ''; } catch (_) {}
    return CANARY_ID_RE.test(value) ? value : '';
  }

  function referrerOrigin() {
    if (!document.referrer) return '';
    try { return new URL(document.referrer).origin; } catch (_) { return ''; }
  }

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
    var canaryId = canaryIdentity();
    var common = {
      event_schema_version: EVENT_SCHEMA_VERSION,
      event_id: randomId(),
      traffic_class: canaryId ? 'bwm_canary' : 'production',
      source_surface: 'website',
      page_path: location.pathname || '/',
      page_referrer_origin: referrerOrigin()
    };
    if (canaryId) common.bwm_canary_id = canaryId;
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

    ensureHidden('landing_page', location.pathname || '/');
    ensureHidden('page_referrer_origin', referrerOrigin());
    var canaryId = canaryIdentity();
    if (canaryId) ensureHidden('bwm_ga4_canary_id', canaryId);
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

  function fireLeadEvents(form, result, sourceFormType) {
    var sourceSubmissionId = result && typeof result.source_submission_id === 'string'
      ? result.source_submission_id : '';
    var capiEventId = result && typeof result.capi_event_id === 'string'
      ? result.capi_event_id : '';
    if (!sourceSubmissionId || sourceSubmissionId !== capiEventId || acceptedSubmissionIds[sourceSubmissionId]) return false;
    acceptedSubmissionIds[sourceSubmissionId] = true;

    var state = formState(form);
    var fields = commonEventFields();
    fields.form_instance_id = state.formInstanceId;
    fields.source_submission_id = sourceSubmissionId;
    fields.form_key = normalizedFormKey(sourceFormType || 'contact');
    directGa4Event('generate_lead', fields);

    if (typeof window.fbq === 'function') {
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
