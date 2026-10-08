# Hindi Varnmala - Team Handyapps

A mobile-first, light-mode learning website, ready to connect to Railway. No domain purchase or production deployment is required to build it. The website has no analytics, advertising, accounts, cookies, form submissions or progress tracking. All fonts and code are served locally. It is a parent-led beginner resource, not a substitute for a teacher.

## Quick start

Node 22 or newer. No runtime dependencies.

```sh
npm install
npm test
npm run build
npm start
# http://localhost:3000
```

`npm install` uses the supplied package lock. The production server binds `0.0.0.0` and uses Railway's `PORT` (3000 locally). Static HTML is built for eight routes: home, letters, barakhadi, numbers, worksheets, parents, privacy and support. Pages work without JavaScript; JS adds sound mode, letter selection and printing controls.

## Railway

1. New Project > Deploy from GitHub repo. Choose this private repository and grant Railway access if asked.
2. Railway reads `railway.json`: build `npm run build`, start `npm start`, health check `/health.json`. No database required.
3. Generate a Railway public domain under the service's networking settings.
4. Set `SITE_URL` to that exact HTTPS origin, for example the Railway-generated URL. Redeploy so canonicals, sitemap and structured data use it. `RAILWAY_PUBLIC_DOMAIN` is also read automatically if present at build time.
5. Check `/`, `/letters/`, `/worksheets/`, `/privacy/`, `/sitemap.xml` and `/health.json` on the deployed URL. Confirm logs and the hosting provider's privacy/retention settings.

No custom domain is hardcoded. A local or unconfigured build deliberately has no canonical and is `noindex`, with robots disallowing crawls, to avoid an accidental preview entering search. A valid `SITE_URL` or build-time `RAILWAY_PUBLIC_DOMAIN` enables indexing. If you later choose a domain, add it in Railway, follow Railway's exact DNS instructions, change `SITE_URL`, and redeploy. Hosting may have charges; this project does not provision or authorize spending.

## Sound: honest by default

Sound starts OFF. There are two explicit modes:

- Reviewed recordings: `audio-manifest.json` maps a glyph to a same-origin `/audio/` path. **No recordings are bundled yet.** Add parent/educator-reviewed files to `public/audio/` (create the folder) and mappings such as `"अ": "/audio/a.mp3"`. Rebuild. Recordings should speak the letter and example clearly and have documented rights. The interface reports missing files rather than pretending to play them.
- Device Hindi voice: the code uses only a browser voice with `localService: true` and a Hindi language tag. No remote fallback. Availability varies, and synthetic speech can mispronounce isolated letters. This is an optional aid, not a reviewed pronunciation lesson. If unavailable, the UI reports it.

Nothing requests microphone access. Recordings and browser voices still need testing on the actual target devices. For consistent children's pronunciation lessons, supply reviewed recordings.

## Content and worksheets

`data.json` contains starter letters, examples and numbers 1-20. Additional signs and conjuncts are separate, and no universal letter-total claim is made. Barakhadi is a beginner row, not an exhaustive grammar treatment: anusvar and visarg are labelled separately from vowel signs, and ऋ combinations are explicitly outside scope.

Worksheets are original print layouts generated from the chosen glyph: pale shapes to trace, repeated practice and a blank row. They are **not** stroke-order diagrams. Browser Print / save as PDF creates the PDF locally. Use A4 portrait and turn off browser headers/footers. Parent/teacher review of content, phonetics, age suitability and letter-formation teaching is recommended before promoting this as a full curriculum.

The app link is the verified Play listing:
https://play.google.com/store/apps/details?id=com.bharat.kidshindivarnmala

App capabilities on the homepage are attributed to the developer-provided listing, not independently tested. No fake star rating, testimonials, install numbers or learning promises. Website privacy is distinct from app policy; confirm the app's current policy in Play Console before reusing website text for the app.

## Files and maintenance

- `build.mjs`: HTML, metadata, canonical, sitemap, robots and WebSite JSON-LD. No rating or price schema.
- `styles.css`: responsive layout, keyboard focus, reduced motion and A4 print rules.
- `app.js`: local-only interactions. No storage or telemetry.
- `server.mjs`: path-constrained static server, MIME types, security headers, CSP and real 404s. No visitor log added by application.
- `data.json` / `audio-manifest.json`: content and recordings.
- `devanagari.ttf` / `FONT-LICENSE.txt`: local Noto Sans Devanagari font and SIL OFL attribution.
- `tests.mjs`: build/config/content/server tests using Node's built-in runner.

The public brand is Team Handyapps and support is teamhandyapps@gmail.com. No personal names or postal addresses are included in website copy. Following the existing app-site workflow, the code repository is private under the owner's development account, not a public personal listing. No open-source license is granted for project code; the bundled font keeps its own license.

## Launch checklist

- [ ] Supply and review pronunciation recordings.
- [ ] Have a Hindi educator review the letter chart, examples and beginner barakhadi.
- [ ] Connect Railway, set the public URL, and test the generated domain.
- [ ] Check hosting logs/privacy settings and update website policy if needed.
- [ ] Verify printing and sound on Android Chrome and Safari (sound is device-dependent).
- [ ] Add a custom domain only if wanted later; no domain is needed now.

SEO basics are in place, but rankings, traffic and app installs are not promised. Grow from genuinely useful learning material, not thin duplicate pages.

## App-matched edition (October 8, 2026)

The website now follows the supplied Hindi Varnmala app: its exact icon, cream #FFF8E1, orange #E65100, brown #4E342E, pastel rounded tiles, letter/word examples, 1-20 counting, barakhadi, six stories and five rhymes. App-like activities are available at /tracing/, /gallery/ and /parents/. The original printable worksheets, privacy and support pages remain. There are 11 routes.

The app uses native system typography. The web uses system UI plus its bundled Devanagari font, not a claim of pixel-identical native rendering. Emoji pictures depend on the device's emoji font. The exact logo is bundled locally. Its PNG and the app-derived content/styles are embedded in build.mjs so browser-based source delivery remains deterministic; generated files are not remote dependencies. Edit those payloads in build.mjs for this edition. The earlier root app.js/styles.css are legacy reference copies, not the current generated assets.

Progress stars and active time use sessionStorage in the current tab by default. A parent can opt in to localStorage persistence, turn it off, or reset. No child name, account, microphone, analytics or server progress endpoint. The small arithmetic parent gate prevents accidental taps; it is not age verification or a security boundary. Stars are shape-practice celebrations, not learning scores. Tracing checks shape coverage, not correct stroke order or handwriting quality, and uses font-rendered web guides rather than the app's platform-specific masks.

The app's letter audio is synthetic Piper output. Its voice-model source and redistribution terms were not established by the generic Expo MIT file, so those clips are not republished. Optional device speech uses local Hindi voices only and may be unavailable. No installed offline mode, app progress sync, device vibration, child-name field or social progress sharing is included on this website. Review the app's and website's educational content with a Hindi educator.

App-derived content is adapted under the source repository's MIT notice, preserved in build.mjs. Check ownership and third-party rights before broader distribution, especially audio models and traditional text editions.
