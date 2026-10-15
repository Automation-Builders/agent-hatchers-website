// Local rendered-page regression check. Requires Playwright + Chromium and a static
// server at PROTOTYPE_TEST_URL (default http://127.0.0.1:8768). No remote calls allowed.
// 15 Oct 2026 (QA): company and agent names typed on "Create your agent" were lost on
// Back → Next and on reload, before "Hatch 3 designs" was pressed.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const browser=await chromium.launch({headless:true,channel:'chromium'});
  try{
    const context=await browser.newContext({viewport:{width:1280,height:800}});
    const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await context.route('**/*',route=>new URL(route.request().url()).origin!==origin
      ?route.fulfill({status:400,contentType:'application/json',body:'{}'}):route.continue());
    await page.goto(origin+'/prototype/');await page.waitForSelector('#biz-intro');
    await page.fill('#biz-intro','small Brisbane plumbing business');
    await page.click('[data-action="team"]');await page.waitForSelector('#agent-co');
    const typed={'#agent-co':'Pipe Pros','#agent-name':'Pip','#agent-look':'a robot plumber with a wrench'};
    const check=async when=>{for(const [sel,v] of Object.entries(typed))assert.equal(await page.inputValue(sel),v,`${sel} after ${when}`);};
    for(const [sel,v] of Object.entries(typed))await page.fill(sel,v);
    await page.click('[data-action="back"]');await page.waitForSelector('#biz-intro');
    await page.click('[data-action="team"]');await page.waitForSelector('#agent-co');
    await check('Back → Next');
    await page.fill('#agent-name','Pip');await page.waitForTimeout(700);   // past the 400ms save debounce
    await page.reload();await page.waitForSelector('#agent-co');
    await check('reload');
    assert.deepEqual(errors,[]);
    console.log('names persist across Back and reload');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
