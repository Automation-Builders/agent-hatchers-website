import test from 'node:test';
import assert from 'node:assert/strict';

delete process.env.VERCEL;
delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN;
delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN;
process.env.OPENROUTER_API_KEY = 'test-key';
process.env.SESSIONS_KEY = 'a-long-test-sessions-key';

const guardLib = await import('../lib/guard.js');
const { allow, clientIp, subjectOf, mintStaffPass, verifyStaffPass, _resetMemory } = guardLib;

// Every call to OpenRouter (or anything else) the endpoints make is counted here.
let upstream = [];
globalThis.fetch = async (url, init = {}) => {
  upstream.push(String(url));
  return new Response(JSON.stringify({ choices: [{ message: { content: 'x' } }], data: [{ b64_json: 'aGk=' }] }), { status: 200, headers: { 'content-type': 'application/json' } });
};

const req = (headers = {}, body = {}) => ({ method: 'POST', headers: { origin: 'https://agenthatchers.com', 'x-vercel-forwarded-for': '203.0.113.7', ...headers }, body, query: {} });
const call = (handler, r) => new Promise(ok => {
  const res = { h: {}, setHeader(k, v) { this.h[k.toLowerCase()] = v; }, status(c) { this.c = c; return this; }, json(b) { ok({ c: this.c, b, h: this.h }); }, end() { ok({ c: this.c, h: this.h }); }, send(b) { ok({ c: this.c, b, h: this.h }); } };
  handler(r, res);
});
const fresh = (limits) => { _resetMemory(); upstream = []; process.env.RATE_LIMITS = JSON.stringify(limits || {}); delete process.env.DAILY_SPEND_CAP_CENTS; };

const roster = [1, 2, 3, 4].map(i => ({ id: 'a' + i, name: 'Agent ' + i, summary: 'does things' }));
const ENDPOINTS = {
  portrait: ['../api/prototype-portrait.js', { brief: 'a friendly blue robot with a clipboard', name: 'Scout' }],
  team: ['../api/prototype-team.js', { business: 'dental clinic', roster }],
  chat: ['../api/prototype-chat.js', { question: 'Can you chase my unpaid invoices?', agent: 'Scout' }],
  profile: ['../api/prototype-profile.js', { name: 'Recall Agent', description: 'books recalls', roster }],
};

for (const [cls, [path, body]] of Object.entries(ENDPOINTS)) {
  test(`${cls}: a direct call past the limit is refused with 429 and OpenRouter is not called`, async () => {
    fresh({ [cls]: { visitor: 2, ip: 5 } });
    const { default: handler } = await import(path);
    // curl-style: no Origin, no visitor id
    const bare = { 'x-vercel-forwarded-for': '198.51.100.9' };
    await call(handler, req(bare, body));
    await call(handler, req(bare, body));
    const before = upstream.length;
    assert.ok(before > 0, 'the first calls reach OpenRouter');
    const r = await call(handler, req(bare, body));
    assert.equal(r.c, 429);
    assert.equal(r.b.limit, cls);
    assert.match(r.b.error, /free limit/);
    assert.ok(Number(r.h['retry-after']) > 0);
    assert.equal(upstream.length, before, 'no upstream call after the refusal');
  });
}

test('the IP limit holds when a script sends a new visitor id every time', async () => {
  fresh({ portrait: { visitor: 100, ip: 3 } });
  const { default: handler } = await import('../api/prototype-portrait.js');
  const codes = [];
  for (let i = 0; i < 5; i++) codes.push((await call(handler, req({ 'x-ah-visitor': 'visitor-' + i }, ENDPOINTS.portrait[1]))).c);
  assert.deepEqual(codes, [200, 200, 200, 429, 429]);
  assert.equal(upstream.length, 3);
});

test('two visitors behind one office IP each get their own visitor allowance', async () => {
  fresh({ chat: { visitor: 2, ip: 10 } });
  const { default: handler } = await import('../api/prototype-chat.js');
  const run = async v => { const out = []; for (let i = 0; i < 3; i++) out.push((await call(handler, req({ 'x-ah-visitor': v }, ENDPOINTS.chat[1]))).c); return out; };
  assert.deepEqual(await run('visitor-aaaa'), [200, 200, 429]);
  assert.deepEqual(await run('visitor-bbbb'), [200, 200, 429]);
});

test('the global daily cap refuses everyone once the estimated spend is used up, without counting refused callers', async () => {
  fresh({ portrait: { visitor: 1, ip: 100, cents: 8 } });
  process.env.DAILY_SPEND_CAP_CENTS = '16';
  const ok1 = await allow(req({ 'x-ah-visitor': 'visitor-0001' }), 'portrait');
  // one caller hammering past their own limit must not use up the shared cap
  for (let i = 0; i < 5; i++) assert.equal((await allow(req({ 'x-ah-visitor': 'visitor-0001' }), 'portrait')).scope, 'visitor');
  const ok2 = await allow(req({ 'x-ah-visitor': 'visitor-0002' }), 'portrait');
  const third = await allow(req({ 'x-ah-visitor': 'visitor-0003' }), 'portrait');
  assert.equal(ok1.ok, true); assert.equal(ok2.ok, true);
  assert.equal(third.ok, false); assert.equal(third.scope, 'daily'); assert.equal(third.status, 429);
});

