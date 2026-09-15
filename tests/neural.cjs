const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');const M=require('../assets/js/neural-models.js');const root=path.resolve(__dirname,'..');
for(let t=0;t<=12;t+=.01){assert.equal(M.potential(t,49),-70);assert.equal(M.potential(t,65),M.potential(t,100));for(const speed of [.5,1,2])assert(M.potential(t,65,speed)>=-80-1e-9&&M.potential(t,65,speed)<=40+1e-9);}
for(const speed of [.5,1,2])for(let i=0;i<6;i++)assert(Math.abs(M.potential(1+i*.8/speed+.2,65,speed,i)-40)<1e-9);
assert(M.depolarization(.2,65)>0);assert(M.depolarization(.2,100)===M.depolarization(.2,65));assert(M.depolarization(.35,49)<-50);assert.equal(M.depolarization(2,65),-70);
assert(M.synapse(1,100).response===0);assert(M.synapse(4,0).response===0);assert(M.synapse(6,100,.2).response>M.synapse(6,100,2).response);assert(M.synapse(1.5,100).response>M.synapse(1.5,50).response);
for(let t=0;t<=12;t+=.1)for(const r of [0,50,100])for(const k of [.2,.8,2]){const s=M.synapse(t,r,k);assert(s.amount>=0&&s.response>=0&&s.response<=100);assert(Math.abs(s.amount+s.removed-s.released)<1e-9);}
const element=()=>({attrs:{},children:[],value:'',textContent:'',setAttribute(k,v){this.attrs[k]=String(v)},append(...e){this.children.push(...e)},replaceChildren(){this.children=[]},addEventListener(k,fn){this[k]=fn}});
for(const [id,slug]of [['11','action_potential'],['12','synapse']]){
 const html=fs.readFileSync(path.join(root,`pharmacology_lab_${id}_${slug}.html`),'utf8'),els=new Map();
 for(const m of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){const e=element();e.value=(m[0].match(/value="([^"]+)"/)||[])[1]||'';els.set('#'+m[1],e);}
 const $=s=>els.get(s);let now=0,frame;const ctx={document:{body:{dataset:{lab:id}},querySelector:$,createElementNS:element},performance:{now:()=>now},requestAnimationFrame(fn){frame=fn},console};ctx.window=ctx;vm.createContext(ctx);
 for(const name of ['neural-models.js','neural.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',name),'utf8'),ctx);
 const advance=n=>{for(let i=0;i<n;i++){now+=16;frame(now)}};
 assert.equal($('#status').textContent,'待機中');$('#start').onclick();advance(100);const saved=$('#curLine').attrs.points;assert(saved.startsWith('60,'));advance(20);assert($('#curLine').attrs.points.startsWith(saved+' '));assert.equal($('#stdLine').attrs.points.split(' ').at(-1).split(',')[0],$('#curLine').attrs.points.split(' ').at(-1).split(',')[0]);
 $('#pause').onclick();const frozen=$('#curLine').attrs.points;advance(100);assert.equal($('#curLine').attrs.points,frozen);$('#pause').onclick();advance(1000);assert.equal($('#status').textContent,'終了');assert.equal($('#curLine').attrs.points.split(' ').at(-1).split(',')[0],'790');assert($('#pause').disabled);
 const input=$(id==='11'?'#strength':'#release');input.value='0';input.input();assert.equal($('#curLine').attrs.points,'');$('#start').onclick();advance(300);assert.equal($('#value').textContent,id==='11'?'-70 mV':'0%');$('#reset').onclick();assert.equal($('#dot').attrs.visibility,'hidden');assert.equal($('#pause').textContent,'一時停止');
 console.log('PASS neural controller',id,'history / comparison / pause / end / no stimulus-release / reset');
}
{
 const html=fs.readFileSync(path.join(root,'pharmacology_lab_14_depolarization.html'),'utf8'),els=new Map();
 for(const m of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){const e=element();e.value=(m[0].match(/value="([^"]+)"/)||[])[1]||'';els.set('#'+m[1],e)}
 const $=s=>els.get(s);let now=0,frame;const ctx={document:{querySelector:$,createElementNS:element},performance:{now:()=>now},requestAnimationFrame(fn){frame=fn},console};ctx.window=ctx;vm.createContext(ctx);
 for(const name of ['neural-models.js','depolarization.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',name),'utf8'),ctx);
 const advance=n=>{for(let i=0;i<n;i++){now+=16;frame(now)}};
 assert.equal($('#status').textContent,'待機中');assert.equal($('#channels').children.length,6);assert.equal($('#sodium').children.length,6);$('#start').onclick();advance(90);assert.equal($('#channelState').textContent,'開く');assert($('#voltageLine').attrs.points.startsWith('60,'));$('#pause').onclick();const frozen=$('#voltageLine').attrs.points;advance(30);assert.equal($('#voltageLine').attrs.points,frozen);$('#pause').onclick();advance(300);assert.equal($('#status').textContent,'終了');$('#strength').value='30';$('#strength').input();$('#start').onclick();advance(90);assert.equal($('#result').textContent,'閾値未満');assert(+$('#voltage').textContent< -50);$('#reset').onclick();assert.equal($('#dot').attrs.visibility,'hidden');
 console.log('PASS neural controller 14 Na influx / depolarization / history / pause / threshold / reset');
}
console.log('PASS threshold, all-or-none peak, conduction delays, release conservation, removal direction');
