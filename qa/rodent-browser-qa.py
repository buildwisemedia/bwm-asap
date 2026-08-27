#!/usr/bin/env python3
"""Rendered matrix QA for the private-review Rodent page."""
import asyncio, json, sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:18991/rodent-removal/"
OUT = Path("/tmp/asap-rodent-browser-qa")
MATRIX = [(1440,900,2),(980,900,2),(768,900,2),(641,900,2),(390,844,1),(390,844,2),(390,844,3),(320,720,2)]

async def inspect(browser, width, height, dpr):
    context = await browser.new_context(viewport={"width":width,"height":height}, device_scale_factor=dpr)
    page = await context.new_page(); errors=[]; failed=[]; api=[]
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("requestfailed", lambda r: failed.append(r.url))
    page.on("request", lambda r: api.append(r.url) if "/api/" in r.url else None)
    await page.goto(BASE, wait_until="networkidle")
    await page.screenshot(path=str(OUT/f"rodent-{width}-{dpr}x.png"),full_page=False)
    hero=page.locator(".hero-art img"); current=await hero.evaluate("n=>n.currentSrc")
    resources=await page.evaluate("performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.includes('/hero-v2/rodent-hero'))")
    broken=await page.locator("img").evaluate_all("imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)")
    overflow=await page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
    header=await page.locator(".site-header").evaluate("n=>n.getBoundingClientRect().bottom")
    await page.locator('a[href="#estimate"]').first.click()
    await page.wait_for_timeout(1200)
    anchor=await page.locator("#estimate").evaluate("n=>n.getBoundingClientRect().top")
    sizes={}
    if width<=980:
        for name,selector in {"phone":'.header-contact a[href^="tel:"]',"email":'.header-contact a[href="/contact/"]',"menu":".mobile-nav summary"}.items():
            box=await page.locator(selector).bounding_box(); sizes[name]=[round(box["width"],2),round(box["height"],2)]
        await page.locator(".mobile-nav summary").focus(); await page.keyboard.press("Enter")
        assert await page.locator(".mobile-nav").evaluate("n=>n.open")
    form=page.locator("[data-asap-lead-form]")
    for name,value in [("first_name","Test"),("last_name","Homeowner"),("phone","7705550100"),("email","test@example.com")]: await form.locator(f'[name="{name}"]').fill(value)
    await form.locator('[name="issue"]').select_option(label="Rat or mouse"); await form.locator('[name="sms_consent"]').check(); await form.locator('button[type="submit"]').click()
    expected="rodent-hero-mobile.webp" if width<=640 and dpr==1 else "rodent-hero-medium.webp" if width<=640 else "rodent-hero.webp"
    result={"viewport":[width,height],"dpr":dpr,"currentSrc":current,"heroResources":resources,"overflow":overflow,"broken":broken,"tapSizes":sizes,"headerBottom":round(header,2),"anchorTop":round(anchor,2),"api":api,"errors":errors,"failed":failed}
    assert len(resources)==1 and current.endswith(expected),result
    assert overflow<=0 and not broken and not api and not errors and not failed,result
    assert anchor>=header-2,result
    assert await form.get_attribute("data-fixture-result")=="passed-no-send",result
    assert all(v[1]>=44 for v in sizes.values()),result
    await context.close(); return result

async def no_js(browser):
    context=await browser.new_context(viewport={"width":390,"height":844},device_scale_factor=2,java_script_enabled=False)
    page=await context.new_page(); api=[]; page.on("request",lambda r:api.append(r.url) if "/api/" in r.url else None)
    await page.goto(BASE,wait_until="networkidle")
    result={"disabled":await page.locator("[data-fixture-submit]").is_disabled(),"action":await page.locator("[data-asap-lead-form]").get_attribute("action"),"api":api}
    assert result=={"disabled":True,"action":"#estimate","api":[]},result
    await context.close(); return result

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        results=[]
        for item in MATRIX:
            print(f"checking {item}", flush=True)
            results.append(await inspect(browser,*item))
        output={"ok":True,"matrix":results,"noJs":await no_js(browser),"screenshots":str(OUT)}
        await browser.close()
    print(json.dumps(output,indent=2))
if __name__=="__main__":
    try: asyncio.run(main())
    except Exception as exc:
        print(json.dumps({"ok":False,"error":repr(exc)},indent=2),file=sys.stderr)
        raise
