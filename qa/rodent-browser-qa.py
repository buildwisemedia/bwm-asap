#!/usr/bin/env python3
"""Rendered browser matrix QA for all five aligned ASAP animal routes."""
import asyncio, json, sys
from pathlib import Path
from playwright.async_api import async_playwright

ORIGIN = "http://127.0.0.1:18991"
ROUTES = {"rodent":("/rodent-removal/","rodent-hero",True),"mouse-rat":("/wildlife/mouse-rat/","mouse-rat-hero",False),"gray-squirrel":("/wildlife/gray-squirrel/","squirrel-hero",False),"raccoon":("/wildlife/raccoon/","raccoon-hero",False),"bats":("/wildlife/bats/","bat-hero",False)}
SHARED_ROUTES = ["/pest-control-services/", "/wildlife-removal-canton/", "/wildlife-removal-woodstock/", "/wildlife-removal-acworth/", "/wildlife-removal-kennesaw/", "/wildlife-removal-cartersville/"]
SHARED_MATRIX = [(1440, 900, 2), (390, 844, 2)]
LEGACY_ROUTE = "/peace-of-mind-from/rodents/"
LEGACY_MATRIX = [(768, 900, 2), (641, 900, 2), (390, 844, 2), (320, 720, 2)]
OUT = Path("/tmp/asap-animal-browser-qa")
MATRIX = [(1440,900,2),(980,900,2),(768,900,2),(641,900,2),(390,844,1),(390,844,2),(390,844,3),(320,720,2)]

CONTRAST_JS = """() => {
 const parse=v=>{const m=v.match(/[\\d.]+/g);return m?m.map(Number):[0,0,0,0]}, comp=(f,b)=>{const a=f[3]??1;return [0,1,2].map(i=>f[i]*a+b[i]*(1-a))};
 const bg=el=>{let c=[255,255,255],q=[];for(let n=el;n;n=n.parentElement)q.push(n);for(const n of q.reverse())c=comp(parse(getComputedStyle(n).backgroundColor),c);return c};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])},out=[];
 for(const el of document.querySelectorAll('a,button,summary,h1,h2,h3,p,li,dt,dd,cite,label')){const r=el.getBoundingClientRect(),s=getComputedStyle(el),t=(el.innerText||'').trim();if(!t||r.width<1||r.height<1||s.visibility==='hidden'||s.display==='none')continue;const a=lum(parse(s.color)),b=lum(bg(el)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(s.fontSize),weight=parseInt(s.fontWeight)||400,need=(size>=24||(size>=18.66&&weight>=700))?3:4.5;if(ratio+.01<need)out.push({tag:el.tagName,text:t.slice(0,60),ratio:+ratio.toFixed(2),need,className:el.className})}return out;
}"""
ARIA_JS = """() => {const ids=[...document.querySelectorAll('[id]')].map(n=>n.id),duplicates=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))],missing=[];for(const el of document.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls]'))for(const attr of ['aria-labelledby','aria-describedby','aria-controls'])for(const id of(el.getAttribute(attr)||'').split(/\\s+/).filter(Boolean))if(!document.getElementById(id))missing.push({attr,id});const unnamed=[...document.querySelectorAll('a,button,input,select,textarea,summary')].filter(el=>{if(el.matches('input[type=hidden]')||el.disabled)return false;const name=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||el.value||'').trim();return !name&&!(el.id&&document.querySelector(`label[for="${CSS.escape(el.id)}"]`))}).map(el=>el.outerHTML.slice(0,120));return{duplicates,missing,unnamed}}"""

async def settled(page, selector):
    await page.wait_for_function("""selector=>new Promise(resolve=>{const el=document.querySelector(selector);let prev=null,stable=0,frames=0;const tick=()=>{const top=el.getBoundingClientRect().top;stable=prev!==null&&Math.abs(top-prev)<.25?stable+1:0;prev=top;if(stable>=5||++frames>=180)resolve();else requestAnimationFrame(tick)};tick()})""",arg=selector)

async def settle_visual_state(page):
    await page.mouse.move(0, 0)
    await page.wait_for_timeout(250)

