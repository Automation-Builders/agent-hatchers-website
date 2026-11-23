// Local rendered-page regression check. Requires Playwright + Chromium and a static
// server at PROTOTYPE_TEST_URL (default http://127.0.0.1:8768). No remote calls allowed.
// 22 Nov 2026: on a domain the portrait proxy refused (a Vercel preview), a prospect asked for
// an airplane-style agent and got the same stock mascot three times, offered as "three takes on
// your description". A design that can't be drawn must say so and offer Try again, never be
// pickable, and a retry that works must hatch normally.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const browser=await chromium.launch({headless:true,...(process.env.CHROME?{executablePath:process.env.CHROME}:{channel:'chromium'})});
  try{
    for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
      const context=await browser.newContext({viewport});
      const page=await context.newPage();const errors=[];let draws=0;let proxyUp=false;
      page.on('pageerror',e=>errors.push(e.message));
      await context.route('**/*',route=>{const u=new URL(route.request().url());
        if(u.origin===origin)return route.continue();
        if(/prototype-portrait/.test(u.pathname)){draws++;return proxyUp
          ?route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({image:PNG})})
          :route.abort('failed');}   // what a CORS refusal looks like to the page
        if(/prototype-session/.test(u.pathname))return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});
        return route.fulfill({status:400,contentType:'application/json',body:'{}'});});
      await page.goto(origin+'/prototype/');await page.waitForSelector('#biz-intro');
      await page.fill('#biz-intro','small travel agency');
      await page.click('[data-action="team"]');await page.waitForSelector('#agent-co');
      await page.fill('#agent-co','Fly Co');await page.fill('#agent-name','Traveley');await page.fill('#agent-look','like an airplane');
      await page.click('[data-action="generate"]');
      await page.fill('#who-name','Test Person');await page.fill('#who-email','test@example.com');await page.click('.who-btn');
      await page.waitForFunction(()=>document.querySelectorAll('.egg-cell.is-failed').length===3,null,{timeout:30000});
      assert.equal(await page.locator('.egg-cell.is-failed').count(),3,'all three designs show as not drawn');
      assert.equal(await page.locator('.egg-cell.is-ready').count(),0,'no failed draw is offered as a design');
      assert.equal(await page.locator('.hx6-pop[src*="hatchy-pop"]').count(),0,'no stock mascot stands in');
      assert.equal(await page.$('[data-action="market"]'),null,'no Use this avatar');
      if(process.env.SHOT)await page.screenshot({path:process.env.SHOT.replace('.png',`-${viewport.width}.png`)});
      assert.match(await page.textContent('.hatch-status'),/couldn’t draw Traveley/);
      await page.locator('.egg-cell.is-failed').first().click();
      assert.equal(await page.$('.egg-cell.selected'),null,'a failed design cannot be picked');
      const hatches=await page.evaluate(()=>localStorage.getItem('ah-hatches'));
      // The proxy is back: one egg's Try again redraws that egg only, then Try again does the rest.
      proxyUp=true;const before=draws;
      await page.click('[data-egg-retry="0"]');
      await page.waitForSelector('.egg-cell[data-egg="0"].is-ready',{timeout:20000});
      assert.equal(draws-before,1,'one retry draws one design');
      assert.equal(await page.locator('.egg-cell.is-failed').count(),2);
      await page.locator('.egg-cell.is-ready').first().click();
      assert.ok(await page.$('.egg-cell.selected'),'a drawn design can be picked');
      await page.waitForSelector('[data-action="market"]');
      await page.click('[data-egg-retry="1"]');await page.click('[data-egg-retry="2"]');
      await page.waitForFunction(()=>document.querySelectorAll('.egg-cell.is-ready').length===3,null,{timeout:20000});
      assert.equal(await page.evaluate(()=>localStorage.getItem('ah-hatches')),hatches,'Try again is not another hatch');
      // The dashboard's agent portraits can't be drawn either: once that settles, cards show the
      // agent's own picture and stay that way when the page re-renders (no "Hatching…" egg back).
      proxyUp=false;
      await page.click('[data-action="market"]');
      await page.waitForSelector('.dx');
      await page.waitForFunction(()=>!document.querySelector('.dx-thumb.is-loading'),null,{timeout:45000});
      await page.locator('[data-tab="market"]:visible').first().click();await page.waitForSelector('.mkt-card');
      await page.locator('[data-tab="profiles"]:visible').first().click();await page.waitForSelector('.dx-card');
      assert.equal(await page.locator('.dx-thumb.is-loading').count(),0,'no card goes back to the loader');
      assert.deepEqual(errors,[]);
      console.log(JSON.stringify({viewport,failedShown:3,retried:true,cardsSettled:true,pageErrors:errors}));
      await context.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
