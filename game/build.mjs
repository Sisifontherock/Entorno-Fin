import {readFile,writeFile} from 'node:fs/promises';
const read=name=>readFile(new URL(name,import.meta.url),'utf8');
const [html,css,strategies,app]=await Promise.all(['index.html','style.css','strategies.js','app.js'].map(read));
const bundle=strategies.replace(/^export /gm,'')+'\n'+app.replace(/^import .*;\n/,'');
const standalone=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="app.js"></script>',()=>`<script type="module">${bundle}</script>`);
await writeFile(new URL('play.html',import.meta.url),standalone);
console.log('Built game/play.html — standalone, offline, no external dependencies.');
