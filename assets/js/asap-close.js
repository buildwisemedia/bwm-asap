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
      test_label: "asap_close_local_review",
      consent_sms: Boolean(form.elements.namedItem("sms_consent").checked)
    };
  }

  document.querySelectorAll("[data-asap-lead-form]").forEach(function (form) {
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
        status.textContent = form.dataset.sourcePage === "/rodent-removal/"
          ? "This form is not connected yet, so no request was sent."
          : "Review fixture passed. No email, Monday.com item, Make.com run, or customer message was created.";
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
