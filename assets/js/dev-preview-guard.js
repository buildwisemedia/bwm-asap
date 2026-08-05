/* Client-review safety rail for branch previews.
 * Forms stay fully functional on removeasap.com after approval, but cannot
 * create real leads from Pages preview domains or local QA hosts.
 */
(function () {
  'use strict';

  var host = window.location.hostname;
  var isPreview = /\.pages\.dev$/.test(host) || host === 'localhost' || host === '127.0.0.1';
  if (!isPreview) return;

  // Client-review traffic must not enter GA4, GTM, Clarity, Meta, or Reddit.
  // The shared analytics loader and the city-page fallback both honor these
  // flags before their deferred startup paths can create network requests.
  window['ga-disable-G-GQZJKG5JCK'] = true;
  window.__bwmAnalyticsLoaded = true;
  try {
    Object.defineProperty(window, '__bwmLoadAnalytics', {
      value: function () {},
      writable: false,
      configurable: true
    });
  } catch (_) {
    window.__bwmLoadAnalytics = function () {};
  }

  // The review engine owns a richer preview-only response flow and independently
  // forces safe mode on these same hosts.
  if (window.location.pathname.replace(/\/+$/, '') === '/rate') return;

  function showNotice() {
    var notice = document.getElementById('bwm-dev-preview-notice');
    if (!notice) {
      notice = document.createElement('aside');
      notice.id = 'bwm-dev-preview-notice';
      notice.setAttribute('role', 'status');
      notice.textContent = 'Client preview only — forms are disabled and no lead was sent.';
      notice.style.cssText = 'position:fixed;z-index:2147483647;left:16px;right:16px;bottom:16px;max-width:680px;margin:auto;padding:14px 18px;border:2px solid #e87a2e;border-radius:14px;background:#1b2a4a;color:#f2eddc;font:800 15px/1.35 system-ui,sans-serif;box-shadow:0 12px 36px rgba(0,0,0,.28);text-align:center';
      document.body.appendChild(notice);
    }
    notice.hidden = false;
    notice.focus({ preventScroll: true });
  }

  document.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    showNotice();
  }, true);
})();
