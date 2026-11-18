import test from 'node:test';
import assert from 'node:assert/strict';
process.env.RESEND_API_KEY = 'k';
const calls = [];
globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), method: init.method || 'GET', body: init.body ? JSON.parse(init.body) : null }); return new Response(String(url).endsWith('/segments') && !init.method ? '{"data":[{"id":"s1","name":"Booked a call"}]}' : '{"id":"c"}'); };
const { default: lead } = await import('../api/lead.js');
const call = req => new Promise(ok => { const res = { h: {}, setHeader(k, v) { this.h[k] = v; }, status(c) { this.c = c; return this; }, json(b) { ok({ c: this.c, b, h: this.h }); }, end() { ok({ c: this.c, h: this.h }); } }; lead({ headers: { origin: 'https://agenthatchers.com' }, ...req }, res); });

test('booking lead becomes a contact in "Booked a call"', async () => {
  const r = await call({ method: 'POST', body: JSON.stringify({ name: 'Sarah Chen', email: 'Sarah@Acme.com.au', source: 'hero' }) });
  assert.equal(r.c, 200); assert.equal(r.h['Access-Control-Allow-Origin'], 'https://agenthatchers.com');
  assert.deepEqual(calls[0].body, { email: 'sarah@acme.com.au', first_name: 'Sarah', last_name: 'Chen' });
  assert.ok(calls.some(c => c.url.endsWith('/contacts/sarah%40acme.com.au/segments/s1')));
});
test('bad email and wrong method are refused', async () => {
  assert.equal((await call({ method: 'POST', body: '{"email":"nope"}' })).c, 400);
  assert.equal((await call({ method: 'GET' })).c, 405);
  assert.equal((await call({ method: 'OPTIONS' })).c, 204);
});
