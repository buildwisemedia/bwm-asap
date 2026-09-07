#!/usr/bin/env python3
"""Local navigation regression only: no form submissions or integration suites."""
import asyncio
import functools
import http.server
import json
import threading
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
ROUTES = ["rodent-removal", "wildlife/mouse-rat", "wildlife/gray-squirrel",
          "wildlife/raccoon", "wildlife/bats"]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


async def check(origin):
    cells = []
    blocked = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        try:
            for route in ROUTES:
                for width in [390, 320]:
                    context = await browser.new_context(
                        viewport={"width": width, "height": 844}, reduced_motion="reduce")
                    async def guard(request):
                        if (request.request.url.startswith(origin + "/") and
                                request.request.method == "GET" and
                                "/api/" not in request.request.url):
                            await request.continue_()
                        else:
                            blocked.append(request.request.url)
                            await request.abort()
                    await context.route("**/*", guard)
                    page = await context.new_page()
                    errors = []
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    await page.goto(origin + "/" + route + "/")
                    menu = page.locator(".mobile-nav")
                    summary = menu.locator("summary")
                    await summary.click()
                    await page.locator('a[href="#estimate"]').click()
                    assert not await menu.evaluate("(node) => node.open"), (route, width, "menu remained open")
                    await page.wait_for_function("""() =>
                        document.querySelector('#estimate').getBoundingClientRect().top >=
                        document.querySelector('.site-header').getBoundingClientRect().bottom
                    """)
                    geometry = await page.evaluate("""() => ({
                        headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom,
                        targetTop: document.querySelector('#estimate').getBoundingClientRect().top,
                        hash: location.hash
                    })""")
                    assert geometry["hash"] == "#estimate"
                    # Escape closes the disclosure and returns keyboard focus.
                    await summary.click()
                    await menu.locator('a[href="/about/"]').focus()
                    await page.keyboard.press("Escape")
                    assert not await menu.evaluate("(node) => node.open")
                    assert await summary.evaluate("(node) => document.activeElement === node")
                    # Repeating the same hash must still close the expanded menu.
                    await summary.click()
                    await page.locator('a[href="#estimate"]').evaluate("(node) => node.click()")
                    assert not await menu.evaluate("(node) => node.open")
                    # Invalid fragments do not collapse the menu or throw.
                    await summary.click()
                    await page.evaluate("""() => {
                        const a = document.createElement('a');
                        a.href = '#%ZZ';
                        document.body.append(a); a.click(); a.remove();
                    }""")
                    assert await menu.evaluate("(node) => node.open")
                    assert not errors, errors
                    assert await page.evaluate("""() =>
                        !window.__ASAP_LAST_LEAD_FIXTURE &&
                        !document.querySelector('[data-fixture-result], [data-started="true"]')
                    """), "Navigation touched a form"
                    cells.append({"route": route, "width": width, **geometry,
                                  "escape_focus": True, "repeat_anchor": True,
                                  "malformed_fragment_ignored": True, "forms_untouched": True})
                    await context.close()
            # Shared asset: an unrelated route must retain its old disclosure behavior.
            context = await browser.new_context(viewport={"width": 390, "height": 844})
            await context.route("**/*", guard)
            page = await context.new_page()
            await page.route(origin + "/qa-unrelated/", lambda request: request.fulfill(
                status=200, content_type="text/html", body='''<!doctype html>
                <header class="site-header"><details class="mobile-nav">
                <summary>Menu</summary><a href="#main">Main</a></details></header>
                <main id="main">Unrelated route control</main>
                <script src="/assets/js/asap-close.js"></script>'''))
            await page.goto(origin + "/qa-unrelated/")
            await page.locator(".mobile-nav summary").click()
            await page.keyboard.press("Escape")
            assert await page.locator(".mobile-nav").evaluate("(node) => node.open")
            await context.close()
        finally:
            await browser.close()
    assert not blocked, blocked
    return {"ok": True, "cells": cells, "unrelated_route_unchanged": True,
            "blocked_or_outbound_requests": blocked,
            "scope": "Navigation only; no held fixtures, integrations, or full suites invoked",
            "limitations": ["Chromium emulation, not physical iPhone/Android",
                           "No visual or client acceptance claimed"]}


def main():
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        print(json.dumps(asyncio.run(check("http://127.0.0.1:" + str(server.server_port))), indent=2))
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
