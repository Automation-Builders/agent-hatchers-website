// Vercel serverless function: keep a copy of each prospect's prototype session in Vercel Blob
// so the team can look at what people hatched, and list them for the sessions page.
//   POST <snapshot JSON>            → stores sessions/<sid>.json + a small sessions-index/<sid>.json
//   GET  ?key=<SESSIONS_KEY>        → { sessions:[index summaries…], count }
//   GET  ?key=<SESSIONS_KEY>&sid=…  → the full session snapshot
//   GET  ?key=…&sid=…&view=1&by=<name> → same, and logs that <name> opened that dashboard
//   GET  ?key=…&log=1              → { log:[…] } who deleted / opened what (newest first)
//   DELETE ?key=…&sid=…&by=<name>  → moves that session to the trash; refused without a name; logged + Slack
//   PUT  ?key=…&sid=…&by=<name>    → restores it from the trash (logged + Slack)
//   GET  ?key=…&trash=1            → { trash:[…] } what can still be restored (kept TRASH_DAYS, then purged)
//   PATCH ?key=…&sid=…&by=<name>&share=1 → mints (or returns) that session's share token; logged
//   PATCH ?key=…&sid=…&by=<name>&share=0 → revokes it (the link stops working); logged
//   GET  ?share=<token>             → PUBLIC, no key: the full snapshot for /prototype/?share=<token>,
//                                    counted + logged as a view, Slack-pinged at most once an hour
// Share links are how the team sends a hatched dashboard to the prospect: the token is 18 random
// bytes (unguessable), lives in sessions-share/<token>.json → { sid } and on the session's index,
// and only the session it points at is readable — never the list, the log or any other session.
// Every delete and dashboard open is written to sessions-log/<time>-<action>-<sid>.json with
// the name typed on the sessions page, the caller's IP and browser — the key is shared, so the
// name is what tells the team apart.
// The store is PRIVATE: nothing is readable by URL; every read goes through here and the key
// (or, for one explicitly shared session, its share token).
// Needs a Blob store connected to the project (BLOB_READ_WRITE_TOKEN) and SESSIONS_KEY set.
// Prospect email: set RESEND_API_KEY (and verify agenthatchers.com in Resend) so a prospect who
// leaves their email on the hatch screen is sent their share link — see lib/agent-email.js.
// Slack notifications: set SLACK_BOT_TOKEN (recommended — posts to #prototype-sessions)
// or SLACK_WEBHOOK_URL (legacy incoming webhook) to get pings on new sessions, hatches and connections.
// SLACK_CHANNEL defaults to C0CCA9T995K when using the bot token.
import { put, list, get, del } from '@vercel/blob';
import { randomBytes } from 'node:crypto';
import { sendAgentEmail, emailKey } from '../lib/agent-email.js';
import { unsubUrl, unsubPath } from '../lib/unsubscribe.js';
import { upsertContact, contactUnsubscribed } from '../lib/resend-contacts.js';
import { applyCors, allow, guard, mintStaffPass } from '../lib/guard.js';

const MAX_BYTES = 4_000_000;   // Vercel's request body ceiling is 4.5 MB; the client sends thumbnails

