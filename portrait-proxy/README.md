# Agent Hatchers — portrait proxy

A tiny Vercel serverless function that generates the prototype's agent avatars.

```
prospect page (agenthatchers.com/prototype/<company>/)
   │  POST { brief, name, role, company, industry, variant }
   ▼
this function  ──►  OpenRouter  https://openrouter.ai/api/v1/images
   ▲                            (key read from OPENROUTER_API_KEY env var)
   │  { image: "data:image/png;base64,…" }
```

**Why this exists:** a public static page can't hold an API key without leaking it. The key
lives only in this function's environment on Vercel and never reaches the browser.

## Deploy (Vercel CLI)

```bash
cd portrait-proxy
npx vercel            # first run links/creates the project (answer the prompts)
npx vercel --prod     # production deploy → gives you the live URL
```

Or import the repo in the Vercel dashboard and set **Root Directory** to `portrait-proxy`.

## Set the environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Required | Value |
|---|---|---|
| `OPENROUTER_API_KEY` | **yes** | your OpenRouter key — paste it here, never in code |
| `OPENROUTER_MODEL` | no | image model slug (default `google/gemini-3.1-flash-lite-image`, "Nano Banana 2 Lite" — cheapest/fastest). Use `google/gemini-3.1-flash-image` for higher quality. Must be an **image-output** model — text models like `google/gemini-3.7-flash` will not work. |
| `ALLOWED_ORIGINS` | no | comma-separated origins allowed to call it (default includes `agenthatchers.com` + localhost) |

After adding/changing env vars, redeploy (`npx vercel --prod`) so they take effect.

## Point the prototype at it

Your deploy gives a URL like `https://agent-hatchers-portrait-proxy.vercel.app`. In each
prospect page's `window.PROTOTYPE_CONFIG`, set:

```js
portraitEndpoint: "https://<your-vercel-url>/api/prototype-portrait"
```

(or map a custom domain such as `api.agenthatchers.com` in Vercel → Domains and use that).
The prototype already falls back to simulated mascots if the call fails, so nothing breaks
during setup.

## Test it

```bash
curl -X POST "https://<your-vercel-url>/api/prototype-portrait" \
  -H "Content-Type: application/json" \
  -d '{"brief":"a friendly rounded robot in blue and white","name":"Scout","role":"qualify leads","variant":0}'
```

A working response is `{ "image": "data:image/png;base64,…" }`.

## Website brand lookup (`api/prototype-brand.js`)

The create screen lets a prospect paste their website. The browser can't read a third-party
site, so `POST /api/prototype-brand` with `{ "url": "tanssu.com" }` fetches it server-side
and returns `{ url, name, description, colors:["#hex",…], logo:<data-uri>, hero:<data-uri> }`
— theme-colour + CSS colour literals ranked (greys/white/black dropped), the logo image and
the `og:image`. The page shows them as a brand card and sends them to `prototype-portrait`
as `inspiration:{ photo, brand:{ name, colors, logo, hero } }`, which switches the prompt into
"design a new robot in this brand's colours / like this person" mode (distinct from `image`,
which re-dresses an existing character). No API key is needed for the lookup itself.

## Cost & abuse notes

- Each call costs one OpenRouter image generation; a full hatch generates **3**.
- CORS is restricted to `ALLOWED_ORIGINS`, which stops other websites' browsers from calling
  it, but not raw `curl`. Since the prototype URLs are unlisted and low-traffic this is usually
  fine; if you ever see abuse, add Vercel rate limiting / a WAF rule, or set a spend cap on the
  OpenRouter key.
