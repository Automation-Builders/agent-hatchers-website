// The mailing list: every prospect who leaves their details becomes a Resend Contact, so Noah
// can email everyone from Resend → Broadcasts instead of by hand. Resend contacts are global
// (one per address across the team); RESEND_SEGMENT_ID, if set, also files new ones into
// that segment, which is what a Broadcast is sent to. Unsubscribes go both ways: our link
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
const reasonOf = r => `Resend ${r.status}: ${String(r.data.message || r.data.name || '').slice(0, 100)}`;

// Is this address unsubscribed in Resend? null when unknown (no key, no contact, error).
export async function contactUnsubscribed(email, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.RESEND_API_KEY) return null;
  try { const r = await call(fetchImpl, env, 'GET', '/' + encodeURIComponent(email)); return r.ok ? !!r.data.unsubscribed : null; } catch { return null; }
}

// Add or update the contact. Never throws; { ok, reason }.
export async function upsertContact({ email, you, company }, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.RESEND_API_KEY) return { ok: false, reason: 'no RESEND_API_KEY' };
  const names = split(you);
  try {
    const created = await call(fetchImpl, env, 'POST', '', { email, ...names, ...(env.RESEND_SEGMENT_ID ? { segments: [{ id: env.RESEND_SEGMENT_ID }] } : {}) });
    let res = created;
    if (!created.ok && created.status !== 401 && created.status !== 403) {
      // most likely already a contact: refresh the name instead (never touches unsubscribed)
      res = await call(fetchImpl, env, 'PATCH', '/' + encodeURIComponent(email), names);
    }
    if (!res.ok) return { ok: false, reason: reasonOf(res) };
    // Company as a contact property — only sticks if the "company" property exists in Resend.
    if (company) { try { await call(fetchImpl, env, 'PATCH', '/' + encodeURIComponent(email), { properties: { company: String(company).slice(0, 80) } }); } catch { /* optional */ } }
    return { ok: true, reason: '' };
  } catch (e) { return { ok: false, reason: 'Resend unreachable: ' + (e && e.message) }; }
}

export async function markUnsubscribed(email, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.RESEND_API_KEY || !email) return { ok: false };
  try { const r = await call(fetchImpl, env, 'PATCH', '/' + encodeURIComponent(email), { unsubscribed: true }); return { ok: r.ok, reason: r.ok ? '' : reasonOf(r) }; } catch (e) { return { ok: false, reason: String(e && e.message) }; }
}
