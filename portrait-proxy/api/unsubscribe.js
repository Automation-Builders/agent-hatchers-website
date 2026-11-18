// Unsubscribe from prospect emails — the link in the footer of every agent email.
//   GET  ?s=<sid>&e=<emailKey>&t=<hmac>  → a small page that unsubscribes straight away (it
//        POSTs to itself on load; a button covers browsers without JavaScript). The GET alone
//        changes nothing, so mail scanners that pre-open links can't unsubscribe anyone.
//   POST same query                       → adds the address to the suppression list
//        (sessions-unsub/<emailKey>.json), marks the session, pings Slack. Also what Gmail and
//        Apple Mail call for their own Unsubscribe button (List-Unsubscribe-Post, RFC 8058).
// See lib/unsubscribe.js for the token and lib/agent-email.js for where the link goes.
import { put, get } from '@vercel/blob';
import { checkUnsubToken, unsubPath } from '../lib/unsubscribe.js';
import { markUnsubscribed } from '../lib/resend-contacts.js';

const SID_RE = /^[a-z0-9-]{8,64}$/i, KEY_RE = /^[0-9a-f]{32}$/;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || 'C0CCA9T995K';
const putJson = (pathname, obj) => put(pathname, JSON.stringify(obj), { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
async function readJson(pathname) {
  try {
    const r = await get(pathname, { access: 'private', useCache: false });
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return JSON.parse(await new Response(r.stream).text());
  } catch { return null; }
}
async function slackNote(text) {
  try {
    if (process.env.SLACK_BOT_TOKEN) await fetch('https://slack.com/api/chat.postMessage', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` }, body: JSON.stringify({ channel: SLACK_CHANNEL, text }) });
    else if (process.env.SLACK_WEBHOOK_URL) await fetch(process.env.SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
  } catch { /* the unsubscribe still stands */ }
}

const page = (title, body, extra = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · Agent Hatchers</title>
<style>:root{color-scheme:light}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f1ea;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#16150f;padding:16px;box-sizing:border-box}
main{max-width:440px;width:100%;background:#fff;border-radius:20px;padding:32px}.k{font:700 13px/1 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#216bac;margin:0 0 14px}
h1{font-size:24px;line-height:1.25;margin:0 0 10px}p{margin:0;color:#4a4a44}button{margin-top:20px;border:0;border-radius:999px;padding:13px 24px;background:#216bac;color:#fff;font:600 15px/1 Arial,Helvetica,sans-serif;cursor:pointer}a{color:#216bac}</style></head>
<body><main><p class="k">Agent Hatchers</p>${body}</main>${extra}</body></html>`;
const done = page('Unsubscribed', '<h1>You’re unsubscribed</h1><p>We won’t email you again. The link to your agent still works if you kept it.</p><p style="margin-top:14px">Changed your mind? Email <a href="mailto:support@agenthatchers.com">support@agenthatchers.com</a>.</p>');
const bad = page('Link not recognised', '<h1>That link didn’t work</h1><p>To stop our emails, reply “unsubscribe” to any of them or email <a href="mailto:support@agenthatchers.com">support@agenthatchers.com</a> and we’ll take you off the list.</p>');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const q = req.query || {};
  const sid = String(q.s || ''), key = String(q.e || ''), t = String(q.t || '');
  if (!SID_RE.test(sid) || !KEY_RE.test(key) || !checkUnsubToken(sid, key, t)) { res.status(400).send(bad); return; }

  if (req.method === 'GET') {
    // Unsubscribe on arrival, but via POST so link scanners (which only GET) can't trigger it.
    res.status(200).send(page('Unsubscribing', '<h1>Unsubscribing you…</h1><p>One moment.</p><form method="post" id="f"><noscript><button type="submit">Unsubscribe</button></noscript></form>',
      '<script>document.getElementById("f").submit()</script>'));
    return;
  }
  if (req.method !== 'POST') { res.status(405).send(bad); return; }
  try {
    const already = await readJson(unsubPath(key));
    if (!already) {
      const at = Date.now();
      await putJson(unsubPath(key), { at, sid });
      const index = await readJson(`sessions-index/${sid}.json`);
      if (index) { index.unsubscribed = at; await putJson(`sessions-index/${sid}.json`, index); }
      if (index && index.email) await markUnsubscribed(index.email);   // off the Resend mailing list too
      await slackNote(`:no_bell: ${(index && (index.you || index.email)) || 'A prospect'}${index && index.company ? ` from *${index.company}*` : ''} unsubscribed from our emails`);
    }
    res.status(200).send(done);
  } catch (e) {
    res.status(502).send(bad);
  }
}
