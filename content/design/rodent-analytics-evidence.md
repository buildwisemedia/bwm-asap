# Rodent analytics-instrumentation evidence

`assets/js/asap-close.js` prepares privacy-bounded, page-specific event context for:

- `form_start` through `dataLayer` and `asap:form-start`;
- `lead_intent` through `dataLayer`, `asap:lead-intent`, and a local fixture record;
- `phone_click` through `dataLayer` and `asap:phone-click`.

The context includes event ID, source page, page type, service, city, integration state, test label, and consent state. Attribution inputs preserve UTM, GCLID, and FBCLID values in hidden fields. Unit tests passed `3/3` for privacy-safe phone/email event behavior.

No production tag firing, provider ingestion, lead delivery, attribution join, or outcome is claimed.
