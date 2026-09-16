const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../assets/js/ischemia-model.js','utf8'),c);const M=c.window.ISCHEMIA_MODEL;
const rest=M.state(),exercise=M.state({hr:65,contractility:75}),limited=M.state({narrowing:55}),effort=M.state({narrowing:55,hr:65,contractility:75}),acute=M.state({thrombus:true});
assert(!rest.ischemia);assert(!exercise.ischemia);assert(exercise.demand>rest.demand);assert(exercise.supply>rest.supply);assert(!limited.ischemia);assert(effort.ischemia);assert(acute.ischemia);assert(acute.deficit>.4);
assert(M.state({oxygen:15}).ischemia);assert(M.state({hr:100}).diastole<rest.diastole);assert(M.state({wall:100}).demand>rest.demand);
for(const drug of ['beta','nitrate','dhp','nondhp'])assert(M.state({drug}).demand<rest.demand);
assert(M.state({drug:'nitrate'}).rate===rest.rate);assert(M.state({drug:'dhp'}).rate===rest.rate);assert(M.state({drug:'nondhp'}).rate<rest.rate);
const anti=M.state({thrombus:true,drug:'antiplatelet'});assert.equal(anti.supply,acute.supply);assert.equal(anti.demand,acute.demand);assert(anti.thrombus&&anti.block);
let injury=M.advance(null,acute);assert(!injury.risk);const brief=injury.burden;injury=M.advance(injury,rest);assert(injury.burden<brief);for(let i=0;i<100;i++)injury=M.advance(injury,acute);assert(injury.risk);for(let i=0;i<100;i++)injury=M.advance(injury,rest);assert(injury.risk);
for(let hr=0;hr<=100;hr+=10)for(let narrowing=0;narrowing<=100;narrowing+=10){const s=M.state({hr,narrowing,contractility:100,wall:100});assert(s.supply>=0&&Number.isFinite(s.deficit));assert(s.demand<=4.4);}
console.log('PASS LAB 33: reserve/rest/exercise, acute deficit, oxygen, diastole, drug distinctions, no clot lysis, persistence/recovery and bounds');
