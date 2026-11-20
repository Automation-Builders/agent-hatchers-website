// Local rendered-page regression check. Requires Playwright + Chromium and a static
// server at PROTOTYPE_TEST_URL (default http://127.0.0.1:8768). No remote calls allowed.
// Build 87 sends x-ah-visitor to the proxy. A proxy older than build 87 (mid-deploy, or after a
// Vercel rollback) allows only content-type, so the browser refuses those calls. The page must
// then retry with the plain header and the playground must still hatch.
// The refused preflight is simulated by failing every request that carries x-ah-visitor.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const browser=await chromium.launch({headless:true,...(process.env.CHROME?{executablePath:process.env.CHROME}:{channel:'chromium'})});
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    const errors=[];let refused=0,served=0;
    await context.route('**/*',route=>{const req=route.request();const u=new URL(req.url());
      if(u.origin===origin)return route.continue();
      const cors={'access-control-allow-origin':origin};
      if(req.headers()['x-ah-visitor']){refused++;return route.abort('failed');}   // what a refused preflight looks like to fetch()
      if(/prototype-portrait/.test(u.pathname)){served++;return route.fulfill({status:200,contentType:'application/json',headers:cors,body:JSON.stringify({image:PNG})});}
      if(/prototype-session/.test(u.pathname))return route.fulfill({status:200,contentType:'application/json',headers:cors,body:'{"ok":true}'});
      return route.fulfill({status:400,contentType:'application/json',headers:cors,body:'{}'});});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/prototype/');await page.waitForSelector('#biz-intro');
    await page.fill('#biz-intro','small Brisbane plumbing business');
    await page.click('[data-action="team"]');await page.waitForSelector('#agent-co');
    await page.fill('#agent-co','Pipe Pros');await page.fill('#agent-name','Pip');await page.fill('#agent-look','a robot plumber with a wrench');
    await page.click('[data-action="generate"]');
    await page.fill('#who-name','Jane Doe');await page.fill('#who-email','jane@pipepros.com.au');await page.click('.who-btn');
    await page.waitForSelector('.egg-cell.is-ready',{timeout:20000});await page.waitForTimeout(1500);
    assert.ok(refused>=3,'the new header was tried first');
    assert.equal(served,3,'all three designs still came back through the plain-header retry');
    const imgs=await page.$$eval('.egg-cell img',els=>els.filter(e=>(e.getAttribute('src')||'').startsWith('data:image/png')).length);
    assert.ok(imgs>=3,'the designs are the generated images, not the fallback mascots');
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({olderProxy:'still hatches',refusedWithHeader:refused,servedPlain:served}));
  }finally{await browser.close();}
})().catch(e=>{console.error(String(e&&e.stack||e).slice(0,600));process.exit(1);});
