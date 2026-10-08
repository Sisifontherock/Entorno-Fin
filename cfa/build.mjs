import {readFile,writeFile} from 'node:fs/promises';
const read=name=>readFile(new URL(name,import.meta.url),'utf8');
const names=['math.js','topics.js','questions.js','translations.js','engine.js','app.js'];
let bundle='';
for(const name of names){let code=await read(name);code=code.replace(/^import \* as m from '\.\/math\.js';\n/,'');code=code.replace(/^import .*;\n/gm,'').replace(/^export /gm,'');if(name==='math.js'){bundle+=`const m = (() => { ${code}\n return {mean,variance,covariance,correlation,portfolioVariance,portfolioReturn,utility,optimalWeight,beta,capm,sharpe,treynor,mSquared,jensen,marketVariance}; })();\n`;}else bundle+=code+'\n';}
const [html,css]=await Promise.all([read('index.html'),read('style.css')]);
const output=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="app.js"></script>',()=>`<script type="module">${bundle}</script>`).replaceAll('href="../index.html"','href="play.html"').replaceAll('href="../play.html"','href="play.html"');
await writeFile(new URL('../cfa-study.html',import.meta.url),output);
console.log('Built cfa-study.html — standalone bilingual CFA trainer.');
