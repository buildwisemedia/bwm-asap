# Rodent focus, error, success, and fixture evidence

State: local/review. Date: 2026-08-17.

- Opening the new cleanup FAQ exposed the CDC-qualified answer through the native `details`/`summary` control.
- Empty submission focused the first required field and announced `Please complete the required fields. Nothing has been sent.`
- A synthetic valid fixture announced `Review fixture passed. No email, Monday.com item, Make.com run, or customer message was created.`
- The local URL did not change; no fetch, beacon, XHR, WebSocket, or provider call exists in `assets/js/asap-close.js` for local-review form submission.
- The form status uses an aria live region and receives focus after valid fixture completion.