const clean = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const AGENT_NAMES = { logistics: 'Logistics', sales: 'Sales', documents: 'Documents', invoices: 'Invoices', support: 'Support', website: 'Website', operations: 'Operations', marketing: 'Marketing', returns: 'Returns', inventory: 'Inventory' };
const SESSIONS_PAGE = process.env.SESSIONS_PAGE || 'https://agenthatchers.com/prototype/sessions.html';
const SITE = process.env.SITE_ORIGIN || 'https://agenthatchers.com';
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'C0CCA9T995K';
async function slackPing(kind, index) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!botToken && !webhookUrl) return;
  const mins = index.startedAt ? Math.max(1, Math.round((index.savedAt - index.startedAt) / 60000)) : null;
  const team = (index.teamIds || []).map(id => AGENT_NAMES[id] || id).join(', ');
  const head = kind === 'connected'
    ? `:electric_plug: *${index.company || 'Someone'}* just connected an instance in the prototype`
    : kind === 'contact'
    ? `:wave: *${index.you || 'Someone'}* from *${index.company || 'an unnamed company'}* left their details in the prototype`
    : kind === 'created'
    ? `:hatching_chick: *${index.company || 'Someone'}* just hatched an agent in the prototype`
    : `:hatching_chick: *${index.company || 'Someone'}* just hatched an agent in the prototype`;
  const lines = [
    index.you || index.email ? `*Who:* ${[index.you, index.email].filter(Boolean).join(' · ')}` : '',
    kind === 'contact' && index.mailed ? `*Email:* ${index.mailed.ok ? 'sent them their agent link' : `not sent (${index.mailed.reason})`}` : '',
    kind === 'contact' && index.listed ? `*Mailing list:* ${index.listed.ok ? (index.listed.reason || 'added to Resend contacts, segment "Prototype leads"') : `not added (${index.listed.reason})`}` : '',
    index.name ? `*Agent:* ${index.name}` : '',
    index.biz ? `*Business:* ${index.biz}${index.industry ? ` (${index.industry})` : ''}` : '',
    team ? `*Team proposed:* ${team}` : '',
    index.tools && index.tools.length ? `*Tools they use:* ${index.tools.join(', ')}` : '',
    index.brand ? `*Website used:* ${index.brand}` : '',
    mins ? `*Time on page:* ${mins} min` : ''
  ].filter(Boolean).join('\n');
  const message = {
    text: `${head.replace(/[*:_]/g, '')}${index.name ? ` — ${index.name}` : ''}`,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: head + (lines ? '\n' + lines : '') } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `<${SESSIONS_PAGE}|Open the sessions page> · ${index.page || ''}` }] }
    ]
  };
  if (botToken) {
    try {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${botToken}` },
        body: JSON.stringify({ ...message, channel: SLACK_CHANNEL })
      });
    } catch { /* a missed ping is not worth failing the save */ }
  } else {
    try { await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) }); } catch { /* a missed ping is not worth failing the save */ }
  }
}
const TRASH_DAYS = Number(process.env.TRASH_DAYS) || 30;
const SHARE_RE = /^[A-Za-z0-9_-]{16,64}$/;
const newToken = () => randomBytes(18).toString('base64url');   // 24 url-safe chars, 144 bits
const VIEW_PING_GAP = 60 * 60 * 1000;                            // one Slack ping per shared link per hour
const putJson = (pathname, obj) => put(pathname, JSON.stringify(obj), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
async function slackNote(text) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!botToken && !webhookUrl) return;
  if (botToken) {
    try {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${botToken}` },
        body: JSON.stringify({ channel: SLACK_CHANNEL, text })
      });
    } catch { /* not worth failing the call */ }
  } else {
    try { await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }); } catch { /* not worth failing the call */ }
  }
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
// The prospect left an email on the hatch screen: give the session a public share link (the
// same one sessions.html would mint) and email it to them. One email per address per day, so
// the open POST can't be used to mail someone over and over.
const MAIL_GAP = 24 * 60 * 60 * 1000;
// Returns false when the per-IP limit held it back, so the caller can try again on a later save.
async function mailAgentLink(index, req) {
  const mailKey = `sessions-mail/${emailKey(index.email)}.json`;
  let last = null;
  try { last = await readJson(mailKey); } catch { last = null; }
  // The save is public, so cap how many new addresses one IP can mail or list per day. An address
  // already emailed today doesn't count (it won't be emailed again anyway).
  if (!(last && Date.now() - last.at < MAIL_GAP) && !(await allow(req, 'mail')).ok) {
    index.mailed = { at: Date.now(), ok: false, reason: 'held back: too many new emails from one connection today; tries again on a later save' };
    return false;
  }
  // onto the mailing list first, so the contact exists whatever happens to the email
  const listed = await upsertContact({ email: index.email, you: index.you, company: index.company });
  index.listed = { at: Date.now(), ok: listed.ok, reason: listed.reason };
  if (await readJson(unsubPath(emailKey(index.email))).catch(() => null)) { index.mailed = { at: Date.now(), ok: false, reason: 'they unsubscribed earlier' }; return; }
  if (await contactUnsubscribed(index.email)) { index.mailed = { at: Date.now(), ok: false, reason: 'they unsubscribed in Resend' }; return; }
  if (last && Date.now() - last.at < MAIL_GAP) { index.mailed = { at: Date.now(), ok: false, reason: 'already emailed that address today' }; return; }
  if (!(index.share && index.share.token)) {
    index.share = { token: newToken(), createdAt: Date.now(), by: 'auto (prospect email)', views: 0 };
    await putJson(`sessions-share/${index.share.token}.json`, { sid: index.sid, createdAt: index.share.createdAt, by: index.share.by });
    await logAction('share', index.sid, req, index);
  }
  const page = /^\/prototype\/[A-Za-z0-9/_-]*$/.test(index.page || '') ? index.page : '/prototype/';
  const url = `${SITE}${page}?share=${index.share.token}`;
  const r = await sendAgentEmail(index.email, { you: index.you, company: index.company, agentName: index.name, url, unsub: unsubUrl(index.sid, index.email) });
  index.mailed = { at: Date.now(), ok: r.sent, reason: r.sent ? '' : r.reason };
  if (r.sent) { try { await putJson(mailKey, { at: Date.now(), sid: index.sid }); } catch { /* the email still went */ } }
}
async function readJson(pathname) {
  const r = await get(pathname, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  const text = await new Response(r.stream).text();
  try { return JSON.parse(text); } catch { return null; }
}

export default async function handler(req, res) {
  applyCors(req, res, 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'x-sessions-key');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (!process.env.BLOB_READ_WRITE_TOKEN) { res.status(500).json({ error: 'No Blob store is connected to this project' }); return; }

  if (req.method === 'GET') {
    const shareTok = clean(req.query && req.query.share, 64);
    if (shareTok) {
      // Public read: the token is the only credential, and it opens exactly one session.
      if (!SHARE_RE.test(shareTok)) { res.status(400).json({ error: 'Bad share link' }); return; }
      try {
        const link = await readJson(`sessions-share/${shareTok}.json`);
        const full = link && link.sid ? await readJson(`sessions/${link.sid}.json`) : null;
        if (!full) { res.status(404).json({ error: 'This preview link is not active any more' }); return; }
        const sid = link.sid;
        let index = null;
        try { index = await readJson(`sessions-index/${sid}.json`); } catch { index = null; }
        const { ip } = actor(req);
        let ping = false;
        if (index && index.share && index.share.token === shareTok) {
          const now = Date.now();
          index.share.views = (index.share.views || 0) + 1; index.share.lastViewAt = now;
          if (!index.share.lastPingAt || now - index.share.lastPingAt > VIEW_PING_GAP) { index.share.lastPingAt = now; ping = true; }
          try { await putJson(`sessions-index/${sid}.json`, index); } catch { /* the view still happened */ }
        }
        req.query.by = 'visitor';
        await logAction('view', sid, req, index || { company: clean(full.company, 80), name: clean(full.name, 40), step: Number(full.step) || 0 });
        if (ping) await slackNote(`:eyes: Someone opened the shared prototype for *${(index && index.company) || clean(full.company, 80) || 'an unnamed company'}*${index && index.name ? ` (${index.name})` : ''}${ip ? ` · from ${ip}` : ''}`);
        // The link gets forwarded: the prospect's name, email and browser stay with the team.
        const { you, email, ua, ...shown } = full;
        res.setHeader('Cache-Control', 'no-store'); res.status(200).json(shown);
      } catch (e) { res.status(502).json({ error: 'Could not read this preview: ' + (e && e.message) }); }
      return;
    }
    const key = (req.query && req.query.key) || req.headers['x-sessions-key'] || '';
    if (!process.env.SESSIONS_KEY) { res.status(500).json({ error: 'SESSIONS_KEY is not set' }); return; }
    if (!key || key !== process.env.SESSIONS_KEY) { res.status(401).json({ error: 'Wrong key' }); return; }
    // Demo pass for the team: lifts the playground's free limits in the browser that holds it
    // (lib/guard.js verifies it on every call). Minted from the sessions page; logged.
    if (req.query && req.query.pass) {
      const { by } = actor(req);
      if (!by) { res.status(400).json({ error: 'Say who you are first — demo passes are logged (by=<your name>)' }); return; }
      // 30 days for a team member's own browser; `hours=12` for a demo on someone else's computer.
      const minted = mintStaffPass(by, Date.now(), Number(req.query.hours) || undefined);
      if (!minted) { res.status(500).json({ error: 'Set STAFF_PASS_SECRET (32+ random characters) on the proxy to mint demo passes' }); return; }
      await logAction('pass', 'demo-pass', req, { company: 'their browser', name: '', step: null });
      res.setHeader('Cache-Control', 'no-store'); res.status(200).json({ ok: true, by, ...minted });
      return;
    }
    if (req.query && req.query.trash) {
      try {
        const blobs = await listAll('sessions-trash-index/');
        const cutoff = Date.now() - TRASH_DAYS * 86400000;
        const trash = (await Promise.all(blobs.map(async b => { try { return await readJson(b.pathname); } catch { return null; } }))).filter(Boolean);
        const expired = trash.filter(t => (t.deletedAt || 0) < cutoff);
        if (expired.length) { try { await del(expired.flatMap(t => [`sessions-trash/${t.sid}.json`, `sessions-trash-index/${t.sid}.json`])); } catch { /* next listing tries again */ } }
        const kept = trash.filter(t => (t.deletedAt || 0) >= cutoff).sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
        res.setHeader('Cache-Control', 'no-store'); res.status(200).json({ trash: kept, count: kept.length, days: TRASH_DAYS });
      } catch (e) { res.status(502).json({ error: 'Could not read the trash: ' + (e && e.message) }); }
      return;
    }
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
      // Soft delete: both blobs move to the trash first, so a slip can be undone for TRASH_DAYS.
      let index = null, full = null;
      try { index = await readJson(`sessions-index/${sid}.json`); } catch { index = null; }
      try { full = await readJson(`sessions/${sid}.json`); } catch { full = null; }
      if (!index && !full) { res.status(404).json({ error: 'No such session' }); return; }
      const deletedAt = Date.now();
      if (full) await putJson(`sessions-trash/${sid}.json`, full);
      await putJson(`sessions-trash-index/${sid}.json`, Object.assign({}, index || { sid }, { sid, deletedAt, deletedBy: by }));
      const gone = [`sessions/${sid}.json`, `sessions-index/${sid}.json`];
      if (index && index.share && index.share.token) gone.push(`sessions-share/${index.share.token}.json`);   // the link dies with it
      await del(gone);
      const entry = await logAction('delete', sid, req, index);
      await slackNote(`:wastebasket: ${by} deleted the prototype session for *${(index && index.company) || 'an unnamed company'}*${index && index.name ? ` (${index.name})` : ''}${ip ? ` · from ${ip}` : ''} — restorable from the sessions page for ${TRASH_DAYS} days`);
      res.status(200).json({ ok: true, sid, trashed: true, days: TRASH_DAYS, logged: entry });
    } catch (e) { res.status(502).json({ error: 'Could not delete: ' + (e && e.message) }); }
    return;
  }
  if (req.method === 'PATCH') {
    const key = (req.query && req.query.key) || req.headers['x-sessions-key'] || '';
    if (!process.env.SESSIONS_KEY || key !== process.env.SESSIONS_KEY) { res.status(401).json({ error: 'Wrong key' }); return; }
    const sid = clean(req.query && req.query.sid, 64);
    if (!/^[a-z0-9-]{8,64}$/i.test(sid)) { res.status(400).json({ error: 'Bad session id' }); return; }
    const { by } = actor(req);
    if (!by) { res.status(400).json({ error: 'Say who you are first — share links are logged (by=<your name>)' }); return; }
    const want = String((req.query && req.query.share) ?? '1');
    try {
      let index = null;
      try { index = await readJson(`sessions-index/${sid}.json`); } catch { index = null; }
      if (!index) { res.status(404).json({ error: 'No such session' }); return; }
      if (want === '0') {
        if (index.share && index.share.token) { try { await del([`sessions-share/${index.share.token}.json`]); } catch { /* the index is what the page trusts */ } }
        delete index.share;
        await putJson(`sessions-index/${sid}.json`, index);
        const entry = await logAction('unshare', sid, req, index);
        res.status(200).json({ ok: true, sid, shared: false, logged: entry });
        return;
      }
      if (!(index.share && index.share.token)) {
        // One token per session: sharing twice hands back the same link.
        index.share = { token: newToken(), createdAt: Date.now(), by, views: 0 };
        await putJson(`sessions-share/${index.share.token}.json`, { sid, createdAt: index.share.createdAt, by });
        await putJson(`sessions-index/${sid}.json`, index);
        await logAction('share', sid, req, index);
      }
      res.status(200).json({ ok: true, sid, shared: true, share: index.share });
    } catch (e) { res.status(502).json({ error: 'Could not update sharing: ' + (e && e.message) }); }
    return;
  }
  if (req.method === 'PUT') {
    const key = (req.query && req.query.key) || req.headers['x-sessions-key'] || '';
    if (!process.env.SESSIONS_KEY || key !== process.env.SESSIONS_KEY) { res.status(401).json({ error: 'Wrong key' }); return; }
    const sid = clean(req.query && req.query.sid, 64);
    if (!/^[a-z0-9-]{8,64}$/i.test(sid)) { res.status(400).json({ error: 'Bad session id' }); return; }
    const { by } = actor(req);
    if (!by) { res.status(400).json({ error: 'Say who you are first — restores are logged (by=<your name>)' }); return; }
    try {
      let tindex = null, full = null;
      try { tindex = await readJson(`sessions-trash-index/${sid}.json`); } catch { tindex = null; }
      try { full = await readJson(`sessions-trash/${sid}.json`); } catch { full = null; }
      if (!tindex && !full) { res.status(404).json({ error: 'Nothing in the trash with that id' }); return; }
      const index = Object.assign({}, tindex || {}); delete index.deletedAt; delete index.deletedBy;
      if (full) await putJson(`sessions/${sid}.json`, full);
      if (tindex) await putJson(`sessions-index/${sid}.json`, index);
      if (index.share && index.share.token) await putJson(`sessions-share/${index.share.token}.json`, { sid, createdAt: index.share.createdAt, by: index.share.by });
      await del([`sessions-trash/${sid}.json`, `sessions-trash-index/${sid}.json`]);
      const entry = await logAction('restore', sid, req, index);
      await slackNote(`:leftwards_arrow_with_hook: ${by} restored the prototype session for *${index.company || 'an unnamed company'}*${index.name ? ` (${index.name})` : ''}`);
      res.status(200).json({ ok: true, sid, restored: true, logged: entry });
    } catch (e) { res.status(502).json({ error: 'Could not restore: ' + (e && e.message) }); }
    return;
  }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!(await guard(req, res, 'session'))) return;
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
    company: clean(body.company, 80), you: clean(body.you, 60), email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(body.email, 120)) ? clean(body.email, 120).toLowerCase() : '',
    name: clean(body.name, 40), biz: clean(body.biz, 80), industry: clean(body.industry, 60),
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
    if (prev && prev.share) index.share = prev.share;             // a saved-again session stays shared
    const pings = [];
    if ((!prev && !index.pinged.created) || index.pinged.created === false) { index.pinged.created = true; pings.push('created'); }   // false = held back by the ping limit earlier
    if (index.email && !index.pinged.contact) { index.pinged.contact = true; pings.push('contact'); }
    if (index.step >= 4 && !index.pinged.hatched) { index.pinged.hatched = true; pings.push('hatched'); }
    if (index.done && !index.pinged.connected) { index.pinged.connected = true; pings.push('connected'); }
    await put(`sessions/${sid}.json`, raw, { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
    if (prev && prev.mailed) index.mailed = prev.mailed;
    if (prev && prev.unsubscribed) index.unsubscribed = prev.unsubscribed;
    if (prev && prev.listed) index.listed = prev.listed;
    // Pings and emails held back by a per-IP limit are not marked done, so a later save retries.
    const pingOk = pings.length ? (await allow(req, 'ping')).ok : true;
    if (!pingOk) for (const k of pings) if (k !== 'contact') index.pinged[k] = false;
    if (pings.includes('contact') && (await mailAgentLink(index, req)) === false) index.pinged.contact = false;
    await put(`sessions-index/${sid}.json`, JSON.stringify(index), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
    // New session ids are free to make, so the pings one IP can trigger are capped too.
    if (pingOk) for (const kind of pings) if (kind !== 'contact' || index.pinged.contact) await slackPing(kind, index);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, sid, bytes: raw.length });
  } catch (e) {
    res.status(502).json({ error: 'Could not store session: ' + (e && e.message) });
  }
}