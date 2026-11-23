// Serve the repo at PROTOTYPE_TEST_URL; intercept all off-origin requests.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
  const origin=process.env.PROTOTYPE_TEST_URL||'http://127.0.0.1:8768';
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext();const page=await context.newPage();
    let fixture='';const requests=[];
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.pathname.endsWith('/api/prototype-portrait')&&fixture){requests.push(route.request().postDataJSON());return route.fulfill({json:{image:fixture}});}
      if(url.origin!==origin)return route.fulfill({status:400,contentType:'application/json',body:'{}'});
      if(url.pathname==='/prototype/app.js'){
        const r=await route.fetch();const body=(await r.text()).replace('  root.dataset.build=BUILD;', '  window.testApp={keyOut,pickKey,state,buildCapture,generateMarket,render};\n  root.dataset.build=BUILD;');
        return route.fulfill({response:r,body});
      }
      return route.continue();
    });
    await page.goto(origin+'/prototype/');
    const result=await page.evaluate(async()=>{
      const {keyOut,pickKey,state,buildCapture}=window.testApp;
      const make=bg=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,64,64);g.fillStyle='#888888';g.fillRect(12,12,16,16);g.fillStyle='#ff8800';g.fillRect(36,36,16,16);return c.toDataURL();};
      const pixels=async src=>{const im=new Image();im.src=src;await im.decode();const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.drawImage(im,0,0,64,64);return [0,20,40].map(x=>Array.from(g.getImageData(x,x,1,1).data));};
      const outputs=[];
      for(const [key,bg] of [['magenta','#ff00ff'],['green','#00ff00']])outputs.push(await pixels(await keyOut(make(bg),key)));
      const white=make('#ffffff');const unchanged=await keyOut(white,'magenta')===white;
      const pink=make('#ffffff');const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const im=new Image();im.src=pink;await im.decode();g.drawImage(im,0,0);g.fillStyle='#ef55bb';g.fillRect(16,16,24,24);
      const selected=await pickKey(c.toDataURL()),neutral=await pickKey(white);
      const cut=await keyOut(make('#ff00ff'),'magenta');state.marketImages={_hero:cut,support:cut};state.profiles=[{status:'complete',img:cut}];
      const capture=await buildCapture();
      return {outputs,unchanged,selected,neutral,saved:await pixels(capture.market._hero),profile:await pixels(capture.profiles[0].img),format:capture.market.support.slice(0,20)};
    });
    for(const pixels of result.outputs){
      assert.equal(pixels[0][3],0);assert.deepEqual(pixels[1],[136,136,136,255]);assert.deepEqual(pixels[2],[255,136,0,255]);
    }
    for(const pixels of [result.saved,result.profile]){assert.equal(pixels[0][3],0);assert.equal(pixels[1][3],255);assert.equal(pixels[2][3],255);}
    assert.equal(result.unchanged,true);assert.equal(result.selected,'green');assert.equal(result.neutral,'magenta');
    assert.match(result.format,/^data:image\/(webp|png)/);assert.deepEqual(errors,[]);
    // Exercise the actual re-dress path, including the hero and extra chat profiles.
    const original=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,64,64);g.fillStyle='#888';g.fillRect(20,20,24,24);return c.toDataURL();});
    fixture=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#f0f';g.fillRect(0,0,64,64);g.fillStyle='#888';g.fillRect(20,20,24,24);return c.toDataURL();});
    if(process.env.PROTOTYPE_CARD_FIXTURES)fixture='data:image/png;base64,'+fs.readFileSync(path.join(process.env.PROTOTYPE_CARD_FIXTURES,'live-key.png')).toString('base64');
    await page.evaluate(async original=>{const {state,generateMarket,render}=window.testApp;Object.assign(state,{name:'Molar',biz:'dental practice',industry:'healthcare',variant:0,selectedImage:original,step:4,tab:'profiles',marketImages:{},profiles:[],marketStarted:false,downloadOffered:true});await generateMarket();render();},original);
    assert.ok(requests.length>7,'hero, catalog and extra profiles requested');
    for(const req of requests){assert.equal(req.bg,'magenta');assert.equal(req.image,original);assert.ok(!req.role.includes('white background'));}
    assert.equal(requests.filter(r=>r.role.includes('nothing added or removed')).length,1);
    assert.equal(await page.evaluate(()=>window.testApp.state.selectedImage),original);
    assert.ok(await page.evaluate(()=>window.testApp.state.marketImages._hero));
    assert.equal(await page.locator('[data-thumb="__you"] img').getAttribute('src'),await page.evaluate(()=>window.testApp.state.marketImages._hero));
    if(process.env.PROTOTYPE_SCREENSHOT_DIR){
      fs.mkdirSync(process.env.PROTOTYPE_SCREENSHOT_DIR,{recursive:true});
      for(const width of [1280,390]){
        await page.setViewportSize({width,height:900});
        for(const [tab,label] of [['profiles','agents'],['market','marketplace']]){
          await page.evaluate(tab=>{window.testApp.state.tab=tab;window.testApp.render();},tab);
          await page.locator('.dx-thumb img').first().waitFor();
          await page.evaluate(()=>Promise.all([...document.querySelectorAll('.dx-thumb img')].map(im=>im.decode().catch(()=>{}))));
          await page.screenshot({path:path.join(process.env.PROTOTYPE_SCREENSHOT_DIR,`${label}-${width}.png`),fullPage:true});
        }
      }
    }
    assert.deepEqual(errors,[]);
    console.log('transparent cards: magenta/green alpha, neutral/orange preservation, white fallback, pink key selection, saved market/profile alpha passed');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
