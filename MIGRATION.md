# Migration: Railway -> GitHub Pages

One-time cutover of hindivarnmala.com from Railway to GitHub Pages. Railway
stays live until every verification step at the end passes. Rollback at any
point before the final step: point DNS back at Railway.

## 1. Move the repository

Repo must be **public** under the target GitHub account (approved by Amar,
Oct 25) because GitHub Pages on a free plan serves only public repos.

- [ ] Transfer `amar08007/hindi-varnmala-site` to the target account
      (Settings -> Danger Zone -> Transfer), or push a fresh copy with full
      history if transfer is blocked by org permissions.
- [ ] In the new location: Settings -> change visibility to **Public**.
- [ ] Settings -> Pages -> Build and deployment -> Source: **GitHub Actions**.

## 2. Merge the migration PR

Before merging, add the deploy workflow (the push token used for this PR lacks
the `workflow` scope, so the file cannot arrive by push): in the GitHub web UI
on `main`, Add file -> Create new file -> path `.github/workflows/pages.yml`,
paste this exactly, commit directly to `main`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```


- [ ] Merge the `gh-pages-migration` PR. It adds:
      - `.github/workflows/pages.yml`: `npm ci` -> `npm run build` -> deploy
        `dist/` to Pages on every push to `main`.
      - Static redirect pages for the two legacy paths
        (`/ka-se-kabutar/`, `/hi/varnamala/`) that Railway 301s today.
      - This checklist.
- [ ] Confirm the Actions run deploys successfully (green check on the merge
      commit). The site is now live at `<account>.github.io/<repo>/` and
      ready to take the custom domain.

## 3. DNS at Namecheap (Amar's action)

Current: apex A `69.46.46.37`, `www` CNAME `<...>.up.railway.app`.

- [ ] Apex: four A records -> `185.199.108.153`, `185.199.109.153`,
      `185.199.110.153`, `185.199.111.153`.
- [ ] `www`: CNAME -> `<account>.github.io`.
- [ ] Repo Settings -> Pages -> Custom domain: `hindivarnmala.com` (GitHub
      verifies DNS, then creates the CNAME file).
- [ ] After the certificate provisions (minutes to a few hours): tick
      **Enforce HTTPS**.

## 4. Post-cutover verification

- [ ] All 18 pages return 200 (walk sitemap.xml, plus `/gallery/`).
- [ ] `https://hindivarnmala.com/sitemap.xml` (17 URLs) and `/robots.txt`
      load.
- [ ] Legacy paths redirect: `/ka-se-kabutar/` and `/hi/varnamala/` land on
      `/swar-vyanjan-chart/` at the right anchors.
- [ ] `https://www.hindivarnmala.com/` loads (Pages redirects www/apex both
      ways once DNS is set).
- [ ] Mobile spot-check of the chart page.
- [ ] Google Search Console: no property change needed (same domain). Watch
      crawl stats for a week; request reindex of `/` if desired.

## 5. Only after verification passes

- [ ] Take the Railway deployment down / stop the service.

## Behavior changes vs Railway (accepted with the migration)

- **Legacy-path 301s become static redirect pages** (meta refresh + JS).
  GitHub Pages cannot send 301s for arbitrary paths. These are old URLs that
  already 301 on Railway; search engines treat a fast meta refresh as a
  redirect, and both targets carry self-canonicals.
- **Per-page sha256 CSP and security headers are dropped.** Pages serves
  static files with fixed headers and no per-page CSP. The site is static
  with no user input, accounts, or forms; GA loads as before.
- **404 becomes the GitHub Pages default** unless a `404.html` is added
  later (optional follow-up).
- **`/health.json`** keeps working: it is a static file in `dist/`.
- **Deploy path** changes from Railway auto-deploy on push to Actions
  build+deploy on push. Build command is identical (`npm run build`).
