// One-click unsubscribe for prospect emails (Spam Act 2003 s18: a functional unsubscribe).
// The link carries the session id, a hash of the address and an HMAC of both, so nobody can
// unsubscribe someone else by guessing. Unsubscribed addresses live in the private Blob store
// at sessions-unsub/<emailKey>.json — that is the suppression list every send checks.
//   UNSUB_SECRET  optional; falls back to SESSIONS_KEY
import { createHmac, timingSafeEqual } from 'node:crypto';
import { emailKey } from './agent-email.js';

const secretOf = env => env.UNSUB_SECRET || env.SESSIONS_KEY || '';
export const unsubPath = key => `sessions-unsub/${key}.json`;

export function unsubToken(sid, key, env = process.env) {
  const secret = secretOf(env);
  if (!secret) return '';
  return createHmac('sha256', secret).update(`${sid}|${key}`).digest('base64url').slice(0, 32);
}
export function checkUnsubToken(sid, key, token, env = process.env) {
  const want = unsubToken(sid, key, env);
  const got = String(token || '');
  return !!want && want.length === got.length && timingSafeEqual(Buffer.from(want), Buffer.from(got));
}
// Lives on the proxy so the click needs nothing from the static site.
export function unsubUrl(sid, email, env = process.env) {
  const key = emailKey(email);
  const t = unsubToken(sid, key, env);
  if (!t) return '';
  const base = env.PROXY_ORIGIN || 'https://agent-hatchers-portrait-proxy.vercel.app';
  return `${base}/api/unsubscribe?s=${encodeURIComponent(sid)}&e=${key}&t=${t}`;
}
