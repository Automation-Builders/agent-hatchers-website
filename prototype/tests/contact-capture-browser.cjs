// Local rendered-page regression check. Requires Playwright + Chromium and a static
// server at PROTOTYPE_TEST_URL (default http://127.0.0.1:8768). No remote calls allowed.
// 16 Nov 2026: prospects finished the flow without leaving a name or email. The hatch screen
// now asks; this checks the card shows, rejects a bad email, sends the details with the
// session save, and keeps them across a reload.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const shot=process.env.SHOT||'';
  const browser=await chromium.launch({headless:true,...(process.env.CHROME?{executablePath:process.env.CHROME}:{channel:'chromium'})});
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    const page=await context.newPage();const errors=[];const saves=[];
    page.on('pageerror',e=>errors.push(e.message));
    await context.route('**/*',route=>{const u=new URL(route.request().url());
      if(u.origin===origin)return route.continue();
      if(/prototype-session/.test(u.pathname)&&route.request().method()==='POST'){try{saves.push(JSON.parse(route.request().postData()));}catch(e){}return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});}
      return route.fulfill({status:400,contentType:'application/json',body:'{}'});});
    await page.goto(origin+'/prototype/');await page.waitForSelector('#biz-intro');
    await page.fill('#biz-intro','small Brisbane plumbing business');
    await page.click('[data-action="team"]');await page.waitForSelector('#agent-co');
    await page.fill('#agent-co','Pipe Pros');await page.fill('#agent-name','Pip');await page.fill('#agent-look','a robot plumber with a wrench');
    await page.click('[data-action="generate"]');
    await page.waitForSelector('#who-card');
    await page.fill('#who-name','Jane Doe');await page.fill('#who-email','jane@pipepros');
    await page.click('.who-btn');
    assert.equal(await page.getAttribute('#who-email','aria-invalid'),'true','bad email rejected');
    if(shot)await page.screenshot({path:shot.replace('.png','-card.png')});
    await page.fill('#who-email','Jane@PipePros.com.au');await page.click('.who-btn');
    await page.waitForSelector('.who-done');
    assert.match(await page.textContent('.who-done'),/Thanks, Jane.*Jane@PipePros\.com\.au/);
    if(shot)await page.screenshot({path:shot});
    await page.waitForTimeout(1500);
    const last=saves[saves.length-1];
    assert.ok(last,'session pushed');assert.equal(last.you,'Jane Doe');assert.equal(last.email,'Jane@PipePros.com.au');
    await page.waitForTimeout(800);
    const snap=await page.evaluate(()=>new Promise(ok=>{const r=indexedDB.open('ah-prototype',1);r.onsuccess=()=>{const q=r.result.transaction('session','readonly').objectStore('session').get('/prototype/');q.onsuccess=()=>ok(q.result);};}));
    assert.equal(snap.email,'Jane@PipePros.com.au');assert.equal(snap.contactSaved,true);
    assert.deepEqual(errors,[]);
    console.log('contact card: shown, validated, sent with the session save, kept for reload');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
