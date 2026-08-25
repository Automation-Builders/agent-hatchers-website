# Prospect prototype pages

Each prospect receives an unlisted GitHub Pages route at `/prototype/<company-slug>/`.

To add a prospect:

1. Copy `prototype/demo/index.html` to `prototype/<company-slug>/index.html`.
2. Edit only `window.PROTOTYPE_CONFIG`:
   - `company`: display name
   - `industry`: one of `professional-services`, `legal`, `construction`, `retail`, `healthcare`, or `technology`
   - `industryLabel`: human-readable industry
   - `recommendedAgents`: optional agent IDs to include
3. Keep the `noindex,nofollow,noarchive` robots directive intact.
4. Open the resulting unlisted URL and complete the whole flow on desktop and mobile.

The shared flow and marketplace live in `prototype/app.js`; visual styling lives in `prototype/styles.css`. Update those shared files once to change every prospect page.
