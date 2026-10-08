import test from 'node:test';
import assert from 'node:assert/strict';
import {strategies,payoff,cost,matches,sameCurve,shuffle} from './strategies.js';
const byId=id=>strategies.find(s=>s.id===id);
const expected={
 'long-call':[-5,-5,35], 'long-put':[35,-5,-5],
 'short-call':[5,5,-35], 'short-put':[-35,5,5],
 'covered-call':[-37,3,13], 'bull-call':[-5,0,5],
 'bear-put':[5,0,-5], 'bull-put':[-5,0,5],
 'bear-call':[5,0,-5], 'straddle':[30,-10,30],
 'strangle':[29,-6,29], 'short-straddle':[-30,10,-30],
 'butterfly':[-4,6,-4], 'condor':[-6,4,-6]
};
for(const [id,values] of Object.entries(expected))test(`${id}: expiration P/L includes premiums and quantities`,()=>{
 assert.deepEqual([60,100,140].map(p=>payoff(byId(id).legs,p)),values);
});
test('all strategy prices and breaks match known examples',()=>{
 assert.equal(strategies.length,14);assert.equal(new Set(strategies.map(s=>s.id)).size,14);
 for(const [id,prices] of Object.entries({'long-call':[105],'long-put':[95],'bull-call':[100],'bear-put':[100],'bull-put':[100],'bear-call':[100],'straddle':[90,110],'strangle':[89,111],'butterfly':[94,106],'condor':[91,109]})){
  for(const p of prices) assert.equal(payoff(byId(id).legs,p),0,`${id} break-even ${p}`);
 }
 assert.equal(cost(byId('covered-call').legs),97);
 assert.equal(cost(byId('condor').legs),-4);
 assert.equal(payoff(byId('short-put').legs,0),-95);
 assert.equal(payoff(byId('covered-call').legs,0),-97);
 assert.ok(payoff(byId('short-call').legs,100000)<-90000);
});
test('identical vertical curves must not become ambiguous choices',()=>{
 assert.ok(sameCurve(byId('bull-call'),byId('bull-put')));
 assert.ok(sameCurve(byId('bear-put'),byId('bear-call')));
 assert.ok(!sameCurve(byId('straddle'),byId('strangle')));
});
test('construction requires quantities and direction, including butterfly ratio',()=>{
 const legs=byId('butterfly').legs;
 assert.ok(matches(legs,['1','-2','1']));
 assert.ok(!matches(legs,['1','-1','1']));assert.ok(!matches(legs,['','','']));
});
test('shuffle preserves strategies without mutating source',()=>{
 const ids=strategies.map(s=>s.id);assert.deepEqual(shuffle(ids,()=>0).sort(),[...ids].sort());assert.deepEqual(strategies.map(s=>s.id),ids);
});
