// Pre-deploy: hash the currently deployed content of every sitemap URL plus
// every /downloads/*.pdf linked from the built pages. Runs in the build job
// (live site is still the previous deploy). Tolerant: any failure just leaves
// no artifact, and the indexnow job falls back to submitting the full set.
import { createHash } from 'node:crypto';
import { writeFileSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const HOST = 'https://hindivarnmala.com';
const res = await fetch(`${HOST}/sitemap.xml`).catch(() => null);
if (!res || !res.ok) { console.log('sitemap fetch failed; no snapshot'); process.exit(0); }
const urls = [...(await res.text()).matchAll(/<loc>(https:\/\/hindivarnmala\.com[^<]+)<\/loc>/g)].map(m => m[1]);
const pdfs = new Set();
const walk = d => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) for (const m of readFileSync(p, 'utf8').matchAll(/href="(\/downloads\/[^"]+\.pdf)"/g)) pdfs.add(HOST + m[1]);
  }
};
try { walk('dist'); } catch { /* no local build; page URLs still covered */ }
const all = [...urls, ...pdfs];
const hashes = {};
for (const u of all) {
  try {
    const r = await fetch(u);
    if (r.ok) hashes[u] = createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex');
  } catch { /* skip: missing entry means "cannot prove unchanged" */ }
}
writeFileSync('old-hashes.json', JSON.stringify(hashes));
console.log(`snapshotted ${Object.keys(hashes).length} of ${all.length} urls (${pdfs.size} pdfs)`);
