// Vercel serverless function: pull a website's brand cues for the prototype.
//
// The create screen lets a prospect paste their website; the browser can't read a
// third-party site (CORS), so this function fetches it server-side and returns
//   { url, name, description, colors:[#hex…], logo:<data-uri|''>, hero:<data-uri|''> }
// The page then shows the palette/logo and hands them to prototype-portrait as
// "inspiration" so the hatched robot wears the brand's colours and motif.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);
const UA = 'Mozilla/5.0 (compatible; AgentHatchersBot/1.0; +https://agenthatchers.com)';
const HTML_LIMIT = 1_500_000;   // bytes of HTML we bother reading
const CSS_LIMIT = 400_000;      // per stylesheet
const IMG_LIMIT = 2_500_000;    // per image
const MAX_SHEETS = 4;

function applyCors(res, origin) {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

// Only public http(s) hosts — never let a prospect point us at localhost / private ranges.
function normaliseUrl(raw) {
  let s = String(raw || '').trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s.replace(/^\/+/, '');
  let u;
  try { u = new URL(s); } catch { return null; }
  const host = u.hostname.toLowerCase();
  if (!host.includes('.') || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.startsWith('[')) return null;   // IP literals
  u.hash = '';
  return u;
}

async function fetchWithTimeout(url, ms, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { redirect: 'follow', signal: ctrl.signal, ...opts,
      headers: { 'User-Agent': UA, 'Accept': opts.accept || '*/*', 'Accept-Language': 'en', ...(opts.headers || {}) } });
  } finally { clearTimeout(t); }
}

async function readText(res, limit) {
  const reader = res.body && res.body.getReader ? res.body.getReader() : null;
  if (!reader) return (await res.text()).slice(0, limit);
  const chunks = []; let size = 0;
  while (size < limit) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); size += value.length;
  }
  try { reader.cancel(); } catch {}
  return Buffer.concat(chunks).toString('utf8').slice(0, limit);
}

