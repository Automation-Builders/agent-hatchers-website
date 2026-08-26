# Prospect prototype pages

Each prospect receives an unlisted GitHub Pages route at `/prototype/<company-slug>/`.

## The flow

Every page runs the same six-step hatching experience (shared code in `app.js` / `styles.css`):

1. **Welcome** — tailored to the prospect's industry.
2. **Create a profile** — name the agent and say what it should help with.
3. **Design the look** — free-text description of the avatar (like agenthatchers.ai).
4. **Hatch** — three eggs hatch in sequence into three different designs.
5. **Pick your favourite** — choose one of the three; it becomes the agent's avatar.
6. **Marketplace** — agents ranked from what was described + the industry; open one to see
   its MCP connections and five concrete outcomes.

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
Contract tests: `python3 -m unittest` from `prototype/`.
