const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'assets/js/electrolyte-model.js'),'utf8'),ctx);const M=ctx.window.ELECTROLYTE_MODEL;
const normal=M.state(),loop=M.state({drugClass:'loop'}),thiazide=M.state({drugClass:'thiazide'}),mra=M.state({drugClass:'mra'}),enac=M.state({drugClass:'enac'}),combo=M.state({drugClass:'combo'});
assert(loop.delivered>normal.delivered);assert(thiazide.delivered>normal.delivered);assert(loop.kSecretion>normal.kSecretion);assert(thiazide.kSecretion>normal.kSecretion);assert(mra.kSecretion<normal.kSecretion);assert(enac.kSecretion<mra.kSecretion);assert(combo.kSecretion<loop.kSecretion);assert(combo.kSecretion>mra.kSecretion);
assert(M.state({waterBalance:90}).serumNaIndex<normal.serumNaIndex);assert(M.state({waterBalance:10}).serumNaIndex>normal.serumNaIndex);assert.notEqual(loop.urineNa,loop.serumNaIndex);
const html=fs.readFileSync(path.join(root,'pharmacology_lab_38_electrolytes.html'),'utf8');for(const x of ['ENaC','ROMK','Na⁺/K⁺-ATPase','尿中Na⁺排泄','血清Na⁺濃度','学習用モデル','pharmacology_lab_39_edema.html'])assert(html.includes(x));
console.log('PASS: LAB 38 distal sodium, collecting-duct K secretion, MRA/ENaC effects, water balance and teaching text.');
