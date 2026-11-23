# Prospect prototype pages

Each prospect receives an unlisted GitHub Pages route at `/prototype/<company-slug>/`.

## The flow

Every page runs the same hatching experience (shared code in `app.js` / `styles.css`):

1. **What can our agents do for you?** — industry, what the business does, website and tools.
   Written for people who have never used an AI agent. (The separate "Your team" screen was
   removed in September; the researched team shows up in the dashboard.)
2. **Create a profile** — company, agent name, type of company (prefilled) and the look.
3. **Hatch** — three eggs hatch into three different designs behind frosted glass until the
   prospect gives a name and email; then they click one to pick it.
4. **Dashboard** — a mimic of the live dashboard (`Hermes-Dashboard`, its v5 look in dark: cool
   neutrals, Hatch Blue, thin cards, a 72px labelled rail that opens to 280px), populated with
   the hatched character. The rail follows the dashboard's: New chat (the one filled control)
   and Search, then Home and Team, then Agents, Analytics (locked here), Marketplace, Merch and
   Feed (Soon, last). Chats is reached from New chat; Config is now Settings, reached from Apps
   and the account row at the rail's foot. Phones get the bottom tab bar, which keeps Chats.
   The dashboard shows Agents–Feed to admins only, under an "Admin" heading; the prototype
   keeps them (they are what a prospect came to see) and drops the heading.
5. **Connect** — the dashboard's first-run screen for an account with no box yet
   ("It's time to hatch…", Book a call, or "I have my own box" for the inline Connect Your Agent
   form).

Steps 1–3 and Connect wear the dashboard's onboarding frame (`SelfServeChrome.tsx`: dark page,
big centred heading, full-width pills); their styles are the `.ob` block at the end of
`styles.css`.

## Keeping the dashboard copy in sync

`dashboard-sync.json` records the Hermes-Dashboard commit the playground was last matched to
(`dashboardCommit`, `syncedAt`) and the dashboard files it copies (`watch`). Hermes-Dashboard's
`playground-copy` check reads `watch` on every dashboard pull request and, when one changes a
watched file, labels the PR `playground-copy` and comments with the files. That is the signal to
re-match the playground:

1. Compare the flagged screens on agenthatchers.ai with the playground, at 1280px and 390px.
2. Change the matching view in `app.js` and its rules in the `.dx` / `.ob` blocks; keep each
   view's comment naming the component it copies.
3. Update `dashboardCommit`, `syncedAt` and, if the playground starts or stops copying a file,
   `watch`.

If the check stops appearing on dashboard PRs that touch these files, it is broken: look at
`.github/workflows/playground-copy.yml` in Hermes-Dashboard. (Before 20 Nov the README said a
"daily sync routine" kept this up to date; it lived in one person's Claude account and opened
nothing between 10 Oct and 23 Nov.)

When the dashboard finishes generating (every marketplace and "Other profiles" portrait is
drawn), a **Download your image** pop hands the prospect their hatched character as a PNG
(`downloadPop()` in `app.js`). It shows once per hatch (`state.downloadOffered`, saved with
the session) and stays reachable from the dashboard footer. `downloadFiles()` is the list of
attachments, so the dashboard's JSON creation script can be added there as a second file.

The team is **researched, not picked from a list** (build 69): the proxy's `prototype-team`
function researches the business first (roles, systems, where the hours go — with a web search
when it can, and the prospect's website when they give one on screen 1) and designs six named
roles for it ("Recall & Rebooking Agent", not "Support Agent"), each pinned to a catalog base.
`app.js` overlays those names, one-liners, outcomes, tools and portrait scenes on the catalog
entries via `agentById()` so Agents, Chats, Marketplace, the agent peek and hand-offs all show
them. While it thinks (~20s, behind the create screen) a small console-style card
(`researchPopStart` in `app.js`, `.rs-pop` in the CSS) cycles through status lines the way a
coding agent does — mostly silly ("Caramelising onions…"), every third one true ("Reading
tanssu.com…") — and ends with a tick when the team lands. The same call designs **ten more** roles for the Marketplace (`state.team.extras`, ids
`more-1`…`more-10`, each pinned to a catalog `base` for art/category), listed straight after the
team and ahead of the stock leftovers; every one gets a portrait in the hatched character's look. The
research request and response go through the eligibility gate below; if the proxy is down the
page falls back to keyword ranking with the stock names.

The dashboard markup is `marketScreen()` and the views it picks from (`homeView`, `teamView`,
`profilesBoard`, `chatsView`, `marketplaceView`, …) in `app.js`; its styles are the `.dx` block at
the end of `styles.css`, built from the dashboard's own tokens (`client/src/v4theme.css`). Each
view names the dashboard component it copies — check that file when the dashboard changes, and keep `watch` in `dashboard-sync.json` in step with those comments.
As in the dashboard, a Marketplace card opens the agent's side peek and **Install** lives there;
Create offers New Chat, New Agent and New Skill.

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
agents remain in Agents/Chats; no installed-agent migration or deletion is performed.

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
     stock mascot
3. Keep the `noindex,nofollow,noarchive` robots directive intact.
4. Open the resulting unlisted URL and complete the whole flow on desktop and mobile.

## Real avatar generation (backend required)

Step 4 POSTs `{ brief, name, role, company, industry, variant }` (`variant` is `0|1|2`) to
`portraitEndpoint` for each of the three designs and expects JSON `{ "image": "<url-or-data-uri>" }`
back. **If a design can't be drawn** (the call fails, times out or is refused), that egg stays shut
and says "Couldn't draw this one" with **Try again**; when all three fail, the hatch screen says so
and offers Try again for all of them. A failed design is never pickable, and Try again redraws only
that design without counting as another hatch (`hatchOne` / `retryDesigns` in `app.js`,
`prototype/tests/hatch-failure-browser.cjs`). Before 22 Nov a failed draw silently became the stock
mascot, so a refused page showed the same robot three times as "three takes on your description".

The proxy only answers pages on the domains in its `ALLOWED_ORIGINS` (by default
`agenthatchers.com`, `www.agenthatchers.com` and `localhost:8799`). Until the proxy from PR #58
is live, a Vercel preview of this repo (`agent-hatchers-website-…-agenthatchers.vercel.app`) is not
allowed, so the browser refuses every AI call there: designs fail, team research falls back to
keyword picks and chat answers offline. Check the AI parts on agenthatchers.com. Once #58 is live
the proxy also accepts this repo's own previews, under the same limits; previews always call the
production proxy, so a preview only works once the production proxy allows it.

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
With `generatePortraits: false` a page skips the proxy on purpose and shows the stock mascot.

## Shared files

The flow and marketplace live in `prototype/app.js`; visual styling lives in
`prototype/styles.css`. Update those shared files once to change every prospect page.
Contract tests (from repo root): `python3 -m unittest discover -s prototype/tests -v`.
Selection regressions (Node 18+): `node --test prototype/tests/industry-selection.test.cjs`.
Research regressions (Playwright, served repo root as below): `node prototype/tests/research-browser.cjs`
— the researched team must survive the prospect editing "Type of company" while research is still
running, and a failed first run is retried (with the company name) when they hatch.
Design brief (Node 18+): `node --test prototype/tests/look-brief.test.cjs` — the prospect's words
lead the brief and decide what the character is ("an airplane" is an airplane mascot, not a robot
holding a plane; colours or mood alone give a robot), and the brief stays under the proxy's
600-character cut without losing the rule.
Hatch-failure regression (same server): `node prototype/tests/hatch-failure-browser.cjs` — a design
the proxy can't draw shows as not drawn with Try again, is never pickable, and a working retry hatches.

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