test('limits reset the next UTC day', async () => {
  fresh({ team: { visitor: 1, ip: 1 } });
  const day = Date.UTC(2026, 10, 20, 23, 59);
  assert.equal((await allow(req(), 'team', { now: day })).ok, true);
  assert.equal((await allow(req(), 'team', { now: day + 30000 })).ok, false);
  assert.equal((await allow(req(), 'team', { now: day + 120000 })).ok, true);
});

test('a staff pass lifts the limits; a forged, expired or URL-made one does not', async () => {
  fresh({ portrait: { visitor: 1, ip: 1 } });
  const { pass, exp } = mintStaffPass('Noah');
  assert.ok(verifyStaffPass(pass)); assert.ok(exp > Date.now());
  for (let i = 0; i < 4; i++) assert.equal((await allow(req({ 'x-ah-pass': pass }), 'portrait')).ok, true);
  const [v, payload] = pass.split('.');
  const forged = `${v}.${Buffer.from(JSON.stringify({ n: 'x', exp: Date.now() + 1e9 })).toString('base64url')}.${pass.split('.')[2]}`;
  assert.equal(verifyStaffPass(forged), null);
  assert.equal(verifyStaffPass(mintStaffPass('Old', Date.now() - 31 * 86400000).pass), null);
  assert.equal(verifyStaffPass('1'), null);
  assert.ok(payload);
  assert.equal((await allow(req(), 'portrait')).ok, true);
  assert.equal((await allow(req({ 'x-ah-pass': forged }), 'portrait')).ok, false);
});

test('on Vercel with no counter store the paid endpoints refuse (503) and the free ones carry on', async () => {
  fresh();
  process.env.VERCEL = '1';
  try {
    const r = await allow(req(), 'portrait');
    assert.equal(r.ok, false); assert.equal(r.status, 503);
    assert.equal((await allow(req(), 'session')).ok, true);
  } finally { delete process.env.VERCEL; }
});

test('the Upstash REST store is used when configured, and a store error fails closed for paid calls', async () => {
  fresh();
  process.env.KV_REST_API_URL = 'https://kv.example.test'; process.env.KV_REST_API_TOKEN = 'tok';
  const seen = [];
  const counts = new Map();
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    seen.push(String(url));
    const cmds = JSON.parse(init.body);
    return new Response(JSON.stringify(cmds.map(c => {
      if (c[0] === 'SET') { if (!counts.has(c[1])) counts.set(c[1], 0); return { result: 'OK' }; }
      counts.set(c[1], counts.get(c[1]) + Number(c[2])); return { result: counts.get(c[1]) };
    })), { status: 200 });
  };
  try {
    process.env.RATE_LIMITS = JSON.stringify({ chat: { visitor: 1, ip: 5 } });
    assert.equal((await allow(req(), 'chat')).ok, true);
    assert.equal((await allow(req(), 'chat')).scope, 'visitor');
    assert.ok(seen.every(u => u === 'https://kv.example.test/pipeline'));
    globalThis.fetch = async () => new Response('nope', { status: 500 });
    assert.equal((await allow(req(), 'chat')).status, 503);
    assert.equal((await allow(req(), 'lead')).ok, true);
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN;
  }
});

test('who is counted: Vercel IP headers, IPv6 grouped by /64, visitor id only when well-formed', () => {
  assert.equal(clientIp({ headers: { 'x-vercel-forwarded-for': '203.0.113.7', 'x-forwarded-for': '1.1.1.1' } }), '203.0.113.7');
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '203.0.113.8, 10.0.0.1' } }), '203.0.113.8');
  assert.equal(clientIp({ headers: { 'x-real-ip': '2001:db8:aa:bb:1:2:3:4' } }), clientIp({ headers: { 'x-real-ip': '2001:db8:aa:bb::9' } }));
  assert.equal(clientIp({ headers: { 'x-real-ip': '::ffff:198.51.100.2' } }), '198.51.100.2');
  assert.equal(subjectOf({ headers: { 'x-ah-visitor': 'abc12345-xyz' } }), 'v:abc12345-xyz');
  assert.equal(subjectOf({ headers: { 'x-ah-visitor': 'bad id!', 'x-real-ip': '203.0.113.1' } }), 'ip:203.0.113.1');
});

test('CORS lets the page send the visitor id and staff pass', async () => {
  fresh();
  const { default: handler } = await import('../api/prototype-portrait.js');
  const r = await call(handler, { method: 'OPTIONS', headers: { origin: 'https://agenthatchers.com' } });
  assert.equal(r.c, 204);
  assert.equal(r.h['access-control-allow-origin'], 'https://agenthatchers.com');
  assert.match(r.h['access-control-allow-headers'], /x-ah-visitor/);
  assert.match(r.h['access-control-allow-headers'], /x-ah-pass/);
});