async def inspect(browser,slug,route,hero_name,private,width,height,dpr):
    context=await browser.new_context(viewport={"width":width,"height":height},device_scale_factor=dpr); page=await context.new_page(); errors=[]; failed=[]; api=[]
    page.on("console",lambda m:errors.append(m.text) if m.type=="error" else None); page.on("requestfailed",lambda r:failed.append(r.url)); page.on("request",lambda r:api.append(r.url) if "/api/" in r.url else None)
    response=await page.goto(ORIGIN+route,wait_until="networkidle"); await page.screenshot(path=str(OUT/f"{slug}-{width}-{dpr}x.png"),full_page=False)
    hero=page.locator(".hero-art img"); current=await hero.evaluate("n=>n.currentSrc"); resources=await page.evaluate("name=>performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.includes('/hero-v2/'+name))",hero_name)
    broken=await page.locator("img").evaluate_all("imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.currentSrc||i.src)"); overflow=await page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth"); header=await page.locator(".site-header").evaluate("n=>n.getBoundingClientRect().bottom")
    await page.locator('a[href="#estimate"]').first.click();await settled(page,"#estimate");await settle_visual_state(page);await settled(page,"#estimate");anchor=await page.locator("#estimate").evaluate("n=>n.getBoundingClientRect().top")
    tap=await page.evaluate("""() => [...document.querySelectorAll('button,summary,.button,input:not([type=hidden]),select,textarea')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&!el.disabled&&(r.width<44||r.height<44)}).map(el=>({tag:el.tagName,className:el.className,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}))""") if width<=980 else []
    aria=await page.evaluate(ARIA_JS); contrast=await page.evaluate(CONTRAST_JS); result={"route":route,"viewport":[width,height],"dpr":dpr,"status":response.status if response else None,"currentSrc":current,"heroResources":resources,"overflow":overflow,"broken":broken,"tapIssues":tap,"headerBottom":round(header,2),"anchorTop":round(anchor,2),"contrast":contrast,"aria":aria,"api":api,"errors":errors,"failed":failed}
    assert result["status"]==200 and len(resources)==1 and "undefined" not in current,result
    assert overflow<=0 and not broken and not api and not errors and not failed,result
    assert header-3<=anchor<=header+3,result
    assert not tap and not contrast and not aria["duplicates"] and not aria["missing"] and not aria["unnamed"],result
    if slug=="raccoon" and width<=640: assert current.endswith("raccoon-hero-mobile.webp" if dpr==1 else "raccoon-hero.webp"),result
    if private:
        form=page.locator("[data-asap-lead-form]")
        for name,value in [("first_name","Test"),("last_name","Homeowner"),("phone","7705550100"),("email","test@example.com")]:await form.locator(f'[name="{name}"]').fill(value)
        await form.locator('[name="issue"]').select_option(label="Rat or mouse");await form.locator('[name="sms_consent"]').check();await form.locator('button[type="submit"]').click();assert await form.get_attribute("data-fixture-result")=="passed-no-send" and not api,result
    await context.close();return result

async def inspect_anchor_and_cta(browser, route, width, height, dpr, check_anchor):
    context=await browser.new_context(viewport={"width":width,"height":height},device_scale_factor=dpr);page=await context.new_page();errors=[];failed=[]
    page.on("console",lambda m:errors.append(m.text) if m.type=="error" else None);page.on("requestfailed",lambda r:failed.append(r.url))
    response=await page.goto(ORIGIN+route,wait_until="networkidle")
    cta=page.locator(".contact-copy .button--cream")
    if await cta.count():
        colors=await cta.first.evaluate("n=>({color:getComputedStyle(n).color,background:getComputedStyle(n).backgroundColor})")
        assert colors=={"color":"rgb(33, 41, 54)","background":"rgb(242, 237, 220)"},{"route":route,"colors":colors}
    header=anchor=None
    if check_anchor:
        await page.locator('a[href="#estimate"]').first.click();await settled(page,"#estimate");await settle_visual_state(page);await settled(page,"#estimate")
        header=await page.locator(".site-header").evaluate("n=>n.getBoundingClientRect().bottom");anchor=await page.locator("#estimate").evaluate("n=>n.getBoundingClientRect().top")
    result={"route":route,"viewport":[width,height],"dpr":dpr,"status":response.status if response else None,"headerBottom":round(header,2) if header is not None else None,"anchorTop":round(anchor,2) if anchor is not None else None,"errors":errors,"failed":failed}
    assert result["status"]==200 and (not check_anchor or header-3<=anchor<=header+3) and not errors and not failed,result
    await context.close();return result

async def no_js(browser):
    context=await browser.new_context(viewport={"width":390,"height":844},device_scale_factor=2,java_script_enabled=False);page=await context.new_page();api=[];page.on("request",lambda r:api.append(r.url) if "/api/" in r.url else None);await page.goto(ORIGIN+ROUTES["rodent"][0],wait_until="networkidle");result={"disabled":await page.locator("[data-fixture-submit]").is_disabled(),"action":await page.locator("[data-asap-lead-form]").get_attribute("action"),"api":api};assert result=={"disabled":True,"action":"#estimate","api":[]},result;await context.close();return result

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True);results=[]
        for slug,(route,hero_name,private) in ROUTES.items():
            for item in MATRIX:print(f"checking {slug} {item}",flush=True);results.append(await inspect(browser,slug,route,hero_name,private,*item))
        shared=[]
        for route in SHARED_ROUTES:
            for item in SHARED_MATRIX:print(f"checking shared {route} {item}",flush=True);shared.append(await inspect_anchor_and_cta(browser,route,*item,False))
        legacy=[]
        for item in LEGACY_MATRIX:print(f"checking legacy {item}",flush=True);legacy.append(await inspect_anchor_and_cta(browser,LEGACY_ROUTE,*item,True))
        output={"ok":True,"routes":len(ROUTES),"renders":len(results),"matrix":results,"sharedRegression":shared,"legacyAnchorRegression":legacy,"noJs":await no_js(browser),"screenshots":str(OUT)};await browser.close()
    print(json.dumps(output,indent=2))
if __name__=="__main__":
    try:asyncio.run(main())
    except Exception as exc:print(json.dumps({"ok":False,"error":repr(exc)},indent=2),file=sys.stderr);raise
