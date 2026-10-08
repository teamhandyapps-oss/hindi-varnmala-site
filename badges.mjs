// Post-build step: adds a small directory badge row to every page footer.
// Each entry is the directory's own badge HTML, pasted exactly as the directory issued it (their verifiers look for it).
// Do not edit the snippets. Images are hotlinked; the CSP in server.mjs allows only those image hosts. No scripts.
// Size is set in CSS only (height, auto width), so the HTML attributes stay untouched.
import fs from 'node:fs';
import path from 'node:path';
const BADGES=[
`<a href="https://neeed.directory/products/hindi-varnmala?utm_source=hindi-varnmala" target="_blank" rel="noopener"><img src="https://neeed.directory/badges/neeed-badge-light.svg" alt="Featured on neeed.directory" width="139" height="20"></a>`,
`<a href="https://findly.tools/hindi-varnmala?utm_source=hindi-varnmala" target="_blank" rel="noopener noreferrer">
  <img src="https://findly.tools/badges/findly-tools-badge-light.svg" alt="Featured on Findly.tools" width="175" height="55" />
</a>`,
`<a href="https://startuptrusted.com?ref=hindivarnmala.com" target="_blank" rel="noopener">
  <img src="https://startuptrusted.com/api/badge?type=featured&style=light" alt="Hindi Varnmala on StartupTrusted" width="240" height="54" />
</a>`,
`<a href="https://nicklaunches.com/" target="_blank" rel="noopener"><img src="https://nicklaunches.com/badges/featured.png" alt="Featured on Nick Launches" width="244" height="56" /></a>`,
];
const row='<div class="fbadges"><span class="fbadges-label">Directories</span>'+BADGES.join('')+'</div>';
const css='.fbadges{max-width:1140px;margin:18px auto 0;padding:14px 24px 0;border-top:1px solid #F0D9B5;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 14px}.fbadges-label{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#76584d}.fbadges a{display:inline-block;margin:0;line-height:0}.fbadges img{display:block;height:28px;width:auto;max-width:100%}@media(max-width:700px){.fbadges{padding:12px 16px 0;gap:8px 12px}}@media print{.fbadges{display:none!important}}\n';
fs.appendFileSync('dist/styles.css',css);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
let n=0;
for(const f of walk('dist').filter(f=>f.endsWith('.html'))){const t=fs.readFileSync(f,'utf8');if(!t.includes('</footer>')||t.includes('class="fbadges"'))continue;fs.writeFileSync(f,t.replace('</footer>',row+'</footer>'));n++}
console.log('Badges added to '+n+' pages');
