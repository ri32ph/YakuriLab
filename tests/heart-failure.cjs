const assert=require('node:assert/strict');require('../assets/js/heart-failure-model.js');const {state}=globalThis.HEART_FAILURE_MODEL;
const base=state();assert.equal(base.cardiacOutput,1);assert.equal(base.heartRate,1);assert.equal(base.volume,1);assert.equal(base.congestion,0);
for(const pump of [20,40,65,95]){
 const first=state(pump,0),comp=state(pump,1),long=state(pump,2);
 assert(first.strokeVolume<1);assert(first.cardiacOutput<1);assert.equal(first.raas,0);assert.equal(first.sympathetic,0);assert.equal(first.congestion,0);
 assert(comp.cardiacOutput>first.cardiacOutput);assert(comp.pressureIndex>first.pressureIndex);assert(comp.heartRate>1);assert(comp.resistance>1);assert(comp.volume>1);assert(comp.raas>0);assert.equal(comp.congestion,0);
 assert(long.congestion>comp.congestion);assert(long.load>comp.load);assert(long.volume>comp.volume);assert(long.cardiacOutput<comp.cardiacOutput);
 for(const s of [first,comp,long]){assert.equal(s.cardiacOutput,s.heartRate*s.strokeVolume);assert(s.cardiacOutput>0&&s.cardiacOutput<=1);assert(s.congestion>=0&&s.congestion<=1);assert.equal(s.pump,pump);assert(!('ef' in s));}
}
assert.equal(state(100,2).phase,0);assert.equal(state(100,2).congestion,0);
for(const p of [NaN,Infinity,-100,500])for(const phase of [NaN,Infinity,-1,6]){const s=state(p,phase);assert(Number.isFinite(s.cardiacOutput));assert(s.phase>=0&&s.phase<=2);}
assert(state(20,2).congestion>state(60,2).congestion);
console.log('PASS HF: initial output loss, temporary compensation, sustained burden, separate congestion/perfusion, HR×SV, reset and input bounds');
