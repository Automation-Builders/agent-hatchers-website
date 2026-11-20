// One guard for every public endpoint of the portrait proxy.
//
// The playground page calls these functions straight from the browser, and the repo is public,
// so anyone can call them with curl. CORS only tells browsers which sites may read the answer;
// it never refuses a request. This module is what actually refuses one: it counts calls per
// visitor, per IP and (for the paid endpoints) an estimated global spend per day, and answers
// 429 BEFORE the endpoint calls OpenRouter, Resend, Slack or Blob.
//
//   import { applyCors, guard } from '../lib/guard.js';
//   applyCors(req, res);                        // headers only, as before
//   if (!(await guard(req, res, 'portrait'))) return;   // 429 / 503 already sent
//
// Who is counted
//   ip       the caller's address as Vercel reports it (IPv6 grouped by /64, which one person
//            usually holds whole). This is the key a script cannot change cheaply.
//   visitor  the page's random id from localStorage, sent as `x-ah-visitor`. A script can send
//            any value, so a visitor id only ever makes the limits TIGHTER: both the visitor and
//            the IP count, and either one over its limit refuses. A call without the header is
//            counted with the IP as its visitor, so curl gets the per-visitor limit per address.
//            Once the playground verifies an email, use a hash of the verified email here
//            instead of the localStorage id (see `subjectOf`), and the limits keep their meaning.
//   staff    a signed pass in `x-ah-pass`, minted on the sessions page with the SESSIONS_KEY
//            (`mintStaffPass`). Staff are not limited and not counted against the daily cap; the
//            spending cap on the OpenRouter key still applies to everyone.
//
// Counters live in Upstash Redis (Vercel Marketplace), read through its REST API with plain
// fetch, so there is no new dependency. Locally and in tests (no VERCEL env) an in-memory map
// stands in. On Vercel without a store the paid endpoints answer 503 rather than run unlimited;
// the free ones (session save, lead, handoff, website lookup) carry on.
//
// Limits are per UTC day unless a class sets `window` (seconds). Override any number without a
// code change with RATE_LIMITS, e.g. RATE_LIMITS='{"portrait":{"visitor":120}}', and the global
// cap with DAILY_SPEND_CAP_CENTS.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);

// `cents` is an estimate of what one call costs us on OpenRouter, used only for the global cap.
// A portrait is one image (~1,290 output tokens on the default image model, about 8 US cents);
// a team call is research with web search plus design; chat and profile are small text calls.
// One full hatch is up to ~29 portraits (3 designs, then the marketplace and other profiles are
// re-dressed in the chosen look), and a kept look edit redraws the marketplace again, so the
// portrait numbers are sized for a visitor who uses all three hatches and all three edits.
export const DEFAULT_LIMITS = {
  portrait: { visitor: 180, ip: 400, cents: 8, paid: true },
  team:     { visitor: 10,  ip: 30,  cents: 4, paid: true },
  profile:  { visitor: 6,   ip: 15,  cents: 2, paid: true },
  chat:     { visitor: 80,  ip: 200, cents: 1, paid: true },
  brand:    { visitor: 10,  ip: 30 },
  session:  { ip: 400, window: 3600 },   // the page saves at most once every 12 s per tab
  ping:     { ip: 30 },                   // Slack milestone pings from session saves
  mail:     { ip: 3 },                    // prospect emails + mailing-list adds from session saves
  lead:     { ip: 5 },
  handoff:  { ip: 20 },
};
const DEFAULT_CAP_CENTS = 2000;           // US$20 a day across all paid endpoints

const MESSAGES = {
  visitor: 'You’ve reached today’s free limit for the playground. Start your 30-day free trial to keep going, or come back tomorrow.',
  ip: 'You’ve reached today’s free limit for the playground. Start your 30-day free trial to keep going, or come back tomorrow.',
  daily: 'The playground is very busy today, so free designs are paused until tomorrow. Start your 30-day free trial to keep going.',
  store: 'The playground can’t check its free limits right now. Please try again in a minute.',
};

function limits() {
  let over = {};
  try { over = JSON.parse(process.env.RATE_LIMITS || '{}') || {}; } catch { over = {}; }
  const out = {};
  for (const [k, v] of Object.entries(DEFAULT_LIMITS)) out[k] = { ...v, ...(over[k] && typeof over[k] === 'object' ? over[k] : {}) };
  return out;
}
const capCents = () => {
  const n = Number(process.env.DAILY_SPEND_CAP_CENTS);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_CAP_CENTS;
};

