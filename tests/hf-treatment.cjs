const assert=require('node:assert/strict');require('../assets/js/heart-failure-model.js');require('../assets/js/hf-treatment-model.js');const M=globalThis.HF_TREATMENT_MODEL;
const base=M.state();assert.equal(base.after,false);assert.equal(base.active.length,0);assert.equal(Object.keys(base.blocks).length,0);
assert.deepEqual(M.choose(['arni','beta'],'ace',true),['beta','ace']);assert.deepEqual(M.choose(['ace','mra'],'arb',true),['mra','arb']);assert.deepEqual(M.choose(['arni','beta'],'loop',false),['loop']);assert.deepEqual(M.choose(['mra'],'mra',true),['mra']);
for(const id of Object.keys(M.drugs)){
 const s=M.state([id]);assert.equal(s.active.length,1);assert(s.after);assert(s.selected.includes(id));assert(M.drugs[id].observe.length);assert(s.view.congestion>=0);assert(s.view.congestion<=base.base.congestion);
 const before=M.state([id],false);assert.deepEqual(before.view,before.base);assert.equal(before.selected.length,1);assert.equal(before.active.length,0);
}
assert.equal(M.state(['ace']).changed.angiotensin,true);assert.equal(M.state(['arb']).changed.angiotensin,undefined);assert.equal(M.state(['arni']).changed.np,true);
assert(M.state(['beta']).view.heartRate<base.view.heartRate);assert.equal(M.state(['beta']).view.congestion,base.view.congestion);assert.equal(M.state(['mra']).channels.aldosterone,true);
assert.equal(M.state(['sglt2']).changed.sglt2Benefit,true);assert.equal(M.state(['sglt2']).changed.raas,undefined);assert.equal(M.state(['loop']).longterm,false);assert(M.state(['loop']).view.congestion<base.view.congestion);
const combination=M.state(['arni','beta','mra','sglt2']);assert.equal(combination.active.length,4);for(const key of ['raas','sympathetic','volume','kidneys'])assert(combination.emphasis[key]);
assert.equal(combination.view.congestion,M.state(['arni']).view.congestion);assert.equal(combination.view.resistance,M.state(['arni']).view.resistance);
const sanitized=M.state(['bad','ace','arb','arni','mra','mra']);assert.deepEqual(sanitized.selected,['arni','mra']);assert.equal(M.state(['loop']).view.pump,base.view.pump);
console.log('PASS LAB 32: single/combined targets, RAAS exclusivity, ARNI dual action, SGLT2/loop distinction, before/after and non-additive drawing');
