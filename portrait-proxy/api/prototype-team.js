// Vercel serverless function: work out which agents a specific business needs.
//
// The prototype's first screen asks what the prospect's business does (plus industry, the
// tools they use and, optionally, their website). This function has a text model RESEARCH
// that business first — its customers, the roles it hires for and what they do all day, the
// software it runs on, where the hours and money leak — with a web search when one is
// available, and only then DESIGN six agents from that brief. Each agent comes back as a named
// role for this business (not a catalog label) pinned to the closest catalog base:
//   POST { business, industry, company, website, tools:[...], connectors:[...], roster:[{id,name,summary}] }
//   → { intro, team:[{id, name, does, job, outcomes[5], mcps[3-5], scene}], more:[…10 more, id "more-n", base], researched, brief, v:2 }
// The client falls back to its keyword ranking if this is unreachable. All the reasoning
// lives in ../lib/team-research.js so it can be tested with a fake model.

import { normaliseInput, researchTeam } from '../lib/team-research.js';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);
const TEAM_MODEL = process.env.OPENROUTER_TEAM_MODEL || process.env.OPENROUTER_CHAT_MODEL || 'google/gemini-3.7-flash';
const RESEARCH_MODEL = process.env.OPENROUTER_RESEARCH_MODEL || TEAM_MODEL;
// OpenRouter's web plugin (about US$0.02 per research call at 5 results). TEAM_WEB_SEARCH=0 turns it off.
const WEB_SEARCH = process.env.TEAM_WEB_SEARCH !== '0';

function applyCors(res, origin) {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

async function callModel({ system, user, ...params }) {
  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
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
  applyCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!process.env.OPENROUTER_API_KEY) { res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const input = normaliseInput(body);
  if (input.business.length < 2 && !input.industry) { res.status(400).json({ error: 'business too short' }); return; }
  if (input.roster.length < 3) { res.status(400).json({ error: 'roster missing' }); return; }

  try {
    const out = await researchTeam(input, {
      callModel, researchModel: RESEARCH_MODEL, designModel: TEAM_MODEL, webSearch: WEB_SEARCH,
      log: r => console.log(JSON.stringify({ fn: 'prototype-team', business: input.business, website: input.website, ...r }))
    });
    if (!out.ok) { res.status(502).json({ error: 'No usable team', v: 2, trace: out.trace }); return; }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ team: out.team, more: out.more, intro: out.intro, researched: out.researched, brief: out.brief, v: 2, business: input.business });
  } catch (e) {
    res.status(502).json({ error: 'Upstream request failed: ' + (e && e.message), v: 2 });
  }
}
