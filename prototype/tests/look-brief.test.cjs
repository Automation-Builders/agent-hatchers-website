// The design brief sent to the portrait proxy (designBrief / lookBrief in app.js).
// 23 Nov 2026: "an airplane" and "a cute orange cat" came back as robots holding tools. The
// prospect's words now decide what the character is, and they must come FIRST in the brief:
// with the rule first and their words last the model drew robots again (checked against the
// live proxy). The proxy trims briefs at 600 characters, so the page cuts their words, never
// the rule. Run: node --test prototype/tests/look-brief.test.cjs
const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('fs');const path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const axes=src.slice(src.indexOf('  const DESIGN_AXES='),src.indexOf('  const shuffle='));
const fns=src.slice(src.indexOf('  function designBrief('),src.indexOf('\n  }\n',src.indexOf('  function lookBrief('))+4);
const brief=(look,v=0)=>new Function('state',axes+'const PHOTO_STYLES=["a photo style"];'+fns+'return designBrief;')({look,axes:null,refPhoto:''})(v);
test('their words lead the brief',()=>{
  const b=brief('an airplane');
  assert.ok(b.startsWith('The customer’s words for the look: "an airplane"'),b);
  assert.match(b,/the character IS that/);
  assert.doesNotMatch(b,/Show ONE robot/);
});
test('the three designs differ',()=>{
  assert.equal(new Set([0,1,2].map(v=>brief('a cute orange cat',v))).size,3);
});
test('fits the proxy limit and never loses the rule',()=>{
  for(const n of [1,60,150,250,600]){
    for(const v of [0,1,2,3]){
      const b=brief('w'.repeat(n),v);
      assert.ok(b.length<=590,`${n} chars → ${b.length}`);
      assert.match(b,/reads as an AI agent/);
    }
  }
});
test('no words: a robot',()=>{
  assert.match(brief('',0),/^A friendly robot with /);
});
