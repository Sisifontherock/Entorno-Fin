import {topics} from './topics.js';
import {conceptual,numerical} from './questions.js';
import {bilingual} from './translations.js';
export function shuffle(items,random=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function prepare(q,random=Math.random){
 const translated=bilingual(q),order=shuffle([0,1,2],random);
 return {...translated,choices:order.map(i=>translated.choices[i]),correct:order.indexOf(q.correct)};
}
export function bank(seed){return [...conceptual,...numerical(seed)];}
export function scopedTopics(scope='all'){return topics.filter(t=>scope==='all'||scope===`m${t.module}`||scope===t.id);}
export function createExam(scope='all',seed=1,random=Math.random){
 const qs=bank(seed),out=[];
 for(const t of scopedTopics(scope)){
  const pool=qs.filter(q=>q.topic===t.id),numeric=pool.filter(q=>q.kind==='calculation');
  const first=shuffle(numeric.length?numeric:pool,random)[0];
  const second=shuffle(pool.filter(q=>q.kind==='concept'&&q.baseId!==first.baseId),random)[0];
  out.push(prepare(first,random),prepare(second,random));
 }
 return shuffle(out,random);
}
export function topicStats(topic,attempts){
 const relevant=attempts.filter(a=>a.topic===topic),last=relevant.slice(-5);
 const numericRequired=numerical(1).some(q=>q.topic===topic);
 const mastered=last.length===5&&last.every(a=>a.correct)&&new Set(last.map(a=>a.baseId)).size>=3&&(!numericRequired||last.some(a=>a.kind==='calculation'));
 return {attempts:relevant.length,correct:relevant.filter(a=>a.correct).length,last,mastered,numericRequired,unique:new Set(relevant.map(a=>a.baseId)).size};
}
export function choosePractice(scope,attempts,seed=1,random=Math.random){
 const allowed=scopedTopics(scope),pool=bank(seed),scores=allowed.map(t=>({t,stats:topicStats(t.id,attempts)}));
 scores.sort((a,b)=>Number(a.stats.mastered)-Number(b.stats.mastered)||a.stats.last.filter(x=>x.correct).length-b.stats.last.filter(x=>x.correct).length||a.stats.attempts-b.stats.attempts);
 const target=scores[0].t;
 const candidates=shuffle(pool.filter(q=>q.topic===target.id),random);
 const recent=attempts.filter(a=>a.topic===target.id).slice(-3).map(a=>a.baseId);
 const remaining=candidates.filter(q=>!recent.includes(q.baseId));
 const targetStats=topicStats(target.id,attempts);
 const numericNeeded=targetStats.numericRequired&&!targetStats.last.some(a=>a.kind==='calculation'&&a.correct);
 const selection=(numericNeeded?remaining.find(q=>q.kind==='calculation'):null)||remaining[0]||candidates[0];
 return prepare(selection,random);
}
export function scoreExam(questions,answers){const correct=questions.filter((q,i)=>answers[i]===q.correct).length;return {correct,total:questions.length,score:questions.length?Math.round(correct/questions.length*100):0};}
export function readProgress(raw){
 try{const parsed=JSON.parse(raw);if(parsed?.version!==1)return {version:1,attempts:[],exams:[]};
  const attempts=Array.isArray(parsed.attempts)?parsed.attempts.filter(a=>topics.some(t=>t.id===a.topic)&&typeof a.correct==='boolean'&&typeof a.baseId==='string'&&['concept','calculation'].includes(a.kind)).slice(-2000):[];
  const exams=Array.isArray(parsed.exams)?parsed.exams.filter(e=>Number.isInteger(e.score)&&e.score>=0&&e.score<=100&&typeof e.date==='string').slice(-30):[];
  return {version:1,attempts,exams};
 }catch{return {version:1,attempts:[],exams:[]};}
}
