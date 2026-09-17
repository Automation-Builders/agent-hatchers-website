// Local rendered-page regression check. Requires Playwright + Chromium and a static
// server at PROTOTYPE_TEST_URL (default http://127.0.0.1:8768). No remote calls allowed.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const browser=await chromium.launch({headless:true,channel:'chromium'});
  try{
    for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
      const context=await browser.newContext({viewport});
      const page=await context.newPage();const errors=[];let blocked=0;
      page.on('pageerror',e=>errors.push(e.message));
      await context.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.origin!==origin){blocked++;return route.fulfill({status:400,contentType:'application/json',body:'{}'});}
        if(url.pathname==='/prototype/app.js'){
          const response=await route.fetch();
          let source=await response.text();
          // Test-only state access: unchanged production rendering/bind/restore functions.
          source=source.replace('  root.dataset.build=BUILD;', '  window.testApp={state,render,addAgent,writeSession,researchTeam};\n  root.dataset.build=BUILD;');
          return route.fulfill({response,body:source});
        }
        await route.continue();
      });
      await page.goto(origin+'/prototype/');await page.waitForSelector('#biz-intro');
      for(const [biz,expected] of [['online travel agency',7],['online clothing retailer',10],['unknown business',7]]){
        await page.evaluate(({biz})=>{const {state,render}=window.testApp;Object.assign(state,{biz,industry:'',name:'Retail Warehouse',look:'shop full of stock',step:4,tab:'market',team:{ids:['returns','inventory','logistics','support'],lines:{}},added:[],variant:null});render();},{biz});
        const cards=await page.locator('.mkt-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.agent));
        assert.equal(cards.length,expected);
        if(expected===7)for(const id of ['returns','inventory','logistics'])assert.ok(!cards.includes(id));
        else for(const id of ['returns','inventory','logistics'])assert.ok(cards.includes(id));
        console.log(JSON.stringify({viewport,biz,cards}));
      }
      await page.locator('[data-add="website"]').click();
      assert.ok(await page.evaluate(()=>window.testApp.state.added.includes('website')),'eligible Add action still works');
      await page.evaluate(async()=>{
        const {state,render,addAgent,writeSession}=window.testApp;state.biz='travel agency';state.added=['inventory'];
        addAgent('returns');if(state.added.includes('returns'))throw Error('invalid add accepted');
        await writeSession({v:1,build:67,step:4,name:'Test',biz:state.biz,industry:'',slots:[{status:'ready',image:''}],variant:null,team:{ids:['returns','inventory','support'],lines:{}},added:state.added,tab:'market'});
      });
      await page.reload();await page.waitForSelector('.mkt-card');
      assert.equal(await page.locator('.mkt-card[data-agent="returns"]').count(),0);
      assert.equal(await page.locator('.mkt-card[data-agent="inventory"]').count(),0);
      await page.locator('[data-tab="profiles"]').click();
      assert.ok(await page.locator('[data-agent="inventory"]').count()>0,'intentional installed agent survives restore');
      assert.equal(await page.locator('[data-agent="returns"]').count(),0);
      assert.deepEqual(errors,[]);
      console.log(JSON.stringify({viewport,restored:true,pageErrors:errors,remoteRequestsBlocked:blocked}));
      await context.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
