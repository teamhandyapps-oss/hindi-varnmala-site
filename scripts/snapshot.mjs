// Pre-deploy: write old-hashes.json with three maps for the indexnow job:
//   attempted - every covered URL we tried to hash from the live site
//   hashes    - sha256 of the current (pre-deploy) live content per URL
//   build     - sha256 of the freshly built local bytes for the new covered
//               set (every sitemap page plus every linked /downloads/*.pdf);
//               null when the local bytes cannot be read
// Comparing hashes to build post-deploy proves exactly which URLs changed,
// independent of Pages propagation. Tolerant: any failure degrades coverage
// only, and the indexnow job submits whatever change cannot be disproven.
import { createHash } from 'node:crypto';
import { writeFileSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const HOST = 'https://hindivarnmala.com';
const sha = b => createHash('sha256').update(b).digest('hex');

// New covered set and its build bytes, from the local build.
const pdfs = new Set();
try {
  const walk = d => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.html')) for (const m of readFileSync(p, 'utf8').matchAll(/href="(\/downloads\/[^"]+\.pdf)"/g)) pdfs.add(HOST + m[1]);
    }
  };
  walk('dist');
} catch { /* no local build; page URLs still covered below */ }
let sitemapUrls = [];
try { sitemapUrls = [...readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>/g)].map(m => m[1]); } catch { /* no local sitemap */ }
const covered = [...sitemapUrls, ...pdfs];
const build = {};
for (const u of covered) {
  const path = u.startsWith(HOST) ? u.slice(HOST.length) : null;
  const file = path && (path.endsWith('/') ? `dist${path}index.html` : `dist${path}`);
  try { build[u] = file ? sha(readFileSync(file)) : null; }
  catch { build[u] = null; } // unprovable build content -> indexnow submits it
}

// Pre-deploy live state: old sitemap URLs plus anything new we now cover.
const res = await fetch(`${HOST}/sitemap.xml`).catch(() => null);
const liveUrls = res && res.ok ? [...(await res.text()).matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>/g)].map(m => m[1]) : [];
if (!liveUrls.length) console.log('live sitemap fetch failed; snapshot holds the build map only');
const attempted = [...new Set([...liveUrls, ...covered])];
const hashes = {};
for (const u of attempted) {
  try {
    const r = await fetch(u);
    if (r.ok) hashes[u] = sha(Buffer.from(await r.arrayBuffer()));
  } catch { /* skip: missing entry means "cannot prove unchanged" */ }
}
writeFileSync('old-hashes.json', JSON.stringify({ attempted, hashes, build }));
console.log(`snapshotted ${Object.keys(hashes).length} of ${attempted.length} live urls; build map covers ${covered.length} urls`);
