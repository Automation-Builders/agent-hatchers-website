import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAgentEmail, sendAgentEmail, emailKey } from '../lib/agent-email.js';

const details = { you: 'Jane Doe', company: 'Pipe Pros', agentName: 'Pip', url: 'https://agenthatchers.com/prototype/?share=abcdefghijklmnopqrstuvwx' };

test('email names the person, agent and company and carries the share link', () => {
  const m = buildAgentEmail(details);
  assert.equal(m.subject, 'Pip is ready for Pipe Pros');
  assert.match(m.text, /^Hi Jane,/);
  assert.ok(m.text.includes(details.url));
  assert.ok(m.html.includes(`href="${details.url}"`));
  assert.match(m.html, /Pip has hatched, Jane/);
});

test('email identifies the sender and offers an unsubscribe (Spam Act)', () => {
  const m = buildAgentEmail(details);
  for (const body of [m.text, m.html]) {
    assert.match(body, /Agent Hatchers Pty Ltd \(ACN 690 308 242\)/);
    assert.match(body, /Reply (&quot;|"|“)unsubscribe/);
  }
});

test('email escapes whatever the prospect typed', () => {
  const m = buildAgentEmail({ ...details, you: '<b>x', agentName: '<script>' });
  assert.ok(!m.html.includes('<script>'));
  assert.ok(!m.html.includes('<b>x'));
});

test('email reads naturally with nothing optional filled in', () => {
  const m = buildAgentEmail({ url: details.url });
  assert.equal(m.subject, 'your agent is ready');
  assert.match(m.text, /^Hi,/);
});

test('no key → nothing sent, no fetch', async () => {
  let called = false;
  const r = await sendAgentEmail('jane@pipepros.com.au', details, { env: {}, fetchImpl: async () => { called = true; } });
  assert.deepEqual(r, { sent: false, reason: 'no RESEND_API_KEY' });
  assert.equal(called, false);
});

test('sends through Resend with from, reply-to and the link', async () => {
  let req;
  const r = await sendAgentEmail('jane@pipepros.com.au', details, {
    env: { RESEND_API_KEY: 'k' },
    fetchImpl: async (url, init) => { req = { url, init }; return new Response(JSON.stringify({ id: 'em_1' }), { status: 200 }); }
  });
  assert.deepEqual(r, { sent: true, id: 'em_1' });
  assert.equal(req.url, 'https://api.resend.com/emails');
  assert.equal(req.init.headers.Authorization, 'Bearer k');
  const body = JSON.parse(req.init.body);
  assert.deepEqual(body.to, ['jane@pipepros.com.au']);
  assert.equal(body.from, 'Agent Hatchers <hello@agenthatchers.com>');
  assert.equal(body.reply_to, 'noah@agenthatchers.com');
  assert.ok(body.text.includes(details.url));
});

test('a Resend refusal is reported, not thrown', async () => {
  const r = await sendAgentEmail('jane@pipepros.com.au', details, {
    env: { RESEND_API_KEY: 'k' },
    fetchImpl: async () => new Response(JSON.stringify({ message: 'domain not verified' }), { status: 403 })
  });
  assert.equal(r.sent, false);
  assert.match(r.reason, /403.*domain not verified/);
});

test('bad address is refused before calling out', async () => {
  const r = await sendAgentEmail('nope', details, { env: { RESEND_API_KEY: 'k' }, fetchImpl: async () => { throw new Error('should not call'); } });
  assert.equal(r.reason, 'bad address');
});

test('throttle key ignores case and spaces', () => {
  assert.equal(emailKey(' Jane@PipePros.com.au '), emailKey('jane@pipepros.com.au'));
});

test('with an unsubscribe link: footer link and one-click headers', async () => {
  const unsub = 'https://agent-hatchers-portrait-proxy.vercel.app/api/unsubscribe?s=abc&e=f&t=x';
  const m = buildAgentEmail({ ...details, unsub });
  assert.ok(m.text.includes(`Unsubscribe: ${unsub}`));
  assert.ok(m.html.includes('>Unsubscribe</a>'));
  let body;
  await sendAgentEmail('jane@pipepros.com.au', { ...details, unsub }, { env: { RESEND_API_KEY: 'k' }, fetchImpl: async (u, init) => { body = JSON.parse(init.body); return new Response('{"id":"1"}'); } });
  assert.equal(body.headers['List-Unsubscribe'], `<${unsub}>`);
  assert.equal(body.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
});
