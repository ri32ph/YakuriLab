const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'assets/js/expansion-models.js'),'utf8'),ctx);const M=ctx.window.EXPANSION_MODELS;
// LAB 10: absorption raises exposure; faster metabolism or renal elimination lowers the curve/AUC direction.
for(const t of [1,4,12,24]){assert(M.pk(t,1.2,1,1)>M.pk(t,.7,1,1));assert(M.pk(t,1,1.5,1)<M.pk(t,1,.5,1));assert(M.pk(t,1,1,1.5)<M.pk(t,1,1,.5))}
// LAB 12 and 19: monotonic Emax, ceiling and a lower partial-agonist maximum.
assert(M.emax(60,1,30)>M.emax(10,1,30));assert(M.emax(1e9,1,30)<1.000001);assert(M.emax(1e9,.55,30)<.551);assert(M.emax(30,1,30)===.5);
// LAB 13: K permeability and maintained gradient increase the negative-inside teaching index.
assert(M.membrane(90,true).negative>M.membrane(20,true).negative);assert(M.membrane(80,true).negative>M.membrane(80,false).negative);
// LAB 25: agonist increases ON/relaxation; antagonist competes; fractions conserve mass.
for(const [a,b] of [[0,0],[50,0],[50,80],[100,100]]){const s=M.beta3(a,b);assert(Math.abs(s.on+s.blocked+s.free-1)<1e-12)}
assert(M.beta3(80,0).relaxation>M.beta3(20,0).relaxation);assert(M.beta3(60,80).relaxation<M.beta3(60,0).relaxation);assert(M.beta3(60,0).capacity>1);
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/js/catalog.js'),'utf8').split('=')[1].trim().replace(/;$/,''));
for(const id of ['pk-summary','dose-response','membrane-ions','partial-agonist','drug-targets','beta3']){const lab=catalog.find(x=>x.id===id);assert(lab);assert(fs.existsSync(path.join(root,lab.href)))}
assert.equal(catalog.length,34);assert.deepEqual(catalog.map(x=>x.numbers[0]),[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29,30,31,32,33,34,35]);
console.log('PASS: LAB 10/12/13/19/20/25 models, six files, and expanded navigation catalog.');
