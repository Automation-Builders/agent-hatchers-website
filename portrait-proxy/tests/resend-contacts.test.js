import test from 'node:test';
import assert from 'node:assert/strict';
import { upsertContact, contactUnsubscribed, markUnsubscribed } from '../lib/resend-contacts.js';

const env = { RESEND_API_KEY: 'k' };
const fake = replies => { const calls = []; return { calls, fetchImpl: async (url, init) => { calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : null }); const [status, body] = replies.shift() || [200, {}]; return new Response(JSON.stringify(body), { status }); } }; };

test('new contact: created with split name, then company property', async () => {
  const f = fake([[200, { id: 'c' }], [200, {}]]);
  assert.deepEqual(await upsertContact({ email: 'jane@x.com', you: 'Jane van Doe', company: 'Pipe Pros' }, { env, fetchImpl: f.fetchImpl }), { ok: true, reason: '' });
  assert.equal(f.calls[0].url, 'https://api.resend.com/contacts');
  assert.deepEqual(f.calls[0].body, { email: 'jane@x.com', first_name: 'Jane', last_name: 'van Doe' });
  assert.deepEqual(f.calls[1].body, { properties: { company: 'Pipe Pros' } });
});
test('segment id files the contact into a segment', async () => {
  const f = fake([[200, {}]]);
  await upsertContact({ email: 'a@x.com' }, { env: { ...env, RESEND_SEGMENT_ID: 'seg1' }, fetchImpl: f.fetchImpl });
  assert.deepEqual(f.calls[0].body.segments, [{ id: 'seg1' }]);
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
