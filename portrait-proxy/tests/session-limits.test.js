import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// The public session save: per-IP limits on prospect emails and Slack pings hold them back
// without losing them. A later save (another connection, or the next day) sends them.
delete process.env.VERCEL;
process.env.BLOB_READ_WRITE_TOKEN = 'x';
process.env.SLACK_BOT_TOKEN = 'xoxb-test';
process.env.RATE_LIMITS = JSON.stringify({ mail: { ip: 1 }, ping: { ip: 1 }, session: { ip: 100, window: 3600 } });

const store = new Map();
mock.module('@vercel/blob', { namedExports: {
  put: async (p, body) => { store.set(p, String(body)); return {}; },
  get: async p => store.has(p) ? { statusCode: 200, stream: new Response(store.get(p)).body } : null,
  list: async () => ({ blobs: [], hasMore: false }),
  del: async () => {},
}});
const sent = [];
mock.module('../lib/agent-email.js', { namedExports: {
  emailKey: e => createHash('sha256').update(String(e).trim().toLowerCase()).digest('hex').slice(0, 32),
  sendAgentEmail: async to => { sent.push(to); return { sent: true }; },
  EMAIL_RE: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
}});
const listed = [];
mock.module('../lib/resend-contacts.js', { namedExports: {
  upsertContact: async ({ email }) => { listed.push(email); return { ok: true }; },
  contactUnsubscribed: async () => false,
  markUnsubscribed: async () => ({ ok: true }),
  SEGMENTS: { prototype: 'Prototype leads', booking: 'Booked a call' },
}});
const slack = [];
globalThis.fetch = async (url, init) => { if (String(url).includes('slack')) slack.push(JSON.parse(init.body).text || ''); return new Response('{"ok":true}'); };

const { default: handler } = await import('../api/prototype-session.js');
const save = (ip, sid, email) => new Promise(ok => {
  const res = { h: {}, setHeader(k, v) { this.h[k] = v; }, status(c) { this.c = c; return this; }, json(b) { ok({ c: this.c, b }); }, end() { ok({ c: this.c }); } };
  handler({ method: 'POST', query: {}, headers: { 'x-vercel-forwarded-for': ip, 'content-type': 'text/plain' },
    body: JSON.stringify({ sid, email, you: 'Jane', company: 'Pipe Pros', step: 3, savedAt: Date.now() }) }, res);
});
const index = sid => JSON.parse(store.get(`sessions-index/${sid}.json`));

test('an email or ping held back by the per-IP limit is retried on a later save, not lost', async () => {
  assert.equal((await save('203.0.113.1', 'aaaaaaaa-1111', 'a@pipepros.com.au')).c, 200);
  assert.deepEqual(sent, ['a@pipepros.com.au']);
  const pingsAfterFirst = slack.length;
  assert.ok(pingsAfterFirst >= 1);

  // same connection, second new address: both limits are used up
  assert.equal((await save('203.0.113.1', 'bbbbbbbb-2222', 'b@pipepros.com.au')).c, 200);
  assert.deepEqual(sent, ['a@pipepros.com.au'], 'held back');
  assert.equal(slack.length, pingsAfterFirst, 'pings held back');
  let b = index('bbbbbbbb-2222');
  assert.equal(b.pinged.contact, false); assert.equal(b.pinged.created, false);
  assert.match(b.mailed.reason, /held back/);
  assert.ok(!listed.includes('b@pipepros.com.au'), 'not listed while held back');

  // a later save from another connection goes through and sends what was held
  assert.equal((await save('198.51.100.7', 'bbbbbbbb-2222', 'b@pipepros.com.au')).c, 200);
  assert.deepEqual(sent, ['a@pipepros.com.au', 'b@pipepros.com.au']);
  assert.ok(listed.includes('b@pipepros.com.au'));
  b = index('bbbbbbbb-2222');
  assert.equal(b.pinged.contact, true); assert.equal(b.pinged.created, true);
  assert.ok(slack.length > pingsAfterFirst);

  // saving again sends nothing new
  const n = sent.length;
  await save('198.51.100.7', 'bbbbbbbb-2222', 'b@pipepros.com.au');
  assert.equal(sent.length, n);
});
