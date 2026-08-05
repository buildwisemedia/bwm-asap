#!/usr/bin/env python3
"""Behavioral smoke test for the client-safe review-engine preview."""

import os

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("NEHEMIAH_PREVIEW_URL", "http://localhost:8788")
PRIVATE_QUESTION = "How could we have made your experience five stars?"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def handler_requests(page):
    requests = []
    page.on(
        "request",
        lambda request: requests.append(request.url)
        if "/asap/review-response" in request.url
        else None,
    )
    return requests


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=CHROME)
    page = browser.new_page()

    for rating in (1, 2, 3, 4):
        requests = handler_requests(page)
        page.goto(f"{BASE_URL}/rate/?preview=1&request_id=qa-{rating}")
        page.get_by_role(
            "button", name=f"{rating} star{'s' if rating != 1 else ''}", exact=True
        ).click()
        assert page.get_by_role("heading", name="We want to make it right").is_visible()
        assert page.get_by_label(PRIVATE_QUESTION).is_visible()
        assert page.locator("#rating-value").input_value() == str(rating)
        assert page.locator("#five-star-panel").is_hidden()
        assert not requests

    requests = handler_requests(page)
    page.goto(f"{BASE_URL}/rate/?preview=1&request_id=qa-five")
    page.get_by_role("button", name="5 stars", exact=True).click()
    assert page.get_by_role("heading", name="Thank you!").is_visible()
    google_link = page.get_by_role("link", name="Open Google review composer")
    assert "search.google.com/local/writereview" in google_link.get_attribute("href")
    assert page.locator("#follow-up-panel").is_hidden()
    assert "/rate/?preview=1" in page.url
    assert not requests

    requests = handler_requests(page)
    page.goto(f"{BASE_URL}/rate/?preview=1&request_id=qa-submit")
    page.get_by_role("button", name="2 stars", exact=True).click()
    page.get_by_label("Best number to call you back").fill("770-555-0100")
    page.get_by_label(PRIVATE_QUESTION).fill(
        "A clearer arrival window would have helped."
    )
    page.get_by_role("button", name="Send my note").click()
    assert "Preview only" in page.get_by_role("status").inner_text()
    assert not requests

    browser.close()

print("PASS: ratings 1-4 use private feedback; rating 5 uses Google; preview sends nothing")
