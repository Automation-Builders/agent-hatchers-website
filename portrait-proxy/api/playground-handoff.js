// One-time handoff from the playground to sign-up on the dashboard (setup snapshot v1).
//   POST {sid}  (from the page, text/plain, no secret)
//        → { ok, url, expiresAt }   url = https://agenthatchers.ai/register?v=4&setup=<token>
//        Freezes a cleaned copy of that session (lib/handoff.js) at handoffs/<token>.json.
//        404 no such session, 409 no hatched agent yet.
//   POST {token} with header x-handoff-key: <HANDOFF_SECRET>  (from the dashboard server only)
//        → { ok, snapshot }  once. A second claim is 410 "used", an old link 410 "expired",
//        an unknown one 404. The claim drops the snapshot from the store and keeps only when
//        and that it was claimed.
// The token is the only thing in the address: no email, no business details. The sid is not a
// secret (a share link reveals it), which is why the dashboard never sees or uses it.
// Needs BLOB_READ_WRITE_TOKEN and HANDOFF_SECRET (at least 32 characters).
import { put, get } from '@vercel/blob';
import {
  SID_RE, TOKEN_RE, buildSnapshot, hasAgent, newHandoffToken, handoffPath, signupUrl, ttlMs, checkSecret,
} from '../lib/handoff.js';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);

function applyCors(res, origin) {
  const allow = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}
const putJson = (pathname, obj) => put(pathname, JSON.stringify(obj), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
async function readJson(pathname) {
  try {
    const r = await get(pathname, { access: 'private', useCache: false });
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return JSON.parse(await new Response(r.stream).text());
  } catch { return null; }
}
function body(req) {
  const b = req.body;
  if (b && typeof b === 'object' && !Buffer.isBuffer(b)) return b;
  try { return JSON.parse(String(b || '{}')); } catch { return {}; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const serverCall = req.headers['x-handoff-key'] !== undefined;
  if (!serverCall) applyCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }
  if (!process.env.HANDOFF_SECRET || String(process.env.HANDOFF_SECRET).length < 32) {
    res.status(503).json({ error: 'not_configured' }); return;
  }
  const b = body(req);

  if (serverCall) {
    if (!checkSecret(req.headers['x-handoff-key'])) { res.status(401).json({ error: 'key' }); return; }
    const token = String(b.token || '');
    if (!TOKEN_RE.test(token)) { res.status(400).json({ error: 'token' }); return; }
    const rec = await readJson(handoffPath(token));
    if (!rec) { res.status(404).json({ error: 'unknown' }); return; }
    if (rec.claimedAt) { res.status(410).json({ error: 'used' }); return; }
    if (!rec.snapshot || Date.now() > Number(rec.expiresAt || 0)) { res.status(410).json({ error: 'expired' }); return; }
    try {
      await putJson(handoffPath(token), { createdAt: rec.createdAt, expiresAt: rec.expiresAt, claimedAt: Date.now() });
    } catch { res.status(503).json({ error: 'store' }); return; }
    res.status(200).json({ ok: true, snapshot: rec.snapshot });
    return;
  }

  const sid = String(b.sid || '');
  if (!SID_RE.test(sid)) { res.status(400).json({ error: 'sid' }); return; }
  const session = await readJson(`sessions/${sid}.json`);
  if (!session) { res.status(404).json({ error: 'no_session' }); return; }
  if (!hasAgent(session)) { res.status(409).json({ error: 'no_agent' }); return; }
  const now = Date.now();
  const token = newHandoffToken();
  const expiresAt = now + ttlMs();
  try {
    await putJson(handoffPath(token), { createdAt: now, expiresAt, snapshot: buildSnapshot(session, now) });
  } catch { res.status(503).json({ error: 'store' }); return; }
  res.status(200).json({ ok: true, url: signupUrl(token), expiresAt });
}
