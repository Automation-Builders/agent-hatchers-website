import test from 'node:test';
import assert from 'node:assert/strict';
import { upsertContact, contactUnsubscribed, markUnsubscribed } from '../lib/resend-contacts.js';

const env = { RESEND_API_KEY: 'k' };
const fake = replies => { const calls = []; return { calls, fetchImpl: async (url, init) => { calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : null }); const [status, body] = replies.shift() || [200, {}]; return new Response(JSON.stringify(body), { status }); } }; };

test('new contact: created with split name, then company property', async () => {
  const f = fake([[200, { id: 'c' }], [200, {}]]);
  await upsertContact({ email: 'jane@x.com', you: 'Jane van Doe', company: 'Pipe Pros', segment: '' }, { env, fetchImpl: f.fetchImpl });
  assert.equal(f.calls[0].url, 'https://api.resend.com/contacts');
  assert.deepEqual(f.calls[0].body, { email: 'jane@x.com', first_name: 'Jane', last_name: 'van Doe' });
  assert.deepEqual(f.calls[1].body, { properties: { company: 'Pipe Pros' } });
});
test('segment: found by name, else created once, then the contact is filed into it', async () => {
  const { upsertContact: up } = await import('../lib/resend-contacts.js?fresh=1');
  const f = fake([[200, {}], [200, { data: [{ id: 'other', name: 'Something' }] }], [200, { id: 'seg-book' }], [200, {}]]);
  const r = await up({ email: 'b@x.com', segment: 'Booked a call' }, { env, fetchImpl: f.fetchImpl });
  assert.deepEqual(r, { ok: true, reason: '' });
  assert.equal(f.calls[1].url, 'https://api.resend.com/segments');
  assert.deepEqual(f.calls[2].body, { name: 'Booked a call' });
  assert.equal(f.calls[3].url, 'https://api.resend.com/contacts/b%40x.com/segments/seg-book');
  const g = fake([[200, {}], [200, {}]]);
  await up({ email: 'c@x.com', segment: 'Booked a call' }, { env, fetchImpl: g.fetchImpl });
  assert.equal(g.calls[1].url, 'https://api.resend.com/contacts/c%40x.com/segments/seg-book', 'segment id cached, not looked up again');
});
test('segment trouble still lists the contact and says why', async () => {
  const { upsertContact: up } = await import('../lib/resend-contacts.js?fresh=2');
  const f = fake([[200, {}], [500, {}]]);
  const r = await up({ email: 'd@x.com', segment: 'Prototype leads' }, { env, fetchImpl: f.fetchImpl });
  assert.equal(r.ok, true); assert.match(r.reason, /not filed under "Prototype leads"/);
});
test('existing contact: falls back to updating the name, never the subscription', async () => {
  const f = fake([[409, { message: 'exists' }], [200, {}]]);
  assert.equal((await upsertContact({ email: 'a@x.com', you: 'Al' }, { env, fetchImpl: f.fetchImpl })).ok, true);
  assert.equal(f.calls[1].method, 'PATCH'); assert.ok(!('unsubscribed' in f.calls[1].body));
});
test('a sending-only key is reported, not retried', async () => {
  const f = fake([[401, { message: 'restricted_api_key' }]]);
  const r = await upsertContact({ email: 'a@x.com' }, { env, fetchImpl: f.fetchImpl });
  assert.equal(r.ok, false); assert.match(r.reason, /401.*restricted/); assert.equal(f.calls.length, 1);
});
test('unsubscribed lookups and marking', async () => {
  assert.equal(await contactUnsubscribed('a@x.com', { env, fetchImpl: fake([[200, { unsubscribed: true }]]).fetchImpl }), true);
  assert.equal(await contactUnsubscribed('a@x.com', { env, fetchImpl: fake([[404, {}]]).fetchImpl }), null);
  assert.equal(await contactUnsubscribed('a@x.com', { env: {} }), null);
  const f = fake([[200, {}]]);
  await markUnsubscribed('a@x.com', { env, fetchImpl: f.fetchImpl });
  assert.equal(f.calls[0].url, 'https://api.resend.com/contacts/a%40x.com'); assert.deepEqual(f.calls[0].body, { unsubscribed: true });
});