const decode = s => String(s || '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();

// Read every <meta>/<link> into a flat list of attribute maps (regex, no deps).
function tags(html, name) {
  const out = [];
  const re = new RegExp(`<${name}\\b([^>]*)>`, 'gi');
  let m;
  while ((m = re.exec(html))) {
    const attrs = {};
    const ar = /([a-zA-Z_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let a;
    while ((a = ar.exec(m[1]))) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
    out.push(attrs);
  }
  return out;
}

// ---------- colours ----------
function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map(c => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}
// A "brand" colour is something you'd paint a robot in: not white, not black, not grey.
function isBrandy(rgb) {
  const [, s, l] = hsl(rgb);
  return l > 0.13 && l < 0.9 && s > 0.22;
}
const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

function collectColours(text, bucket, weight = 1) {
  let m;
  const hexRe = /#([0-9a-fA-F]{3,8})\b/g;
  while ((m = hexRe.exec(text))) {
    const rgb = hexToRgb(m[1]);
    if (rgb) bucket.push([rgb, weight]);
  }
  const rgbRe = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;
  while ((m = rgbRe.exec(text))) bucket.push([[+m[1], +m[2], +m[3]], weight]);
}

function rankColours(bucket, preferred = []) {
  const groups = [];  // {rgb, score}
  const add = (rgb, w) => {
    if (!isBrandy(rgb)) return;
    const g = groups.find(x => dist(x.rgb, rgb) < 42);
    if (g) { g.score += w; } else groups.push({ rgb, score: w });
  };
  preferred.forEach(rgb => rgb && add(rgb, 1000));
  bucket.forEach(([rgb, w]) => add(rgb, w));
  return groups.sort((a, b) => b.score - a.score).slice(0, 5).map(g => toHex(g.rgb));
}

// ---------- images ----------
async function fetchImageDataUri(url, base) {
  if (!url) return '';
  let abs;
  try { abs = new URL(url, base).href; } catch { return ''; }
  if (!/^https?:/i.test(abs)) return '';
  if (/\.(svg|ico)(\?|#|$)/i.test(abs)) return '';   // image models want raster input
  try {
    const res = await fetchWithTimeout(abs, 6000, { accept: 'image/*' });
    if (!res.ok) return '';
    const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!/^image\/(png|jpeg|jpg|webp|gif)$/.test(type)) return '';
    const len = +res.headers.get('content-length') || 0;
    if (len > IMG_LIMIT) return '';
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > IMG_LIMIT || buf.length < 200) return '';
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch { return ''; }
}

export default async function handler(req, res) {
  applyCors(res, req.headers.origin || '');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const target = normaliseUrl(body.url);
  if (!target) { res.status(400).json({ error: 'Please enter a public website address, e.g. tanssu.com' }); return; }

  let html = '', finalUrl = target.href;
  try {
    const page = await fetchWithTimeout(target.href, 9000, { accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5' });
    finalUrl = page.url || finalUrl;
    if (!page.ok) { res.status(502).json({ error: `That site answered ${page.status}` }); return; }
    html = await readText(page, HTML_LIMIT);
  } catch (e) {
    res.status(502).json({ error: 'We couldn’t reach that website' });
    return;
  }

  const metas = tags(html, 'meta');
  const links = tags(html, 'link');
  const meta = (key) => {
    const hit = metas.find(m => (m.property || m.name || '').toLowerCase() === key);
    return hit ? hit.content || '' : '';
  };
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decode(titleMatch ? titleMatch[1] : '').replace(/\s+/g, ' ');
  let name = meta('og:site_name') || meta('application-name') || title.split(/\s[|–—:·-]\s/)[0] || target.hostname.replace(/^www\./, '');
  name = name.slice(0, 60);
  const description = (meta('description') || meta('og:description') || '').slice(0, 240);

  // Logo candidates, best first: explicit logo <img>, apple-touch-icon, large png icons, og:image.
  const imgs = tags(html, 'img');
  const logoImg = imgs.find(i => /logo/i.test(`${i.src || ''} ${i.alt || ''} ${i.class || ''} ${i.id || ''}`) && i.src && !/\.svg(\?|$)/i.test(i.src))
    || imgs.find(i => /logo/i.test(`${i.src || ''} ${i.alt || ''} ${i.class || ''} ${i.id || ''}`) && (i['data-src'] || i.srcset));
  const logoSrc = logoImg ? (logoImg.src || logoImg['data-src'] || (logoImg.srcset || '').split(',')[0].trim().split(/\s+/)[0]) : '';
  const icons = links.filter(l => /icon/i.test(l.rel || '') && l.href);
  const touch = icons.find(l => /apple-touch/i.test(l.rel));
  const bigIcon = icons
    .filter(l => /png|webp|jpe?g/i.test(l.type || l.href))
    .sort((a, b) => (parseInt((b.sizes || '0').split('x')[0], 10) || 0) - (parseInt((a.sizes || '0').split('x')[0], 10) || 0))[0];
  const heroSrc = meta('og:image') || meta('twitter:image') || '';

  const [logoA, logoB, logoC, hero] = await Promise.all([
    fetchImageDataUri(logoSrc, finalUrl),
    fetchImageDataUri(touch && touch.href, finalUrl),
    fetchImageDataUri(bigIcon && bigIcon.href, finalUrl),
    fetchImageDataUri(heroSrc, finalUrl)
  ]);
  // Icons first: an <img> matching "logo" is often a customer/partner logo on the page,
  // whereas the touch icon is reliably the site's own mark (and carries its colour).
  const logo = logoB || logoC || logoA || '';

  // Colours: theme-color first, then every colour literal in the HTML + first few stylesheets.
  const bucket = [];
  collectColours(html, bucket, 1);
  const sheets = links.filter(l => /stylesheet/i.test(l.rel || '') && l.href).slice(0, MAX_SHEETS);
  await Promise.all(sheets.map(async l => {
    try {
      const abs = new URL(l.href, finalUrl).href;
      const r = await fetchWithTimeout(abs, 5000, { accept: 'text/css,*/*;q=0.1' });
      if (r.ok) collectColours(await readText(r, CSS_LIMIT), bucket, 1);
    } catch {}
  }));
  const themeColor = hexToRgb((meta('theme-color').match(/#[0-9a-fA-F]{3,8}/) || [''])[0] || '');
  const colors = rankColours(bucket, [themeColor]);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ url: finalUrl, name, description, colors, logo, hero: hero && hero !== logo ? hero : '' });
}