// ---------- CORS (headers only; the guard below is what refuses) ----------
export function applyCors(req, res, methods = 'POST,OPTIONS', extraHeaders = '') {
  const origin = (req && req.headers && req.headers.origin) || '';
  const allow = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', ['content-type', 'x-ah-visitor', 'x-ah-pass', extraHeaders].filter(Boolean).join(','));
  res.setHeader('Access-Control-Expose-Headers', 'retry-after');
}

// ---------- who is calling ----------
const header = (req, name) => {
  const v = req && req.headers ? req.headers[name] : '';
  return String(Array.isArray(v) ? v[0] : (v || '')).trim();
};
// Vercel sets these from the connection and overwrites what the client sent.
export function clientIp(req) {
  const raw = header(req, 'x-vercel-forwarded-for') || header(req, 'x-real-ip') ||
    header(req, 'x-forwarded-for') || String((req && req.socket && req.socket.remoteAddress) || '');
  const ip = raw.split(',')[0].trim().slice(0, 64);
  if (!ip) return 'unknown';
  if (ip.includes(':') && !/^::ffff:\d+\.\d+\.\d+\.\d+$/i.test(ip)) return ipv6Prefix(ip);
  return ip.replace(/^::ffff:/i, '');
}
// First four groups of an IPv6 address (its /64), expanded so '2001:db8::1' and '2001:db8:0:0::2' match.
function ipv6Prefix(ip) {
  const bare = ip.replace(/^\[|\]$/g, '').split('%')[0].toLowerCase();
  const [head, tail = ''] = bare.split('::');
  const h = head ? head.split(':') : [];
  const t = bare.includes('::') ? (tail ? tail.split(':') : []) : [];
  const groups = bare.includes('::') ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t] : h;
  return groups.slice(0, 4).map(g => (g || '0').replace(/^0+(?=.)/, '')).join(':') + '::/64';
}
const VISITOR_RE = /^[A-Za-z0-9_-]{8,64}$/;
// The thing a person is counted as. Today: the page's localStorage id. Later: a hash of the
// visitor's verified email, which a script can't mint for free.
export function subjectOf(req) {
  const v = header(req, 'x-ah-visitor');
  return VISITOR_RE.test(v) ? 'v:' + v : 'ip:' + clientIp(req);
}

