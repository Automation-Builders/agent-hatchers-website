// Vercel serverless function: work out which agents a specific business needs.
//
// The prototype's first screen asks what the prospect's business does (plus industry, the
// tools they use and, optionally, their website). This function has a text model RESEARCH
// that business first — its customers, the roles it hires for and what they do all day, the
// software it runs on, where the hours and money leak — with a web search when one is
// available, and only then DESIGN six agents from that brief. Each agent comes back as a named
// role for this business (not a catalog label) pinned to the closest catalog base:
//   POST { business, industry, company, website, tools:[...], connectors:[...], roster:[{id,name,summary}] }
//   → { intro, team:[{id, name, does, job, outcomes[5], mcps[3-5], scene}], more:[…10 more, id "more-n", base], researched, brief, v:3 }
// With `stream: true` in the body the answer is two NDJSON lines instead: the team as soon as it
// is ready ({ intro, team, researched, brief, v, business }), then { more } when the extras land,
// so the Agents cards don't wait for the Marketplace. Without it, one JSON object as before.
// The client falls back to its keyword ranking if this is unreachable. All the reasoning
// lives in ../lib/team-research.js so it can be tested with a fake model.

import { normaliseInput, researchTeam } from '../lib/team-research.js';
import { applyCors, guard } from '../lib/guard.js';

const TEAM_MODEL = process.env.OPENROUTER_TEAM_MODEL || process.env.OPENROUTER_CHAT_MODEL || 'google/gemini-3.7-flash';
const RESEARCH_MODEL = process.env.OPENROUTER_RESEARCH_MODEL || TEAM_MODEL;
// OpenRouter's web plugin (about US$0.02 per research call at 5 results). TEAM_WEB_SEARCH=0 turns it off.
const WEB_SEARCH = process.env.TEAM_WEB_SEARCH !== '0';

// `timeoutMs` aborts a call that would outlive the function; the budget in team-research.js sets it.
async function callModel({ system, user, timeoutMs, ...params }) {
  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://agenthatchers.com',
      'X-Title': 'Agent Hatchers Prototype Team'
    },
    body: JSON.stringify({
      temperature: 0.5,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      ...params
    })
  });
  const data = await upstream.json().catch(() => ({}));
  const msg = data?.choices?.[0]?.message;
  let text = '';
  if (typeof msg?.content === 'string') text = msg.content;
  else if (Array.isArray(msg?.content)) text = msg.content.map(p => p?.text || '').join('');
  return { ok: upstream.ok, status: upstream.status, error: data?.error?.message || data?.error || null, text: (text || '').trim() };
}

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!process.env.OPENROUTER_API_KEY) { res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const input = normaliseInput(body);
  if (input.business.length < 2 && !input.industry) { res.status(400).json({ error: 'business too short' }); return; }
  if (input.roster.length < 3) { res.status(400).json({ error: 'roster missing' }); return; }
  if (!(await guard(req, res, 'team'))) return;

  const stream = body && body.stream === true;
  const head = t => ({ team: t.team, intro: t.intro, researched: t.researched, brief: t.brief, v: 3, business: input.business });
  try {
    const out = await researchTeam(input, {
      callModel, researchModel: RESEARCH_MODEL, designModel: TEAM_MODEL, webSearch: WEB_SEARCH,
      log: r => console.log(JSON.stringify({ fn: 'prototype-team', business: input.business, website: input.website, ...r })),
      onTeam: stream ? t => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Cache-Control', 'no-store');
        res.write(JSON.stringify(head(t)) + '\n');
      } : null
    });
    if (stream && res.headersSent) { res.end(JSON.stringify({ more: out.more || [] }) + '\n'); return; }
    if (!out.ok) { res.status(502).json({ error: 'No usable team', v: 3, trace: out.trace }); return; }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ...head(out), more: out.more });
  } catch (e) {
    if (res.headersSent) { res.end(); return; }
    res.status(502).json({ error: 'Upstream request failed: ' + (e && e.message), v: 3 });
  }
}
