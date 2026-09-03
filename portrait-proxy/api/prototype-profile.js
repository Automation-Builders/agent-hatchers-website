// Vercel serverless function: turn a prospect's "what should this agent do?" description
// into a real agent profile — the same shape the catalog agents show in the dashboard.
//   POST { name, description, company, business, roster:[{id,name,summary}], connectors:[...] }
//   → { summary, outcomes:[5], mcps:[3-6], mates:[2-3 catalog ids], team, v:1 }
// The client falls back to a keyword-built profile if this is unreachable.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);
const PROFILE_MODEL = process.env.OPENROUTER_PROFILE_MODEL || process.env.OPENROUTER_TEAM_MODEL || process.env.OPENROUTER_CHAT_MODEL || 'google/gemini-3.7-flash';
const TEAMS = ['Growth', 'Operations', 'Finance', 'Creative', 'Support', 'Documents', 'Sales', 'Marketing', 'Logistics', 'Tech'];

function applyCors(res, origin) {
  const allow = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

function parseJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const a = cleaned.indexOf('{'), b = cleaned.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(cleaned.slice(a, b + 1)); } catch {} }
  return null;
}

export default async function handler(req, res) {
  applyCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!process.env.OPENROUTER_API_KEY) { res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const name = String(body.name || '').slice(0, 60).trim();
  const description = String(body.description || '').slice(0, 600).trim();
  const company = String(body.company || 'the company').slice(0, 80).trim();
  const business = String(body.business || '').slice(0, 160).trim();
  const roster = (Array.isArray(body.roster) ? body.roster : []).slice(0, 16).map(a => ({
    id: String(a.id || '').slice(0, 30), name: String(a.name || '').slice(0, 40), summary: String(a.summary || '').slice(0, 200)
  })).filter(a => a.id && a.name);
  const connectors = (Array.isArray(body.connectors) ? body.connectors : []).slice(0, 60).map(s => String(s).slice(0, 30)).filter(Boolean);
  if (!name) { res.status(400).json({ error: 'name missing' }); return; }
  if (roster.length < 3) { res.status(400).json({ error: 'roster missing' }); return; }
  const ids = new Set(roster.map(a => a.id));
  const known = new Set(connectors.map(c => c.toLowerCase()));

  const system =
    `You are a sharp operations consultant setting up an AI agent for a small business. ` +
    `The owner of "${company}"${business ? ` (a ${business})` : ''} has named a new agent "${name}" and described ` +
    `what they want it to do. Take the description at face value — however unusual — and work out what that ` +
    `agent would actually do day to day for THIS business, which systems it would need to plug into, and which ` +
    `of the existing catalog agents it would hand work to.\n\n` +
    `Agent catalog (use the exact id):\n` + roster.map(a => `- id "${a.id}" — ${a.name}: ${a.summary}`).join('\n') +
    `\n\nConnectors with logos available (prefer these exact names; you may add one or two well-known others if the job clearly needs them):\n` +
    connectors.join(', ') +
    `\n\nReturn ONLY a JSON object, no prose, no markdown, shaped exactly like:\n` +
    `{"summary":"...","outcomes":["...","...","...","...","..."],"mcps":["..."],"mates":["id","id"],"team":"..."}\n` +
    `Rules:\n` +
    `- "summary": one sentence (max 26 words) describing what ${name} does for ${company}, plain everyday English, third person.\n` +
    `- "outcomes": exactly 5, each one sentence (max 16 words), concrete things ${name} will do for ${company}, ` +
    `directly derived from the description, naming the real customers, files, channels or tools involved. No jargon, no "AI", no "leverage".\n` +
    `- "mcps": 3 to 6 connector names the agent needs, most important first.\n` +
    `- "mates": 2 or 3 catalog ids whose work overlaps or hands off to this agent, best first.\n` +
    `- "team": one of ${TEAMS.join(', ')}.`;

  async function callModel(params) {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agenthatchers.com', 'X-Title': 'Agent Hatchers Prototype Profile'
      },
      body: JSON.stringify({
        temperature: 0.5,
        messages: [{ role: 'system', content: system }, { role: 'user', content: `Agent name: ${name}\nWhat it should do: ${description || '(no description given — infer from the name)'}` }],
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

  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  function validate(obj) {
    if (!obj) return null;
    const outcomes = (Array.isArray(obj.outcomes) ? obj.outcomes : []).map(o => clean(o).slice(0, 140)).filter(o => o.length > 8).slice(0, 5);
    const seenM = new Set();
    const mcps = (Array.isArray(obj.mcps) ? obj.mcps : []).map(m => clean(m).slice(0, 30)).filter(m => m && !seenM.has(m.toLowerCase()) && seenM.add(m.toLowerCase()))
      .map(m => { const k = connectors.find(c => c.toLowerCase() === m.toLowerCase()); return k || m; }).slice(0, 6);
    const seenA = new Set();
    const mates = (Array.isArray(obj.mates) ? obj.mates : []).map(m => clean(m)).filter(m => ids.has(m) && !seenA.has(m) && seenA.add(m)).slice(0, 3);
    const team = TEAMS.find(t => t.toLowerCase() === clean(obj.team).toLowerCase()) || 'Operations';
    const summary = clean(obj.summary).slice(0, 220);
    if (outcomes.length < 4 || mcps.length < 2 || mates.length < 1 || summary.length < 12) return null;
    return { summary, outcomes, mcps, mates, team, knownOnly: mcps.filter(m => known.has(m.toLowerCase())).length };
  }

  try {
    const attempts = [
      { model: PROFILE_MODEL, max_tokens: 2000, reasoning: { enabled: false }, response_format: { type: 'json_object' } },
      { model: PROFILE_MODEL, max_tokens: 5000, reasoning: { effort: 'low' } },
      { model: PROFILE_MODEL, max_tokens: 5000 }
    ];
    const trace = [];
    for (const params of attempts) {
      const r = await callModel(params);
      const out = r.ok ? validate(parseJson(r.text)) : null;
      trace.push({ status: r.status, len: r.text.length, error: r.error, valid: !!out });
      if (out) { delete out.knownOnly; res.setHeader('Cache-Control', 'no-store'); res.status(200).json({ ...out, v: 1 }); return; }
    }
    res.status(502).json({ error: 'No usable profile', v: 1, trace });
  } catch (e) {
    res.status(502).json({ error: 'Upstream request failed: ' + (e && e.message), v: 1 });
  }
}
