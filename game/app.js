import {strategies,payoff,cost,orderText,matches,shuffle,sameCurve} from './strategies.js';
const $ = id => document.getElementById(id);
const storageKey='option-lab-progress-v1';
let progress={rounds:0,correct:0,streak:0}, stage=1, current, selected='', firstCorrect=false, queue=[];
try {const p=JSON.parse(localStorage.getItem(storageKey));if(p&&['rounds','correct','streak'].every(k=>Number.isInteger(p[k])&&p[k]>=0)&&p.correct<=p.rounds&&p.streak<=p.rounds)progress=p;} catch {}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch{}stats();}
function stats(){$('rounds').textContent=progress.rounds;$('accuracy').textContent=progress.rounds?`${Math.round(100*progress.correct/progress.rounds)}%`:'—';$('streak').textContent=progress.streak;}
const fmt=n=>`${n<0?'−':n>0?'+':''}${Math.abs(n).toFixed(1)}`;
function svg(s,price=100,mini=false){
 const w=560,h=300,left=55,right=540,top=25,bottom=258;
 const samples=Array.from({length:81},(_,i)=>({s:60+i,p:payoff(s.legs,60+i)}));
 const max=Math.max(12,...samples.map(p=>Math.abs(p.p)))*1.1;
 const x=p=>left+(p-60)/80*(right-left),y=p=>bottom-(p+max)/(2*max)*(bottom-top);
 const points=samples.map(p=>`${x(p.s)},${y(p.p)}`).join(' ');
 const grid=[-max/2,0,max/2].map(p=>`<line x1="${left}" x2="${right}" y1="${y(p)}" y2="${y(p)}" stroke="${p===0?'#788c99':'#293846'}" ${p===0?'':'stroke-dasharray="3 5"'}/><text x="46" y="${y(p)+4}" fill="#a3b5bf" text-anchor="end" font-size="11">${fmt(p)}</text>`).join('');
 const ticks=[60,80,100,120,140].map(p=>`<text x="${x(p)}" y="278" fill="#a3b5bf" text-anchor="middle" font-size="11">${p}</text>`).join('');
 const strikes=[...new Set(s.legs.filter(l=>l.type!=='acción').map(l=>l.strike))].map(k=>`<line x1="${x(k)}" x2="${x(k)}" y1="${top}" y2="${bottom}" stroke="#435260" stroke-dasharray="3 6"/><text x="${x(k)}" y="16" text-anchor="middle" fill="#a3b5bf" font-size="10">K ${k}</text>`).join('');
 return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${mini?s.name:'Curva por identificar'}: beneficio o pérdida al vencimiento. Precio entre 60 y 140. Usa el control de precio para consultar resultados."><defs><clipPath id="positive-${s.id}-${mini}"><rect x="0" y="0" width="560" height="${y(0)}"/></clipPath><clipPath id="negative-${s.id}-${mini}"><rect x="0" y="${y(0)}" width="560" height="300"/></clipPath></defs>${grid}${strikes}${ticks}<text x="55" y="16" fill="#a3b5bf" font-size="10">P/L ($)</text><text x="540" y="298" fill="#a3b5bf" font-size="10" text-anchor="end">Precio al vencimiento ($)</text><polyline points="${points}" fill="none" stroke="#b4f478" stroke-width="3" clip-path="url(#positive-${s.id}-${mini})"/><polyline points="${points}" fill="none" stroke="#ff8b91" stroke-width="3" clip-path="url(#negative-${s.id}-${mini})"/>${mini?'':`<line x1="${x(price)}" x2="${x(price)}" y1="${top}" y2="${bottom}" stroke="#d7e5ea" stroke-dasharray="2 5"/><circle cx="${x(price)}" cy="${y(payoff(s.legs,price))}" r="5" fill="#eef4f5"/>`}</svg>`;
}
function draw(){const price=Number($('price').value);$('chart').innerHTML=svg(current,price);$('price-label').textContent=`$${price}`;$('live-payoff').textContent=`P/L: ${fmt(payoff(current.legs,price))}`;}
function newRound(target){
 const pool=strategies.filter(s=>s.level<=Number($('level').value));
 if(!target){if(!queue.length)queue=shuffle(pool);current=queue.pop();}else current=target;
 stage=1;selected='';$('step').textContent='PASO 1 DE 2';$('question-title').textContent='Ponle nombre a la curva';$('question-help').textContent='Elige la estrategia que encaja con el gráfico.';
 $('round-label').textContent=`RONDA ${String(progress.rounds+1).padStart(2,'0')}`;
 // Debit and credit verticals can have identical terminal P/L. Never ask
 // learners to distinguish mathematically identical curves from an image.
 const distractors=shuffle(pool.filter(s=>s.id!==current.id&&!sameCurve(s,current))).slice(0,3);
 $('choices').innerHTML=shuffle([current,...distractors]).map((s,i)=>`<label class="choice"><input type="radio" name="strategy" value="${s.id}"><span>${s.name}</span></label>`).join('');
 $('choices').hidden=false;$('orders').hidden=true;$('feedback').innerHTML='';$('next').hidden=true;$('submit').hidden=false;$('submit').disabled=true;$('submit').textContent='Comprobar estrategia →';$('hint').hidden=true;$('hint-button').disabled=false;$('price').value=100;draw();
}
function build(){
 stage=2;$('step').textContent='PASO 2 DE 2';$('question-title').textContent=`Construye: ${current.name}`;$('question-help').textContent='Elige comprar o vender y la cantidad para cada pata. Mismo vencimiento para todas.';
 $('choices').hidden=true;$('orders').hidden=false;
 $('orders').innerHTML=current.legs.map((l,i)=>`<div class="order-row"><label for="leg-${i}">${l.type==='acción'?'Acción a $100':`${l.type.toUpperCase()} · K $${l.strike}`}<small>${l.type==='acción'?'Activo subyacente':`Prima por unidad: $${l.premium}`}</small></label><select id="leg-${i}" class="leg-answer"><option value="">Elige acción…</option><option value="1">Comprar 1</option><option value="-1">Vender 1</option><option value="2">Comprar 2</option><option value="-2">Vender 2</option></select></div>`).join('');
 $('submit').textContent='Comprobar posición →';$('submit').disabled=true;
}
$('choices').addEventListener('change',e=>{selected=e.target.value;$('submit').disabled=false;});
$('orders').addEventListener('change',()=>{$('submit').disabled=[...document.querySelectorAll('.leg-answer')].some(el=>!el.value);});
$('submit').addEventListener('click',()=>{
 if(stage===1){firstCorrect=selected===current.id;$('feedback').innerHTML=`<h3 class="${firstCorrect?'success':'failure'}">${firstCorrect?'¡Bien visto!':'Mira la forma una vez más.'}</h3><p>Es <strong>${current.name}</strong>. Ahora construye la posición para entender por qué.</p>`;build();$('feedback').focus();return;}
 if(stage!==2)return;
 const ordersCorrect=matches(current.legs,[...document.querySelectorAll('.leg-answer')].map(el=>el.value));
 const perfect=firstCorrect&&ordersCorrect;progress.rounds++;progress.correct+=Number(perfect);progress.streak=perfect?progress.streak+1:0;save();stage=3;
 const debit=cost(current.legs);$('feedback').innerHTML=`<h3 class="${ordersCorrect?'success':'failure'}">${ordersCorrect?'Posición correcta.':'Estas son las patas correctas:'}</h3><ul class="correct-orders">${current.legs.map(l=>`<li>${orderText(l)}</li>`).join('')}</ul><p>${current.explanation}</p><p class="risk"><strong>Riesgo:</strong> ${current.risk}</p><p>${current.legs.some(l=>l.type==='acción')?'Desembolso neto (incluye acción)':debit>=0?'Débito neto':'Crédito neto'}: $${Math.abs(debit)} por unidad.</p><p class="reference">Cohen, 2.ª ed., p. ${current.page}. ${perfect?'Ronda perfecta: identificación y construcción correctas.':'Repite este patrón en la biblioteca para afianzarlo.'}</p>`;
 $('submit').hidden=true;$('next').hidden=false;$('hint-button').disabled=true;document.querySelectorAll('.leg-answer').forEach(el=>el.disabled=true);$('feedback').focus();
});
$('next').addEventListener('click',()=>{newRound();$('question-title').scrollIntoView({behavior:'smooth',block:'nearest'});});
$('price').addEventListener('input',draw);
$('hint-button').addEventListener('click',()=>{$('hint').textContent=`Perspectiva: ${current.outlook}. ${current.legs.length} pata(s). Pregúntate dónde gana, dónde pierde y si el resultado está limitado.`;$('hint').hidden=!$('hint').hidden;});
$('level').addEventListener('change',()=>{queue=[];newRound();});
$('reset').addEventListener('click',()=>{if(confirm('¿Borrar tus rondas, aciertos y racha?')){progress={rounds:0,correct:0,streak:0};save();queue=[];newRound();}});
function showLibrary(show){$('library').hidden=!show;$('practice').hidden=show;$('hint-button').hidden=show;$('library-toggle').textContent=show?'Volver al juego':'Explorar estrategias';}
$('library-toggle').addEventListener('click',()=>showLibrary($('library').hidden));$('back').addEventListener('click',()=>showLibrary(false));
$('library-grid').innerHTML=strategies.map(s=>`<article class="library-card"><span class="eyebrow">${s.outlook}</span><h3>${s.name}</h3>${svg(s,100,true)}<ul>${s.legs.map(l=>`<li>${orderText(l)}</li>`).join('')}</ul><p>${s.explanation}</p><p class="risk">${s.risk}</p><span class="reference">Cohen · p. ${s.page}</span><br><button class="quiet" data-practice="${s.id}">Practicar esta estrategia →</button></article>`).join('');
$('library-grid').addEventListener('click',e=>{const id=e.target.dataset.practice;if(id){const s=strategies.find(s=>s.id===id);if(s.level>Number($('level').value)){$('level').value=s.level;queue=[];}showLibrary(false);newRound(s);$('practice').scrollIntoView({behavior:'smooth'});}});
stats();newRound();
