(function () {
  "use strict";

  const root = document.documentElement;
  const reviewOnly = root.dataset.buildState === "local-review";

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (char) {
      const value = Math.random() * 16 | 0;
      const next = char === "x" ? value : (value & 0x3 | 0x8);
      return next.toString(16);
    });
  }

  function queryValue(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function setField(form, name, value) {
    const field = form.elements.namedItem(name);
    if (field && !field.value) field.value = value;
  }

  function contextFor(form) {
    return {
      event_name: "lead_intent",
      event_id: form.elements.namedItem("lead_id").value,
      source_page: form.dataset.sourcePage,
      page_type: form.dataset.pageType,
      service: form.dataset.service || "",
      city: form.dataset.city || "",
      integration_state: form.dataset.integrationState,
      consent_sms: Boolean(form.elements.namedItem("sms_consent").checked)
    };
  }

  document.querySelectorAll("[data-asap-lead-form]").forEach(function (form) {
    const submit = form.querySelector("[data-fixture-submit]");
    const fixtureOnly = form.dataset.integrationState === "fixture-only";
    if (!reviewOnly || !fixtureOnly) {
      if (submit) submit.disabled = true;
      return;
    }
    if (submit) submit.disabled = false;
    setField(form, "lead_id", uuid());
    setField(form, "source_page", form.dataset.sourcePage);
    setField(form, "utm_source", queryValue("utm_source"));
    setField(form, "utm_medium", queryValue("utm_medium"));
    setField(form, "utm_campaign", queryValue("utm_campaign"));
    setField(form, "gclid", queryValue("gclid"));
    setField(form, "fbclid", queryValue("fbclid"));

    form.addEventListener("focusin", function () {
      if (form.dataset.started === "true") return;
      form.dataset.started = "true";
      const detail = { ...contextFor(form), event_name: "form_start" };
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(detail);
      window.dispatchEvent(new CustomEvent("asap:form-start", { detail }));
    });

    form.addEventListener("invalid", function () {
      if (!reviewOnly) return;
      const status = form.querySelector("[data-form-status]");
      if (status) status.textContent = "Please complete the required fields. Nothing has been sent.";
      form.dataset.fixtureResult = "validation-error-no-send";
    }, true);

    form.addEventListener("submit", function (event) {
      if (!reviewOnly) return;
      event.preventDefault();
      const status = form.querySelector("[data-form-status]");
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) status.textContent = "Please complete the required fields. Nothing has been sent.";
        form.dataset.fixtureResult = "validation-error-no-send";
        return;
      }

      const detail = contextFor(form);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(detail);
      window.__ASAP_LAST_LEAD_FIXTURE = detail;
      window.dispatchEvent(new CustomEvent("asap:lead-intent", { detail }));
      if (status) {
        status.textContent = "Form check complete. No request was sent and no customer record was created.";
        status.focus();
      }
      form.dataset.fixtureResult = "passed-no-send";
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener("click", function () {
      const detail = {
        event_name: "phone_click",
        source_page: window.location.pathname,
        phone: "+17706913636",
        build_state: reviewOnly ? "local-review" : "production"
      };
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(detail);
      window.dispatchEvent(new CustomEvent("asap:phone-click", { detail }));
    });
  });
})();


// Keep the accepted five-page mobile header clear of in-page destinations.
// This shared asset also serves other review pages; leave their behavior alone.
(function () {
  "use strict";
  const routes = new Set([
    "/rodent-removal/",
    "/wildlife/mouse-rat/",
    "/wildlife/gray-squirrel/",
    "/wildlife/raccoon/",
    "/wildlife/bats/"
  ]);
  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  if (!routes.has(path)) return;
  const menu = document.querySelector(".site-header details.mobile-nav");
  if (!menu) return;

  document.addEventListener("click", function (event) {
    if (!menu.open || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") ||
        (link.target && link.target !== "_self")) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin ||
        destination.pathname !== window.location.pathname ||
        destination.search !== window.location.search || !destination.hash) return;
    let id;
    try {
      id = decodeURIComponent(destination.hash.slice(1));
    } catch (_) {
      return;
    }
    if (!document.getElementById(id)) return;
    // Close before native fragment navigation calculates the scroll position.
    // Preserve the link's normal hash, browser history, and keyboard behavior.
    menu.open = false;
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !menu.open || event.defaultPrevented) return;
    menu.open = false;
    menu.querySelector("summary").focus();
    event.preventDefault();
  });
})();
