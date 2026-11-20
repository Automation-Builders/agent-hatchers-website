// Local rendered-page regression check. Requires Playwright + Chromium and a static
// server at PROTOTYPE_TEST_URL (default http://127.0.0.1:8768). No remote calls allowed.
// Build 87 (20 Nov 2026): the free limits moved to the proxy (portrait-proxy/lib/guard.js).
// This checks that the page sends a stable visitor id on every AI call, that ?unlimited=1 no
// longer lifts anything, that a 429 from the proxy shows the limit message once and is not
// retried, and that a demo pass from the sessions page travels with the calls and lifts the gate.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const LIMIT_MSG='You’ve reached today’s free limit for the playground. Start your 30-day free trial to keep going, or come back tomorrow.';
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const browser=await chromium.launch({headless:true,...(process.env.CHROME?{executablePath:process.env.CHROME}:{channel:'chromium'})});
  try{
    const errors=[];const portraits=[];let allowed=3;
    const mock=route=>{const req=route.request();const u=new URL(req.url());
      if(u.origin===origin)return route.continue();
      if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':origin,'access-control-allow-headers':'content-type,x-ah-visitor,x-ah-pass','access-control-allow-methods':'POST,OPTIONS'}});
      const cors={'access-control-allow-origin':origin};
      if(/prototype-portrait/.test(u.pathname)){
        let name='';try{name=JSON.parse(req.postData()||'{}').name||'';}catch(e){}
        portraits.push({...req.headers(),name});
        if(allowed-->0)return route.fulfill({status:200,contentType:'application/json',headers:cors,body:JSON.stringify({image:PNG})});
        return route.fulfill({status:429,contentType:'application/json',headers:{...cors,'retry-after':'3600'},body:JSON.stringify({error:LIMIT_MSG,limit:'portrait',scope:'visitor',retryAfter:3600})});
      }
      if(/prototype-session/.test(u.pathname))return route.fulfill({status:200,contentType:'application/json',headers:cors,body:'{"ok":true}'});
      return route.fulfill({status:400,contentType:'application/json',headers:cors,body:'{}'});};
    const open=async init=>{const context=await browser.newContext({viewport:{width:1280,height:900}});
      if(init)await context.addInitScript(init);
      await context.route('**/*',mock);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));return page;};
    let page=await open();

    // The old URL switch must not lift anything any more.
    await page.goto(origin+'/prototype/?unlimited=1');await page.waitForSelector('#biz-intro');
    assert.equal(await page.evaluate(()=>localStorage.getItem('ah-unlimited')),null,'?unlimited=1 stores nothing');
    await page.fill('#biz-intro','small Brisbane plumbing business');
    await page.click('[data-action="team"]');await page.waitForSelector('#agent-co');
    await page.fill('#agent-co','Pipe Pros');await page.fill('#agent-name','Pip');await page.fill('#agent-look','a robot plumber with a wrench');
    await page.click('[data-action="generate"]');
    await page.waitForSelector('#who-card');   // still gated: ?unlimited=1 did not make this a team browser
    await page.fill('#who-name','Jane Doe');await page.fill('#who-email','jane@pipepros.com.au');await page.click('.who-btn');
    await page.waitForSelector('.egg-cell.is-ready',{timeout:20000});await page.waitForTimeout(1500);
    assert.equal(portraits.length,3,'three designs, one call each');
    const vid=portraits[0]['x-ah-visitor'];
    assert.match(vid||'',/^[A-Za-z0-9_-]{8,64}$/,'visitor id sent');
    assert.ok(portraits.every(h=>h['x-ah-visitor']===vid),'same visitor id on every call');
    assert.ok(portraits.every(h=>!h['x-ah-pass']),'no pass in a visitor browser');

    // Picking a design re-dresses the marketplace; the proxy now refuses every one of those.
    await page.click('.egg-cell.is-ready');await page.click('[data-action="market"]');
    await page.waitForSelector('.create-pop',{timeout:15000});
    assert.match(await page.textContent('.create-pop'),/free limit/,'limit message shown');
    await page.waitForTimeout(6000);
    const refused=portraits.length-3;
    const pops=await page.$$eval('.create-pop',els=>els.length);
    assert.ok(refused>0,'marketplace asked for portraits');
    assert.ok(pops<=1,'one message, not one per refused call');
    // Each refused portrait is asked for once: before build 87 a failure was retried 3 times.
    const names=portraits.slice(3).map(h=>h.name);
    assert.equal(new Set(names).size,names.length,'no portrait asked for twice after a 429');
    assert.ok(refused<=32,`no retry storm (${refused} refused calls)`);

    // A demo pass from the sessions page travels with the calls and skips the email gate.
    const exp=Date.now()+86400000;
    const pass='v1.'+Buffer.from(JSON.stringify({n:'Test',exp})).toString('base64url')+'.'+'a'.repeat(43);
    await page.context().close();
    page=await open(`localStorage.setItem('ah-staff-pass',${JSON.stringify(pass)})`);
    await page.goto(origin+'/prototype/');await page.waitForSelector('#biz-intro');
    await page.fill('#biz-intro','small Brisbane plumbing business');
    await page.click('[data-action="team"]');await page.waitForSelector('#agent-co');
    await page.fill('#agent-co','Pipe Pros');await page.fill('#agent-name','Pip');await page.fill('#agent-look','a robot plumber with a wrench');
    allowed=99;const before=portraits.length;
    await page.click('[data-action="generate"]');
    await page.waitForSelector('.egg-cell.is-ready',{timeout:20000});
    assert.equal(!!(await page.$('.hatch-row.is-veiled')),false,'a demo browser is not held behind the email gate');
    const withPass=portraits.slice(before);
    assert.ok(withPass.length>=3&&withPass.every(h=>h['x-ah-pass']===pass),'demo pass sent with every call');
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({visitorId:'sent',unlimitedParam:'ignored',refusedPortraits:refused,limitPops:pops,demoPass:'sent'}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
