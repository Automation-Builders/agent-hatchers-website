// Playground → dashboard handoff (setup snapshot v1).
// A visitor who hatched an agent in /prototype/ presses "Start 30-day free trial". The page asks
// /api/playground-handoff for a one-time link; this file builds what that link carries.
//
// Only the token travels in the address. The dashboard server (agenthatchers.ai) then reads the
// snapshot straight from this proxy with a shared secret, once. The snapshot is a frozen copy
// taken at mint time, so later writes to the session (which need no auth) cannot change it.
//
// What carries over is Hyein's decision 2 (working default, 19 Nov 2026): company and business
// details, the tools list, the main agent's name, look and brand colours, and the researched
// team as a "recommended" list. Never the email, the visitor's name, chats, profiles or photos:
// the dashboard account's own verified email is the owner.
//   HANDOFF_SECRET     shared with the dashboard (PLAYGROUND_HANDOFF_SECRET there); required
//   HANDOFF_TTL_HOURS  how long an unclaimed link works, default 24
//   DASHBOARD_SIGNUP_URL where the link points, default https://agenthatchers.ai/register?v=4
import { randomBytes, timingSafeEqual } from 'node:crypto';

export const SNAPSHOT_VERSION = 1;
export const TOKEN_RE = /^[A-Za-z0-9_-]{32}$/;
export const SID_RE = /^[a-z0-9-]{8,64}$/i;
export const BASES = ['logistics', 'marketing', 'support', 'returns', 'sales', 'inventory', 'invoices', 'documents', 'website', 'operations'];
const HEX_RE = /^#[0-9a-f]{6}$/i;
const IMAGE_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const IMAGE_MAX = 160_000;   // the client keeps the chosen look under 118,000 chars

export const newHandoffToken = () => randomBytes(24).toString('base64url');   // 32 chars, 192 bits
export const handoffPath = token => `handoffs/${token}.json`;

const clean = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const cleanList = (a, max, n) => Array.isArray(a)
  ? [...new Set(a.map(x => clean(x, n)).filter(Boolean))].slice(0, max) : [];

export function hasAgent(session) {
  return !!(session && clean(session.name, 28) && IMAGE_RE.test(String(session.selectedImage || '')));
}

// The researched team, flattened to what the dashboard can show as "recommended":
// the six catalog roles first (renamed for this business), then any extras.
function recommendedTeam(team) {
  if (!team || typeof team !== 'object') return [];
  const out = [];
  const agents = team.agents && typeof team.agents === 'object' ? team.agents : {};
  const lines = team.lines && typeof team.lines === 'object' ? team.lines : {};
  for (const id of Array.isArray(team.ids) ? team.ids : []) {
    if (!BASES.includes(id)) continue;
    const a = agents[id] || {}, l = lines[id] || {};
    out.push({ base: id, name: clean(a.name, 44) || id, summary: clean(a.summary || l.does, 170), job: clean(l.job, 48) });
  }
  for (const x of Array.isArray(team.extras) ? team.extras.slice(0, 10) : []) {
    if (!x || !BASES.includes(x.base)) continue;
    out.push({ base: x.base, name: clean(x.name, 44) || x.base, summary: clean(x.summary, 170), job: clean(x.job, 48) });
  }
  return out.slice(0, 16);
}

// session: the stored sessions/<sid>.json body (visitor-written, so everything is re-cleaned).
export function buildSnapshot(session, now = Date.now()) {
  const s = session || {};
  const image = String(s.selectedImage || '');
  return {
    v: SNAPSHOT_VERSION,
    mintedAt: now,
    company: {
      name: clean(s.company, 40) === 'Your Company' ? '' : clean(s.company, 40),
      business: clean(s.biz, 120),
      industry: clean(s.industry, 60),
      website: clean(s.website, 200),
      tools: cleanList(s.tools, 40, 30),
    },
    agent: {
      name: clean(s.name, 28),
      look: clean(s.look, 600),
      image: IMAGE_RE.test(image) && image.length <= IMAGE_MAX ? image : '',
      colors: (s.brand && Array.isArray(s.brand.colors) ? s.brand.colors : [])
        .map(c => String(c).toLowerCase()).filter(c => HEX_RE.test(c)).slice(0, 5),
    },
    team: { intro: clean(s.team && s.team.intro, 400), recommended: recommendedTeam(s.team) },
    from: { build: Number(s.build) || 0, page: clean(s.page, 120) },
  };
}

export function signupUrl(token, env = process.env) {
  const base = env.DASHBOARD_SIGNUP_URL || 'https://agenthatchers.ai/register?v=4';
  const u = new URL(base);
  u.searchParams.set('setup', token);
  return u.toString();
}

export function ttlMs(env = process.env) {
  const h = Number(env.HANDOFF_TTL_HOURS);
  return (Number.isFinite(h) && h > 0 ? Math.min(h, 72) : 24) * 3600_000;
}

export function checkSecret(given, env = process.env) {
  const want = String(env.HANDOFF_SECRET || '');
  const got = String(given || '');
  return want.length >= 32 && want.length === got.length && timingSafeEqual(Buffer.from(want), Buffer.from(got));
}
