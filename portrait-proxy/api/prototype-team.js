// Vercel serverless function: work out which agents a specific business needs.
//
// The prototype's first screen asks "what does your business do?". This function has a
// text model actually reason about that business — what its day looks like, where the
// hours go, which of the catalog agents would pay off first — and returns a ranked team
// with a one-line, business-specific description per agent:
//   POST { business, roster:[{id,name,summary}] }
//   → { team:[{id, does, job}], intro, v:1 }
// The client falls back to its keyword ranking if this is unreachable.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);
const TEAM_MODEL = process.env.OPENROUTER_TEAM_MODEL || process.env.OPENROUTER_CHAT_MODEL || 'google/gemini-3.7-flash';

function applyCors(res, origin) {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

// Models wrap JSON in fences or prose more often than you'd like; dig the object out.
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
  const business = String(body.business || '').slice(0, 160).trim();
  const roster = (Array.isArray(body.roster) ? body.roster : []).slice(0, 16).map(a => ({
    id: String(a.id || '').slice(0, 30),
    name: String(a.name || '').slice(0, 40),
    summary: String(a.summary || '').slice(0, 200)
  })).filter(a => a.id && a.name);
  if (business.length < 2) { res.status(400).json({ error: 'business too short' }); return; }
  if (roster.length < 3) { res.status(400).json({ error: 'roster missing' }); return; }
  const ids = new Set(roster.map(a => a.id));

  const system =
    `You are a sharp operations consultant who has worked inside hundreds of small businesses. ` +
    `A prospect has told you what their business is. Think carefully about THAT specific kind of ` +
    `business: what a normal day looks like, who the customers are, where the owner and staff lose ` +
    `hours, what falls through the cracks, what they'd pay to never think about again. Then pick, from ` +
    `the agent catalog below and nothing else, the 6 agents that would make the biggest difference, ` +
    `most valuable first.\n\nAgent catalog (use the exact id):\n` +
    roster.map(a => `- id "${a.id}" — ${a.name}: ${a.summary}`).join('\n') +
    `\n\nReturn ONLY a JSON object, no prose, no markdown, shaped exactly like:\n` +
    `{"intro":"...","team":[{"id":"...","does":"...","job":"..."}]}\n` +
    `Rules:\n` +
    `- "intro": one sentence (max 28 words) that shows you understand this particular business — a ` +
    `concrete observation about its day-to-day, not a compliment and not generic.\n` +
    `- "team": exactly 6 entries, unique ids from the catalog, best first.\n` +
    `- "does": one sentence (max 22 words), plain everyday English, second person ("your"), naming the ` +
    `specific things THIS business deals with (its real customers, jobs, stock, paperwork, tools). ` +
    `Never reuse the catalog wording. No jargon, no "AI", no "leverage".\n` +
    `- "job": 2-5 words, lowercase, present tense, the hand-off this agent owns for this business ` +
    `(e.g. "books the appointments", "chases unpaid invoices").`;

  async function callModel(params) {
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
          { role: 'user', content: `The business: ${business}` }
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

  function validate(obj) {
    if (!obj || !Array.isArray(obj.team)) return null;
    const seen = new Set();
    const team = obj.team.map(t => ({
      id: String(t?.id || '').trim(),
      does: String(t?.does || '').replace(/\s+/g, ' ').trim().slice(0, 170),
      job: String(t?.job || '').replace(/\s+/g, ' ').trim().replace(/\.$/, '').slice(0, 48)
    })).filter(t => ids.has(t.id) && !seen.has(t.id) && seen.add(t.id) && t.does.length > 12 && t.job.length > 2)
      .slice(0, 6);
    if (team.length < 4) return null;
    return { team, intro: String(obj.intro || '').replace(/\s+/g, ' ').trim().slice(0, 240) };
  }

  try {
    // Reasoning models can spend the budget thinking and return nothing visible — the
    // same escalation the chat function uses.
    const attempts = [
      { model: TEAM_MODEL, max_tokens: 2500, reasoning: { enabled: false }, response_format: { type: 'json_object' } },
      { model: TEAM_MODEL, max_tokens: 6000, reasoning: { effort: 'low' } },
      { model: TEAM_MODEL, max_tokens: 6000 }
    ];
    const trace = [];
    for (const params of attempts) {
      const r = await callModel(params);
      const out = r.ok ? validate(parseJson(r.text)) : null;
      trace.push({ status: r.status, len: r.text.length, error: r.error, valid: !!out });
      if (out) { res.setHeader('Cache-Control', 'no-store'); res.status(200).json({ ...out, v: 1, business }); return; }
    }
    res.status(502).json({ error: 'No usable team', v: 1, trace });
  } catch (e) {
    res.status(502).json({ error: 'Upstream request failed: ' + (e && e.message), v: 1 });
  }
}
