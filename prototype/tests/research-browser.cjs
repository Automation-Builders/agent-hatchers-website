// The researched team must survive the create screen. Two regressions this guards:
//  1. a slow research answer was thrown away when "Type of company" no longer matched the intro
//     answer word for word, leaving the stock team;
//  2. a first run that failed was never retried, even once the company name was known.
// Serve the repo root at PROTOTYPE_TEST_URL (default http://127.0.0.1:8768). No remote calls.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const ROLES=[['support','Booking Change Agent'],['sales','Group Quote Agent'],['documents','Itinerary Pack Agent'],['invoices','Supplier Payment Agent'],['marketing','Deal Alert Agent'],['website','Fare Page Agent']];
const team=()=>({intro:'You juggle fares and changes all week.',researched:true,team:ROLES.map(([id,name])=>({id,name,does:`Handles your ${name.toLowerCase()} work.`,job:'does the job'})),more:[]});
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const browser=await chromium.launch({headless:true});
  try{
    for(const mode of ['slow','fail-then-ok']){
      const context=await browser.newContext({viewport:{width:1280,height:900}});
      const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
      const asks=[];
      await context.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.pathname.endsWith('/api/prototype-team')){
          const body=JSON.parse(route.request().postData()||'{}');asks.push(body);
          if(mode==='fail-then-ok'&&asks.length<=2)return route.fulfill({status:502,contentType:'application/json',body:'{"error":"No usable team"}'});
          if(mode==='slow')await new Promise(r=>setTimeout(r,4000));
          return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(team())});
        }
        if(url.origin!==origin)return route.fulfill({status:400,contentType:'application/json',body:'{}'});
        if(url.pathname==='/prototype/app.js'){const r=await route.fetch();let s=await r.text();s=s.replace('  root.dataset.build=BUILD;','  window.testApp={state};\n  root.dataset.build=BUILD;');return route.fulfill({response:r,body:s});}
        return route.continue();
      });
      await page.goto(origin+'/prototype/');await page.waitForSelector('#biz-intro');
      const long='Y Travels is a family-run travel agency in Brisbane booking group tours and cruises';   // over 60 characters
      await page.fill('#biz-intro',long);
      await page.click('[data-action="team"]');
      await page.waitForSelector('#agent-name');
      if(mode==='fail-then-ok')await page.waitForFunction(()=>window.testApp.state.team&&window.testApp.state.team.source==='fallback',null,{timeout:15000});
      await page.fill('#agent-co','Y Travels');await page.fill('#agent-name','Yara');
      // The prospect tidies "Type of company" while the research is still thinking.
      if(mode==='slow')await page.fill('#agent-biz','travel agency');
      await page.click('[data-action="generate"]');
      await page.waitForFunction(()=>{const t=window.testApp.state.team;return t&&!window.testApp.state.teamBusy&&t.source!=='fallback';},null,{timeout:20000});
      const t=await page.evaluate(()=>window.testApp.state.team);
      assert.equal(t.agents.support.name,'Booking Change Agent');
      if(mode==='fail-then-ok')assert.equal(asks.at(-1).company,'Y Travels','the retry knows the company');
      assert.deepEqual(errors,[]);
      console.log(JSON.stringify({mode,asks:asks.length,team:Object.values(t.agents).map(a=>a.name)}));
      await context.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
