import test from 'node:test';
import assert from 'node:assert/strict';

delete process.env.VERCEL;
delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN;
delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN;
process.env.OPENROUTER_API_KEY = 'test-key';
process.env.RATE_LIMITS = JSON.stringify({ portrait: { visitor: 100, ip: 100 } });

// Capture the prompt text the endpoint sends to OpenRouter.
let sent;
globalThis.fetch = async (url, init = {}) => {
  sent = JSON.parse(init.body);
  return new Response(JSON.stringify({ data: [{ b64_json: 'aGk=' }] }), { status: 200, headers: { 'content-type': 'application/json' } });
};
const { default: handler } = await import('../api/prototype-portrait.js');
const call = body => new Promise(ok => {
  const res = { setHeader() {}, status() { return this; }, json: ok, end: ok };
  handler({ method: 'POST', headers: { origin: 'https://agenthatchers.com', 'x-ah-visitor': 'prompt-test', 'x-vercel-forwarded-for': '203.0.113.50' }, body, query: {} }, res);
});
const promptText = () => sent.prompt || sent.messages[0].content.at(-1).text;

test('a card re-dress keeps the character on plain white, with no scene', async () => {
  await call({ brief: 'x', name: 'Scout', role: 'Sales agent', image: 'data:image/png;base64,aGk=' });
  const p = promptText();
  assert.match(p, /Plain solid white background/);
  assert.match(p, /no room, desk, furniture, screens or scenery/);
  assert.doesNotMatch(p, /real setting|background scene/);
});

test('a new design follows the subject the description names', async () => {
  await call({ brief: 'a calm owl', name: 'Hoot' });
  const p = promptText();
  assert.match(p, /a robot unless the description names another subject/);
  assert.match(p, /Show exactly ONE character/);
});

test('a card asked for a key colour gets that flat backdrop instead of white', async () => {
  await call({ brief: 'x', name: 'Scout', role: 'Sales agent', image: 'data:image/png;base64,aGk=', bg: 'green' });
  const p = promptText();
  assert.match(p, /Solid flat pure green \(#00FF00\) chroma-key background/);
  assert.doesNotMatch(p, /Plain solid white background/);
});

test('an unknown bg value keeps the white backdrop', async () => {
  await call({ brief: 'x', name: 'Scout', role: 'Sales agent', image: 'data:image/png;base64,aGk=', bg: 'red' });
  assert.match(promptText(), /Plain solid white background/);
});
