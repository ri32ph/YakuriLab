const assert=require('node:assert/strict');
require('../assets/js/antihypertensive-model.js');
const {state,drugs,metrics,label}=globalThis.ANTIHYPERTENSIVE_MODEL;
assert.equal(Object.keys(drugs).length,7);assert.equal(metrics.length,7);
for(const id of Object.keys(drugs)){
 const s=state(id);assert.equal(s.directions.bp,id==='none'?0:-1);
 assert(s.lumen>0&&s.lumen<30);assert(s.volumeLevel>0&&s.volumeLevel<1);
 if(id!=='none'){assert(s.safety.length);assert(s.observe.length);}
}
assert.deepEqual(state('dhp').organs,['vessels']);assert.equal(state('dhp').directions.hr,0);assert.equal(state('dhp',true).directions.hr,1);assert.equal(state('dhp',true).directions.tpr,-1);
assert.deepEqual(state('ace').targets,['ace']);assert.deepEqual(state('arb').targets,['at1']);
assert.deepEqual(state('beta').organs,['heart','kidneys']);assert.equal(state('beta').directions.hr,-1);assert.equal(state('beta').directions.raas,-1);
assert.equal(state('thiazide').directions.raas,0);assert.equal(state('thiazide',true).directions.raas,1);assert.equal(state('thiazide').directions.volume,-1);
assert.deepEqual(state('mra').targets,['mr']);assert.match(state('mra').safety[0],/K⁺排泄↓/);
const s=state('dhp');s.directions.hr=99;assert.equal(state('dhp').directions.hr,0);assert.equal(state('unknown').id,'none');
assert.equal(label('bp',-1),'↓方向');assert.equal(label('diameter',1),'広い');
console.log('PASS LAB 30 model: target distinction, 7 metrics, compensation, scoped side effects and independent state');
