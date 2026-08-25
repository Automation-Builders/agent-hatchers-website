# Prospect prototype pages

These pages are intentionally unlisted and carry `noindex`, `nofollow`, and `noarchive` directives.

## Add a prospect

1. Add an entry to `prospects.js` with a URL-safe slug, company name, industry, market and welcome copy.
2. Copy `_template/index.html` to `<company-slug>/index.html`.
3. Open `/prototype/<company-slug>/` and verify the full flow on desktop and mobile.

Available market keys are `construction`, `professional`, `retail`, and `healthcare`. Unknown slugs fall back to professional services when the prototype shell is loaded.
