// Vercel serverless proxy for Agent Hatchers prototype avatars.
//
// The prospect prototype pages (static, on agenthatchers.com) POST a brief here;
// this function calls OpenRouter's image API and returns { image: <data-uri> }.
// The OpenRouter key lives ONLY in this function's environment variable and never
// reaches the browser. See README.md for deploy + env setup.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://agenthatchers.com,https://www.agenthatchers.com,http://localhost:8799')
  .split(',').map(s => s.trim()).filter(Boolean);
// Default: Nano Banana 2 (higher quality). Override with OPENROUTER_MODEL — e.g.
// google/gemini-3.1-flash-lite-image for cheaper/faster but rougher output. Note: text
// models like google/gemini-3.7-flash do NOT generate images and will not work here.
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-3.1-flash-image';
// NOTE: an earlier version forced three fixed palettes (blue / teal / indigo) here, which
// made every run produce the same-coloured trio of robots. Colours now follow the brief;
// when the brief names none, the model may choose freely — so designs genuinely vary.

function applyCors(res, origin) {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

// OpenRouter's image endpoint returns data[0].b64_json; some models route through
// the chat shape (choices[0].message.images). Handle both so a model swap can't break us.
function extractImage(data) {
  const d = data && data.data && data.data[0];
  if (d) {
    const b64 = d.b64_json || d.b64Json;
    if (b64) return `data:${d.media_type || d.mediaType || 'image/png'};base64,${b64}`;
    if (d.url) return d.url;
  }
  const msg = data && data.choices && data.choices[0] && data.choices[0].message;
  const img = msg && msg.images && msg.images[0];
  const url = img && ((img.image_url && img.image_url.url) || img.url);
  if (url) return url;
  return null;
}

export default async function handler(req, res) {
  applyCors(res, req.headers.origin || '');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const brief = String(body.brief || '').slice(0, 600).trim();
  const name = String(body.name || 'Agent').slice(0, 60);
  const role = String(body.role || '').slice(0, 200).trim();
  const variant = Math.max(0, Math.min(2, parseInt(body.variant, 10) || 0));
  // A reference image turns this into an EDIT: keep the same character, re-dress + re-scene it.
  const ref = typeof body.image === 'string' && /^data:image\//.test(body.image) ? body.image : '';
  if (!ref && brief.length < 8) { res.status(400).json({ error: 'brief too short' }); return; }

  const prompt = ref
    ? `This is one specific robot mascot character. Keep it EXACTLY the same character as the ` +
      `reference image — identical body shape, proportions, colours, materials, markings and face. ` +
      `Do not restyle, recolour or redesign it. ${role ? `${role} ` : ''}` +
      `Re-dress the very same character for that job with one or two fitting accessories and clear ` +
      `props/tools, and place it in a real setting that fits the work (a proper background scene). ` +
      `Polished, high-quality, sharp 3D cartoon render, the same character throughout, no text, no watermark.`
    : `${brief}. A friendly 3D cartoon robot mascot character named "${name}". ` +
      `${role ? `${role} ` : ''}` +
      `Give it one or two fitting accessories and one or two clear props that show what it does. ` +
      `Plain solid white background, soft even studio lighting, the character centred and full-body. ` +
      `Use the colours the description asks for; if it names none, choose an appealing scheme of your ` +
      `own — avoid defaulting to blue. Make this a distinctive, original character design. Polished, ` +
      `high-quality, sharp 3D cartoon mascot render, crisp clean edges, no text, no watermark, no clutter.`;

  const upstreamUrl = ref
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/images';
  const payload = ref
    ? { model: MODEL, modalities: ['image', 'text'], messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: ref } },
        { type: 'text', text: prompt }
      ] }] }
    : { model: MODEL, prompt, n: 1, aspect_ratio: '1:1', quality: 'high', output_format: 'png' };

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agenthatchers.com',
        'X-Title': 'Agent Hatchers Prototype'
      },
      body: JSON.stringify(payload)
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const msg = (data && (data.error?.message || data.error)) || `Provider error ${upstream.status}`;
      res.status(502).json({ error: String(msg) });
      return;
    }
    const image = extractImage(data);
    if (!image) { res.status(502).json({ error: 'No image returned' }); return; }
    res.status(200).json({ image });
  } catch (e) {
    res.status(502).json({ error: 'Upstream request failed' });
  }
}
