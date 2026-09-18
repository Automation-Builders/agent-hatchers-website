# Prospect prototype pages

Each prospect receives an unlisted GitHub Pages route at `/prototype/<company-slug>/`.

## The flow

Every page runs the same hatching experience (shared code in `app.js` / `styles.css`):

1. **What can our agents do for you?** — one box: the prospect types what their business
   does (or taps an example). Written for people who have never used an AI agent.
2. **Your team** — the five/six agents that fit that business, one plain-English line each,
   and a "how they work together" hand-off chain. Ends with "Ready to hatch your first agent?".
3. **Create a profile** — company, agent name, type of company (prefilled) and the look.
4. **Hatch** — three eggs hatch into three different designs; click one to pick it.
5. **Dashboard** — a mimic of the product's Profiles board, Chats, Analytics, Config,
   Marketplace and Merch, all populated with the hatched character.
6. **Connect** — the Slack/Teams connection dialog.

The team is **researched, not picked from a list** (build 69): the proxy's `prototype-team`
function researches the business first (roles, systems, where the hours go — with a web search
when it can, and the prospect's website when they give one on screen 1) and designs six named
roles for it ("Recall & Rebooking Agent", not "Support Agent"), each pinned to a catalog base.
`app.js` overlays those names, one-liners, outcomes, tools and portrait scenes on the catalog
entries via `agentById()` so Profiles, Chats, Marketplace, the agent modal and hand-offs all show
them. While it thinks (~20s, behind the create screen) a small console-style card
(`researchPopStart` in `app.js`, `.rs-pop` in the CSS) cycles through status lines the way a
coding agent does — mostly silly ("Caramelising onions…"), every third one true ("Reading
tanssu.com…") — and ends with a tick when the team lands. The same call designs **ten more** roles for the Marketplace (`state.team.extras`, ids
`more-1`…`more-10`, each pinned to a catalog `base` for art/category), listed straight after the
team and ahead of the stock leftovers; every one gets a portrait in the hatched character's look. The
research request and response go through the eligibility gate below; if the proxy is down the
page falls back to keyword ranking with the stock names.

Ranking first applies conservative business eligibility, then uses the catalog keyword sets
plus `BIZ_HINTS` to sort the eligible agents. Logistics requires physical retail or freight
operations; Returns requires physical retail; Inventory requires retail or explicit stock
operations (for example a warehouse or restaurant). Ambiguous/unknown businesses retain
cross-industry roles, never niche roles to fill a quota. This is a deterministic allowlist,
not general natural-language understanding: unusual physical-goods businesses should describe
their operations explicitly, and new business categories should be added with regression tests.

Only the business description and selected industry determine eligibility. If neither is
present, `config.industry` and `industryLabel` are used. Names, visual styling, tools and
`recommendedAgents` cannot grant eligibility. Generic online/digital/services wording does
not establish physical commerce. Hybrid service businesses need explicit goods-selling
wording (for example “travel agency also selling luggage”).

The same gate covers marketplace cards/portrait batches, team research requests, AI results,
saved suggested teams, offline fallback and new Add actions. Previously explicit `added`
agents remain in Profiles/Chats; no installed-agent migration or deletion is performed.

The Chats sidebar's "Other profiles"
(Bug Destroyer, Data Scientist, …) are generated in the hatched character's look right after
the marketplace batch, so no stock robot ever appears next to the prospect's agent.

## Sending a prospect their hatched dashboard

Hatch the agent for them yourself (or find their own session), open
`/prototype/sessions.html`, enter the sessions key, and pick **Share with the prospect…** in the
card's `⋯` menu. The page copies a public link — `/prototype/?share=<random token>` — that opens
that one dashboard read-only with no key or prompt. The card shows how many times it has been
opened; **Stop sharing** kills the link. The sessions page itself stays behind the key.

## Adding a prospect

1. Copy `prototype/demo/index.html` to `prototype/<company-slug>/index.html`.
2. Edit only `window.PROTOTYPE_CONFIG`:
   - `company`: display name
   - `industry`: one of `professional-services`, `legal`, `construction`, `retail`, `healthcare`, or `technology`
   - `industryLabel`: human-readable industry
   - `recommendedAgents`: optional agent IDs to boost in the marketplace ranking
   - `portraitEndpoint` *(optional)*: override the image-generation endpoint (see below)
   - `generatePortraits` *(optional)*: set `false` to skip generation and always use the
     built-in simulated mascots
3. Keep the `noindex,nofollow,noarchive` robots directive intact.
4. Open the resulting unlisted URL and complete the whole flow on desktop and mobile.

## Real avatar generation (backend required)

Step 4 POSTs `{ brief, name, role, company, industry, variant }` (`variant` is `0|1|2`) to
`portraitEndpoint` for each of the three designs and expects JSON `{ "image": "<url-or-data-uri>" }`
back. **If the call fails, the egg falls back to an on-brand simulated mascot**, so a prospect
never sees a broken page — real images appear automatically once the endpoint is live.

A static host (GitHub Pages / GoDaddy) can't hold an API key, so generation runs through a small
serverless proxy that keeps the key server-side. That proxy lives in **`../portrait-proxy/`**
(a Vercel function calling OpenRouter — see its README to deploy and set `OPENROUTER_API_KEY`).

Once the proxy is deployed, point the prototype at it by adding to each prospect's
`window.PROTOTYPE_CONFIG`:

```js
portraitEndpoint: "https://<your-vercel-url>/api/prototype-portrait"
```

(or map `api.agenthatchers.com` to the Vercel project and use that). To make every page use it
without per-page config, change the `portraitEndpoint` default near the top of `app.js`.
Until the proxy is wired, pages work now with simulated designs.

## Shared files

The flow and marketplace live in `prototype/app.js`; visual styling lives in
`prototype/styles.css`. Update those shared files once to change every prospect page.
Contract tests (from repo root): `python3 -m unittest discover -s prototype/tests -v`.
Selection regressions (Node 18+): `node --test prototype/tests/industry-selection.test.cjs`.

Rendered desktop/mobile check (Playwright and Chromium installed): serve the repo root with
`python3 -m http.server 8768 --bind 127.0.0.1`, then run
`node prototype/tests/industry-browser.cjs`. Set `NODE_PATH` if Playwright is installed outside
this repo, and `PLAYWRIGHT_BROWSERS_PATH` if its browser cache is non-default. The test loads
the actual page/CSS/app, exposes closure state only in the intercepted test response, verifies
cards, Add and IndexedDB restore, and blocks every non-local request (no paid APIs).

Release discovery: `.github/workflows/deploy.yml` publishes the repo root to GitHub Pages
on pushes to `main` or manual dispatch. This repair is shared static JavaScript; it does not
require a portrait-proxy deployment. Before an approved release, bump `BUILD` and the app.js
cache-busting versions in prototype entry pages together, then verify the served script and
travel/retail marketplace in a fresh browser. Creating a local worktree or running these
checks does not publish anything.
