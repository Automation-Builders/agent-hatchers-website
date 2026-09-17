const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
// Execute the actual selection/research functions without booting DOM or paid APIs.
function app(config={}, values={}, response=null){
  const requests=[];
  const code=source.slice(0,source.indexOf('  const MCP_SPRITE='))+
    source.slice(source.indexOf('  const PLAIN='),source.indexOf('  // "Other profiles"'))+
    '\nconst sleep=async()=>{}; window.test={state,rankAgents,topAgents,addAgent,researchTeam};})();';
  const window={PROTOTYPE_CONFIG:config};
  vm.runInNewContext(code,{window,document:{getElementById:()=>({})},Date,fetch:async(url,opts)=>{
    requests.push(JSON.parse(opts.body));return {ok:!!response,status:response?200:400,json:async()=>response};
  }});
  Object.assign(window.test.state,values);
  return {...window.test,requests};
}
const niche=['logistics','returns','inventory'];
const ids=a=>Array.from(a,x=>x.agent?x.agent.id:x.id);
function noNiche(actual){for(const id of niche)assert.ok(!actual.includes(id),`${id} must not be suggested: ${actual}`);}
for(const biz of ['online travel agency selling holidays, flights and hotel bookings','online education courses','software product consultancy','legal practice','healthcare clinic','property rental agency','financial advisory','construction company','hospitality hotel','marketing agency','workshop training','unknown business','']){
  test(`no physical-goods padding: ${biz||'unknown'}`,()=>{
    const a=app({}, {biz});noNiche(ids(a.rankAgents()));noNiche(ids(a.topAgents()));
    assert.ok(ids(a.rankAgents()).includes('support'));
  });
}
test('name, cosmetic look, tools and recommended IDs cannot grant eligibility',()=>{
  const a=app({recommendedAgents:niche},{biz:'travel agency',name:'Retail warehouse',look:'clothing shop with parcels',tools:['Shopify']});
  noNiche(ids(a.rankAgents()));
});
test('physical goods retail retains all three roles',()=>{
  const a=app({}, {industry:'Retail & e-commerce',biz:'online clothing retailer shipping goods'});
  for(const id of niche)assert.ok(ids(a.rankAgents()).includes(id));
});
test('configured industry works before input; current business overrides stale retail config',()=>{
  assert.ok(ids(app({industry:'retail'}).rankAgents()).includes('returns'));
  noNiche(ids(app({industry:'retail',industryLabel:'Retail'}, {biz:'travel agency'}).rankAgents()));
  noNiche(ids(app({industry:'travel',industryLabel:'Travel agency'}).rankAgents()));
});
test('role-specific evidence: cafe stock is not parcel returns; freight is not retail',()=>{
  const cafe=ids(app({}, {biz:'café restaurant'}).rankAgents());assert.ok(cafe.includes('inventory'));assert.ok(!cafe.includes('returns'));assert.ok(!cafe.includes('logistics'));
  const freight=ids(app({}, {biz:'freight courier'}).rankAgents());assert.ok(freight.includes('logistics'));assert.ok(!freight.includes('returns'));assert.ok(!freight.includes('inventory'));
});
test('standalone café allows inventory without returns or logistics',()=>{
  const ranked=ids(app({}, {biz:'café'}).rankAgents());
  assert.ok(ranked.includes('inventory'));
  assert.ok(!ranked.includes('returns'));
  assert.ok(!ranked.includes('logistics'));
});
test('digital commerce and negated goods are not physical retail',()=>{
  for(const biz of ['e-commerce selling digital downloads','online store selling courses','retail travel agency','consultancy with no physical goods or inventory','travel agency handling luggage and lost parcels','logistics software tracking shipments','software for clothing retailers'])noNiche(ids(app({}, {biz}).rankAgents()));
});
test('real hybrid business may offer physical goods alongside services',()=>{
  const ranked=ids(app({}, {biz:'travel agency also selling luggage and shipping parcels'}).rankAgents());for(const id of niche)assert.ok(ranked.includes(id));
});
test('saved AI suggestions are filtered and invalid-only teams fall back',()=>{
  const a=app({}, {biz:'travel agency',team:{ids:[...niche,'missing','support','support'],lines:{}}});
  assert.deepEqual(ids(a.topAgents()),['support']);
  a.state.team.ids=niche;noNiche(ids(a.topAgents()));assert.ok(a.topAgents().length>0);
});
test('explicit previously added agents are preserved, but invalid new add is refused',()=>{
  const a=app({}, {biz:'travel agency',added:['inventory']});
  assert.ok(ids(a.topAgents()).includes('inventory'));
  a.addAgent('returns');a.addAgent('missing');assert.deepEqual(a.state.added,['inventory']);
});
test('AI request roster and response both enforce eligibility',async()=>{
  const a=app({}, {biz:'travel agency'}, {team:[...niche,'support','documents','sales','operations','missing'].map(id=>({id}))});
  await a.researchTeam('travel agency');
  noNiche(a.requests[0].roster.map(a=>a.id));noNiche(a.state.team.ids);assert.equal(a.state.team.source,'ai');
});
test('invalid, duplicate and null AI entries cannot bypass safe fallback',async()=>{
  const a=app({}, {biz:'travel agency'}, {team:[null,{id:'returns'},{id:'missing'},{id:'support'},{id:'support'}]});
  await a.researchTeam('travel agency');noNiche(a.state.team.ids);assert.equal(a.state.team.source,'fallback');
});
test('offline fallback is relevant',async()=>{
  const a=app({}, {biz:'online travel agency'});await a.researchTeam(a.state.biz);noNiche(a.state.team.ids);assert.equal(a.state.team.source,'fallback');
});
