import http from 'node:http';
import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const schema=await readFile(path.join(root,'schema.json'),'utf8');
const hash=createHash('sha256').update(schema).digest('base64');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
http.createServer(async(req,res)=>{try{const requestUrl=new URL(req.url,'http://localhost');
const host=(req.headers.host||'').toLowerCase().replace(/:\d+$/,'');
if(requestUrl.pathname!=='/health.json'&&['www.hindivarnmala.com','hindi-varnmala-site-production.up.railway.app'].includes(host)){
res.writeHead(301,{'Location':'https://hindivarnmala.com'+requestUrl.pathname+requestUrl.search});res.end();return;
}
let pathname=decodeURIComponent(requestUrl.pathname);let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))throw Error();if((await stat(file)).isDirectory())file=path.join(file,'index.html');const bytes=await readFile(file);const inline=path.extname(file)==='.html'?[...bytes.toString().matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>"'sha256-"+createHash('sha256').update(m[1]).digest('base64')+"'").join(' '):"'sha256-"+hash+"'";res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':`default-src 'self'; script-src 'self' ${inline}; style-src 'self'; font-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`,'Cache-Control':file.endsWith('.html')?'no-cache':'public, max-age=3600'});res.end(bytes)}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Page not found. Visit / to start again.')}}).listen(process.env.PORT||3000,'0.0.0.0');
