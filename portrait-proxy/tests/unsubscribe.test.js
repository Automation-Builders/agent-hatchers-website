import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { unsubToken, checkUnsubToken, unsubUrl } from '../lib/unsubscribe.js';
import { emailKey } from '../lib/agent-email.js';

const env = { SESSIONS_KEY: 'secret' };
test('token is tied to the session and the address', () => {
  const k = emailKey('jane@pipepros.com.au');
  const t = unsubToken('abcdef12-3456', k, env);
  assert.ok(checkUnsubToken('abcdef12-3456', k, t, env));
  assert.ok(!checkUnsubToken('abcdef12-9999', k, t, env));
  assert.ok(!checkUnsubToken('abcdef12-3456', emailKey('bob@x.com'), t, env));
  assert.ok(!checkUnsubToken('abcdef12-3456', k, t.slice(1), env));
  assert.ok(!checkUnsubToken('abcdef12-3456', k, t, {}), 'no secret, no unsubscribe links');
});
test('url carries the session, hash and token, never the address', () => {
  const u = unsubUrl('abcdef12-3456', 'Jane@PipePros.com.au', env);
  assert.match(u, /^https:\/\/agent-hatchers-portrait-proxy\.vercel\.app\/api\/unsubscribe\?s=abcdef12-3456&e=[0-9a-f]{32}&t=/);
  assert.ok(!u.toLowerCase().includes('pipepros'));
  assert.equal(unsubUrl('abcdef12-3456', 'x@y.com', {}), '');
});

test('endpoint: GET changes nothing, POST adds to the list, sends then skip', async () => {
  const store = new Map();
  mock.module('@vercel/blob', { namedExports: {
    put: async (p, body) => { store.set(p, String(body)); return {}; },
    get: async p => store.has(p) ? { statusCode: 200, stream: new Response(store.get(p)).body } : null,
    list: async () => ({ blobs: [], hasMore: false }), del: async ps => ps.forEach(p => store.delete(p))
  }});
  Object.assign(process.env, { SESSIONS_KEY: 'secret', BLOB_READ_WRITE_TOKEN: 'x', RESEND_API_KEY: 'k', SLACK_BOT_TOKEN: 's' });
  const sent = [], slack = [], contacts = [];
  globalThis.fetch = async (url, init = {}) => {
    url = String(url);
    if (url.includes('/emails')) { sent.push(JSON.parse(init.body)); return new Response('{"id":"e"}'); }
    if (url.includes('/contacts')) { contacts.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : null }); return new Response(init.method === 'GET' ? '{"unsubscribed":false}' : '{"id":"c"}'); }
    slack.push(init.body); return new Response('{}');
  };
  const { default: session } = await import('../api/prototype-session.js');
  const { default: unsub } = await import('../api/unsubscribe.js');
  const call = (h, req) => new Promise(ok => { const res = { setHeader() {}, status(c) { this.c = c; return this; }, json(b) { ok({ c: this.c, b }); }, send(b) { ok({ c: this.c, b }); }, end() { ok({ c: this.c }); } }; h({ headers: {}, query: {}, socket: {}, ...req }, res); });
  const save = b => call(session, { method: 'POST', body: JSON.stringify({ step: 3, page: '/prototype/', company: 'Pipe Pros', name: 'Pip', you: 'Jane', ...b }) });

  await save({ sid: 'aaaaaaaa-0001', email: 'jane@pipepros.com.au' });
  assert.equal(sent.length, 1);
  const link = new URL(sent[0].headers['List-Unsubscribe'].slice(1, -1));
  const query = Object.fromEntries(link.searchParams);

  const g = await call(unsub, { method: 'GET', query });
  assert.equal(g.c, 200); assert.match(g.b, /Unsubscribing/);
  assert.ok(![...store.keys()].some(k => k.startsWith('sessions-unsub/')), 'GET alone unsubscribes nobody');

  assert.equal((await call(unsub, { method: 'GET', query: { ...query, t: 'x'.repeat(32) } })).c, 400, 'forged token refused');

  const p = await call(unsub, { method: 'POST', query, body: 'List-Unsubscribe=One-Click' });
  assert.equal(p.c, 200); assert.match(p.b, /unsubscribed/);
  assert.ok(store.has(`sessions-unsub/${query.e}.json`));
  assert.ok(JSON.parse(store.get('sessions-index/aaaaaaaa-0001.json')).unsubscribed);
  assert.ok(slack.some(b => b.includes('unsubscribed from our emails')));
  assert.ok(contacts.some(c => c.method === 'POST' && c.body.email === 'jane@pipepros.com.au' && c.body.first_name === 'Jane'), 'added to the mailing list');
  assert.ok(contacts.some(c => c.method === 'PATCH' && c.body && c.body.unsubscribed === true && c.url.endsWith(encodeURIComponent('jane@pipepros.com.au'))), 'unsubscribed in Resend too');

  await save({ sid: 'aaaaaaaa-0001', email: 'jane@pipepros.com.au', step: 4 });
  assert.ok(JSON.parse(store.get('sessions-index/aaaaaaaa-0001.json')).unsubscribed, 'a later save keeps the flag');

  store.delete(`sessions-mail/${query.e}.json`);   // past the daily throttle
  await save({ sid: 'aaaaaaaa-0002', email: 'JANE@pipepros.com.au' });
  assert.equal(sent.length, 1, 'unsubscribed address is never emailed again');
  assert.match(JSON.parse(store.get('sessions-index/aaaaaaaa-0002.json')).mailed.reason, /unsubscribed/);
});
