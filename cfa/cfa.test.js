import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from './math.js';
import {topics} from './topics.js';
import {conceptual,numerical} from './questions.js';
import {bilingual} from './translations.js';
import {prepare,createExam,choosePractice,topicStats,scoreExam,readProgress} from './engine.js';
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} versus ${expected}`);
test('historical sample statistics: independent hand calculations and unit conventions',()=>{
 near(m.mean([.02,.06,.10]),.06);near(m.variance([.02,.06,.10]),.0016);
 near(m.covariance([.02,.06,.10],[.01,.03,.05]),.0008);near(m.correlation([.02,.06,.10],[.01,.03,.05]),1);
 near(m.correlation([.02,.06,.10],[.05,.03,.01]),-1);
});
test('risk formula retains covariance, weight squares and diversification',()=>{
 near(m.portfolioVariance(.5,.2,.2,0),.02);near(m.portfolioVariance(.5,.2,.2,-1),0);near(m.portfolioVariance(.5,.2,.2,1),.04);
 near(m.portfolioReturn(-.2,.05,.10),.11);
});
test('utility and optimal allocation use variance in decimal units',()=>{
 near(m.utility(.10,.20,4),.02);near(m.optimalWeight(.10,.02,.20,4),.5);
 assert.ok(m.optimalWeight(.1,.02,.2,2)>m.optimalWeight(.1,.02,.2,4));
});
test('beta, CAPM and performance definitions match independent examples',()=>{
 near(m.beta(.6,.3,.2),.9);near(m.capm(.03,.09,1.5),.12);near(m.capm(.03,.09,-.5),0);
 near(m.sharpe(.13,.03,.2),.5);near(m.treynor(.13,.03,1.25),.08);
 near(m.mSquared(.13,.03,.2,.16),.11);near(m.jensen(.13,.03,.09,1.25),.025);
 near(m.marketVariance(1.5,.2,.01),.10);
});
test('all 16 PDF learning objectives have five original concepts and study notes',()=>{
 assert.equal(topics.length,16);assert.equal(topics.filter(t=>t.module===1).length,7);assert.equal(topics.filter(t=>t.module===2).length,9);
 assert.equal(conceptual.length,80);
 for(const t of topics){assert.equal(conceptual.filter(q=>q.topic===t.id).length,5);assert.ok(t.pages&&t.idea&&t.points.length>=3&&t.formulas.length);}
});
test('every numerical template has three distinct finite choices for all seven variants',()=>{
 assert.equal(numerical(0).length,23);
 for(let seed=0;seed<70;seed++)for(const q of [...conceptual,...numerical(seed)]){
  assert.equal(q.choices.length,3);assert.equal(new Set(q.choices.map(c=>c.text)).size,3,q.id);
  assert.ok(q.choices.every(c=>c.why.length>15));assert.ok(topics.some(t=>t.id===q.topic));
  assert.ok(!q.choices.some(c=>/NaN|Infinity/.test(c.text)),q.id);
 }
});
test('numeric template answers: independent seed-zero landmarks',()=>{
 const expected={'real':'7.69%','utility':'4.14%','allocation':'58.33%','sample-var':'0.001600','covariance':'0.000800','portfolio-sigma':'9.95%','portfolio-return':'4.24%','hedge-weight':'25.00%','blend-risk':'5.76%','borrowing':'10.00%','cml':'5.00%','model-var':'0.020800','systematic-share':'69.23%','beta':'0.720','portfolio-beta':'1.276','capm':'6.80%','premium':'6.80%','sml-slope':'6.00%','expected-alpha':'2.50%','sharpe':'0.389','treynor':'8.75%','m2':'9.78%','jensen':'2.20%'};
 for(const q of numerical(0))assert.equal(q.choices[q.correct].text,expected[q.baseId],q.id);
});
test('every concept and every numerical variant has Spanish and English content',()=>{
 for(let seed=0;seed<7;seed++)for(const q of [...conceptual,...numerical(seed)]){
  const b=bilingual(q);assert.ok(b.stemEs.length>20,q.id);assert.notEqual(b.stemEs,b.stem,q.id);assert.ok(b.choices.every(c=>c.textEs));
 }
});
test('answer shuffle carries explanation, translation and correct key together',()=>{
 for(const q of [...conceptual,...numerical(1)]){
  const shuffled=prepare(q,()=>.1);assert.equal(shuffled.choices[shuffled.correct].why,q.choices[q.correct].why);assert.equal(shuffled.choices[shuffled.correct].text,q.choices[q.correct].text);
 }
});
test('exam is balanced by objective with a calculation where supported',()=>{
 for(const [scope,count] of [['all',32],['m1',14],['m2',18],['m2-performance',2]]){
  const qs=createExam(scope,7,()=>.3);assert.equal(qs.length,count);assert.equal(new Set(qs.map(q=>q.id)).size,count);
  for(const id of new Set(qs.map(q=>q.topic))){assert.equal(qs.filter(q=>q.topic===id).length,2);if(numerical(1).some(q=>q.topic===id))assert.ok(qs.some(q=>q.topic===id&&q.kind==='calculation'));}
 }
});
test('mastery requires five recent correct answers, diversity, and calculation when applicable',()=>{
 const make=(id,kind='concept',correct=true)=>({topic:'m1-risk',baseId:id,kind,correct});
 assert.ok(!topicStats('m1-risk',Array(5).fill(make('same'))).mastered);
 const varied=[make('a'),make('b'),make('c'),make('d'),make('e')];
 assert.ok(!topicStats('m1-risk',varied).mastered);varied[4]=make('calc','calculation');assert.ok(topicStats('m1-risk',varied).mastered);
 assert.ok(!topicStats('m1-risk',[...varied,make('f','concept',false)]).mastered);
});
test('adaptive practice stays in selected scope and avoids recent bases',()=>{
 const q=choosePractice('m2-beta',[],1,()=>.2);assert.equal(q.topic,'m2-beta');assert.equal(q.kind,'calculation');
 const attempts=[{...q,correct:true}];assert.notEqual(choosePractice('m2-beta',attempts,2,()=>.2).baseId,q.baseId);
});
test('scores unanswered items as wrong without negative marking',()=>{
 const qs=createExam('all',1,()=>.1);assert.deepEqual(scoreExam(qs,qs.map(q=>q.correct)),{correct:32,total:32,score:100});
 assert.equal(scoreExam(qs,Array(32).fill(null)).score,0);assert.equal(scoreExam(qs,qs.map((q,i)=>i%2?null:q.correct)).score,50);
});
test('progress import rejects corrupt entries and bounds history',()=>{
 assert.equal(readProgress('not-json').attempts.length,0);assert.equal(readProgress('{"version":99}').attempts.length,0);
 const valid={topic:'m1-risk',baseId:'test',correct:true,kind:'concept'};
 const parsed=readProgress(JSON.stringify({version:1,attempts:[{topic:'untrusted'},...Array(2100).fill(valid)],exams:[{score:101,date:'bad'},{score:100,date:'2026-10-08'}]}));assert.equal(parsed.attempts.length,2000);assert.equal(parsed.exams.length,1);
});
