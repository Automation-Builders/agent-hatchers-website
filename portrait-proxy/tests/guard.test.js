import test from 'node:test';
import assert from 'node:assert/strict';

delete process.env.VERCEL;
delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN;
delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN;
process.env.OPENROUTER_API_KEY = 'test-key';
process.env.SESSIONS_KEY = 'a-long-test-sessions-key';
process.env.STAFF_PASS_SECRET = 'p'.repeat(40);

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
const fresh = (limits) => { _resetMemory(); upstream = []; process.env.RATE_LIMITS = JSON.stringify(limits || {}); delete process.env.DAILY_SPEND_CAP_CENTS; delete process.env.IP_SPEND_CAP_CENTS; };

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

test('limits reset at midnight Australian Eastern time (14:00 UTC), not midnight UTC', async () => {
  fresh({ team: { visitor: 1, ip: 1 } });
  const day = Date.UTC(2026, 10, 20, 13, 59);   // 23:59 in Brisbane
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

test('one IP can only spend its own share of the day, and refused calls do not eat the shared cap', async () => {
  fresh({ portrait: { visitor: 100, ip: 100, cents: 8 } });
  process.env.IP_SPEND_CAP_CENTS = '16';
  process.env.DAILY_SPEND_CAP_CENTS = '24';
  const a = { 'x-vercel-forwarded-for': '203.0.113.50' }, b = { 'x-vercel-forwarded-for': '203.0.113.51' };
  assert.equal((await allow(req(a), 'portrait')).ok, true);
  assert.equal((await allow(req(a), 'portrait')).ok, true);
  for (let i = 0; i < 4; i++) { const r = await allow(req(a), 'portrait'); assert.equal(r.ok, false); assert.equal(r.scope, 'ip'); }
  assert.equal((await allow(req(b), 'portrait')).ok, true, 'the other IP still has the last 8 cents of the day');
  assert.equal((await allow(req(b), 'portrait')).scope, 'daily');
});

test('a 12-hour pass for someone else\'s computer expires after 12 hours; no pass without STAFF_PASS_SECRET', async () => {
  const t0 = Date.now();
  const short = mintStaffPass('Noah', t0, 12);
  assert.ok(verifyStaffPass(short.pass, t0 + 11 * 3600000));
  assert.equal(verifyStaffPass(short.pass, t0 + 13 * 3600000), null);
  const secret = process.env.STAFF_PASS_SECRET;
  try {
    delete process.env.STAFF_PASS_SECRET;
    assert.equal(mintStaffPass('Noah'), null, 'SESSIONS_KEY alone does not sign passes');
    assert.equal(verifyStaffPass(short.pass), null);
  } finally { process.env.STAFF_PASS_SECRET = secret; }
});

test('on Vercel with no counter store connected yet, limits still count (in memory) and Slack is told once', async () => {
  fresh({ portrait: { visitor: 2, ip: 5 } });
  process.env.VERCEL = '1'; process.env.SLACK_BOT_TOKEN = 'xoxb-test';
  const realFetch = globalThis.fetch, slack = [];
  globalThis.fetch = async (url, init) => { if (String(url).includes('slack')) slack.push(JSON.parse(init.body).text); return new Response('{}'); };
  try {
    const codes = [];
    for (let i = 0; i < 3; i++) codes.push((await allow(req(), 'portrait')).ok);
    assert.deepEqual(codes, [true, true, false], 'the playground keeps working and the limit still holds');
    assert.equal((await allow(req(), 'session')).ok, true);
    assert.equal(slack.length, 1);
    assert.match(slack[0], /no Upstash store/);
  } finally { globalThis.fetch = realFetch; delete process.env.VERCEL; delete process.env.SLACK_BOT_TOKEN; }
});

// A stand-in for Upstash's /pipeline endpoint; Slack posts are recorded separately.
function fakeUpstash() {
  const counts = new Map(), seen = [], slack = [];
  const fetchImpl = async (url, init) => {
    url = String(url);
    if (url.includes('slack')) { slack.push(JSON.parse(init.body).text); return new Response('{"ok":true}'); }
    seen.push(url);
    const cmds = JSON.parse(init.body);
    return new Response(JSON.stringify(cmds.map(c => {
      if (c[0] === 'SET') { if (!counts.has(c[1])) counts.set(c[1], 0); return { result: 'OK' }; }
      counts.set(c[1], counts.get(c[1]) + Number(c[2])); return { result: counts.get(c[1]) };
    })), { status: 200 });
  };
  return { fetchImpl, seen, slack };
}
const withStore = async fn => {
  const realFetch = globalThis.fetch;
  process.env.KV_REST_API_URL = 'https://kv.example.test'; process.env.KV_REST_API_TOKEN = 'tok';
  process.env.SLACK_BOT_TOKEN = 'xoxb-test';
  try { await fn(); } finally {
    globalThis.fetch = realFetch;
    delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN; delete process.env.SLACK_BOT_TOKEN;
  }
};

test('the Upstash REST store is used when configured', async () => {
  fresh({ chat: { visitor: 1, ip: 5 } });
  await withStore(async () => {
    const up = fakeUpstash(); globalThis.fetch = up.fetchImpl;
    assert.equal((await allow(req(), 'chat')).ok, true);
    assert.equal((await allow(req(), 'chat')).scope, 'visitor');
    assert.ok(up.seen.length && up.seen.every(u => u === 'https://kv.example.test/pipeline'));
  });
});

test('if the store fails at run time, counting carries on in memory and Slack is told once', async () => {
  fresh({ chat: { visitor: 2, ip: 5 } });
  await withStore(async () => {
    const slack = [];
    globalThis.fetch = async (url, init) => {
      if (String(url).includes('slack')) { slack.push(JSON.parse(init.body).text); return new Response('{}'); }
      return new Response('nope', { status: 500 });
    };
    const codes = [];
    for (let i = 0; i < 3; i++) codes.push((await allow(req(), 'chat')).ok);
    assert.deepEqual(codes, [true, true, false], 'still limited while the store is down');
    assert.equal((await allow(req(), 'lead')).ok, true);
    assert.equal(slack.length, 1);
    assert.match(slack[0], /counter store failed/);
  });
});

test('Slack hears when the day passes 80% and 100% of the budget, once each', async () => {
  fresh({ portrait: { visitor: 100, ip: 100, cents: 10 } });
  process.env.DAILY_SPEND_CAP_CENTS = '50';
  await withStore(async () => {
    const up = fakeUpstash(); globalThis.fetch = up.fetchImpl;
    const results = [];
    for (let i = 0; i < 7; i++) results.push((await allow(req({ 'x-ah-visitor': 'visitor-' + i + 'xxxx' }), 'portrait')).ok);
    assert.deepEqual(results, [true, true, true, true, true, false, false]);
    assert.equal(up.slack.length, 2);
    assert.match(up.slack[0], /80%/);
    assert.match(up.slack[1], /reached/);
  });
});

test('a team browser is not limited on session saves and emails either', async () => {
  fresh({ mail: { ip: 1 }, session: { ip: 1, window: 3600 } });
  const { pass } = mintStaffPass('Noah');
  for (let i = 0; i < 5; i++) {
    assert.equal((await allow(req({ 'x-ah-pass': pass }), 'mail')).ok, true);
    assert.equal((await allow(req({ 'x-ah-pass': pass }), 'session')).ok, true);
  }
  assert.equal((await allow(req(), 'mail')).ok, true);
  assert.equal((await allow(req(), 'mail')).ok, false);
});

test('who is counted: Vercel IP headers, IPv6 grouped by /64, visitor id only when well-formed', () => {
  assert.equal(clientIp({ headers: { 'x-vercel-forwarded-for': '203.0.113.7', 'x-forwarded-for': '1.1.1.1' } }), '203.0.113.7');
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '203.0.113.8, 10.0.0.1' } }), '203.0.113.8');
  assert.equal(clientIp({ headers: { 'x-real-ip': '2001:db8:aa:bb:1:2:3:4' } }), clientIp({ headers: { 'x-real-ip': '2001:db8:aa:bb::9' } }));
  assert.equal(clientIp({ headers: { 'x-real-ip': '::ffff:198.51.100.2' } }), '198.51.100.2');
  assert.equal(subjectOf({ headers: { 'x-ah-visitor': 'abc12345-xyz' } }), 'v:abc12345-xyz');
  assert.equal(subjectOf({ headers: { 'x-ah-visitor': 'bad id!', 'x-real-ip': '203.0.113.1' } }), 'ip:203.0.113.1');
});

test('CORS allows the website\'s own Vercel previews, not look-alikes', async () => {
  const { originAllowed } = guardLib;
  for (const o of ['https://agenthatchers.com', 'https://agent-hatchers-website-git-design-playground-v5-agenthatchers.vercel.app',
    'https://agent-hatchers-website-git-fix-playground-608ff6-agenthatchers.vercel.app', 'https://agent-hatchers-website-k3j2h1g0f-agenthatchers.vercel.app'])
    assert.equal(originAllowed(o), true, o);
  for (const o of ['', 'https://evil.example', 'http://agent-hatchers-website-git-x-agenthatchers.vercel.app',
    'https://agent-hatchers-website-git-x-agenthatchers.vercel.app.evil.example', 'https://agent-hatchers-website-git-x-agenthatchers2.vercel.app',
    'https://other-project-git-x-agenthatchers.vercel.app'])
    assert.equal(originAllowed(o), false, o);
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
