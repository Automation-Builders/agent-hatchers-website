// Vercel serverless function: keep a copy of each prospect's prototype session in Vercel Blob
// so the team can look at what people hatched, and list them for the sessions page.
//   POST <snapshot JSON>            → stores sessions/<sid>.json + a small sessions-index/<sid>.json
//   GET  ?key=<SESSIONS_KEY>        → { sessions:[index summaries…], count }
//   GET  ?key=<SESSIONS_KEY>&sid=…  → the full session snapshot
//   DELETE ?key=<SESSIONS_KEY>&sid=… → removes that session
// The store is PRIVATE: nothing is readable by URL; every read goes through here and the key.
// Needs a Blob store connected to the project (BLOB_READ_WRITE_TOKEN) and SESSIONS_KEY set.
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
    const sid = clean(req.query && req.query.sid, 64);
    if (sid) {
      if (!/^[a-z0-9-]{8,64}$/i.test(sid)) { res.status(400).json({ error: 'Bad session id' }); return; }
      try {
        const full = await readJson(`sessions/${sid}.json`);
        if (!full) { res.status(404).json({ error: 'No such session' }); return; }
        res.setHeader('Cache-Control', 'no-store'); res.status(200).json(full);
      } catch (e) { res.status(502).json({ error: 'Could not read session: ' + (e && e.message) }); }
      return;
    }
    try {
      const out = [];
      let cursor;
      do {
        const page = await list({ prefix: 'sessions-index/', limit: 1000, cursor });
        out.push(...page.blobs); cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
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
    try { await del([`sessions/${sid}.json`, `sessions-index/${sid}.json`]); res.status(200).json({ ok: true, sid }); }
    catch (e) { res.status(502).json({ error: 'Could not delete: ' + (e && e.message) }); }
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
    look: clean(body.look, 160), step: Number(body.step) || 0, tab: clean(body.tab, 20), done: !!body.done,
    teamIds: Array.isArray(body.team && body.team.ids) ? body.team.ids.slice(0, 10).map(s => clean(s, 30)) : [],
    teamSource: clean(body.team && body.team.source, 12), hadPhoto: !!body.hadPhoto, brand: body.brand ? clean(body.brand.name || body.brand.url, 80) : '',
    profileCount: profiles.length, marketCount: body.market && typeof body.market === 'object' ? Object.keys(body.market).length : 0,
    chatTurns, thumb: typeof body.selectedImage === 'string' && body.selectedImage.startsWith('data:') ? body.selectedImage.slice(0, 120000) : ''
  };
  try {
    await put(`sessions/${sid}.json`, raw, { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
    await put(`sessions-index/${sid}.json`, JSON.stringify(index), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, sid, bytes: raw.length });
  } catch (e) {
    res.status(502).json({ error: 'Could not store session: ' + (e && e.message) });
  }
}
