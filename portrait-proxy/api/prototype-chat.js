// One free, genuinely-smart chat reply for the prospect prototype.
//
// The prototype's Chats tab sends the prospect's FIRST message here; this function
// answers it for real — in the voice of the agent they're talking to, grounded in
// their typed company/business — and recommends which other marketplace agents it
// would loop in. The prototype shows the paywall from the second message onward.
// The OpenRouter key lives ONLY in this function's environment.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);
// Text model — cheap + smart. Override with OPENROUTER_CHAT_MODEL.
const CHAT_MODEL = process.env.OPENROUTER_CHAT_MODEL || 'google/gemini-3.7-flash';

function applyCors(res, origin) {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

export default async function handler(req, res) {
  applyCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const question = String(body.question || '').slice(0, 1200).trim();
  const agent = String(body.agent || 'your agent').slice(0, 60);
  const company = String(body.company || 'the company').slice(0, 80);
  const business = String(body.business || '').slice(0, 120);
  const roster = Array.isArray(body.roster) ? body.roster.slice(0, 12).map(a => ({
    name: String(a.name || '').slice(0, 40),
    summary: String(a.summary || '').slice(0, 160),
    mcps: Array.isArray(a.mcps) ? a.mcps.slice(0, 6).map(m => String(m).slice(0, 30)) : []
  })) : [];
  if (question.length < 5) { res.status(400).json({ error: 'question too short' }); return; }

  const rosterText = roster.map(a => `- ${a.name}: ${a.summary} (connects to: ${a.mcps.join(', ')})`).join('\n');
  const system =
    `You are "${agent}", an AI agent working inside ${company}` +
    `${business ? `, a ${business}` : ''}. A team member just messaged you. ` +
    `Answer their actual question with genuinely useful, specific, expert help — concrete steps, ` +
    `real product/tool names, practical detail. Be warm and confident, like a sharp colleague. ` +
    `Where it helps, say which teammate agents you would loop in (by exact name) and what you'd ` +
    `hand them, and mention the real connectors you'd use. Your teammate agents:\n${rosterText}\n` +
    `Rules: plain text only (no markdown symbols, no asterisks, no headers; short dashes for lists ` +
    `are fine). 120-190 words. End with one crisp sentence saying what you would already be doing ` +
    `right now if you were fully connected.`;

  async function callModel(params) {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agenthatchers.com',
        'X-Title': 'Agent Hatchers Prototype Chat'
      },
      body: JSON.stringify({
        temperature: 0.7,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question }
        ],
        ...params
      })
    });
    const data = await upstream.json().catch(() => ({}));
    const msg = data?.choices?.[0]?.message;
    // content can be a string or an array of parts depending on the provider
    let text = '';
    if (typeof msg?.content === 'string') text = msg.content;
    else if (Array.isArray(msg?.content)) text = msg.content.map(p => p?.text || '').join('');
    return {
      ok: upstream.ok, status: upstream.status,
      error: data?.error?.message || data?.error || null,
      text: (text || '').trim(),
      finish: data?.choices?.[0]?.finish_reason || data?.choices?.[0]?.native_finish_reason || null,
      usage: data?.usage || null
    };
  }

  try {
    // Thinking models can silently spend the whole token budget on hidden reasoning and
    // truncate the visible reply, and providers differ on how reasoning is disabled — so
    // try progressively blunter configurations until a complete reply lands.
    const attempts = [
      { model: CHAT_MODEL, max_tokens: 3000, reasoning: { enabled: false } },
      { model: CHAT_MODEL, max_tokens: 8000, reasoning: { effort: 'low' } },
      { model: CHAT_MODEL, max_tokens: 8000 }
    ];
    const trace = [];
    for (const params of attempts) {
      const r = await callModel(params);
      trace.push({ params: Object.keys(params).join('+'), status: r.status, finish: r.finish, len: r.text.length, error: r.error, usage: r.usage });
      // a good reply is non-trivially long and didn't stop because it ran out of budget
      if (r.ok && r.text.length >= 300 && r.finish !== 'length') {
        res.status(200).json({ reply: r.text, v: 3, finish: r.finish, usage: r.usage });
        return;
      }
      // keep the best partial in case every attempt truncates
      if (r.ok && r.text.length > (trace.best?.len || 0)) trace.best = { len: r.text.length, text: r.text, finish: r.finish, usage: r.usage };
    }
    if (trace.best?.text) { res.status(200).json({ reply: trace.best.text, v: 3, finish: trace.best.finish, usage: trace.best.usage, degraded: true, trace }); return; }
    res.status(502).json({ error: 'No usable reply', v: 3, trace });
  } catch (e) {
    res.status(502).json({ error: 'Upstream request failed: ' + (e && e.message), v: 3 });
  }
}
