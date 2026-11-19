import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { buildSnapshot, hasAgent, signupUrl, checkSecret, TOKEN_RE, newHandoffToken } from '../lib/handoff.js';

const IMG = 'data:image/jpeg;base64,' + 'A'.repeat(400);
const SESSION = {
  sid: 'abcdef12-3456', v: 1, build: 85, page: '/prototype/', company: 'Pipe Pros', you: 'Jane', email: 'jane@pipepros.com.au',
  name: 'Piper', biz: 'Emergency plumbing  in Sydney', industry: 'Trades & construction', website: 'pipepros.com.au',
  tools: ['Xero', 'ServiceM8', 'Xero', ''], look: 'friendly blue robot', selectedImage: IMG,
  brand: { name: 'Pipe Pros', url: 'https://pipepros.com.au', colors: ['#1A2B3C', 'red', '#ffffff'] },
  team: {
    ids: ['sales', 'invoices', 'not-a-base'], intro: 'Your team',
    lines: { sales: { does: 'Chases quotes', job: 'Quote follow-up' } },
    agents: { sales: { name: 'Quote Chaser', summary: 'Follows up every quote' } },
    extras: [{ id: 'more-1', base: 'support', name: 'After-hours Line', summary: 'Answers at night', job: 'Night calls' }, { base: 'evil' }],
  },
  chats: { 0: [['me', 'hi']] }, profiles: [{ name: 'x' }], market: { sales: IMG },
};

test('snapshot carries the agreed fields and never the email, name, chats or profiles', () => {
  const s = buildSnapshot(SESSION, 1000);
  assert.equal(s.v, 1);
  assert.deepEqual(s.company, { name: 'Pipe Pros', business: 'Emergency plumbing in Sydney', industry: 'Trades & construction', website: 'pipepros.com.au', tools: ['Xero', 'ServiceM8'] });
  assert.equal(s.agent.name, 'Piper');
  assert.equal(s.agent.image, IMG);
  assert.deepEqual(s.agent.colors, ['#1a2b3c', '#ffffff']);
  assert.deepEqual(s.team.recommended.map(r => r.base), ['sales', 'invoices', 'support']);
  assert.equal(s.team.recommended[0].name, 'Quote Chaser');
  assert.equal(s.team.recommended[0].job, 'Quote follow-up');
  const text = JSON.stringify(s);
  for (const leak of ['jane', 'Jane', '"hi"', 'abcdef12-3456', 'evil']) assert.ok(!text.includes(leak), leak);
});

test('the placeholder company name and a bad image are dropped', () => {
  const s = buildSnapshot({ ...SESSION, company: 'Your Company', selectedImage: 'javascript:alert(1)' });
  assert.equal(s.company.name, '');
  assert.equal(s.agent.image, '');
  assert.ok(!hasAgent({ ...SESSION, selectedImage: '' }));
  assert.ok(hasAgent(SESSION));
});

test('the link carries only the token', () => {
  const t = newHandoffToken();
  assert.match(t, TOKEN_RE);
  const u = signupUrl(t, {});
  assert.equal(u, `https://agenthatchers.ai/register?v=4&setup=${t}`);
  assert.equal(signupUrl(t, { DASHBOARD_SIGNUP_URL: 'http://localhost:3080/register' }), `http://localhost:3080/register?setup=${t}`);
});

test('the secret check is exact and refuses short secrets', () => {
  const k = 'k'.repeat(40);
  assert.ok(checkSecret(k, { HANDOFF_SECRET: k }));
  assert.ok(!checkSecret(k.slice(1), { HANDOFF_SECRET: k }));
  assert.ok(!checkSecret('', { HANDOFF_SECRET: '' }));
  assert.ok(!checkSecret('short', { HANDOFF_SECRET: 'short' }));
});

test('endpoint: mint, claim once, then used; secrets and states enforced', async () => {
  const store = new Map();
  mock.module('@vercel/blob', { namedExports: {
    put: async (p, body) => { store.set(p, String(body)); return {}; },
    get: async p => store.has(p) ? { statusCode: 200, stream: new Response(store.get(p)).body } : null,
  }});
  const SECRET = 's'.repeat(40);
  Object.assign(process.env, { HANDOFF_SECRET: SECRET, BLOB_READ_WRITE_TOKEN: 'x' });
  store.set('sessions/abcdef12-3456.json', JSON.stringify(SESSION));
  store.set('sessions/nohatch1-0000.json', JSON.stringify({ ...SESSION, selectedImage: '' }));
  const { default: handler } = await import('../api/playground-handoff.js');
  const call = async (body, headers = {}, method = 'POST') => {
    const out = { headers: {} };
    const res = {
      setHeader: (k, v) => { out.headers[k] = v; },
      status(c) { out.status = c; return this; },
      json(o) { out.body = o; return this; },
      end() { return this; },
    };
    await handler({ method, headers: { origin: 'https://agenthatchers.com', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) }, res);
    return out;
  };

  assert.equal((await call({ sid: 'bad sid' })).status, 400);
  assert.equal((await call({ sid: 'missing1-0000' })).status, 404);
  assert.equal((await call({ sid: 'nohatch1-0000' })).status, 409);

  const minted = await call({ sid: 'abcdef12-3456' });
  assert.equal(minted.status, 200);
  assert.equal(minted.headers['Access-Control-Allow-Origin'], 'https://agenthatchers.com');
  const token = new URL(minted.body.url).searchParams.get('setup');
  assert.match(token, TOKEN_RE);
  assert.ok(!minted.body.url.includes('jane'));

  // A later write to the session does not change what was minted.
  store.set('sessions/abcdef12-3456.json', JSON.stringify({ ...SESSION, name: 'Changed' }));

  assert.equal((await call({ token }, { 'x-handoff-key': 'wrong'.padEnd(40, 'x') })).status, 401);
  assert.equal((await call({ token: 'x'.repeat(32) }, { 'x-handoff-key': SECRET })).status, 404);
  const claimed = await call({ token }, { 'x-handoff-key': SECRET });
  assert.equal(claimed.status, 200);
  assert.equal(claimed.body.snapshot.agent.name, 'Piper');
  assert.ok(!store.get(`handoffs/${token}.json`).includes('Piper'), 'the claim drops the snapshot');
  const again = await call({ token }, { 'x-handoff-key': SECRET });
  assert.deepEqual([again.status, again.body.error], [410, 'used']);

  const old = await call({ sid: 'abcdef12-3456' });
  const oldToken = new URL(old.body.url).searchParams.get('setup');
  const rec = JSON.parse(store.get(`handoffs/${oldToken}.json`));
  store.set(`handoffs/${oldToken}.json`, JSON.stringify({ ...rec, expiresAt: Date.now() - 1 }));
  const expired = await call({ token: oldToken }, { 'x-handoff-key': SECRET });
  assert.deepEqual([expired.status, expired.body.error], [410, 'expired']);

  assert.equal((await call({}, {}, 'GET')).status, 405);
  delete process.env.HANDOFF_SECRET;
  assert.equal((await call({ sid: 'abcdef12-3456' })).status, 503);
});
