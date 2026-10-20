# GitHub Pages migration preparation

This branch does not publish anything. Keep it unmerged until the hosting move is approved.

## Build and destination

`npm ci && npm run build:pages` generates `dist/`. It contains 18 pre-rendered content pages, a custom `404.html`, browser-only activities, seven PDFs, six local badge images, local font, scripts, sitemap and robots file. Audio recordings are not supplied: `audio-manifest.json` is empty. The existing audio-disabled behavior remains unchanged.

The requested final repository owner is the **teamhandyapps-oss user account**, not the teamhandyapps organization. The source repository remains private under amar08007 while this PR is reviewed. No workflow, Pages setting or public repository is created by this PR.

A separately approved publication step must decide the public repo contents before creating it. Prefer uploading only generated `dist/` to a new public static snapshot repo under teamhandyapps-oss, keeping this private source/history private, as done for the Math test site. Public repo name and update mechanism still need to be settled. Do not transfer or expose this private source/history by assumption.

## Separate approval gates

1. Approve the target public repo name and exactly what will be public. Audit the generated files for secrets and private material before upload.
2. Approve enabling Pages. Upload the generated output, including `.nojekyll`, to the approved repo and configure the publishing source. No publishing workflow is installed here.
3. Approve the DNS cutover for hindivarnmala.com. Verify GitHub ownership, TLS and both apex/www behavior before changing DNS. Keep Railway online until live checks pass; no shutdown is authorized by this PR.

`dist/CNAME` is `hindivarnmala.com`. All canonical URLs and sitemap URLs retain this HTTPS apex. Preview on a project-subpath URL is not equivalent to the final custom-domain setup because asset paths are root-relative.

## Security and behavior differences

GitHub Pages cannot apply server.mjs HTTP headers. The Pages post-build adds a CSP meta element immediately after charset, before scripts and styles, with per-page inline-script hashes, plus a referrer-policy meta element. It preserves the relevant script/style/image/font/media/connect/base/form restrictions with the self-hosted badge assets. `frame-ancestors` cannot work in CSP meta: anti-framing protection from that header is lost. `X-Content-Type-Options`, exact cache-control headers and host/path redirects from server.mjs cannot be carried over as meta tags. No claim of equivalent header security is made.

The old Railway hostname's 301 redirect exists only while that service is running. www-to-apex behavior on GitHub must be verified after its custom-domain setup. Existing trailing-slash directory routes work as static indexes. Unknown paths should return the custom 404 with a real 404 status, not the homepage. GitHub's actual routing, custom-domain TLS, DNS and analytics delivery remain untested until the separate approved deployment.

## Local checks

`npm test` checks existing content, PDFs, server behavior and homepage carousel. `node --test test-pages.mjs` checks the Pages build, all 19 HTML files including 404, CSP hashes, CNAME, nojekyll, sitemap and empty audio manifest. Browser preview checks should use a static server without server.mjs headers so CSP meta is tested on its own.
