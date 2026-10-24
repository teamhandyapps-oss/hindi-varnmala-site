// Homepage-only directory row. Destinations and rel values preserved.
import fs from 'node:fs';
import path from 'node:path';
const BADGES=[
`<a href="https://neeed.directory/products/hindi-varnmala?utm_source=hindi-varnmala" target="_blank" rel="noopener"><img src="/badges/neeed.svg" alt="Featured on neeed.directory" width="139" height="20"></a>`,
`<a href="https://findly.tools/hindi-varnmala?utm_source=hindi-varnmala" target="_blank" rel="noopener noreferrer">
  <img src="/badges/findly.svg" alt="Featured on Findly.tools" width="175" height="55" />
</a>`,
`<a href="https://startuptrusted.com?ref=hindivarnmala.com" target="_blank" rel="noopener">
  <img src="/badges/startuptrusted.svg" alt="Hindi Varnmala on StartupTrusted" width="240" height="54" />
</a>`,
`<a href="https://nicklaunches.com/products/hindi-varnmala/" target="_blank" rel="noopener"><img src="/badges/nicklaunches.png" alt="Hindi Varnmala on Nick Launches" width="244" height="56" /></a>`,
`<a href="https://wallof.tools/education/hindi-varnmala" target="_blank" rel="noopener"><img src="/badges/wallof.svg" alt="Featured on Wall of Tools" width="188" height="56" /></a>`,
`<a href="https://easydofollow.dev/education/hindi-varnmala" target="_blank" rel="noopener"><img src="/badges/easydofollow.svg" alt="Featured on EasyDoFollow" width="188" height="56" /></a>`,
`<a href="https://tinyhunt.dev/projects/hindi-varnmala?utm_source=badge" target="_blank" rel="noopener noreferrer"><img src="/badges/tinyhunt.svg" alt="Featured on TinyHunt" width="150" height="44" /></a>`,
`<a class="fbadges-text" href="https://twelve.tools" target="_blank" rel="noopener">Twelve Tools</a>`,
`<a class="fbadges-text" href="https://dailypings.com/p/hindi-varnmala" target="_blank" rel="noopener" title="Featured on DailyPings">DailyPings</a>`,
];
const row='<section class="fbadges" aria-label="Directories that list Hindi Varnmala"><h2>Featured on</h2><button class="fbadges-toggle" type="button" aria-pressed="false">Pause scrolling</button><div class="fbadges-clip"><div class="fbadges-track">'+BADGES.join('')+'</div></div></section>';
fs.cpSync('assets/badges','dist/badges',{recursive:true});
fs.copyFileSync('carousel.js','dist/carousel.js');
const file='dist/index.html';
const html=fs.readFileSync(file,'utf8');
fs.writeFileSync(file,html.replace('<footer class="footer">', '<footer class="footer">'+row).replace('</body>','<script src="/carousel.js" defer></script></body>'));
fs.appendFileSync('dist/styles.css',fs.readFileSync('carousel.css','utf8'));
console.log('Homepage carousel added; inner pages unchanged');
