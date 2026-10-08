import {topics} from './topics.js';
import {bank,prepare,createExam,choosePractice,topicStats,scoreExam,readProgress,scopedTopics} from './engine.js';
const $=id=>document.getElementById(id),key='cfa-study-lab-v1';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let progress=readProgress(null),mode='practice',current,seed=Date.now(),answered=false,exam=null,ticker=null,activeView='practice';
try{progress=readProgress(localStorage.getItem(key));const lang=localStorage.getItem(key+'-language');if(['es','en','both'].includes(lang))$('language').value=lang;}catch{}
function persist(){try{localStorage.setItem(key,JSON.stringify(progress));}catch{$('storage-note').textContent='El navegador no permite guardar. Exporta tu progreso antes de cerrar.';}refreshStats();}
function refreshStats(){
 const attempts=progress.attempts;$('attempt-count').textContent=attempts.length;$('accuracy').textContent=attempts.length?`${Math.round(100*attempts.filter(a=>a.correct).length/attempts.length)}%`:'—';
 $('mastery').textContent=`${topics.filter(t=>topicStats(t.id,attempts).mastered).length} / 16`;
 $('exam-score').textContent=progress.exams.length?`${progress.exams.at(-1).score}/100`:'—';
 renderCoverage();renderMistakes();
}
function setView(view){activeView=view;for(const el of document.querySelectorAll('.view'))el.hidden=el.id!==view;document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('active',el.dataset.view===view));}
function languages(es,en,cls=''){
 const lang=$('language').value;
 if(lang==='en')return `<span class="${cls}" lang="en">${escape(en)}</span>`;
 return `<span class="${cls}">${escape(es)}</span>${lang==='both'?`<span class="english" lang="en">${escape(en)}</span>`:''}`;
}
function renderQuestion(){
 const topic=topics.find(t=>t.id===current.topic);$('topic-name').textContent=topic.name;
 $('question-kind').textContent=`MÓDULO ${topic.module} · ${current.kind==='calculation'?'CÁLCULO':'CONCEPTO Y APLICACIÓN'}`;
 $('stem').innerHTML=languages(current.stemEs,current.stem);
 const selected=mode==='exam'?exam.answers[exam.index]:null;
 $('answers').innerHTML=current.choices.map((c,i)=>`<label class="answer"><input type="radio" name="answer" value="${i}" ${selected===i?'checked':''} ${answered?'disabled':''}><div class="answer-text"><span class="letter">${'ABC'[i]}.</span> ${languages(c.textEs,c.text)}</div></label>`).join('');
 $('check').hidden=mode==='exam'||answered;$('check').disabled=true;$('next').hidden=mode==='exam'||!answered;$('finish').hidden=mode!=='exam';$('exam-navigation').hidden=mode!=='exam';$('confidence-label').hidden=mode==='exam';
 $('timer').hidden=mode!=='exam';$('feedback').innerHTML='';
 if(mode==='exam'){
  $('previous').disabled=exam.index===0;$('advance').disabled=exam.index===exam.questions.length-1;$('flag').checked=exam.flags.has(exam.index);
  $('session-status').textContent=`SIMULACRO · Pregunta ${exam.index+1} de ${exam.questions.length} · ${exam.answers.filter(a=>a!==null).length} respondidas`;
  $('question-map').innerHTML=exam.questions.map((q,i)=>`<button data-index="${i}" class="${exam.answers[i]!==null?'answered ':''}${exam.flags.has(i)?'flagged ':''}${exam.index===i?'current':''}" aria-label="Pregunta ${i+1}${exam.answers[i]!==null?', respondida':''}${exam.flags.has(i)?', marcada para revisar':''}" ${exam.index===i?'aria-current="step"':''}>${i+1}</button>`).join('');
 }else $('session-status').textContent='PRÁCTICA · Sin límite de tiempo · Feedback inmediato';
}
function explanation(q){
 const topic=topics.find(t=>t.id===q.topic);
 return q.choices.map((c,i)=>`<div class="explanation ${i===q.correct?'correct':'incorrect'}"><b>${i===q.correct?'Respuesta correcta':'Por qué se descarta'} · ${'ABC'[i]}: ${escape(c.textEs)}</b>${escape(c.why)}</div>`).join('')+`<p class="trap"><b>Regla para recordar:</b> ${escape(topic.trap)}</p><p class="muted">Referencia: módulo ${topic.module}, pp. ${topic.pages}. ${escape(topic.terms)}</p>`;
}
function logAttempt(q,selected,confident=true){const questionSeed=q.kind==='calculation'?Number(q.id.split(':')[1]):seed;progress.attempts.push({id:q.id,baseId:q.baseId,topic:q.topic,kind:q.kind,correct:selected===q.correct,confident,seed:questionSeed,date:new Date().toISOString()});progress.attempts=progress.attempts.slice(-2000);}
function newPractice(target){
 clearInterval(ticker);exam=null;mode='practice';answered=false;seed++;current=target||choosePractice($('scope').value,progress.attempts,seed);$('confident').checked=false;$('scratch').value='';$('exam-results').hidden=true;document.querySelector('.question-layout').hidden=false;renderQuestion();setView('practice');lock(false);
}
function lock(inExam){$('scope').disabled=inExam;$('start-exam').disabled=inExam;$('start-practice').disabled=inExam;document.querySelectorAll('.tab').forEach(el=>el.disabled=inExam);$('export').disabled=inExam;$('import').disabled=inExam;$('reset').disabled=inExam;}
$('answers').addEventListener('change',e=>{
 if(answered)return;
 if(mode==='exam'){exam.answers[exam.index]=Number(e.target.value);renderQuestion();}else $('check').disabled=false;
});
$('check').addEventListener('click',()=>{
 if(answered||mode!=='practice')return;
 const checked=document.querySelector('input[name=answer]:checked');if(!checked)return;
 const selected=Number(checked.value),ok=selected===current.correct;
 logAttempt(current,selected,$('confident').checked);answered=true;persist();renderQuestion();
 $('feedback').innerHTML=`<h3 class="feedback-title ${ok?'success':'failure'}">${ok?'Correcto. Ahora verifica tu razonamiento.':'Un error útil: identifica dónde cambió la lógica.'}</h3><p class="muted">Tu respuesta: ${'ABC'[selected]} · ${escape(current.choices[selected].textEs)}</p>${explanation(current)}`;$('feedback').focus();
});
$('next').addEventListener('click',()=>newPractice());$('start-practice').addEventListener('click',()=>newPractice());
function updateExamDescription(){const n=scopedTopics($('scope').value).length*2;$('exam-description').textContent=`${n} preguntas · ${n*1.5} minutos · sin soluciones hasta terminar`;}
$('scope').addEventListener('change',()=>{updateExamDescription();renderLessons();renderCoverage();newPractice();});
$('language').addEventListener('change',()=>{try{localStorage.setItem(key+'-language',$('language').value);}catch{}const oldFeedback=$('feedback').innerHTML;renderQuestion();if(answered)$('feedback').innerHTML=oldFeedback;});
document.querySelectorAll('.tab').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.view)));
$('start-exam').addEventListener('click',()=>{
 seed++;const questions=createExam($('scope').value,seed);exam={questions,answers:Array(questions.length).fill(null),flags:new Set(),index:0,deadline:Date.now()+questions.length*90000};mode='exam';answered=false;current=questions[0];$('scratch').value='';$('exam-results').hidden=true;document.querySelector('.question-layout').hidden=false;lock(true);setView('practice');renderQuestion();tick();ticker=setInterval(tick,1000);
});
function tick(){if(!exam)return;const seconds=Math.max(0,Math.ceil((exam.deadline-Date.now())/1000));$('timer').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} restantes`;if(seconds===0)finishExam(true);}
function go(index){if(!exam||index<0||index>=exam.questions.length)return;exam.index=index;current=exam.questions[index];renderQuestion();tick();}
$('previous').addEventListener('click',()=>go(exam.index-1));$('advance').addEventListener('click',()=>go(exam.index+1));$('question-map').addEventListener('click',e=>{if(e.target.dataset.index!==undefined)go(Number(e.target.dataset.index));});
$('flag').addEventListener('change',()=>{if($('flag').checked)exam.flags.add(exam.index);else exam.flags.delete(exam.index);renderQuestion();});
$('finish').addEventListener('click',()=>{const unanswered=exam.answers.filter(a=>a===null).length;if(!unanswered||confirm(`Quedan ${unanswered} sin responder. Contarán como incorrectas. ¿Terminar?`))finishExam(false);});
function finishExam(expired){
 if(!exam)return;clearInterval(ticker);const completed=exam,score=scoreExam(completed.questions,completed.answers);
 completed.questions.forEach((q,i)=>logAttempt(q,completed.answers[i]));progress.exams.push({...score,date:new Date().toISOString()});progress.exams=progress.exams.slice(-30);exam=null;mode='review';persist();lock(false);
 $('timer').hidden=true;document.querySelector('.question-layout').hidden=true;$('session-status').textContent=expired?'Tiempo agotado. Las preguntas sin responder cuentan como incorrectas.':'Simulacro terminado. Revisa también los aciertos.';
 $('exam-results').hidden=false;$('exam-results').innerHTML=`<div class="review-card"><span class="eyebrow">RESULTADO DEL SIMULACRO</span><div class="score-big">${score.score}/100</div><p>${score.correct} de ${score.total} correctas. Cada pregunta tiene el mismo peso; no hay penalización adicional por error.</p><p class="muted">Este resultado mide este conjunto de práctica. No garantiza una nota en el examen oficial.</p><button id="resume" class="primary">Volver a la práctica adaptativa</button></div>`+completed.questions.map((q,i)=>`<details class="review-card"><summary><span class="${completed.answers[i]===q.correct?'success':'failure'}">${completed.answers[i]===q.correct?'✓':'×'} Pregunta ${i+1}</span> · ${escape(topics.find(t=>t.id===q.topic).name)}</summary><p>${languages(q.stemEs,q.stem)}</p><p class="muted">Tu respuesta: ${completed.answers[i]===null?'Sin responder':escape(q.choices[completed.answers[i]].textEs)}</p>${explanation(q)}</details>`).join('');
 $('exam-results').scrollIntoView({behavior:'smooth',block:'start'});$('resume').addEventListener('click',()=>{document.querySelector('.question-layout').hidden=false;newPractice();});
}
function renderLessons(){
 $('lesson-list').innerHTML=scopedTopics($('scope').value).map(t=>`<details class="lesson"><summary><span>M${t.module} · ${escape(t.name)}</span><small>pp. ${t.pages}</small></summary><p>${escape(t.idea)}</p><ul>${t.points.map(p=>`<li>${escape(p)}</li>`).join('')}</ul>${t.formulas.map(f=>`<code class="formula">${escape(f)}</code>`).join('')}<p class="trap"><b>Trampa:</b> ${escape(t.trap)}</p><p class="terms" lang="en">${escape(t.terms)}</p><button class="quiet" data-topic="${t.id}">Practicar este objetivo →</button></details>`).join('');
}
function renderCoverage(){
 $('coverage-grid').innerHTML=scopedTopics($('scope').value).map(t=>{const s=topicStats(t.id,progress.attempts);return `<article class="coverage-card"><span class="badge">M${t.module} · ${s.mastered?'Dominado':s.attempts?'En práctica':'Pendiente'}</span><h3>${escape(t.name)}</h3><progress max="5" value="${s.last.filter(a=>a.correct).length}" aria-label="Aciertos en las últimas cinco respuestas"></progress><p>${s.last.filter(a=>a.correct).length}/5 recientes correctas · ${s.unique} preguntas base vistas · ${s.correct}/${s.attempts} aciertos históricos</p><p>${s.numericRequired?'Incluye cálculo; se exige uno correcto entre las últimas cinco.':'Objetivo conceptual.'}</p><button class="quiet" data-topic="${t.id}">Reforzar →</button></article>`;}).join('');
}
function practiceTopic(id){if(exam)return;$('scope').value=id;updateExamDescription();renderLessons();renderCoverage();document.querySelector('.question-layout').hidden=false;newPractice();}
for(const id of ['lesson-list','coverage-grid'])$(id).addEventListener('click',e=>{if(e.target.dataset.topic)practiceTopic(e.target.dataset.topic);});
function renderMistakes(){
 const selected=progress.attempts.filter(a=>!a.correct||a.confident===false).slice(-30).reverse();
 const unique=[...new Map(selected.map(a=>[a.id,a])).values()];
 $('mistake-list').innerHTML=unique.length?unique.map(a=>{const q=bank(Number.isSafeInteger(a.seed)?a.seed:1).find(q=>q.id===a.id||q.baseId===a.baseId);if(!q)return '';const t=topics.find(t=>t.id===q.topic);return `<article class="review-card"><span class="eyebrow">${a.correct?'ACIERTO CON DUDAS':'ERROR PARA REVISAR'}</span><h3>${escape(t.name)}</h3><p>${escape(q.stem)}</p><button class="quiet" data-retry="${escape(q.id)}" data-seed="${Number.isSafeInteger(a.seed)?a.seed:1}">Reintentar sin solución →</button></article>`;}).join(''):'<p class="muted">Todavía no tienes errores registrados. Empieza con un objetivo o un simulacro.</p>';
}
$('mistake-list').addEventListener('click',e=>{const id=e.target.dataset.retry;if(id&&!exam){seed=Number(e.target.dataset.seed);const q=bank(seed).find(q=>q.id===id);if(q){document.querySelector('.question-layout').hidden=false;newPractice(prepare(q));}}});
$('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cfa-study-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>3000000){$('file-message').textContent='Archivo demasiado grande (máximo 3 MB).';return;}try{const text=await file.text(),parsed=JSON.parse(text);if(parsed.version!==1||!Array.isArray(parsed.attempts))throw Error('format');if(confirm('¿Reemplazar tu progreso actual por el archivo?')){progress=readProgress(text);persist();newPractice();$('file-message').textContent='Progreso importado.';}}catch{$('file-message').textContent='No se pudo importar. Usa un archivo exportado por este entrenador.';}e.target.value='';});
$('reset').addEventListener('click',()=>{if(!exam&&confirm('¿Borrar respuestas y simulacros guardados?')){progress=readProgress(null);persist();document.querySelector('.question-layout').hidden=false;newPractice();}});
for(const t of topics){const option=document.createElement('option');option.value=t.id;option.textContent=`M${t.module} · ${t.name}`;$('scope').append(option);}
refreshStats();renderLessons();updateExamDescription();newPractice();
// Returning from completed exam via the toolbar must restore the question panel.
$('start-practice').addEventListener('click',()=>{document.querySelector('.question-layout').hidden=false;});
window.addEventListener('beforeunload',e=>{if(exam){e.preventDefault();e.returnValue='';}});
