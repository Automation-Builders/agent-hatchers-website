// "Here's your agent" — the email a prospect gets when they leave their details on the
// prototype's hatch screen. It carries their public share link (/prototype/?share=<token>),
// which always shows the latest saved snapshot, so it works even though it is sent mid-hatch.
//
// Sent through Resend (https://resend.com) with a plain fetch — no SDK.
//   RESEND_API_KEY  required; without it nothing is sent (the Slack ping says so)
//   EMAIL_FROM      default "Agent Hatchers <hello@agenthatchers.com>" — the domain must be
//                   verified in Resend
//   EMAIL_REPLY_TO  default noah@agenthatchers.com, so a reply reaches a person
import { createHash } from 'node:crypto';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const emailKey = email => createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex').slice(0, 32);

// Spam Act 2003: the email promotes a call, so it identifies the sender and carries a working
// opt-out — a one-click unsubscribe link (lib/unsubscribe.js) plus List-Unsubscribe headers so
// Gmail/Apple Mail show their own Unsubscribe button. A reply saying "unsubscribe" still
// reaches Noah as a fallback.
export const SENDER = 'Agent Hatchers Pty Ltd (ACN 690 308 242), Level 1, 184 Clarendon Street, South Melbourne VIC 3205';
const WHY = "You're getting this because you asked us to send your agent from agenthatchers.com.";

export function buildAgentEmail({ you, company, agentName, url, unsub = '', bookUrl = 'https://calendly.com/noah-agenthatchers/30min' }) {
  const first = String(you || '').trim().split(/\s+/)[0] || '';
  const agent = String(agentName || '').trim() || 'your agent';
  const co = String(company || '').trim();
  const subject = `${agent} is ready${co ? ` for ${co}` : ''}`;
  const text = [
    `Hi${first ? ` ${first}` : ''},`,
    '',
    `Here's ${agent}${co ? `, ${co}'s AI agent` : ''}, and the team we put together for you:`,
    url,
    '',
    'The link opens your agent any time, on any device. Forward it to anyone you like.',
    '',
    `When you want ${agent} working for real, book a 30-minute call and we'll set it up with you:`,
    bookUrl,
    '',
    'Noah',
    'Agent Hatchers',
    '',
    `${WHY} Don't want to hear from us again? ${unsub ? `Unsubscribe: ${unsub}` : 'Reply "unsubscribe" and we won\'t email you again.'}`,
    `${SENDER}.`
  ].join('\n');
  const btn = (href, label, primary) => `<a href="${esc(href)}" style="display:inline-block;padding:13px 24px;border-radius:999px;font:600 15px/1 Arial,Helvetica,sans-serif;text-decoration:none;${primary ? 'background:#216bac;color:#ffffff' : 'background:#eef4f8;color:#16150f'}">${esc(label)}</a>`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f1ea">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px">
<tr><td style="padding:32px 32px 8px;font:700 13px/1 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#216bac">Agent Hatchers</td></tr>
<tr><td style="padding:8px 32px 0;font:700 26px/1.2 Arial,Helvetica,sans-serif;color:#16150f">${esc(agent)} has hatched${first ? `, ${esc(first)}` : ''}</td></tr>
<tr><td style="padding:14px 32px 0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#4a4a44">Here’s ${esc(agent)}${co ? `, ${esc(co)}’s AI agent,` : ''} and the team we put together for you. The link opens it any time, on any device, so keep it or forward it to anyone you like.</td></tr>
<tr><td style="padding:24px 32px 0">${btn(url, `Open ${agent}`, true)}</td></tr>
<tr><td style="padding:28px 32px 0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#4a4a44">When you want ${esc(agent)} working for real, book a 30-minute call and we’ll set it up with you.</td></tr>
<tr><td style="padding:16px 32px 0">${btn(bookUrl, 'Book a call', false)}</td></tr>
<tr><td style="padding:28px 32px 32px;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:#16150f">Noah<br><span style="color:#8a8a80">Agent Hatchers</span></td></tr>
</table>
<p style="max-width:520px;margin:16px auto 0;font:400 12px/1.5 Arial,Helvetica,sans-serif;color:#8a8a80">${esc(WHY)} Don’t want to hear from us again? ${unsub ? `<a href="${esc(unsub)}" style="color:#8a8a80">Unsubscribe</a>.` : 'Reply “unsubscribe” and we won’t email you again.'}<br>${esc(SENDER)}. <a href="https://agenthatchers.com/privacy-policy.html" style="color:#8a8a80">Privacy Policy</a></p>
</td></tr></table></body></html>`;
  return { subject, html, text };
}

// Returns { sent:true, id } or { sent:false, reason } — never throws.
export async function sendAgentEmail(to, details, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.RESEND_API_KEY) return { sent: false, reason: 'no RESEND_API_KEY' };
  if (!EMAIL_RE.test(String(to || ''))) return { sent: false, reason: 'bad address' };
  const { subject, html, text } = buildAgentEmail(details);
  // RFC 8058 one-click: mail apps POST "List-Unsubscribe=One-Click" to the same URL.
  const headers = details.unsub ? { 'List-Unsubscribe': `<${details.unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : undefined;
  try {
    const r = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'Agent Hatchers <hello@agenthatchers.com>',
        to: [to], reply_to: env.EMAIL_REPLY_TO || 'noah@agenthatchers.com',
        subject, html, text, ...(headers ? { headers } : {})
      })
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) return { sent: false, reason: `Resend ${r.status}: ${String(body.message || body.name || '').slice(0, 120)}` };
    return { sent: true, id: body.id || '' };
  } catch (e) { return { sent: false, reason: 'Resend unreachable: ' + (e && e.message) }; }
}
