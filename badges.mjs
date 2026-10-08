// Post-build step: adds a small directory badge row to every page footer.
// Each entry is the directory's own badge HTML, pasted exactly as issued (their verifier looks for it).
// Images are hotlinked from the directory; the CSP in server.mjs allows only those image hosts. No scripts.
// To add or update a badge, edit BADGES below.
import fs from 'node:fs';
import path from 'node:path';
const BADGES=[
  '<a href="https://neeed.directory/products/hindi-varnmala?utm_source=hindi-varnmala" target="_blank" rel="noopener"><img src="https://neeed.directory/badges/neeed-badge-light.svg" alt="Featured on neeed.directory" width="139" height="20"></a>',
  '<a href="https://findly.tools/hindi-varnmala?utm_source=hindi-varnmala" target="_blank" rel="noopener noreferrer"><img src="https://findly.tools/badges/findly-tools-badge-light.svg" alt="Featured on Findly.tools" width="139" height="20"></a>',
];
const row='<div class="fbadges"><span class="fbadges-label">Directories</span>'+BADGES.join('')+'</div>';
const css='.fbadges{max-width:1140px;margin:18px auto 0;padding:14px 24px 0;border-top:1px solid #F0D9B5;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 12px}.fbadges-label{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#76584d}.fbadges a{display:inline-block;margin:0;line-height:0;min-height:20px;min-width:139px}.fbadges img{display:block;width:139px;height:20px;max-width:100%}@media(max-width:700px){.fbadges{padding:14px 20px 0}}@media print{.fbadges{display:none!important}}\n';
fs.appendFileSync('dist/styles.css',css);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
let n=0;
for(const f of walk('dist').filter(f=>f.endsWith('.html'))){const t=fs.readFileSync(f,'utf8');if(!t.includes('</footer>')||t.includes('class="fbadges"'))continue;fs.writeFileSync(f,t.replace('</footer>',row+'</footer>'));n++}
console.log('Badges added to '+n+' pages');
