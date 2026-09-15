const assert=require('node:assert/strict');
require('../assets/js/raas-model.js');
const {state,stages}=globalThis.RAAS_MODEL;
assert.equal(stages.length,8);
assert.equal(state().supported,false);
assert.equal(state(20,0).renin,false);
assert.equal(state(20,1).renin,true);
assert.equal(state(20,3).angiotensin,false);
assert.equal(state(20,4).angiotensin,true);
assert.equal(state(20,4).resistance,0);
assert(state(20,5).resistance>0);
assert.equal(state(20,5).retention,0);
assert(state(20,6).retention>0);
assert.equal(state(20,7).supported,true);
for(let i=0;i<8;i++) {const s=state(20,i,false);assert.equal(s.renin,false);assert.equal(s.angiotensin,false);assert.equal(s.aldosterone,false);assert.equal(s.resistance,0);assert.equal(s.retention,0);assert.equal(s.supported,false);}
for(const v of [50,80,100])assert.equal(state(v,7).supported,false);
assert(state(0,7).resistance>state(30,7).resistance);
for(const v of [NaN,Infinity,-10,200])for(const step of [NaN,Infinity,-1,100]){const s=state(v,step);assert(Number.isFinite(s.drive));assert(s.stage>=0&&s.stage<8);}
console.log('PASS RAAS: ordered response, distinct vascular/retention stages, ON/OFF, reset and bounds');
