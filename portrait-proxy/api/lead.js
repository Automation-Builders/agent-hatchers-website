// Booking-form leads → the mailing list. The homepage and pricing "Book a call" forms send
// { name, email, source } here (alongside the n8n webhook they already post to), and the
// person becomes a Resend Contact in the "Booked a call" segment. Unsubscribes are honoured
// by Resend itself: an unsubscribed contact stays unsubscribed (upsert never touches it).
import { upsertContact, SEGMENTS } from '../lib/resend-contacts.js';
import { EMAIL_RE } from '../lib/agent-email.js';

const ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://agenthatchers.com,https://www.agenthatchers.com').split(',').map(s => s.trim());
const clean = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED.includes(origin) ? origin : ALLOWED[0]);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const email = clean(body && body.email, 120).toLowerCase();
  if (!EMAIL_RE.test(email)) { res.status(400).json({ error: 'Bad email' }); return; }
  const r = await upsertContact({ email, you: clean(body.name, 60), segment: SEGMENTS.booking });
  res.status(r.ok ? 200 : 502).json({ ok: r.ok });
}
