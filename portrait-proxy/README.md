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

## Team research (`api/prototype-team.js`, build 68, Sep 2026)

The first screen asks what the prospect's business does, plus their industry, the tools they
use and (optionally) their website. `POST /api/prototype-team` with
`{ business, industry, company, website, tools, connectors, roster:[{id,name,summary}] }` runs
two model calls (logic in `lib/team-research.js`, tests in `tests/team-research.test.js`):

1. **Research** — a brief on THAT business: who its customers are, the roles it hires for and
   what they do all day, the industry-specific software it runs on, where hours and money leak,
   compliance admin, and facts about the actual company when a website was given. The first
   attempt adds OpenRouter's web plugin (`plugins:[{id:'web'}]`, ~US$0.02/call; set
   `TEAM_WEB_SEARCH=0` to turn it off); if that fails it retries without, and if research fails
   altogether the designer still runs (flagged `researched:false`).
2. **Design** — six agents from the brief, each a named role for this business ("Recall &
   Rebooking Agent", "HICAPS Claims Agent"), pinned to the closest catalog `base` for artwork,
   category and hand-offs. Stock catalog names are rejected server-side.

Response: `{ intro, team:[{id, name, does, job, outcomes[5], mcps[3-5], scene}], researched,
brief, v:2 }`. Models: `OPENROUTER_TEAM_MODEL` (default `google/gemini-3.7-flash`) for design,
`OPENROUTER_RESEARCH_MODEL` (defaults to the team model) for research. The page keeps the stock
names if the proxy is unreachable or still returns the old v1 shape.

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

## `api/prototype-profile.js` (build 41, Sep 2026)

Turns a dashboard "Create a Profile" description into a real agent profile: `POST {name,
description, company, business, roster, connectors}` → `{summary, outcomes[5], mcps[3-6],
mates[2-3 catalog ids], team}`. Same model/escalation as `prototype-team.js`
(`OPENROUTER_PROFILE_MODEL` overrides). The client (`researchProfile` in
`prototype/app.js`) falls back to a keyword-built profile while this is undeployed.

## `api/prototype-session.js` — saved prospect sessions (build 45, Sep 2026)

Every prototype session (business, team, hatched look, marketplace portraits, created profiles,
chat turns — as small JPEG thumbnails, never the person's reference photo) is posted here and
kept in a **private Vercel Blob** store under `sessions/<sid>.json`, with a summary in
`sessions-index/`. Nothing is readable by URL: `GET ?key=<SESSIONS_KEY>` lists the summaries and
`GET ?key=…&sid=…` returns one session, both for **agenthatchers.com/prototype/sessions.html**.

Setup once: Vercel → Storage → Create **Blob** (access **Private**, tick "add a read-write
token env var") → connect it to this project (that injects `BLOB_READ_WRITE_TOKEN`), then set
`SESSIONS_KEY` to any long secret and redeploy:

```bash
cd portrait-proxy && npx vercel env add SESSIONS_KEY production && npx vercel --prod
```

### Slack ping on a finished hatch

Set `SLACK_WEBHOOK_URL` to a Slack *incoming webhook* URL and the session function posts to that
channel the first time a session reaches the dashboard, and again if they connect an instance
(once each per session — tracked in `sessions-index/`). `SESSIONS_PAGE` overrides the link.

### Opening a dashboard, deleting, and who did it (build 48)

Each card on the sessions page has a `⋯` menu: **Open dashboard** loads that prospect's saved
session into the prototype at `/prototype/?session=<sid>` (read-only review mode — nothing is
saved back, generated or counted; the sessions key comes from the browser's localStorage), and
**Delete session…** removes it. The key is shared, so the page asks for **your name** (top-left,
remembered per browser): `DELETE ?key=…&sid=…&by=<name>` is refused without one. Every delete
and every dashboard open is written to `sessions-log/<time>-<action>-<sid>.json` with the name,
IP and browser, shown under **Activity** at the bottom of the sessions page (`GET ?key=…&log=1`),
and deletes also post to the Slack webhook.

### Share links — sending a hatched dashboard to the prospect (build 62, Sep 2026)

The sessions page's `⋯` menu has **Share with the prospect…**: it `PATCH`es
`?key=…&sid=…&by=<name>&share=1`, the function mints an 18-byte random token
(`sessions-share/<token>.json → { sid }`, also stored on the session's index) and the page
copies `https://agenthatchers.com/prototype/?share=<token>` to the clipboard. That link is
**public** — no key, no prompt — and opens exactly that one saved dashboard read-only (same
guards as review mode; the bar reads "A preview hatched for <company> by Agent Hatchers").
Every open is counted on the index (`share.views`, shown on the card), logged as `view`, and
Slack-pinged at most once an hour per link. **Stop sharing** (`share=0`) deletes the token so the
link dies; sharing again mints a fresh one. Deleting a session kills its link; restoring brings it
back. A token can only ever read the session it points at — never the list, log or trash.

Deletes are soft: the two blobs move to `sessions-trash/` and `sessions-trash-index/` (with
`deletedAt`/`deletedBy`), an **Undo** toast appears on the page, and the **Trash** panel lists
what's recoverable with a Restore button (`PUT ?key=…&sid=…&by=<name>`, also logged and pinged).
Anything older than `TRASH_DAYS` (default 30) is purged the next time the trash is listed
(`GET ?key=…&trash=1`).
