#!/usr/bin/env python3
"""Rendered private-review checks for the scoped Rodent page."""

import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright


BASE = "http://127.0.0.1:18991/rodent-removal/"
OUT = Path("/tmp/asap-rodent-browser-qa")


async def inspect_viewport(browser, name, width, height, scale):
    context = await browser.new_context(
        viewport={"width": width, "height": height}, device_scale_factor=scale
    )
    page = await context.new_page()
    console_errors = []
    failed_requests = []
    api_requests = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("requestfailed", lambda request: failed_requests.append(request.url))
    page.on("request", lambda request: api_requests.append(request.url) if "/api/" in request.url else None)
    await page.goto(BASE, wait_until="networkidle")

    overflow = await page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    hero = page.locator(".hero-art img")
    current_src = await hero.evaluate("image => image.currentSrc")
    hero_entries = await page.evaluate("""performance.getEntriesByType('resource')
      .map(entry => entry.name).filter(name => name.includes('/hero-v2/rodent-hero'))""")
    await page.screenshot(path=str(OUT / f"{name}.png"), full_page=True)

    header_bottom = await page.locator(".site-header").evaluate("node => node.getBoundingClientRect().bottom")
    await page.locator('a[href="#estimate"]').first.click()
    await page.wait_for_function("""headerBottom => {
      const top = document.querySelector('#estimate').getBoundingClientRect().top;
      return top >= headerBottom - 2 && top <= headerBottom + 24;
    }""", arg=header_bottom, timeout=3000)
    estimate_top = await page.locator("#estimate").evaluate("node => node.getBoundingClientRect().top")

    result = {
        "viewport": [width, height],
        "device_scale_factor": scale,
        "overflow_px": overflow,
        "hero_current_src": current_src,
        "hero_resource_entries": hero_entries,
        "header_bottom_px": round(header_bottom, 2),
        "estimate_top_px": round(estimate_top, 2),
    }

    if width < 980:
        summary = page.locator(".mobile-nav summary")
        await summary.focus()
        await page.keyboard.press("Enter")
        result["mobile_nav_open"] = await page.locator(".mobile-nav").evaluate("node => node.open")
        result["mobile_nav_name"] = await page.locator('[aria-label="Mobile navigation"]').get_attribute("aria-label")
        sizes = {}
        for label, selector in {
            "phone": '.header-contact a[href^="tel:"]',
            "email": '.header-contact a[href="/contact/"]',
            "menu": ".mobile-nav summary",
        }.items():
            box = await page.locator(selector).bounding_box()
            sizes[label] = [round(box["width"], 2), round(box["height"], 2)]
        result["tap_sizes"] = sizes

    form = page.locator("[data-asap-lead-form]")
    await form.locator('[name="first_name"]').fill("Test")
    await form.locator('[name="last_name"]').fill("Homeowner")
    await form.locator('[name="phone"]').fill("7705550100")
    await form.locator('[name="email"]').fill("test@example.com")
    await form.locator('[name="issue"]').select_option(label="Rat or mouse")
    await form.locator('[name="sms_consent"]').check()
    await form.locator('button[type="submit"]').click()
    result["fixture_result"] = await form.get_attribute("data-fixture-result")
    result["form_status"] = await form.locator("[data-form-status]").inner_text()
    result["api_requests"] = api_requests
    result["console_errors"] = console_errors
    result["failed_requests"] = failed_requests

    assert overflow <= 0, result
    assert len(hero_entries) == 1, result
    expected = "rodent-hero-mobile.webp" if width < 641 else "rodent-hero.webp"
    assert current_src.endswith(expected), result
    assert estimate_top >= header_bottom - 2 and estimate_top <= header_bottom + 24, result
    assert result["fixture_result"] == "passed-no-send", result
    assert api_requests == [] and console_errors == [] and failed_requests == [], result
    if width < 980:
        assert result["mobile_nav_open"] and result["mobile_nav_name"] == "Mobile navigation", result
        assert all(box[0] >= 24 and box[1] >= 44 for box in result["tap_sizes"].values()), result

    await context.close()
    return result


async def inspect_no_js(browser):
    context = await browser.new_context(viewport={"width": 390, "height": 844}, java_script_enabled=False)
    page = await context.new_page()
    api_requests = []
    page.on("request", lambda request: api_requests.append(request.url) if "/api/" in request.url else None)
    await page.goto(BASE, wait_until="networkidle")
    button = page.locator("[data-fixture-submit]")
    result = {
        "button_disabled": await button.is_disabled(),
        "form_action": await page.locator("[data-asap-lead-form]").get_attribute("action"),
        "noscript_text": await page.locator("noscript .form-status").inner_text(),
        "api_requests": api_requests,
    }
    assert result["button_disabled"] and result["form_action"] == "#estimate", result
    assert "No form information can be sent" in result["noscript_text"], result
    assert api_requests == [], result
    await context.close()
    return result


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        results = {
            "desktop": await inspect_viewport(browser, "desktop-1440x900-2x", 1440, 900, 2),
            "mobile": await inspect_viewport(browser, "mobile-390x844", 390, 844, 1),
            "no_js": await inspect_no_js(browser),
        }
        await browser.close()
    print(json.dumps({"ok": True, "results": results, "screenshots": str(OUT)}, indent=2))


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as error:
        print(json.dumps({"ok": False, "error": repr(error)}, indent=2), file=sys.stderr)
        raise
