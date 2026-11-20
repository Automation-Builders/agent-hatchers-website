// Fetch a URL only if it, and every redirect it takes, is on the public internet.
//
// prototype-brand.js fetches whatever website a visitor types. Checking the hostname text is
// not enough: a name like 127.0.0.1.nip.io resolves to a loopback address, and a public site
// can redirect to a private one. So every hop is resolved with DNS and refused when any of its
// addresses is private, loopback, link-local or otherwise not public, and redirects are
// followed by hand (at most MAX_HOPS) so each new address is checked the same way.
// Left open: DNS rebinding between our lookup and fetch's own lookup. Closing it needs a
// custom socket lookup; the function has no internal services worth that, so this is accepted.
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_HOPS = 4;

function v4Private(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||          // carrier-grade NAT
    (a === 169 && b === 254) ||                    // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && p[2] === 0) ||
    (a === 198 && (b === 18 || b === 19));         // benchmarking
}
export function isPrivateAddress(ip) {
  const s = String(ip || '').toLowerCase().replace(/^\[|\]$/g, '').split('%')[0];
  const kind = isIP(s);
  if (kind === 4) return v4Private(s);
  if (kind !== 6) return true;
  const mapped = /^(?:0*:)*:?ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(s) || /^::(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (mapped) return v4Private(mapped[1]);
  const hexMapped = /^(?:0*:)*:?ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(s);   // how URL() writes ::ffff:127.0.0.1
  if (hexMapped) {
    const hi = parseInt(hexMapped[1], 16), lo = parseInt(hexMapped[2], 16);
    return v4Private(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  if (s === '::' || s === '::1') return true;
  const first = parseInt(s.split(':')[0] || '0', 16);
  return (first & 0xfe00) === 0xfc00 ||           // fc00::/7 unique local
    (first & 0xffc0) === 0xfe80 ||                 // fe80::/10 link-local
    (first & 0xff00) === 0xff00 ||                 // multicast
    s.startsWith('64:ff9b:') ||                    // NAT64 can reach IPv4 private ranges
    s.startsWith('2001:db8:');
}

// Throws unless `u` is http(s) on a public host whose every DNS answer is public.
export async function assertPublic(u, resolve = lookup) {
  if (!/^https?:$/.test(u.protocol)) throw new Error('not http');
  if (u.username || u.password) throw new Error('credentials in url');
  const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('private host');
  if (isIP(host)) { if (isPrivateAddress(host)) throw new Error('private address'); return; }
  const answers = await resolve(host, { all: true, verbatim: true });
  if (!answers || !answers.length) throw new Error('no address');
  if (answers.some(a => isPrivateAddress(a.address))) throw new Error('private address');
}

// fetch() with every hop checked. Returns the final Response; `res.url` is set to the last hop.
export async function fetchPublic(url, init = {}, { resolve = lookup, fetchImpl = fetch } = {}) {
  let current = new URL(url);
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    await assertPublic(current, resolve);
    const res = await fetchImpl(current.href, { ...init, redirect: 'manual' });
    const loc = res.status >= 300 && res.status < 400 ? res.headers.get('location') : null;
    if (!loc) {
      try { Object.defineProperty(res, 'url', { value: current.href }); } catch { /* keep fetch's own */ }
      return res;
    }
    try { res.body && res.body.cancel && res.body.cancel(); } catch { /* nothing to drain */ }
    current = new URL(loc, current);
  }
  throw new Error('too many redirects');
}
