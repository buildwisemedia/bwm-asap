/* BWM Lead Attribution — phone clicks + form submissions
 *
 * Fires unified events to GA4 (gtag), Meta Pixel (fbq), and GTM
 * (dataLayer) every time a visitor clicks a phone link or submits
 * the contact form. Each destination fires independently inside
 * its own try/catch so a missing/blocked pixel never blocks the
 * others.
 *
 * Phone clicks carry a `link_location` field so the client can see
 * in GA4 which CTA actually drives calls (hero bar vs. navbar pill
 * vs. footer) rather than just a single aggregate count.
 *
 * This file is shared across every page in the site. Include via:
 *   <script src="/assets/js/tracking.js" defer></script>
 */
(function () {
  'use strict';

  function pushDataLayer(eventName, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      var payload = { event: eventName };
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
      }
      window.dataLayer.push(payload);
    } catch (e) { /* no-op */ }
  }

  function fireGA4(eventName, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    } catch (e) { /* no-op */ }
  }

  function fireMetaPixel(pixelEventName, params) {
    try {
      if (typeof window.fbq === 'function') window.fbq('track', pixelEventName, params);
    } catch (e) { /* no-op */ }
  }

  function locationLabelFor(el) {
    if (el.closest('.hero-arrow-wrapper')) return 'hero_cta_bar';
    if (el.closest('.navbar') && !el.closest('.w-nav-menu')) return 'navbar_pill';
    if (el.closest('.w-nav-menu')) return 'mobile_menu';
    if (el.closest('.background---navy')) return 'footer_contact_block';
    return 'body';
  }

  function handlePhoneClick(ev) {
    var a = ev.currentTarget;
    var href = a.getAttribute('href') || '';
    var phone = href.replace(/^tel:/i, '').replace(/[^0-9+]/g, '');
    var params = {
      phone_number: phone,
      link_text: (a.textContent || '').trim(),
      link_location: locationLabelFor(a),
      page_path: window.location.pathname
    };
    fireGA4('phone_click', params);
    fireMetaPixel('Contact', params);
    pushDataLayer('phone_click', params);
  }

  function handleFormSubmit(ev) {
    var form = ev.currentTarget;
    var params = {
      form_name: form.getAttribute('name') || form.id || 'contact_form',
      page_path: window.location.pathname
    };
    fireGA4('generate_lead', params);
    fireMetaPixel('Lead', params);
    pushDataLayer('form_submit', params);
  }

  function init() {
    var phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    for (var i = 0; i < phoneLinks.length; i++) {
      phoneLinks[i].addEventListener('click', handlePhoneClick);
    }
    var forms = document.querySelectorAll('form#email-form, form[name="email-form"]');
    for (var j = 0; j < forms.length; j++) {
      forms[j].addEventListener('submit', handleFormSubmit);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