// ---------- staff pass ----------
const PASS_DAYS = 30;
const passSecret = () => {
  const s = process.env.STAFF_PASS_SECRET || process.env.SESSIONS_KEY || '';
  return s.length >= 16 ? s : '';
};
const sign = (secret, data) => createHmac('sha256', secret).update('ah-staff-pass:' + data).digest('base64url');
// `v1.<payload>.<sig>`, payload = base64url JSON { n: name, exp: ms }. Rotating the secret (or
// SESSIONS_KEY when no STAFF_PASS_SECRET is set) revokes every pass at once.
export function mintStaffPass(name, now = Date.now(), days = PASS_DAYS) {
  const secret = passSecret();
  if (!secret) return null;
  const exp = now + days * 86400000;
  const payload = Buffer.from(JSON.stringify({ n: String(name || '').slice(0, 40), exp })).toString('base64url');
  return { pass: `v1.${payload}.${sign(secret, payload)}`, exp };
}
export function verifyStaffPass(token, now = Date.now()) {
  const secret = passSecret();
  const m = /^v1\.([A-Za-z0-9_-]{8,200})\.([A-Za-z0-9_-]{43})$/.exec(String(token || ''));
  if (!secret || !m) return null;
  const want = Buffer.from(sign(secret, m[1])), got = Buffer.from(m[2]);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  let p = null;
  try { p = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8')); } catch { return null; }
  if (!p || !(Number(p.exp) > now)) return null;
  return { name: String(p.n || ''), exp: Number(p.exp) };
}

// ---------- counter store ----------
const memory = new Map();   // key → { n, until }
export function _resetMemory() { memory.clear(); }
function storeConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (url && token) return { url: url.replace(/\/+$/, ''), token };
  return process.env.VERCEL ? null : { memory: true };
}
// Add `by` to each key (creating it with its TTL first) and return the new totals, in order.
async function incr(store, items, now) {
  if (store.memory) {
    return items.map(({ key, by, ttl }) => {
      let e = memory.get(key);
      if (!e || e.until <= now) { e = { n: 0, until: now + ttl * 1000 }; memory.set(key, e); }
      e.n += by;
      return e.n;
    });
  }
  const cmds = items.flatMap(({ key, by, ttl }) => [['SET', key, '0', 'EX', String(ttl), 'NX'], ['INCRBY', key, String(by)]]);
  const r = await fetch(`${store.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${store.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
    signal: AbortSignal.timeout(2500),
  });
  if (!r.ok) throw new Error(`store ${r.status}`);
  const out = await r.json();
  if (!Array.isArray(out) || out.length !== cmds.length) throw new Error('store reply');
  return items.map((_, i) => {
    const cell = out[i * 2 + 1];
    if (!cell || cell.error !== undefined || !Number.isFinite(Number(cell.result))) throw new Error('store reply');
    return Number(cell.result);
  });
}

// ---------- the check ----------
const dayStart = now => Math.floor(now / 86400000) * 86400000;
// Decide whether this request may go ahead. Never writes to `res`.
//   → { ok:true, staff? } or { ok:false, status:429|503, scope, retryAfter, message }
export async function allow(req, cls, { now = Date.now() } = {}) {
  const rule = limits()[cls];
  if (!rule) throw new Error(`guard: unknown class ${cls}`);
  const staff = verifyStaffPass(header(req, 'x-ah-pass'), now);
  if (staff) return { ok: true, staff: staff.name || true };

  const store = storeConfig();
  if (!store) {
    console.error(JSON.stringify({ fn: 'guard', cls, error: 'no counter store configured (KV_REST_API_URL / KV_REST_API_TOKEN)' }));
    return rule.paid ? { ok: false, status: 503, scope: 'store', retryAfter: 60, message: MESSAGES.store } : { ok: true, unchecked: true };
  }
  const window = Number(rule.window) > 0 ? Number(rule.window) * 1000 : 86400000;
  const start = rule.window ? Math.floor(now / window) * window : dayStart(now);
  const ttl = Math.ceil((start + window - now) / 1000) + 60;
  const retryAfter = Math.max(1, Math.ceil((start + window - now) / 1000));
  const ip = clientIp(req);
  const items = [];
  if (rule.ip) items.push({ scope: 'ip', key: `rl:${cls}:ip:${ip}:${start}`, by: 1, ttl, limit: rule.ip });
  // `sub:` keeps a header-less caller's visitor counter apart from its IP counter.
  if (rule.visitor) items.push({ scope: 'visitor', key: `rl:${cls}:sub:${subjectOf(req)}:${start}`, by: 1, ttl, limit: rule.visitor });
  try {
    const totals = await incr(store, items, now);
    const hit = items.find((it, i) => totals[i] > it.limit);
    if (hit) return { ok: false, status: 429, scope: hit.scope, retryAfter, message: MESSAGES[hit.scope] };
    // Only calls that passed their own limits count toward the shared cap, so one caller
    // hammering past its limit can't use up everyone's day.
    if (rule.cents) {
      const day = dayStart(now);
      const [spent] = await incr(store, [{ key: `spend:${day}`, by: rule.cents, ttl: Math.ceil((day + 86400000 - now) / 1000) + 3600 }], now);
      if (spent > capCents()) {
        return { ok: false, status: 429, scope: 'daily', retryAfter: Math.max(1, Math.ceil((day + 86400000 - now) / 1000)), message: MESSAGES.daily };
      }
    }
    return { ok: true };
  } catch (e) {
    console.error(JSON.stringify({ fn: 'guard', cls, error: String(e && e.message) }));
    return rule.paid ? { ok: false, status: 503, scope: 'store', retryAfter: 60, message: MESSAGES.store } : { ok: true, unchecked: true };
  }
}

// allow() and, when refused, answer the request. Returns true when the endpoint may go on.
export async function guard(req, res, cls, opts) {
  const r = await allow(req, cls, opts);
  if (r.ok) return true;
  console.log(JSON.stringify({ fn: 'guard', cls, refused: r.scope, ip: clientIp(req) }));
  res.setHeader('Retry-After', String(r.retryAfter));
  res.setHeader('Cache-Control', 'no-store');
  res.status(r.status).json({ error: r.message, limit: cls, scope: r.scope, retryAfter: r.retryAfter });
  return false;
}
