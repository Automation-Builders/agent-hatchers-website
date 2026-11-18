// The mailing list: every prospect who leaves their details becomes a Resend Contact, so Noah
// can email everyone from Resend → Broadcasts instead of by hand. Resend contacts are global
// (one per address across the team) and each is filed into a named segment — the group a
// Broadcast goes to: "Prototype leads" (the demo) or "Booked a call" (the booking form).
// The segments are created on first use, so there's nothing to set up in Resend. Unsubscribes go both ways: our link
// marks the contact unsubscribed here, and a contact unsubscribed in Resend (e.g. from a
// Broadcast) is never sent the agent email.
// The API key needs Full access in Resend — a "Sending access" key can't touch contacts.
const API = 'https://api.resend.com/contacts';
const split = name => { const p = String(name || '').trim().split(/\s+/).filter(Boolean); return { first_name: p[0] || '', last_name: p.slice(1).join(' ') }; };
async function call(fetchImpl, env, method, path, body) {
  const r = await fetchImpl(API + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}
export const SEGMENTS = { prototype: 'Prototype leads', booking: 'Booked a call' };
const segmentIds = new Map();   // name → id, per warm function instance
async function segmentId(fetchImpl, env, name) {
  if (segmentIds.has(name)) return segmentIds.get(name);
  const r = await fetchImpl('https://api.resend.com/segments', { headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` } });
  const list = await r.json().catch(() => ({}));
  let found = r.ok && Array.isArray(list.data) ? list.data.find(x => x.name === name) : null;
  if (!found) {
    const c = await fetchImpl('https://api.resend.com/segments', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` }, body: JSON.stringify({ name }) });
    const made = await c.json().catch(() => ({}));
    if (!c.ok || !made.id) throw new Error(`segment ${c.status}`);
    found = made;
  }
  segmentIds.set(name, found.id);
  return found.id;
}
const reasonOf = r => `Resend ${r.status}: ${String(r.data.message || r.data.name || '').slice(0, 100)}`;

// Is this address unsubscribed in Resend? null when unknown (no key, no contact, error).
export async function contactUnsubscribed(email, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.RESEND_API_KEY) return null;
  try { const r = await call(fetchImpl, env, 'GET', '/' + encodeURIComponent(email)); return r.ok ? !!r.data.unsubscribed : null; } catch { return null; }
}

// Add or update the contact. Never throws; { ok, reason }.
export async function upsertContact({ email, you, company, segment = SEGMENTS.prototype }, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.RESEND_API_KEY) return { ok: false, reason: 'no RESEND_API_KEY' };
  const names = split(you);
  try {
    const created = await call(fetchImpl, env, 'POST', '', { email, ...names });
    let res = created;
    if (!created.ok && created.status !== 401 && created.status !== 403) {
      // most likely already a contact: refresh the name instead (never touches unsubscribed)
      res = await call(fetchImpl, env, 'PATCH', '/' + encodeURIComponent(email), names);
    }
    if (!res.ok) return { ok: false, reason: reasonOf(res) };
    // into its segment — new and existing contacts alike; a contact can sit in several
    if (segment) {
      try {
        const id = await segmentId(fetchImpl, env, segment);
        const a = await call(fetchImpl, env, 'POST', `/${encodeURIComponent(email)}/segments/${id}`);
        if (!a.ok) return { ok: true, reason: `listed, but not filed under "${segment}" (${reasonOf(a)})` };
      } catch (e) { return { ok: true, reason: `listed, but not filed under "${segment}" (${e && e.message})` }; }
    }
    // Company as a contact property — only sticks if the "company" property exists in Resend.
    if (company) { try { await call(fetchImpl, env, 'PATCH', '/' + encodeURIComponent(email), { properties: { company: String(company).slice(0, 80) } }); } catch { /* optional */ } }
    return { ok: true, reason: '' };
  } catch (e) { return { ok: false, reason: 'Resend unreachable: ' + (e && e.message) }; }
}

export async function markUnsubscribed(email, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.RESEND_API_KEY || !email) return { ok: false };
  try { const r = await call(fetchImpl, env, 'PATCH', '/' + encodeURIComponent(email), { unsubscribed: true }); return { ok: r.ok, reason: r.ok ? '' : reasonOf(r) }; } catch (e) { return { ok: false, reason: String(e && e.message) }; }
}
