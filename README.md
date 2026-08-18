# agent-hatchers-website

Marketing site for Agent Hatchers, served at **https://agenthatchers.com**.

## Deployment

GitHub Pages, built by GitHub Actions. Every push to `main` — including a PR
merge — triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which publishes the repo root. There is no build step; this is a vanilla static
site.

The custom domain is pinned by the [`CNAME`](CNAME) file. DNS lives at GoDaddy:

| Record | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| CNAME | `www` | `automation-builders.github.io.` |

Because the workflow publishes the repo root, anything committed here is
publicly served. Keep internal material out.

## Related

`automationbuilders.ai` is the sibling site, deployed the same way from
[`automationbuilders-website`](https://github.com/Automation-Builders/automationbuilders-website).

The lead-capture forms on this site post to `n8n.automationbuilders.ai`, so they
depend on that domain staying up.
