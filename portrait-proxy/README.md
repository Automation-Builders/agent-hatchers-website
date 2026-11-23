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

## Free limits and cost (`lib/guard.js`, build 87, Nov 2026)

Every endpoint is public and the repo is public, so CORS is not protection: it only tells
browsers which sites may read the answer, and `curl` ignores it. The limits are enforced here.
Every endpoint calls `guard(req, res, '<class>')` from `lib/guard.js` before it spends anything
(OpenRouter, Resend, Slack or Blob). Past a limit, the call gets **429** with a message the page
shows, and nothing upstream is called.

- **Who is counted:** the caller's IP as Vercel reports it (IPv6 by /64), and the page's random
  visitor id (`x-ah-visitor`, from localStorage). Both are counted and either one over its limit
  refuses. A script can change the visitor id but not its IP, so the IP limit is the one that
  holds. A call with no visitor id gets the visitor limit per IP. When the playground verifies
  emails, `subjectOf()` should return a hash of the verified email instead.
- **A day** runs midnight to midnight Australian Eastern Standard Time (UTC+10), so limits reset
  overnight for our prospects (00:00 AEST, 01:00 during daylight saving).
- **Spend caps:** each paid call has an estimated cost (`cents` in `DEFAULT_LIMITS`). One IP may
  spend `IP_SPEND_CAP_CENTS` a day (default 1500 = US$15, one visitor who uses every free hatch,
  edit, profile and chat). All visitors together may spend `DAILY_SPEND_CAP_CENTS` a day (default
  5000 = US$50). Past that, free use pauses until midnight and Slack is told at 80% and 100%.
  Calls refused by their own limits are not added. It takes four or more addresses at full use to
  pause the day. The spending cap on the OpenRouter key is the hard backstop above all of this.
- **Cost per hatch:** one hatch is up to ~29 image calls (3 designs, then the marketplace and the six
  other profiles are re-dressed in the chosen look). A kept look edit redraws the marketplace again.
  The portrait limits are sized for a visitor who uses all three hatches and all three edits.
- **Team demos:** the sessions page's **Demo mode** button mints a signed pass
  (`GET prototype-session?key=…&by=<name>&pass=1[&hours=12]`, logged) and stores it in that
  browser: 30 days on a team member's own computer, 12 hours on someone else's. The page sends it
  as `x-ah-pass`, also on session saves and the trial handoff, so office demos and email tests
  aren't held by the per-IP limits. A valid pass skips every limit and the daily cap. Passes are
  signed with `STAFF_PASS_SECRET` only. Without it no pass works and everyone, team included, has
  the visitor limits. Rotating it revokes every pass. The old `?unlimited=1` switch is gone.
- **Held, not lost:** a prospect email or Slack ping held back by its per-IP limit is not marked
  done, so the next save of that session (from another connection, or the next day) sends it.
- **Website lookup:** `lib/public-url.js` resolves every hop (up to 8 redirects) and refuses
  private, loopback and link-local addresses, including ones that carry an IPv4 address inside
  IPv6 (`127.0.0.1.nip.io` is refused).
- **Counter store:** the limits are exact only with Upstash connected. With no store yet, or if
  it fails at run time, counting falls back to each function instance's memory and Slack is told.
  The playground keeps working, and a plain script hammering the endpoints is still stopped, but
  parallel or spread-out calls can get past. Until Upstash is connected, the OpenRouter key's
  spending cap is what bounds the money.

**Website previews.** CORS also allows the website's own Vercel previews
(`agent-hatchers-website-…-agenthatchers.vercel.app`), so a page change can be tried with the real
AI before it merges. Those calls are counted and limited like any other. `ALLOWED_ORIGIN_PATTERN`
overrides the pattern (`none` turns it off).

**Rollout order.** Build 87 of the page sends `x-ah-visitor`, which a proxy older than this one
refuses in its CORS preflight. The page then retries with the plain header (counted per IP), so a
mid-deploy or rolled-back proxy only costs a second request. Still, ship the proxy first and the
page second, and don't roll the proxy back past this change while the page is on build 87 without
knowing that.

Default limits per day (session saves: per hour):

| Class | Endpoint | Per visitor | Per IP |
|---|---|---|---|
| `portrait` | prototype-portrait | 180 | 200 |
| `team` | prototype-team | 10 | 30 |
| `profile` | prototype-profile | 6 | 15 |
| `chat` | prototype-chat | 150 | 300 |
| `brand` | prototype-brand | 10 | 30 |
| `session` | prototype-session POST | — | 1200 an hour |
| `ping` / `mail` | Slack pings / prospect emails and list adds from session saves | — | 30 / 10 |
| `lead` | lead | — | 5 |
| `handoff` | playground-handoff (page side) | — | 20 |

| Name | Required | Value |
|---|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | strongly recommended | Upstash Redis REST credentials. Connect Upstash from Vercel → Storage / Marketplace to this project (Production and Preview) and these are injected (`UPSTASH_REDIS_REST_URL` / `_TOKEN` also work). |
| `STAFF_PASS_SECRET` | for demo mode | 32+ random characters. Signs demo passes. Rotate it to revoke them all. |
| `DAILY_SPEND_CAP_CENTS` | no | estimated US cents per day across all visitors (default 5000) |
| `IP_SPEND_CAP_CENTS` | no | estimated US cents per day per IP (default 1500) |
| `RATE_LIMITS` | no | JSON override, e.g. `{"portrait":{"visitor":120,"ip":150}}` |

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

## `api/playground-handoff.js` — playground to sign-up (Nov 2026)

"Start 30-day free trial" in the prototype hands the hatched agent to sign-up on
agenthatchers.ai. The page saves the session, then `POST {sid}` here returns
`{ ok, url, expiresAt }`, with `url` = `https://agenthatchers.ai/register?v=4&setup=<token>`.
A cleaned copy of the session (setup snapshot v1, `lib/handoff.js`) is frozen at
`handoffs/<token>.json` in the private Blob store.

The dashboard server claims it once: `POST {token}` with header `x-handoff-key: <HANDOFF_SECRET>`
returns `{ ok, snapshot }`. A second claim is `410 used`, an old link `410 expired`. The claim
drops the snapshot from the store.

The snapshot holds the company (name, business, industry, website, tools), the main agent
(name, look prompt, chosen image as a JPEG data URI, brand colours) and the researched team as a
recommended list. It never holds the email, the visitor's name, chats, profiles or photos: the
dashboard account's verified email is the owner.

| Name | Required | Value |
|---|---|---|
| `HANDOFF_SECRET` | **yes** | 32+ random characters, the same value as `PLAYGROUND_HANDOFF_SECRET` on the dashboard server |
| `HANDOFF_TTL_HOURS` | no | how long an unclaimed link works (default 24, max 72) |
| `DASHBOARD_SIGNUP_URL` | no | default `https://agenthatchers.ai/register?v=4` |

Without `HANDOFF_SECRET` the endpoint answers 503 and the page offers sign-up without the setup.
