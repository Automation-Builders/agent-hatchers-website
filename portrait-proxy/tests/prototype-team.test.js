import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

// The team endpoint: with `stream: true` the team goes out as the first NDJSON line before the
// marketplace extras are written; without it, one JSON object as before. Counted once either way.
process.env.OPENROUTER_API_KEY = 'test';
let guarded = 0;
mock.module('../lib/guard.js', { namedExports: { applyCors: () => {}, guard: async () => { guarded++; return true; } } });

const ROSTER = ['support', 'invoices', 'sales', 'inventory', 'documents', 'marketing', 'website'].map(id => ({ id, name: `${id} Agent`, summary: `Stock ${id}.` }));
const agent = (base, name) => ({ base, name, does: `Handles the ${name.toLowerCase()} side of your clinic every week.`, job: `does ${name.toLowerCase()}`, outcomes: ['one two three', 'four five six', 'seven eight nine', 'ten eleven twelve'], mcps: ['Gmail'], scene: 'It is a helper.' });
const TEAM = { intro: 'Busy desk.', team: ROSTER.slice(0, 6).map((a, i) => agent(a.id, `Clinic Job ${i + 1}`)) };
const MORE = { more: [agent('website', 'Fee Page'), agent('support', 'Waitlist Filler')] };
const BRIEF = { business: 'Clinic', roles: [{ title: 'a', day: 'b' }, { title: 'c', day: 'd' }], leaks: ['x', 'y'] };

let releaseMore;
globalThis.fetch = async (url, init) => {
  const { messages } = JSON.parse(init.body);
  const sys = messages[0].content;
  const reply = /researcher preparing a brief/.test(sys) ? BRIEF : /MORE agents for its marketplace/.test(sys) ? (await new Promise(r => { releaseMore = r; }), MORE) : TEAM;
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(reply) } }] }));
};
const { default: handler } = await import('../api/prototype-team.js');

function call(body) {
  const res = { h: {}, chunks: [], headersSent: false, statusCode: 0,
    setHeader(k, v) { this.h[k.toLowerCase()] = v; }, status(c) { this.statusCode = c; return this; },
    write(s) { this.headersSent = true; this.chunks.push(s); }, json(b) { this.headersSent = true; this.body = b; this.done(); },
    end(s) { if (s) this.chunks.push(s); this.done(); } };
  const done = new Promise(r => { res.done = r; });
  handler({ method: 'POST', headers: {}, body: { business: 'dental clinic', roster: ROSTER, ...body } }, res);
  return { res, done };
}
const tick = () => new Promise(r => setTimeout(r, 10));

test('stream: the team is written before the extras exist, then the extras close the stream', async () => {
  const { res, done } = call({ stream: true });
  while (!releaseMore || !res.chunks.length) await tick();
  assert.equal(res.statusCode, 200);
  assert.equal(res.h['content-type'], 'application/x-ndjson');
  const first = JSON.parse(res.chunks[0]);
  assert.equal(first.team.length, 6);
  assert.equal(first.researched, true);
  assert.equal(first.more, undefined);
  releaseMore(); releaseMore = null;
  await done;
  assert.deepEqual(JSON.parse(res.chunks[1]).more.map(m => m.name), ['Fee Page Agent', 'Waitlist Filler Agent']);
  assert.ok(res.chunks.every(c => c.endsWith('\n')));
});

test('no stream flag: one JSON object with team and extras, as before', async () => {
  const { res, done } = call({});
  while (!releaseMore) await tick();
  releaseMore(); releaseMore = null;
  await done;
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.team.length, 6);
  assert.equal(res.body.more.length, 2);
  assert.equal(guarded, 2, 'one guard count per request');
});
