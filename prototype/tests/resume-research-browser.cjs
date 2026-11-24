// 24 Nov 2026: a tab closed while the team research was still running came back with no team
// and never asked again, so the dashboard kept the stock names for good. On reload the page
// must ask again and land the researched team.
// Serve the repo root at PROTOTYPE_TEST_URL (default http://127.0.0.1:8768). No remote calls.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const team={intro:'Chairs, recalls and claims all week.',researched:true,more:[],team:[['support','Recall Booking Agent'],['sales','Treatment Plan Agent'],['documents','Clinical Notes Agent'],['invoices','HICAPS Claims Agent']].map(([id,name])=>({id,name,does:`Handles ${name}.`,job:'does the job'}))};
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    let asks=0;
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.pathname.endsWith('/api/prototype-team')){
        asks++;
        if(asks===1)return;   // the first research never answers: the tab is closed while it runs
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(team)});
      }
      if(url.origin!==origin)return route.fulfill({status:400,contentType:'application/json',body:'{}'});
      if(url.pathname==='/prototype/app.js'){const r=await route.fetch();const s=(await r.text()).replace('  root.dataset.build=BUILD;','  window.testApp={state};\n  root.dataset.build=BUILD;');return route.fulfill({response:r,body:s});}
      return route.continue();
    });
    await page.goto(origin+'/prototype/');await page.waitForSelector('#biz-intro');
    await page.fill('#biz-intro','family dental clinic in Brisbane');
    await page.click('[data-action="team"]');await page.waitForSelector('#agent-co');
    await page.fill('#agent-co','Probe Dental');await page.waitForTimeout(800);   // past the save debounce
    assert.equal(asks,1);
    await page.reload();await page.waitForSelector('#agent-co');
    await page.waitForFunction(()=>{const t=window.testApp.state.team;return t&&!window.testApp.state.teamBusy;},null,{timeout:15000});
    const t=await page.evaluate(()=>window.testApp.state.team);
    assert.equal(asks,2,'research asked again after reload');
    assert.equal(t.source,'research');
    assert.ok(Object.values(t.agents).some(a=>a.name==='HICAPS Claims Agent'));
    assert.deepEqual(errors,[]);
    console.log('team research resumes after a reload mid-research');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
