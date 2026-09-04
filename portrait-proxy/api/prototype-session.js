// Vercel serverless function: keep a copy of each prospect's prototype session in Vercel Blob
// so the team can look at what people hatched, and list them for the sessions page.
//   POST <snapshot JSON>            → stores sessions/<sid>.json + a small sessions-index/<sid>.json
//   GET  ?key=<SESSIONS_KEY>        → { sessions:[index summaries…], count }
//   GET  ?key=<SESSIONS_KEY>&sid=…  → the full session snapshot
//   GET  ?key=…&sid=…&view=1&by=<name> → same, and logs that <name> opened that dashboard
//   GET  ?key=…&log=1              → { log:[…] } who deleted / opened what (newest first)
//   DELETE ?key=…&sid=…&by=<name>  → removes that session; refused without a name; logged + Slack
// Every delete and dashboard open is written to sessions-log/<time>-<action>-<sid>.json with
// the name typed on the sessions page, the caller's IP and browser — the key is shared, so the
// name is what tells the team apart.
// The store is PRIVATE: nothing is readable by URL; every read goes through here and the key.
// Needs a Blob store connected to the project (BLOB_READ_WRITE_TOKEN) and SESSIONS_KEY set.
// Optional: SLACK_WEBHOOK_URL — a Slack incoming webhook that gets pinged the first time a
// session reaches the dashboard (a finished hatch) and again if they connect an instance.
import { put, list, get, del } from '@vercel/blob';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);
const MAX_BYTES = 4_000_000;   // Vercel's request body ceiling is 4.5 MB; the client sends thumbnails

function applyCors(res, origin) {
  const allow = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,x-sessions-key');
}
const clean = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const AGENT_NAMES = { logistics: 'Logistics', sales: 'Sales', documents: 'Documents', invoices: 'Invoices', support: 'Support', website: 'Website', operations: 'Operations', marketing: 'Marketing', returns: 'Returns', inventory: 'Inventory' };
const SESSIONS_PAGE = process.env.SESSIONS_PAGE || 'https://agenthatchers.com/prototype/sessions.html';
async function slackPing(kind, index) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  const mins = index.startedAt ? Math.max(1, Math.round((index.savedAt - index.startedAt) / 60000)) : null;
  const team = (index.teamIds || []).map(id => AGENT_NAMES[id] || id).join(', ');
  const head = kind === 'connected'
    ? `:electric_plug: *${index.company || 'Someone'}* just connected an instance in the prototype`
    : `:hatching_chick: *${index.company || 'Someone'}* just hatched an agent in the prototype`;
  const lines = [
    index.name ? `*Agent:* ${index.name}` : '',
    index.biz ? `*Business:* ${index.biz}${index.industry ? ` (${index.industry})` : ''}` : '',
    team ? `*Team proposed:* ${team}` : '',
    index.tools && index.tools.length ? `*Tools they use:* ${index.tools.join(', ')}` : '',
    index.brand ? `*Website used:* ${index.brand}` : '',
    mins ? `*Time on page:* ${mins} min` : ''
  ].filter(Boolean).join('\n');
  const body = {
    text: `${head.replace(/[*:_]/g, '')}${index.name ? ` — ${index.name}` : ''}`,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: head + (lines ? '\n' + lines : '') } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `<${SESSIONS_PAGE}|Open the sessions page> · ${index.page || ''}` }] }
    ]
  };
  try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); } catch { /* a missed ping is not worth failing the save */ }
}
async function slackNote(text) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }); } catch { /* not worth failing the call */ }
}
function actor(req) {
  const by = clean((req.query && req.query.by) || req.headers['x-sessions-by'], 40);
  const ip = clean(String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '').split(',')[0], 64);
  return { by, ip, ua: clean(req.headers['user-agent'], 160) };
}
async function logAction(action, sid, req, index) {
  const at = Date.now();
  const { by, ip, ua } = actor(req);
  const entry = { action, sid, at, by: by || 'unknown', ip, ua, company: (index && index.company) || '', name: (index && index.name) || '', step: index ? index.step : null };
  try { await put(`sessions-log/${at}-${action}-${sid}.json`, JSON.stringify(entry), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' }); } catch { /* the action itself still happened */ }
  return entry;
}
async function listAll(prefix) {
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix, limit: 1000, cursor });
    out.push(...page.blobs); cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}
async function readJson(pathname) {
  const r = await get(pathname, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  const text = await new Response(r.stream).text();
  try { return JSON.parse(text); } catch { return null; }
}

export default async function handler(req, res) {
  applyCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (!process.env.BLOB_READ_WRITE_TOKEN) { res.status(500).json({ error: 'No Blob store is connected to this project' }); return; }

  if (req.method === 'GET') {
    const key = (req.query && req.query.key) || req.headers['x-sessions-key'] || '';
    if (!process.env.SESSIONS_KEY) { res.status(500).json({ error: 'SESSIONS_KEY is not set' }); return; }
    if (!key || key !== process.env.SESSIONS_KEY) { res.status(401).json({ error: 'Wrong key' }); return; }
    if (req.query && req.query.log) {
      try {
        const blobs = (await listAll('sessions-log/')).sort((a, b) => (a.pathname < b.pathname ? 1 : -1)).slice(0, 200);
        const log = (await Promise.all(blobs.map(async b => { try { return await readJson(b.pathname); } catch { return null; } })))
          .filter(Boolean).sort((a, b) => (b.at || 0) - (a.at || 0));
        res.setHeader('Cache-Control', 'no-store'); res.status(200).json({ log, count: log.length });
      } catch (e) { res.status(502).json({ error: 'Could not read the log: ' + (e && e.message) }); }
      return;
    }
    const sid = clean(req.query && req.query.sid, 64);
    if (sid) {
      if (!/^[a-z0-9-]{8,64}$/i.test(sid)) { res.status(400).json({ error: 'Bad session id' }); return; }
      try {
        const full = await readJson(`sessions/${sid}.json`);
        if (!full) { res.status(404).json({ error: 'No such session' }); return; }
        if (req.query.view) await logAction('open', sid, req, { company: clean(full.company, 80), name: clean(full.name, 40), step: Number(full.step) || 0 });
        res.setHeader('Cache-Control', 'no-store'); res.status(200).json(full);
      } catch (e) { res.status(502).json({ error: 'Could not read session: ' + (e && e.message) }); }
      return;
    }
    try {
      const out = await listAll('sessions-index/');
      const sessions = (await Promise.all(out.map(async b => {
        try { return await readJson(b.pathname); } catch { return null; }
      }))).filter(Boolean).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ sessions, count: sessions.length });
    } catch (e) {
      res.status(502).json({ error: 'Could not list sessions: ' + (e && e.message) });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const key = (req.query && req.query.key) || req.headers['x-sessions-key'] || '';
    if (!process.env.SESSIONS_KEY || key !== process.env.SESSIONS_KEY) { res.status(401).json({ error: 'Wrong key' }); return; }
    const sid = clean(req.query && req.query.sid, 64);
    if (!/^[a-z0-9-]{8,64}$/i.test(sid)) { res.status(400).json({ error: 'Bad session id' }); return; }
    const { by, ip } = actor(req);
    if (!by) { res.status(400).json({ error: 'Say who you are first — deletes are logged (by=<your name>)' }); return; }
    try {
      let index = null;
      try { index = await readJson(`sessions-index/${sid}.json`); } catch { index = null; }
      await del([`sessions/${sid}.json`, `sessions-index/${sid}.json`]);
      const entry = await logAction('delete', sid, req, index);
      await slackNote(`:wastebasket: ${by} deleted the prototype session for *${(index && index.company) || 'an unnamed company'}*${index && index.name ? ` (${index.name})` : ''}${ip ? ` · from ${ip}` : ''}`);
      res.status(200).json({ ok: true, sid, logged: entry });
    } catch (e) { res.status(502).json({ error: 'Could not delete: ' + (e && e.message) }); }
    return;
  }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') { res.status(400).json({ error: 'Bad snapshot' }); return; }
  const sid = clean(body.sid, 64);
  if (!/^[a-z0-9-]{8,64}$/i.test(sid)) { res.status(400).json({ error: 'Bad session id' }); return; }
  const raw = JSON.stringify(body);
  if (raw.length > MAX_BYTES) { res.status(413).json({ error: 'Snapshot too large' }); return; }

  const profiles = Array.isArray(body.profiles) ? body.profiles : [];
  const chats = body.chats && typeof body.chats === 'object' ? body.chats : {};
  const chatTurns = Object.values(chats).reduce((n, msgs) => n + (Array.isArray(msgs) ? msgs.filter(m => Array.isArray(m) && m[0] === 'me').length : 0), 0);
  const index = {
    sid, savedAt: Number(body.savedAt) || Date.now(), startedAt: Number(body.startedAt) || null,
    page: clean(body.page, 120), build: Number(body.build) || null,
    company: clean(body.company, 80), name: clean(body.name, 40), biz: clean(body.biz, 80), industry: clean(body.industry, 60),
    look: clean(body.look, 160), tools: Array.isArray(body.tools) ? body.tools.slice(0, 40).map(s => clean(s, 30)).filter(Boolean) : [], step: Number(body.step) || 0, tab: clean(body.tab, 20), done: !!body.done,
    teamIds: Array.isArray(body.team && body.team.ids) ? body.team.ids.slice(0, 10).map(s => clean(s, 30)) : [],
    teamSource: clean(body.team && body.team.source, 12), hadPhoto: !!body.hadPhoto, brand: body.brand ? clean(body.brand.name || body.brand.url, 80) : '',
    profileCount: profiles.length, marketCount: body.market && typeof body.market === 'object' ? Object.keys(body.market).length : 0,
    chatTurns, thumb: typeof body.selectedImage === 'string' && body.selectedImage.startsWith('data:') ? body.selectedImage.slice(0, 120000) : ''
  };
  try {
    // Milestone pings fire once per session: what was already pinged lives in the index.
    let prev = null;
    try { prev = await readJson(`sessions-index/${sid}.json`); } catch { prev = null; }
    index.pinged = Object.assign({}, prev && prev.pinged);
    const pings = [];
    if (index.step >= 4 && !index.pinged.hatched) { index.pinged.hatched = true; pings.push('hatched'); }
    if (index.done && !index.pinged.connected) { index.pinged.connected = true; pings.push('connected'); }
    await put(`sessions/${sid}.json`, raw, { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
    await put(`sessions-index/${sid}.json`, JSON.stringify(index), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
    for (const kind of pings) await slackPing(kind, index);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, sid, bytes: raw.length });
  } catch (e) {
    res.status(502).json({ error: 'Could not store session: ' + (e && e.message) });
  }
}
